---
id: task-039
title: 利用方法ページ（/guide）の作成
parents: [LP, UI/UX]
status: done
priority: high
depends_on: []
this_week: true
completed_at: 2026-03-02
progress: 100
note: docs/Fumuly_機能・使い方まとめ.md を元にページを作成
---

## 概要

ログイン後ページとして `(main)/guide` に利用方法・機能紹介ページを作成する。
`docs/Fumuly_機能・使い方まとめ.md` の内容をベースに、LPと統一感のあるデザインで実装。

## 完了条件
- /guide ページが公開状態で表示される
- LP・フッターから導線がある
- 機能紹介・使い方・対応書類の例が含まれる

## 実装内容

### 変更ファイル
- `app/(main)/guide/page.tsx` - 利用方法ページを新規作成（機能紹介・使い方・対応書類の例）
- `app/(main)/settings/page.tsx` - 「使い方ガイド」リンク（`/guide`）を設定画面に追加

### 実装内容
- `app/(main)/guide/page.tsx` を新規作成し、`docs/Fumuly_機能・使い方まとめ.md` をベースにした利用方法ページを実装
- 機能紹介セクション（スキャン、AI解析、チャット相談、書類管理など）をアイコン付きで表示
- 設定画面に「使い方ガイド」リンクを追加（BookOpenアイコン）
- BackLinkコンポーネントで「戻る」リンクを設定
