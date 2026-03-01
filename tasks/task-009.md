---
id: task-009
title: ホスティング移行判断（Render vs Vercel）
parents:
  - インフラ
status: done
depends_on: []
this_week: false
completed_at: '2026-03-01'
progress: 100
note: Vercel Hobbyに移行完了。URL: https://fumuly.vercel.app
estimated_hours: 2
---

## 背景
Render Freeプランは15分アクセスがないとスリープする。
またRenderにカードが通らない問題がある。

## 調査結果（2026-03-01）

### 選択肢A: Render Free + スリープ防止（cron-job.org or UptimeRobot）
- 完全無料、cron-job.orgなら1分間隔で定期ping可能
- `/api/health` エンドポイントの作成が必要
- ただしRender公式は「keep-aliveはfree tierの趣旨に反する」と言及。将来ブロックのリスクあり
- 月間稼働 744h / 上限750h でギリギリ
- 有料化時: Starter $7/月で常時稼働・商用OK

### 選択肢B: Vercel Hobby（カード不要）
- 完全無料、カード登録不要、スリープの概念なし
- Next.js開発元のため最高の相性（ISR, Image Optimization等）
- `output: "standalone"` の削除が必要
- **制限**: 帯域100GB/月、リクエストボディ4.5MB（画像リサイズで対処可）
- **商用利用不可**（Hobbyプラン）。有料化時はPro $20/月が必要
- Cron Job は Hobby で1日2回まで（Push通知はSupabase Edge Functionで代替可）

### 比較
| | Render Free+ping | Render Starter | Vercel Hobby | Vercel Pro |
|---|---|---|---|---|
| 月額 | 無料 | $7 | 無料 | $20 |
| カード | 不要 | **必要** | 不要 | 必要 |
| スリープ | pingで回避 | なし | なし | なし |
| 商用利用 | OK | OK | **不可** | OK |
| ボディ制限 | なし | なし | 4.5MB | 4.5MB |

### 結論
- カードが通らない現状 → **Vercel Hobby**が最も現実的
- 画像の4.5MB制限はフロント側リサイズ（1568px）で解決可能（task-016）
- 有料化時にPro $20/月 vs Render Starter $7/月のコスト差は要検討

## 移行時の作業（Vercelを選ぶ場合）
1. `next.config.ts` から `output: "standalone"` を削除
2. GitHub リポジトリを Vercel にインポート
3. 環境変数5つを Vercel ダッシュボードで設定
4. Supabase Auth の Redirect URL に Vercel ドメインを追加
5. fumuly.com をカスタムドメインとして設定
6. 動作確認（スキャン・チャット・認証）
