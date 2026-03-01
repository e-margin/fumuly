---
id: task-001
title: 本番ドメイン（fumuly.com）移行時のURL変更
parents: [インフラ]
status: done
depends_on: []
this_week: true
completed_at: 2026-03-01
progress: 100
note: "フェーズ1: Stripe審査通過（優先2）。fumuly.comへの統一"
estimated_hours: 1
---

## 変更が必要なファイル

### ハードコードされたURL
- `app/legal/page.tsx` — サービスURL `https://fumuly.onrender.com` → `https://fumuly.com`
- `docs/Fumuly_特定商取引法に基づく表記.md` — 同上

### メールアドレス
以下のファイルで `contact@fumuly.com` を使用中。ドメインと一致しているので変更不要。
- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- `app/legal/page.tsx`
- `docs/Fumuly_プライバシーポリシー.md`
- `docs/Fumuly_利用規約.md`
- `docs/Fumuly_特定商取引法に基づく表記.md`

### manifest.json
- `public/manifest.json` — `start_url` 等にドメイン指定があれば確認

### Supabase設定
- Supabase Dashboard → Authentication → URL Configuration → Site URL を fumuly.com に変更
- Redirect URLs に fumuly.com を追加

### ホスティング設定
- Vercel移行の場合: Vercel ダッシュボードで fumuly.com をカスタムドメインに追加（task-009参照）
- Render継続の場合: Custom Domain の追加
- DNS設定（Cloudflare等）

### 推奨：環境変数化
将来的に `NEXT_PUBLIC_APP_URL` を導入し、ハードコードを排除する。
