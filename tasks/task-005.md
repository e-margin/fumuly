---
id: task-005
title: Web Push通知の実装
parents: [機能]
status: waiting
depends_on: [task-002]
this_week: false
completed_at: null
progress: 0
note: 期限3日前・当日にリマインド通知
estimated_hours: 8
---

## 概要
書類の期限が近づいたユーザーにプッシュ通知を送る。

## 実装内容
1. Service Worker の登録
2. 通知許可のリクエストUI
3. Supabase Edge Function（Cron Job）で毎日チェック
4. 期限3日前・当日に通知送信
5. 通知タップでアプリの該当書類に遷移
