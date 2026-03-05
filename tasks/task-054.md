---
id: task-054
title: PWA改善 — スケルトンローダー導入（読み込み中の黒帯解消）
parents: [PWA, UI/UX]
status: done
priority: medium
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "ホーム・書類一覧・書類詳細にスケルトンローダー導入。チャットは現状スケルトン不要と判断"
estimated_hours: 3
---

## 概要
ページ読み込み中にテキスト部分が黒帯（フラッシュ）で表示される問題をスケルトンローダー（ゴースト表示）に置き換える。

## 現状
- ローディング中は `Loader2` のスピナーのみ表示
- コンテンツ領域が空→一気に表示されるため、レイアウトシフトが発生
- PWAとして使う際に特に目立つ（スプラッシュ画面→黒帯→コンテンツ）

## 対応方針
1. 共通のスケルトンコンポーネントを作成（カード型・テキスト行型）
2. ホーム画面（`/home`）にスケルトン適用
3. 書類一覧（`/documents`）にスケルトン適用
4. 書類詳細（`/documents/[id]`）にスケルトン適用
5. チャット画面（`/chat`）にスケルトン適用（必要に応じて）

## デザイン方針
- shadcn/ui の Skeleton コンポーネントを活用
- 実際のレイアウトに近い形状でゴースト表示
- アニメーション: pulse（明滅）パターン

## 実装内容

### 変更ファイル
- `components/ui/skeleton.tsx` - shadcn/ui Skeletonコンポーネントを追加
- `components/fumuly/skeletons.tsx` - `DocumentCardSkeleton`/`HomeSkeleton`/`DocumentsListSkeleton`/`DocumentDetailSkeleton` を新規作成
- `app/(main)/home/page.tsx` - ローディング中に `HomeSkeleton` を表示（Loader2スピナーから置換）
- `app/(main)/documents/page.tsx` - ローディング中に `DocumentsListSkeleton` を表示
- `app/(main)/documents/[id]/page.tsx` - ローディング中に `DocumentDetailSkeleton` を表示

### 実装内容
- shadcn/ui の `Skeleton` コンポーネント（pulseアニメーション）を導入
- 実際のレイアウトに近い形状のスケルトンコンポーネントを作成（カードの左サイドバー、テキスト行、バッジ等を模したゴースト表示）
- ホーム画面: カード型スケルトン3枚を表示
- 書類一覧: カード型スケルトン4枚を表示
- 書類詳細: 優先度バッジ+情報カード+アクションボタンの形状でスケルトン表示
- チャット画面は現状スケルトン不要と判断（初期メッセージなしの状態で十分）
