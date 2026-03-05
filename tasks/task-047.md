---
id: task-047
title: APIエラー時のUI表示改善（ホーム・書類一覧・DocumentCard）
parents: [UI/UX, バグ修正]
status: done
priority: medium
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "空表示とエラー表示の区別 + deadline無効日付のフォールバック"
estimated_hours: 1
---

## 概要
1. ホーム・書類一覧: APIエラー時に空表示と見分けがつかない
2. DocumentCard: deadlineが無効な日付文字列の場合に `NaN/NaN` と表示される

## 対応
1. `error` stateを追加し、エラー時は「読み込みに失敗しました」等を表示
2. `formatDeadline` で `isNaN(date.getTime())` チェックを追加し、無効な場合は生文字列を返す

## 実装内容

### 変更ファイル
- `app/(main)/home/page.tsx` - `error` stateを追加、APIエラー時に「読み込みに失敗しました」＋再読み込みボタンを表示
- `app/(main)/documents/page.tsx` - 同様に `error` stateとエラー表示を追加
- `components/fumuly/document-card.tsx` - `formatDeadline` で `isNaN(date.getTime())` チェックを追加し、無効な日付の場合は生文字列をそのまま返却

### 実装内容
- ホーム画面・書類一覧で `error` state（boolean）を追加し、API呼び出し失敗時に `setError(true)` でエラー表示に切り替え
- エラー表示はAlertTriangleアイコン+「読み込みに失敗しました」テキスト+「再読み込み」ボタン（`window.location.reload()`）
- DocumentCardの `formatDeadline` で `new Date(d)` の結果が `NaN` の場合、元の文字列を `{ text: d, urgent: false }` として返却し、`NaN/NaN` 表示を防止
