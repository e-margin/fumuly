---
id: task-055
title: リマインダー機能 — 期限ベースのリマインド管理
parents: [機能, UI/UX]
status: done
priority: high
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "DB+API+書類詳細UI+ホームバナー。プッシュ通知はtask-057で別途対応"
estimated_hours: 5
---

## 概要
書類の期限（deadline）に基づいてリマインダーを設定・管理する機能。ユーザーが「いつまでに何をすべきか」を忘れない仕組みを作る。

## 機能要件
1. 書類詳細ページからリマインダーを設定可能
   - 期限の1日前、3日前、7日前、当日など選択肢
   - カスタム日時の設定も可能
2. ホーム画面に「直近のリマインダー」セクションを追加
3. リマインダー一覧画面（設定中のリマインダーを管理）
4. 通知手段は複数対応（以下のタスクで個別実装）
   - アプリ内バナー（ホーム画面表示）— このタスクで実装
   - プッシュ通知 → task-057
   - カレンダー連携 → task-056

## DBスキーマ案
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL DEFAULT 'in_app', -- 'in_app' | 'push' | 'calendar'
  is_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## API設計
- `POST /api/reminders` — リマインダー作成
- `GET /api/reminders` — ユーザーのリマインダー一覧取得
- `DELETE /api/reminders/[id]` — リマインダー削除

## 影響範囲
- 新規: `app/api/reminders/` — APIエンドポイント
- 新規: `app/(main)/reminders/` — リマインダー一覧画面
- 変更: `app/(main)/documents/[id]/page.tsx` — リマインダー設定UI追加
- 変更: `app/(main)/home/page.tsx` — 直近リマインダー表示追加

## 追加改善（2026-03-05）
- カスタム日時の手入力UI（`datetime-local`）を追加。プリセット選択に加え、任意の日時でリマインダーを設定可能に
- 期限（deadline）がない書類でもリマインダーを追加可能に変更（「この日に対応する」的な使い方に対応）

## 実装内容

### 変更ファイル
- `supabase/schema.sql` - `reminders` テーブルを新規作成（id, user_id, document_id, remind_at, type, is_sent, created_at）
- `app/api/reminders/route.ts` - GET（一覧/upcoming/書類別）、POST（作成、バリデーション・重複チェック・上限50件チェック付き）、DELETE（削除）を新規作成
- `app/(main)/documents/[id]/page.tsx` - リマインダーセクション追加（既存リマインダー一覧、プリセット選択、カスタム日時入力、削除）
- `app/(main)/home/page.tsx` - 直近3日以内のリマインダーをバナー表示（Bellアイコン、残り時間ラベル）

### 実装内容
- `reminders` テーブルをDBに作成し、書類ごと・ユーザーごとのリマインダー管理を実装
- API: GET（mode=upcoming: 未送信かつ未来のリマインダー）、POST（所有権確認、重複チェック、上限50件チェック、UUID・日時バリデーション）、DELETE（所有権確認付き）
- 書類詳細ページにリマインダーセクションを追加: プリセット（当日/1日前/3日前/1週間前）とカスタム日時(`datetime-local`)の入力UI
- ホーム画面に直近3日以内のリマインダーをバナー表示（残り時間ラベル付き）
- 期限がない書類でもカスタム日時でリマインダーを追加可能
