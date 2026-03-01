---
id: task-003
title: Cloudflare Email Routing設定
parents: [インフラ]
status: waiting
depends_on: [task-001]
this_week: false
completed_at: null
progress: 0
note: "フェーズ3: リリース（優先11）。Email Routing設定"
estimated_hours: 1
---

## 概要
プライバシーポリシー・利用規約・特商法に記載の `contact@fumuly.com` でメールを受信できるようにする。

## 実装手順
1. Cloudflareにドメイン追加（fumuly.com）
2. Email Routing を有効化
3. `contact@fumuly.com` → 個人メールアドレスへの転送ルール作成
4. DNS MXレコードの設定
5. 動作確認（テストメール送信）
