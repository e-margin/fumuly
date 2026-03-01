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
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_MONTHLY_PRICE_ID`（サーバーサイドのみ）
- `STRIPE_YEARLY_PRICE_ID`（サーバーサイドのみ）
- `NEXT_PUBLIC_APP_URL`（originフォールバック用）

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

### セキュリティレビュー対応（同日）
- RLS: plan/is_vip/stripe_*カラムのユーザー直接変更を禁止（WITH CHECK制約追加）
- priceIdをサーバーサイドのみで管理（クライアントはプラン名 monthly/yearly のみ送信）
- subscription.updatedイベントハンドラ追加（支払い状態変化に追従）
- Webhook内のDB更新エラーチェック・ログ強化
- 既存有料ユーザーの二重課金防止チェック追加
- originフォールバックを環境変数化（NEXT_PUBLIC_APP_URL）
- チャットのシステムプロンプトに決済機能を実装済みとして反映

### DB変更（RLSポリシー更新 — Supabase SQL Editorで実行が必要）
```sql
-- 既存のUPDATEポリシーを削除して再作成
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND plan = (SELECT plan FROM profiles WHERE id = auth.uid())
    AND is_vip = (SELECT is_vip FROM profiles WHERE id = auth.uid())
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM profiles WHERE id = auth.uid())
    AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT stripe_subscription_id FROM profiles WHERE id = auth.uid())
  );
```

### VIP付与方法
Supabase Dashboard → Table Editor → profiles → 対象ユーザーの is_vip を true に変更
