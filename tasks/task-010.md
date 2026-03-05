---
id: task-010
title: Claude APIモデルの最新化
parents: [品質]
status: done
depends_on: []
this_week: false
completed_at: 2026-03-01
progress: 100
note: claude-sonnet-4-5-20250929（最新Sonnet）に更新済み
estimated_hours: 0.5
---

## 概要
現在 `claude-sonnet-4-5-20241022`（2024年版）を使用中。2026年最新モデルへの更新を検討する。

## 対象ファイル
- `lib/claude.ts` — 書類解析用
- `app/api/chat/route.ts` — チャット用

## 注意事項
- 最新モデルIDの正確な確認が必要（APIドキュメント参照）
- モデル変更による応答品質・速度・コストの変化を検証
- 書類解析の精度が落ちないか、テスト書類で確認してから適用

## 実装内容

### 変更ファイル
- `lib/claude.ts` - model指定を `claude-sonnet-4-6` に更新（analyzeDocument関数・regenerateSummary関数の両方）
- `app/api/chat/route.ts` - model指定を `claude-sonnet-4-6` に更新

### 実装内容
- 書類解析API（`lib/claude.ts`）のモデルを `claude-sonnet-4-6` に更新
- チャットAPI（`app/api/chat/route.ts`）のモデルを `claude-sonnet-4-6` に更新
- 再生成API（`lib/claude.ts` の `regenerateSummary`）のモデルも同様に更新
