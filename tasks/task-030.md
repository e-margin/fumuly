---
id: task-030
title: 金額編集エラー時のフィードバック追加
parents: [UI/UX, バグ修正]
status: done
depends_on: []
this_week: false
completed_at: 2026-03-01
progress: 100
note: 書類詳細の金額編集でDB更新失敗時にユーザーへ通知がない
estimated_hours: 0.05
---

## 概要

書類詳細画面の金額編集でSupabase updateが失敗した場合、エラーフィードバックがない。
ユーザーは保存できたと思い込む可能性がある。

## 対応

- `app/(main)/documents/[id]/page.tsx` の金額保存処理で `error` 時に `alert("保存に失敗しました")` を追加

## 実装内容

### 変更ファイル
- `app/(main)/documents/[id]/page.tsx` - 金額保存のPATCHリクエスト失敗時に `alert("保存に失敗しました")` を追加

### 実装内容
- 金額編集の確定時にPATCHリクエストのレスポンスをチェックし、`!res.ok` の場合に `alert("保存に失敗しました")` を表示
- 成功時のみ `setDoc` でUI更新を行うよう制御
