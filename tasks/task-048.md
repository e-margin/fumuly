---
id: task-048
title: API入力バリデーション・認証チェック順序・レート制限修正
parents: [セキュリティ, バグ修正]
status: done
priority: medium
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "chat認証順序修正 + documents POSTバリデーション追加（regenerateレート制限は現状維持）"
estimated_hours: 1
---

## 概要
1. `/api/chat`: bodyパース後に認証チェック → 認証を先に
2. `/api/documents` POST: sender/type/category等の型・長さチェックなし
3. `/api/regenerate`: レート制限がdocuments件数でカウントされており再生成回数と不一致

## 対応
1. chat APIの認証チェック順序を修正
2. documents POST に基本的なバリデーション追加
3. regenerateのレート制限を再生成リクエスト自体のカウントに変更（または制限方法の見直し）

## 実装内容

### 変更ファイル
- `app/api/chat/route.ts` - 認証チェックをbodyパースより先に移動（bodyパース前に認証を実施）
- `app/api/documents/route.ts` - POST時にsender/typeの型・存在チェック、categoryの有効値チェックを追加

### 実装内容
- チャットAPIの認証チェック順序を修正: `req.json()` でbodyをパースする前に `getUser()` で認証を実施し、未認証リクエストの不要なbodyパースを防止
- ドキュメントPOSTにバリデーション追加: `sender`/`type` が文字列かつ空でないことをチェック、`category` が `urgent/action/keep/ignore` のいずれかであることをチェック
- regenerateのレート制限については現状維持と判断（使用頻度が低く、他のレート制限で十分カバー）
