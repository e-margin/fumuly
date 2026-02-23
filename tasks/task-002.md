---
id: task-002
title: Stripe決済機能の実装
parents: [マネタイズ]
status: waiting
depends_on: []
this_week: false
completed_at: null
progress: 0
note: 月額480円・年額4,800円のサブスクリプション
estimated_hours: 16
---

## 概要
docs/Fumuly_マネタイズ設計.md に基づき、Stripe決済を実装する。

## 実装内容
1. Stripe アカウント設定・APIキー取得
2. 料金プラン作成（月額480円 / 年額4,800円）
3. `/api/stripe/checkout` — Checkout Session作成
4. `/api/stripe/webhook` — Webhook受信（支払い成功/失敗/解約）
5. `profiles.plan` カラムの更新ロジック
6. 料金ページ（`/pricing`）の作成
7. 無料プランの制限実装（スキャン回数等）
8. 設定画面にプラン管理（解約・プラン変更）を追加

## 環境変数
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
