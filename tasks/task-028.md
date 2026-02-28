---
id: task-028
title: オフラインフォールバック・SWキャッシュ改善
parents: [PWA]
status: waiting
depends_on: []
this_week: false
completed_at: null
progress: 0
note: オフラインで白画面になる問題
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
