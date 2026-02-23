---
id: task-007
title: Google認証の追加
parents: [認証]
status: waiting
depends_on: []
this_week: false
completed_at: null
progress: 0
note: メール/パスワード以外のログイン手段
estimated_hours: 3
---

## 概要
現在メール/パスワードのみ。Google OAuthを追加してログインの手間を減らす。

## 実装内容
1. Google Cloud Console でOAuth クライアントID作成
2. Supabase Dashboard → Authentication → Providers → Google を有効化
3. ログイン/登録画面に「Googleでログイン」ボタン追加
4. コールバック処理
5. 既存メールユーザーとのアカウントリンク考慮
