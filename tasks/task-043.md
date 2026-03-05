---
id: task-043
title: Stripe checkout/portalのOriginヘッダー信頼によるオープンリダイレクト修正
parents: [セキュリティ]
status: done
priority: high
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "Origin ヘッダーを信頼せず NEXT_PUBLIC_APP_URL に固定する"
estimated_hours: 0.5
---

## 概要
`/api/stripe/checkout/route.ts` と `/api/stripe/portal/route.ts` で `req.headers.get("origin")` を `success_url` / `cancel_url` に使用しており、悪意あるクライアントから任意のURLにリダイレクトさせられるリスクがある。

## 対応
- `origin` の取得をやめ、`process.env.NEXT_PUBLIC_APP_URL || "https://fumuly.com"` に固定する

## 実装内容

### 変更ファイル
- `app/api/stripe/checkout/route.ts` - `req.headers.get("origin")` を `process.env.NEXT_PUBLIC_APP_URL || "https://fumuly.com"` に変更
- `app/api/stripe/portal/route.ts` - 同様に `origin` を環境変数ベースに変更

### 実装内容
- Stripe Checkout/Portal APIの `success_url`/`cancel_url`/`return_url` で使用するoriginを、リクエストヘッダーからの取得をやめ、`process.env.NEXT_PUBLIC_APP_URL || "https://fumuly.com"` に固定
- 悪意あるクライアントがOriginヘッダーを偽装して任意URLにリダイレクトさせるオープンリダイレクト脆弱性を解消
