---
id: task-006
title: 画像のIndexedDB保存
parents: [機能]
status: waiting
depends_on: []
this_week: false
completed_at: null
progress: 0
note: スキャン画像をローカルに保持し再表示可能にする
estimated_hours: 4
---

## 概要
技術メモに記載の通り、撮影した書類画像をIndexedDBに保存し、書類詳細画面で再表示できるようにする。

## 実装内容
1. IndexedDB ヘルパー関数の作成（保存・取得・削除）
2. スキャン時に画像をIndexedDBに保存（`local_image_id` で紐付け）
3. 書類詳細画面で画像を表示
4. データ全削除時にIndexedDBもクリア
5. ストレージ容量の管理（古い画像の自動削除等）
