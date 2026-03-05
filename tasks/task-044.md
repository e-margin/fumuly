---
id: task-044
title: チャット二重送信防止・スキャン解析中のAbortController対応
parents: [バグ修正, UI/UX]
status: done
priority: high
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "チャット送信ガードの強化 + スキャン解析中の画面離脱でAbortController"
estimated_hours: 1
---

## 概要
1. チャットページ: Cmd+Enter連打で `setLoading(true)` のバッチ処理前に2回目の送信が通る可能性
2. スキャンページ: 解析中にブラウザバック等で離脱した場合、AbortControllerがなくAPIコストが無駄になる

## 対応
1. `useRef` で送信中フラグを管理し、Stateのバッチ更新を待たずにガード
2. スキャンの解析APIに `AbortController` を追加し、アンマウント時にabort

## 実装内容

### 変更ファイル
- `app/(main)/chat/page.tsx` - `sendingRef = useRef(false)` で送信中フラグを管理し、`handleSend()` 冒頭で `sendingRef.current` チェック
- `app/(main)/scan/page.tsx` - `analyzeAbortRef = useRef<AbortController | null>(null)` を追加、`handleAnalyze()` でAbortController生成・fetch signalに渡す、useEffectクリーンアップでabort

### 実装内容
- チャット: `useRef` で送信中フラグを管理し、Stateのバッチ更新を待たずに二重送信をガード。`sendingRef.current = true` を `setLoading(true)` より先に設定
- スキャン: 解析APIに `AbortController` を追加し、`fetch()` の `signal` オプションに渡す。コンポーネントのアンマウント時（useEffectクリーンアップ）でabortを呼び出し、不要なAPIコストを防止
- AbortErrorの場合はエラー表示をスキップ
