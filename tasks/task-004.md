---
id: task-004
title: APIレート制限の実装
parents: [セキュリティ]
status: waiting
depends_on: []
this_week: false
completed_at: null
progress: 0
note: Anthropic API課金の暴走防止
estimated_hours: 3
---

## 概要
悪意ユーザーや無限ループによるAnthropic API課金暴走を防ぐ。

## 実装内容
1. `/api/analyze` — ユーザーあたり1日の解析回数制限（無料: 5回/日、有料: 50回/日）
2. `/api/chat` — ユーザーあたり1日のメッセージ数制限（無料: 20回/日、有料: 200回/日）
3. Anthropicコンソールで使用量アラート設定
4. 制限到達時のユーザー向けメッセージ（「今日の利用上限に達しました」）

## 方法
- Supabaseに `api_usage` テーブル、またはRedis（Upstash）でカウント管理
- ミドルウェアまたはAPI内でチェック
