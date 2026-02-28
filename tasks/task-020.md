---
id: task-020
title: maximumScale制限の撤廃（WCAG対応）
parents: [アクセシビリティ]
status: done
depends_on: []
this_week: false
completed_at: 2026-03-01
progress: 100
note: layout.tsxの1行変更
estimated_hours: 0.003
---

## 概要

`app/layout.tsx` の `maximumScale: 1` を削除してピンチズームを許可する。

## 背景

WCAG 1.4.4 違反。ユーザーがピンチズームで拡大できない。督促状や年金通知を扱うアプリで、高齢者や弱視ユーザーが使えない可能性がある。

## 実装

```diff
- maximumScale: 1,
```

1行削除。
