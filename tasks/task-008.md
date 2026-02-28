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
