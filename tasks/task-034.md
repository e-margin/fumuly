---
id: task-034
title: ユーザーデータのアプリレベル暗号化
parents: [セキュリティ]
status: waiting
depends_on: []
this_week: true
completed_at: null
progress: 0
note: Supabase Dashboardで閲覧不可にするためのカラム単位暗号化
estimated_hours: 6
---

## 概要

Supabase Dashboard（Table Editor）でユーザーの機微データが平文で閲覧できてしまう問題を解消する。
API Route でDB書き込み前に暗号化、読み出し後に復号するアプリレベル暗号化を実装する。

## ゴール

- Supabase Dashboard を開いても対象カラムの中身が読めない状態
- アプリの機能（チャットコンテキスト、書類一覧表示等）は一切変わらない

## 暗号化対象カラム

| テーブル | カラム | 理由 |
|---------|--------|------|
| `documents` | `summary` | 督促・差押等の具体的内容 |
| `documents` | `detailed_summary` | 書類の詳細説明 |
| `documents` | `recommended_action` | 推奨アクション |
| `conversations` | `content` | ユーザーの相談内容・AI回答 |
| `profiles` | `current_situation` | 生活困窮の詳細記述 |

### 暗号化しないカラム（理由）

- `documents.amount`, `deadline`, `priority`, `category` → フィルタ・ソートに使用
- `documents.sender`, `type` → 一覧表示のフィルタに使う可能性あり（要検討）
- `profiles.has_adhd`, `phone_difficulty` → boolean値のみ
- `profiles.debt_total`, `monthly_income` → 数値のみ、単体では個人特定不可

## 設計

詳細は `docs/Fumuly_データ暗号化設計.md` を参照。

## 実装ステップ

1. `lib/encryption.ts` — 暗号化/復号ユーティリティ作成
2. `app/api/analyze/route.ts` — 書き込み時に暗号化
3. `app/api/chat/route.ts` — 読み出し時に復号、書き込み時に暗号化
4. `app/api/regenerate/route.ts` — 書き込み時に暗号化
5. フロント表示箇所 — API レスポンスは復号済みなので変更不要
6. 既存データの一括暗号化マイグレーションスクリプト
7. 動作確認・テスト
