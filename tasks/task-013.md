---
id: task-013
title: 複数枚撮影・大判書類への対応
parents: [機能]
status: done
depends_on: []
this_week: false
completed_at: 2026-03-01
progress: 100
note: 1枚に収まらない書類（裏表・大判・複数ページ）の対応
estimated_hours: 6
---

## 概要
現在のスキャン機能は1枚の写真のみ対応。以下のケースに対応できない：
- A3等の大判書類（1枚の写真に収まらない）
- 裏表のある書類
- 複数ページの書類（契約書、通知書の別紙等）

## 実装案

### UI変更
1. スキャン画面に「写真を追加」ボタンを設置
2. 撮影した写真のサムネイル一覧を表示（追加・削除可能）
3. 「すべて撮影した」ボタンで一括解析に進む

### API変更
- `/api/analyze` のリクエストを `{ images: string[] }` に変更（複数画像対応）
- Claude APIのmessagesに複数のimage contentを含める
- システムプロンプトに「複数画像が送られた場合は全体を1つの書類として解析してください」を追加

### DB変更
- `documents.local_image_id` → `documents.local_image_ids` （TEXT配列）に変更
  - または別テーブル `document_images` を作成

### 考慮事項
- Claude APIのトークン上限（画像が大きいとコスト増）
- 画像枚数の上限設定（無料: 3枚、有料: 10枚等）
- IndexedDB保存時の容量管理（task-006と連携）
- フロント側で画像リサイズが必須（task-016）。Claude APIは内部で長辺1568pxに自動縮小するため、送信前に1568pxにリサイズしても解析精度は変わらない
- Vercel移行時は4.5MBのボディ制限があるが、リサイズ後なら1枚300-500KB程度になるため10枚でも余裕
