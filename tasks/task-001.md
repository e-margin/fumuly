---
id: task-001
title: 本番ドメイン（fumuly.com）移行時のURL変更
parents: [インフラ]
status: waiting
depends_on: []
this_week: false
completed_at: null
progress: 0
note: fumuly.onrender.com → fumuly.com への変更箇所まとめ
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

### Render設定
- Custom Domain の追加
- DNS設定（Cloudflare等）

### 推奨：環境変数化
将来的に `NEXT_PUBLIC_APP_URL` を導入し、ハードコードを排除する。
