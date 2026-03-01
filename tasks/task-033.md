---
id: task-033
title: ホーム画面で最下部のカードと「AIに相談」ボタンが重なる問題の修正
parents: [UI/UX, バグ修正]
status: done
priority: high
depends_on: []
this_week: true
completed_at: 2026-03-01
progress: 100
note: "フェーズ2: アーリーアダプター（優先4）。ホーム画面ボタン重なりバグ"
estimated_hours: 1
---

## 概要
ログイン後のホーム画面（/home）で、一番下のドキュメントカードと「AIに相談」ボタン（FAB）が重なって表示される問題を修正する。

## 原因（想定）
- フローティングボタンの位置と、コンテンツ領域の下部パディングが不足している
- ボトムナビゲーションバー + FABの高さ分のパディングが必要

## 対応方針
- ホーム画面のコンテンツ領域に十分な `padding-bottom` を追加して、FABと重ならないようにする

## 作業メモ（2026-03-01）
- `app/(main)/home/page.tsx` のルートdivに `pb-36` を追加（FAB + ボトムナビ分のパディング）
