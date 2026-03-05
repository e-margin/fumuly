---
id: task-024
title: 書類一覧のselect最適化
parents: [品質]
status: done
priority: low
depends_on: []
this_week: false
completed_at: 2026-03-02
progress: 100
note: "select最適化のみ。書類データはページネーション不要（件数が限定的）"
estimated_hours: 0.1
---

## 概要

書類一覧が `.select("*")` で全カラム・全件取得している。`detailed_summary` 等の長文フィールドが不要にロードされる。

## 対象

- `app/(main)/documents/page.tsx` — 全件取得・全カラム
- `app/(main)/home/page.tsx` — 同様（ただしフィルタあり）

## 実装

### select最適化
```typescript
.select("id, sender, type, amount, deadline, category, summary, recommended_action, is_done, created_at")
```
`detailed_summary` と `priority` を一覧から除外。

## ページネーションについて（見送り）

書類データは現時点でページネーション不要。

- 現時点ではユーザー数が少なく、1ユーザーあたりの書類数も限定的
- データが増えた場合はselect最適化 + `.limit()` で十分対応可能
- 無限スクロールやページネーションUIは、実際にパフォーマンス問題が顕在化してから検討する

※ チャット履歴の件数制限（ユーザーごと最新50件を保持・超過分を自動削除）はtask-027で別途対応済み

## 実装内容

### 変更ファイル
- `app/api/documents/route.ts` - GET mode=home/all/past で `.select()` に必要なカラムのみ指定（`detailed_summary` を除外）

### 実装内容
- 書類一覧（mode=all）のselectを `id, sender, type, amount, deadline, category, summary, recommended_action, is_done, created_at` に限定
- ホーム（mode=home）のselectを `id, sender, type, amount, deadline, category, summary, recommended_action, is_done` に限定
- 過去の書類（mode=past）のselectも必要カラムのみに限定
- 単体取得（id指定）は `select("*")` のまま（詳細表示に全カラム必要）
- ページネーションは見送り（件数が限定的なため）
