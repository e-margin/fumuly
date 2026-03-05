---
id: task-003
title: Cloudflare Email Routing設定
parents: [インフラ]
status: done
priority: low
depends_on: [task-001]
this_week: false
completed_at: 2026-03-02
progress: 100
note: "Cloudflare Email Routing設定完了。support@fumuly.comで受信確認済み"
estimated_hours: 1
---

## 概要
プライバシーポリシー・利用規約・特商法に記載の `support@fumuly.com` でメールを受信できるようにする。

## 実装手順
1. Cloudflareにドメイン追加（fumuly.com）
2. Email Routing を有効化
3. `support@fumuly.com` → 個人メールアドレスへの転送ルール作成
4. DNS MXレコードの設定
5. 動作確認（テストメール送信）

## 作業メモ（2026-03-02）
- Cloudflareアカウント作成、fumuly.comをドメイン追加
- お名前ドットコムのネームサーバーをCloudflare（paris.ns.cloudflare.com / vern.ns.cloudflare.com）に変更
- Vercel向けDNSレコード設定（A: 76.76.21.21、CNAME: cname.vercel-dns.com、DNS only）
- Email Routing有効化、MX/TXT/DKIMレコード自動追加
- `support@fumuly.com` を作成し、メール転送の動作確認済み
- 当初の `support@fumuly.com` ではなく `support@fumuly.com` で作成（プライバシーポリシー等の記載も要更新）

## 実装内容

### 変更ファイル
- Cloudflare Dashboard - ドメイン追加、Email Routing設定、MX/TXT/DKIMレコード設定
- お名前ドットコム - ネームサーバーをCloudflareに変更（paris.ns.cloudflare.com / vern.ns.cloudflare.com）
- Cloudflare DNS - Vercel向けレコード設定（A: 76.76.21.21、CNAME: cname.vercel-dns.com）

### 実装内容
- Cloudflareアカウント作成、fumuly.comをドメインとして追加
- お名前ドットコムのネームサーバーをCloudflareに委譲
- Vercel向けDNSレコード（A / CNAME）をDNS onlyモードで設定
- Email Routing有効化、MX/TXT/DKIMレコード自動追加
- `support@fumuly.com` の転送ルールを作成し、メール受信を確認済み

### 補足
- コードベースの変更はなし（インフラ設定のみ）
