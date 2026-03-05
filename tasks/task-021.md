---
id: task-021
title: プライバシーポリシー・同意説明の実態乖離修正
parents: [法的文書]
status: done
depends_on: []
this_week: true
completed_at: 2026-03-01
progress: 100
note: "フェーズ1: Stripe審査通過（優先1）。コードではなく文言の問題"
estimated_hours: 0.1
---

## 概要

実装が先行してプライバシーポリシーの記載が追いついていない問題を修正する。

## 乖離している箇所

### 1. Anthropicへの送信データ範囲
- **プラポリの記載**: 「書類の画像」がAnthropicで処理される
- **実態**: 解析済みテキスト（送付元・金額・期限）、プロフィール（月収・借金額・特性）、チャット会話履歴もAnthropicに送信

### 2. オンボーディングの同意説明
- **現在の記載**: 「画像はAnthropicのサーバーで処理されます」
- **実態**: テキストデータ・プロフィール情報もAnthropicに送信

### 3. アカウント削除
- **プラポリ第6条**: 「アカウントおよびすべてのデータの削除」
- **実態**: auth.usersテーブルのメアド・パスワードハッシュが残留

## 修正対象

- `docs/Fumuly_プライバシーポリシー.md`
- `app/privacy/page.tsx`
- `app/(auth)/onboarding/page.tsx` — 同意説明テキスト
- `app/(main)/settings/page.tsx` — handleDeleteAllでauth.usersも削除

## 実装内容

### 変更ファイル
- `app/privacy/page.tsx` - Anthropicへの送信データ範囲を「画像」から「画像・解析済みテキスト・プロフィール情報・会話履歴」に更新
- `app/(auth)/onboarding/page.tsx` - 同意説明テキストを「画像はAnthropicで処理されます」から「テキストデータ・プロフィール情報もAnthropicに送信」に修正
- `app/api/delete-account/route.ts` - アカウント削除APIを新規作成（documents/conversations/profiles/push_subscriptions/reminders + auth.usersを一括削除）
- `app/(main)/settings/page.tsx` - `handleDeleteAll` を `/api/delete-account` API経由に変更し、auth.usersも含めた完全削除に対応

### 実装内容
- プライバシーポリシーのAnthropicへの送信データ範囲を実態と一致するよう修正
- オンボーディング画面の同意説明を実態と一致するよう修正
- アカウント削除時にSupabase auth.usersからもユーザーを削除するAPIを実装（supabaseAdmin.auth.admin.deleteUser）
- 設定画面の全データ削除を専用API経由に変更
