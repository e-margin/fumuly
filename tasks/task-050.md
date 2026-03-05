---
id: task-050
title: アクセシビリティ改善（aria-label・フィルタバッジ）
parents: [アクセシビリティ]
status: done
priority: medium
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "アイコンボタンのaria-label追加、フィルタタブのバッジ読み上げ改善"
estimated_hours: 1
---

## 概要
1. 書類詳細等のアイコンのみボタンに `aria-label` がない
2. 書類一覧のフィルタタブで「緊急 3」が「3件」なのか曖昧

## 対応
1. アイコンボタンに `aria-label` を追加
2. TabsTrigger に `aria-label="緊急（3件）"` 等を設定

## 実装内容

### 変更ファイル
- `app/(main)/documents/[id]/page.tsx` - アイコンのみボタンに `aria-label` を追加（「送付元を編集」「金額を確定」「書類を削除」「アーカイブ」「リマインダーを削除」など）
- `app/(main)/documents/page.tsx` - TabsTriggerに `aria-label="緊急（3件）"` 等を設定、バッジ部分に `aria-hidden="true"` を追加
- `app/(main)/scan/page.tsx` - 画像削除ボタンに `aria-label="画像N枚目を削除"` 、金額確定ボタンに `aria-label="金額を確定"` を追加

### 実装内容
- 書類詳細ページのアイコンのみボタン（Pencil、Check、Trash2、Archive、X等）にaria-labelを追加
- 書類一覧のフィルタタブで件数が0より大きい場合に `aria-label="緊急（3件）"` の形式でスクリーンリーダー向けの読み上げテキストを設定
- バッジの数字部分に `aria-hidden="true"` を追加し、aria-labelとの重複読み上げを防止
- スキャン画面の画像削除ボタンやフォームボタンにもaria-labelを追加
