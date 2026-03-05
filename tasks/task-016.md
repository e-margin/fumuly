---
id: task-016
title: LPページのPC表示対応
parents:
  - UI/UX
status: done
priority: low
depends_on: []
this_week: false
completed_at: '2026-03-01'
note: 'フェーズ3: リリース（優先15）。LP PC表示対応'
estimated_hours: 4
---

## 概要
現在のLPはスマホ向けに設計されており、PCで閲覧すると余白が多くコンテンツが狭く見える。
LPはPCからのアクセスも想定されるため、PC表示を改善する。

## 対応方針
- ログイン後の画面はスマホ専用のままでOK（PWAアプリのため）
- LPページ（`app/page.tsx`）のみPC対応する

## 主な改善点
- ヒーローセクション：PC時は左テキスト・右モックアップの横並びレイアウト
- コンテンツ幅：`max-w-4xl` → `max-w-6xl` に拡張
- モックアップ：PC時はサイズを大きく表示
- 各セクションの余白・フォントサイズをPC向けに調整

## 実装内容

### 変更ファイル
- `app/page.tsx` - LP全体にレスポンシブ対応のTailwind CSSクラスを追加（`max-w-6xl`、`sm:`/`md:`/`lg:` ブレークポイント）

### 実装内容
- LP（`app/page.tsx`）にTailwind CSSのレスポンシブクラスを適用
- コンテンツ幅を `max-w-6xl` に拡張し、PC表示時の余白を改善
- ヘッダー、ヒーローセクション、機能紹介セクション等にブレークポイント別のスタイルを設定
- ログイン後の画面はスマホ専用のまま（PWAアプリのため変更なし）
