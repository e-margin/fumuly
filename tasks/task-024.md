---
id: task-024
title: 書類一覧のページネーション・select最適化
parents: [パフォーマンス]
status: waiting
priority: low
depends_on: []
this_week: false
completed_at: null
progress: 0
note: "フェーズ3: リリース（優先16）。ページネーション"
estimated_hours: 0.1
---

## 概要

書類一覧が `.select("*")` で全カラム・全件取得している。`detailed_summary` 等の長文フィールドが不要にロードされる。

## 対象

- `app/(main)/documents/page.tsx` — 全件取得・全カラム
- `app/(main)/home/page.tsx` — 同様（ただしフィルタあり）

## 実装

### 1. select最適化
```typescript
.select("id, sender, type, amount, deadline, category, summary, recommended_action, is_done, created_at")
```
`detailed_summary` と `priority` を一覧から除外。

### 2. ページネーション（将来）
- `.range(0, 49)` で50件ずつ取得
- 「もっと見る」ボタンまたは無限スクロール
- 現時点ではユーザー数が少ないのでselect最適化だけでOK
