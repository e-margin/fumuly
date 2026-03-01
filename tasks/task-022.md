---
id: task-022
title: 書類一覧・ホーム画面のstale data問題
parents: [UX, バグ]
status: waiting
priority: high
depends_on: []
this_week: true
completed_at: null
progress: 0
note: "フェーズ2: アーリーアダプター（優先5）。stale data問題"
estimated_hours: 0.05
---

## 概要

書類詳細で「対応済み」にしてから戻ると、一覧・ホーム画面が古いデータのまま表示される。

## 原因

- `documents/page.tsx` — useEffect依存配列が `[]` で初回マウント時のみ取得
- `home/page.tsx` — 同様
- BottomNavでタブ切替えしても同一ページならコンポーネントが再マウントされない

## 解決案

### A案: pathname変化で再フェッチ（シンプル）
- usePathnameを監視してフォーカス復帰時にrefetch

### B案: ルーター復帰時にリフレッシュ
- `router.refresh()` を詳細画面のtoggleDone/delete後に呼ぶ

### C案: useSWRまたはReact Query導入
- キャッシュ・再検証を仕組み化。大掛かりだが根本解決

## 推奨

A案で十分。`visibilitychange` イベントで画面復帰時にrefetchが最もシンプル。
