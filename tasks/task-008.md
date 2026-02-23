---
id: task-008
title: エラーハンドリングの改善
parents: [品質]
status: waiting
depends_on: []
this_week: false
completed_at: null
progress: 0
note: ユーザー向けエラーメッセージの具体化
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
