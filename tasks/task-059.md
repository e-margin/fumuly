---
id: task-059
title: チャット品質テスト — Playwright自動テスト + 手動チェック
parents: [品質, AI]
status: done
priority: low
depends_on: []
this_week: true
completed_at: 2026-03-05
progress: 100
note: "Playwright 6テスト全pass。トーン・電話非推奨・期限質問・連続送信すべてOK"
estimated_hours: 4
---

## 概要
チャット機能の回答品質をPlaywrightでスモークテスト + ユーザーによる手動チェックで検証する。

## Playwrightテスト範囲
1. チャット画面が正常に表示されるか
2. メッセージ送信→回答が返ってくるか（タイムアウトなし）
3. 特定の質問パターンに対して最低限のキーワードが含まれるか
   - 例: 「期限が近い書類は？」→ deadline関連の情報が含まれる
   - 例: 「この書類はどうすればいい？」→ recommended_action相当の内容が含まれる
4. エラー状態のハンドリング（API障害時のUI表示）

## 手動チェック項目
- AI回答のトーン（寄り添い・語りかけ）
- 具体的なアクション提示の質
- 書類コンテキストの正確な参照
- 不適切な回答（電話を勧める等）がないか

## 備考
- 回答内容の「良し悪し」は自動判定が難しいため、Playwrightは構造テストに限定
- 品質改善はプロンプトチューニングで対応（別タスク化の可能性あり）

## 作業メモ（2026-03-05）

### テスト結果: 6/6 passed (1.3min)
1. **chat page loads correctly** — ヘッダー・入力欄・送信ボタン・初期表示の確認
2. **send message and receive response** — 「こんにちは」に日本語で回答が返る
3. **deadline question returns relevant response** — 「期限が近い書類は？」に期限/書類関連の回答
4. **action advice question returns actionable response** — 「届いた書類にどう対応すればいい？」に電話を勧めない回答
5. **tone is warm and supportive** — 「差押予告通知が届いたんだけど怖い」に対し寄り添い+具体的アクション提示
6. **handles rapid messages gracefully** — 連続メッセージでもエラーなし

### 特筆すべき回答品質
差押予告通知の質問に対する回答が秀逸:
- 「怖いですよね」と共感
- 「予告通知はまだ差押が実行された状態ではない」と事実を穏やかに伝達
- 「今から動けば間に合います」と安心感
- 発行元ごとの対応方法を提示
- 「通知書をFumulyで撮影してもらえると、内容を一緒に確認できますよ」とアプリ活用を案内

### 新規ファイル
- `playwright.config.ts` — Playwright設定（モバイルビューポート）
- `tests/chat-quality.spec.ts` — チャット品質テスト6件

### 実行方法
```bash
npx playwright test tests/chat-quality.spec.ts
```
