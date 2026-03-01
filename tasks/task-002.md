---
id: task-002
title: Stripe決済機能の実装
parents: [マネタイズ]
status: done
depends_on: []
this_week: false
completed_at: 2026-03-01
progress: 100
note: 月額480円・年額4,400円のサブスクリプション + VIPフラグ
estimated_hours: 16
---

## 概要
docs/Fumuly_マネタイズ設計.md に基づき、Stripe決済を実装する。

## 実装内容
1. Stripe アカウント設定・APIキー取得
2. 料金プラン作成（月額480円 / 年額4,400円）
3. `/api/stripe/checkout` — Checkout Session作成
4. `/api/stripe/webhook` — Webhook受信（支払い成功/失敗/解約）
5. `/api/stripe/portal` — Customer Portal（プラン管理・解約）
6. `profiles.plan` カラムの更新ロジック
7. 料金ページ（`/pricing`）の作成
8. 無料プランの制限実装（月5通スキャン）
9. 設定画面にプラン管理（解約・プラン変更）を追加
10. VIPフラグ（is_vip）の実装

## 環境変数
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID`

## 作業メモ（2026-03-01）

### 新規作成ファイル
- `lib/stripe.ts` — Stripeクライアント + isPremiumUser ヘルパー
- `app/api/stripe/checkout/route.ts` — Checkout Session 作成
- `app/api/stripe/webhook/route.ts` — Webhook受信（署名検証、plan更新）
- `app/api/stripe/portal/route.ts` — Customer Portal セッション作成
- `app/pricing/page.tsx` — 料金ページ（無料/月額/年額の3プラン）

### 変更ファイル
- `supabase/schema.sql` — is_vip, stripe_customer_id, stripe_subscription_id カラム追加
- `middleware.ts` — /api/stripe/webhook を認証チェックから除外
- `app/api/analyze/route.ts` — 月5件制限（無料）/ 無制限（有料・VIP）
- `app/(main)/settings/page.tsx` — プラン表示・アップグレード/管理ボタン追加

### DB変更（Supabase SQL Editorで実行が必要）
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
```

### VIP付与方法
Supabase Dashboard → Table Editor → profiles → 対象ユーザーの is_vip を true に変更
