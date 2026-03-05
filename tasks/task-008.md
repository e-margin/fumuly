---
id: task-008
title: エラーハンドリングの改善
parents: [品質]
status: done
depends_on: []
this_week: false
completed_at: 2026-03-01
progress: 100
note: 401リダイレクト・オフライン検知・API混雑検知・エラーメッセージ具体化すべて完了
estimated_hours: 3
---

## 概要
現在は汎用エラーメッセージ（「エラーが発生しました」）が多い。具体的な案内に改善する。

## 対象
1. `/api/analyze` — 画像解析失敗時に「別の角度から撮影してください」等のガイダンス
2. `/api/chat` — Claude API エラー時のリトライ案内
3. ネットワークエラー時のオフライン検知と案内
4. Supabase接続エラー時の案内
5. 認証切れ時の自動リダイレクト

## 実装内容

### 変更ファイル
- `app/api/analyze/route.ts` - Claude APIエラー時の具体的メッセージ（529/503でAI混雑案内、その他で撮り直し案内）
- `app/api/chat/route.ts` - Claude APIエラー時の具体的メッセージ（混雑/接続失敗/応答形式エラーなど分岐）、401認証エラー返却
- `app/(main)/chat/page.tsx` - オフライン検知（`navigator.onLine`）、401でログイン画面リダイレクト、エラー時の日本語メッセージ表示
- `app/(main)/scan/page.tsx` - 401でログイン画面リダイレクト、429でレート制限メッセージ、オフライン検知
- `components/fumuly/auth-guard.tsx` - `getUser()` 失敗時に `refreshSession()` を試行、サーバーエラー/ネットワークエラー時はリダイレクトしない

### 実装内容
- APIルートで529/503（Claude API過負荷）を検知し「AIが混み合っています」メッセージを返却
- 接続失敗（fetch failed/ECONNREFUSED/ETIMEDOUT）を検知し「接続に失敗しました」メッセージを返却
- フロントエンドで `navigator.onLine` によるオフライン検知を実装
- 401レスポンス時にクライアント側から `/login` へ自動リダイレクト
- AuthGuardでネットワークエラー時はリダイレクトせずオフライン利用を許容
