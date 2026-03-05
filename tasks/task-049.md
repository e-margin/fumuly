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

## 実装内容

### 変更ファイル
- `app/api/documents/route.ts` - `cleanupLastRun` Map（メモリ内）でユーザーごとの最終実行時刻を管理、`CLEANUP_INTERVAL_MS = 60 * 60 * 1000`（1時間）以内は再実行をスキップ

### 実装内容
- `const cleanupLastRun = new Map<string, number>()` でユーザーIDごとの最終クリーンアップ実行時刻をメモリ内に保持
- `runAutoCleanup()` 関数の冒頭で `Date.now() - lastRun < CLEANUP_INTERVAL_MS` をチェックし、1時間以内の再実行をスキップ
- GETリクエストごとにクリーンアップクエリが2本走っていた問題を解消
- メモリ内管理のため、サーバーレス環境ではインスタンス再起動でリセットされるが、DB負荷軽減としては十分

### 補足
- Vercelサーバーレス環境ではインスタンスが再起動するとMapがリセットされるが、頻度は十分低い
