---
id: task-026
title: 解析結果の手動編集機能
parents: [UI/UX, 機能]
status: done
priority: low
depends_on: []
this_week: false
completed_at: 2026-03-03
progress: 100
note: sender/type/deadline/categoryの編集UIを実装。金額修正は既存
estimated_hours: 0.3
---

## 概要

AI解析結果（送付元・金額・期限・カテゴリ）を保存後に修正する手段がない。

## ユースケース

- 「保管」に分類されたが実は「要対応」だった
- 金額が読み取りミス
- 期限の年が間違っている（令和→西暦の変換ミス）

## 実装案

- 書類詳細画面に「編集」ボタン
- category / amount / deadline / sender / type を修正可能に
- summary / recommended_action / detailed_summary はAI生成のため編集不要（再スキャンで対応）

## 実装内容

### 変更ファイル
- `app/(main)/documents/[id]/page.tsx` - sender/type/deadline/categoryの各フィールドにインライン編集UI（Pencilアイコン→入力→確定ボタン）を追加
- `app/api/documents/route.ts` - PATCH action=`update_fields` を新規追加（sender/type/deadline/categoryの更新、バリデーション付き）

### 実装内容
- 書類詳細ページにsender/type/deadline/categoryの編集ボタン（Pencilアイコン）を追加
- タップで編集モードに切り替わり、入力→Checkボタンで確定、APIにPATCH送信
- カテゴリはPriorityBadgeをタップして `urgent → action → keep → ignore` の順にサイクル切替え
- API側で `update_fields` アクションを追加し、許可フィールドのみ更新（sender/typeは空文字禁止、categoryは有効値チェック）
- 金額編集は既存実装をそのまま利用
