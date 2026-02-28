---
id: task-004
title: APIレート制限の実装
parents: [セキュリティ]
status: done
depends_on: []
this_week: false
completed_at: 2026-03-01
progress: 100
note: チャット20回/時・スキャン10回/日で実装済み
estimated_hours: 3
---

## 概要
悪意ユーザーや無限ループによるAnthropic API課金暴走を防ぐ。

## 現在の実装状況

### `/api/chat`
- ユーザーあたり **20回/時** の制限（`conversations` テーブルで直近1時間のメッセージ数をカウント）
- 管理者（`ADMIN_USER_ID`）は無制限
- 残り回数をフロントエンドに返却し、チャットUIに表示

### `/api/analyze`
- ユーザーあたり **10回/日** の制限（`documents` テーブルで直近24時間の解析数をカウント）

### フロントエンド
- チャット画面に「残りN回/時」を表示
- 429レスポンス時にエラーメッセージを表示
