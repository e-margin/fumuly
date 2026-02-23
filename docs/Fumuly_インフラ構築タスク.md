# 🏗️ インフラ アカウント構築タスク

*作成日：2026-02-23*

---

## 優先順位

MVP開発を始めるために最低限必要なものを先に構築する。

```
フェーズ1（開発開始前に必須）
  └─ Supabase / Render / GitHub

フェーズ2（課金機能実装前に必要）
  └─ Stripe

フェーズ3（公開前に必要）
  └─ Cloudflare / contact@fumuly.com
```

---

## フェーズ1：開発開始前に必須

### Supabase
- [ ] アカウント作成（https://supabase.com）
- [ ] `fumuly`プロジェクト作成
- [ ] `documents`テーブル作成（技術メモのスキーマ参照）
- [ ] Row Level Security（RLS）有効化
- [ ] APIキー・接続URLを`.env`に保存
- [ ] 7日スリープ対策：UptimeRobot（https://uptimerobot.com）で定期pingを設定

### Render
- [ ] アカウント作成（https://render.com）
- [ ] クレジットカード登録
- [ ] Starterプランの帯域・制限を確認
- [ ] GitHubリポジトリと連携設定

### GitHub
- [ ] `fumuly`リポジトリ作成（private）
- [ ] ブランチ戦略を決める（`main` / `develop`）
- [ ] `.env.example`を用意してAPIキーを管理

---

## フェーズ2：課金機能実装前に必要

### Stripe
- [ ] アカウント作成（https://stripe.com/jp）
- [ ] 本人確認・銀行口座登録（売上受取に必要）
- [ ] 月額480円・年額4,800円の商品を作成
- [ ] WebhookエンドポイントをRenderのAPIに設定
- [ ] テストモードで決済フローを確認してから本番切替

---

## フェーズ3：公開前に必要

### Cloudflare（メール・DNS管理）
- [ ] アカウント作成（https://cloudflare.com）
- [ ] `fumuly.com`のネームサーバーをCloudflareに移管（お名前ドットコムで変更）
- [ ] Email Routingを設定
  - `contact@fumuly.com` → 既存のGmailに転送
- [ ] SSL/TLS設定を確認

### Anthropic API
- [ ] APIキーを発行（https://console.anthropic.com）
- [ ] トレーニングデータ使用のオプトアウトを確認・設定
- [ ] 使用量アラートを設定（予算超過防止）
- [ ] APIキーはRenderの環境変数に設定（フロントに露出しない）

---

## 環境変数まとめ（`.env`）

```
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NODE_ENV=development
```

---

## 注意事項

- APIキーは絶対にGitHubにコミットしない（`.gitignore`に`.env`を追加）
- Stripeの本番切替は動作確認が完全に終わってから
- Supabaseの無料枠は2プロジェクトまで（melogsと共用に注意）
