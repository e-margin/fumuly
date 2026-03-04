---
id: task-050
title: アクセシビリティ改善（aria-label・フィルタバッジ）
parents: [アクセシビリティ]
status: waiting
priority: medium
depends_on: []
this_week: false
completed_at: null
progress: 0
note: "アイコンボタンのaria-label追加、フィルタタブのバッジ読み上げ改善"
estimated_hours: 1
---

## 概要
1. 書類詳細等のアイコンのみボタンに `aria-label` がない
2. 書類一覧のフィルタタブで「緊急 3」が「3件」なのか曖昧

## 対応
1. アイコンボタンに `aria-label` を追加
2. TabsTrigger に `aria-label="緊急（3件）"` 等を設定
