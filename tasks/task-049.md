---
id: task-049
title: 自動クリーンアップのDB負荷軽減
parents: [品質]
status: done
priority: medium
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "GETリクエスト毎のfire-and-forgetをやめ、実行間隔を制御"
estimated_hours: 1
---

## 概要
`/api/documents` GET の全リクエスト（ホーム・一覧・単体・重複チェック）でクリーンアップクエリが2本走る。

## 対応
- 最後の実行時刻をメモリまたはDBで管理し、一定間隔（例: 1時間）以内は再実行しない
