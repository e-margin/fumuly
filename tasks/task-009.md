---
id: task-009
title: UptimeRobot設定（Renderスリープ防止）
parents: [インフラ]
status: waiting
depends_on: []
this_week: true
completed_at: null
progress: 0
note: Render Freeプランの15分スリープ対策
estimated_hours: 0.5
---

## 概要
Render Freeプランは15分アクセスがないとスリープする。UptimeRobotで定期アクセスして防ぐ。

## 実装手順
1. UptimeRobot（https://uptimerobot.com）にアカウント作成
2. 新規モニター追加
   - タイプ: HTTP(s)
   - URL: https://fumuly.onrender.com
   - 監視間隔: 5分
3. 動作確認
