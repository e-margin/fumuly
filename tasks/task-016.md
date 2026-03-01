---
id: task-016
title: LPページのPC表示対応
parents: [UI/UX]
status: idea
priority: low
depends_on: []
this_week: false
completed_at: null
progress: 0
note: "フェーズ3: リリース（優先15）。LP PC表示対応"
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
