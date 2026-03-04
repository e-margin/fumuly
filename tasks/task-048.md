---
id: task-048
title: API入力バリデーション・認証チェック順序・レート制限修正
parents: [セキュリティ, バグ修正]
status: waiting
priority: medium
depends_on: []
this_week: true
completed_at: null
progress: 0
note: "chat認証順序 + documents POSTバリデーション + regenerateレート制限修正"
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
