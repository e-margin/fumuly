---
id: task-011
title: LP・設定画面のフッターリンク整備
parents: [UI/UX]
status: done
depends_on: []
this_week: true
completed_at: 2026-03-01
progress: 100
note: "フェーズ1: Stripe審査通過（優先3）。特商法リンク追加、フッターの統一"
estimated_hours: 1
---

## 概要
特商法ページを追加したが、設定画面からのリンクがまだない。

## 対象
1. `app/(main)/settings/page.tsx` — 特商法リンクを追加
2. LP（`app/page.tsx`）のフッター — 既に追加済み。確認のみ
3. プライバシーポリシー・利用規約・特商法ページのヘッダー「戻る」ボタンの遷移先を適切に（ログイン中はsettings、未ログインはLP）

## 実装内容

### 変更ファイル
- `app/(main)/settings/page.tsx` - 特商法（`/legal`）へのリンクを追加
- `components/fumuly/back-link.tsx` - ログイン状態に応じて遷移先を切り替えるBackLinkコンポーネント
- `app/legal/page.tsx` - BackLinkコンポーネントを使用
- `app/privacy/page.tsx` - BackLinkコンポーネントを使用
- `app/terms/page.tsx` - BackLinkコンポーネントを使用

### 実装内容
- 設定画面にプライバシーポリシー・利用規約・特商法・免責事項へのリンクを一覧表示
- `BackLink` コンポーネントを作成し、ログイン中は `/settings` へ、未ログインは `/` へ遷移するよう実装
- `supabase.auth.getSession()` でログイン状態を判定
