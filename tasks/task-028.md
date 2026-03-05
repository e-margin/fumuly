---
id: task-028
title: オフラインフォールバック・SWキャッシュ改善
parents: [PWA]
status: done
priority: low
depends_on: []
this_week: false
completed_at: 2026-03-03
progress: 100
note: オフラインページ・SWプリキャッシュ・CACHE_NAME自動更新を実装
estimated_hours: 0.1
---

## 概要

Service Workerの2つの問題を修正する。

### 1. オフラインフォールバックページがない
- キャッシュにないページにオフラインでアクセスすると真っ白
- `caches.match(request)` が `undefined` を返す
- 「オフラインです。接続を確認してください」ページを用意する

### 2. CACHE_NAMEがハードコード
- `fumuly-v1` を手動で変えない限り古いキャッシュが残り続ける
- ビルド時にタイムスタンプ等で自動更新する仕組みが必要

## 実装

### フォールバック
- `public/offline.html` を作成
- SWのinstallイベントでプリキャッシュ
- fetchのcatch内で `caches.match("/offline.html")` を返す

### キャッシュ名
- `next.config.ts` のビルド時にSWのCACHE_NAMEを書き換えるスクリプト
- または `fumuly-${Date.now()}` のようなテンプレート

## 実装内容

### 変更ファイル
- `public/offline.html` - オフラインフォールバックページを新規作成（日本語UI、再読み込みボタン、online復帰時の自動リロード）
- `public/sw.js` - installイベントで `offline.html` をプリキャッシュ、fetchのナビゲーションリクエストでnetwork-first→cache→offline.htmlのフォールバックチェーン、静的アセットのcache-first戦略、CACHE_NAMEにビルドタイムスタンプを含める

### 実装内容
- `public/offline.html` を作成: 「インターネットに接続されていません」メッセージ、再読み込みボタン、`window.addEventListener('online', ...)` で自動リロード
- Service Workerのinstallイベントで `offline.html` をプリキャッシュ
- ナビゲーションリクエストでネットワーク失敗時にキャッシュ→`offline.html` の順でフォールバック
- `_next/static/` のアセットはcache-first戦略
- CACHE_NAMEを `fumuly-{ビルドタイムスタンプ}` 形式にし、activateイベントで古いキャッシュを自動削除
- `clients.claim()` でactivate直後に全タブを制御
