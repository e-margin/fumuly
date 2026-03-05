---
id: task-045
title: 複数タブでの書類操作競合対策
parents: [バグ修正]
status: done
priority: high
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "toggleDone/ArchiveをDB状態ベースに変更"
estimated_hours: 0.5
---

## 概要
書類詳細の `toggleDone` / `toggleArchive` がクライアントの `doc` 状態を参照して反転させているが、APIサーバー側はDBの状態を見て反転するため、複数タブで操作すると状態が矛盾する。

## 対応
- API側のレスポンスで更新後の書類データを返し、クライアントはそれで `setDoc` を上書きする

## 実装内容

### 変更ファイル
- `app/api/documents/route.ts` - PATCH `toggle_done`/`toggle_archive` で既存のDB状態（`existing.is_done`/`existing.is_archived`）を参照して反転、更新後の書類データを `.select()` で返却
- `app/(main)/documents/[id]/page.tsx` - `toggleDone`/`toggleArchive` でAPIレスポンスの更新後データで `setDoc` を上書き

### 実装内容
- API側でDB状態ベースの反転を実施: `const newDone = !existing.is_done` のようにDBから取得した現在値を使用
- PATCHレスポンスで更新後の書類データ（is_done/done_at/is_archived/archived_at等）を返却
- クライアント側は `const updated = await res.json(); setDoc({ ...doc, ...updated })` でAPIレスポンスを信頼してUI更新
- 複数タブで操作しても、各タブがDBの最新状態に基づいて更新されるため矛盾が解消
