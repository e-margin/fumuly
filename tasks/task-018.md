---
id: task-018
title: パスワードリセット機能の実装
parents: [認証, UX]
status: waiting
depends_on: []
this_week: true
completed_at: null
progress: 0
note: "フェーズ2: アーリーアダプター（優先8）。パスワードリセット"
estimated_hours: 0.05
---

## 概要

ログイン画面に「パスワードを忘れた方」リンクを追加し、`supabase.auth.resetPasswordForEmail()` を実装する。

## 背景

パスワードを忘れたユーザーがアカウントにアクセスできなくなる。差押通知など重要書類を登録済みのユーザーにとって深刻。

## 実装内容

- `app/(auth)/login/page.tsx` に「パスワードをお忘れですか？」リンク追加
- パスワードリセット画面（メール入力→送信）を作成
- `supabase.auth.resetPasswordForEmail()` を呼ぶだけ（Supabaseがメール送信）
- リセット後のパスワード更新画面（コールバックURL対応）

## 備考

task-003（メール機能）に依存しない。Supabase Auth がリセットメールを送信してくれる。
