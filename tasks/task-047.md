---
id: task-047
title: APIエラー時のUI表示改善（ホーム・書類一覧・DocumentCard）
parents: [UI/UX, バグ修正]
status: waiting
priority: medium
depends_on: []
this_week: true
completed_at: null
progress: 0
note: "空表示とエラー表示の区別 + deadline無効日付のフォールバック"
estimated_hours: 1
---

## 概要
1. ホーム・書類一覧: APIエラー時に空表示と見分けがつかない
2. DocumentCard: deadlineが無効な日付文字列の場合に `NaN/NaN` と表示される

## 対応
1. `error` stateを追加し、エラー時は「読み込みに失敗しました」等を表示
2. `formatDeadline` で `isNaN(date.getTime())` チェックを追加し、無効な場合は生文字列を返す
