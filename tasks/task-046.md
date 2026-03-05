---
id: task-046
title: オンボーディングの暗号化漏れ・エラー表示追加
parents: [セキュリティ, UI/UX]
status: done
priority: high
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "current_situationの平文保存修正 + エラーフィードバック追加"
estimated_hours: 1
---

## 概要
1. オンボーディングで `current_situation` が暗号化されずに平文でDBに保存される（設定ページ経由は暗号化済み）
2. プロフィール保存失敗時にエラー表示がない（ローディングが消えるだけ）

## 対応
1. オンボーディングの `current_situation` を `/api/profile` PUT 経由で保存するか、直接暗号化してから保存
2. エラー時にトーストまたはアラートで通知

## 実装内容

### 変更ファイル
- `app/(auth)/onboarding/page.tsx` - プロフィール保存を `/api/profile` PUT経由に変更（サーバーサイドで暗号化）、エラー時にalert表示
- `app/api/profile/route.ts` - PUT時に `current_situation` を `encrypt()` で暗号化して保存

### 実装内容
- オンボーディングのプロフィール保存処理を、直接Supabaseクライアントで保存する方式から `/api/profile` PUT API経由に変更
- サーバーサイドの `/api/profile` PUT で `current_situation` を `encrypt()` で暗号化してから保存（暗号化漏れの解消）
- API呼び出し失敗時にalertでエラーメッセージを表示（ローディングが消えるだけの問題を解消）
- `setLoading(false)` をcatchブロックで確実に呼び出し、ローディング状態の固着を防止
