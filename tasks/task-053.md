---
id: task-053
title: PWA改善 — アプリアイコン表示修正
parents: [PWA, UI/UX]
status: done
priority: medium
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "apple-touch-icon明示 + manifest purpose追加。maskableは現アイコンだと端が切れるため見送り"
estimated_hours: 1
---

## 概要
ホーム画面に追加した際のアプリアイコンが正しく表示されない問題を修正する。

## 対応方針
1. 現在のアイコン設定（manifest.json / apple-touch-icon）の状態を確認
2. 各サイズのアイコンが正しく配置・参照されているか検証
3. iOS / Android それぞれでホーム画面追加時のアイコン表示を確認
4. 必要に応じてアイコン画像の再生成・manifest修正

## 実装内容

### 変更ファイル
- `app/layout.tsx` - `<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />` を明示的に追加
- `public/manifest.json` - アイコンの `purpose` を `"any"` に設定（maskableは現アイコンだと端が切れるため見送り）

### 実装内容
- `app/layout.tsx` の `icons` メタデータに `apple-touch-icon` を明示的に指定
- `public/manifest.json` のアイコンに `"purpose": "any"` を追加（192x192、512x512の両サイズ）
- maskable用アイコンは現在のデザインだとセーフゾーン外が切れるため見送り

### 補足
- maskableアイコン対応は、アイコンデザインの変更時に合わせて実施予定
