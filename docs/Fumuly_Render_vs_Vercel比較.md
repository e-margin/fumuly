# Render vs Vercel 比較メモ（2026-03-01 調査）

Fumulyのホスティング先としてRenderとVercelを比較した結果をまとめる。

## 前提

- Fumulyは Next.js 16（App Router）+ Supabase + Claude API のアプリ
- 現在は Render Free プランでホスティング中
- 課題: Render Freeプランの15分スリープ問題、カードが通らない問題

---

## プラン比較

| | Render Free | Render Starter | Vercel Hobby | Vercel Pro |
|---|---|---|---|---|
| **月額** | 無料 | $7 | 無料 | $20 |
| **カード登録** | 不要 | 必要 | 不要 | 必要 |
| **スリープ** | 15分で停止 | なし | なし | なし |
| **商用利用** | OK | OK | **不可** | OK |
| **アーキテクチャ** | コンテナ（常時起動） | コンテナ（常時起動） | サーバーレス | サーバーレス |

---

## Renderの優位点

### 1. サーバーが常時起動
- 従来型のコンテナで、プロセスが常に起動している
- WebSocket、長時間処理、バックグラウンドジョブが自然に書ける
- ローカル開発と同じ感覚で動作する

### 2. リクエストボディサイズの制限なし
- サーバーのメモリが許す限り何MBでも受け取れる
- Vercelは**4.5MB**の制限がある（サーバーレス関数への入力）

### 3. 関数のタイムアウト制限なし
- サーバーなのでタイムアウトの概念がない
- Vercel Hobbyは最大300秒（5分）

### 4. 商用利用に制限なし
- Free・有料問わず商用利用OK
- Vercel Hobbyは非商用のみ。収益化するならPro ($20/月) が必要

### 5. ファイルシステムへの書き込み
- ディスクに自由に読み書きできる（永続ディスクもオプションあり）
- Vercelのサーバーレス関数は `/tmp` のみ、リクエスト間で保持されない

### 6. 有料プランが安い
- Starter $7/月 で常時稼働・商用OK・制限なし
- Vercel Pro は $20/月

### 7. Cron Job
- 有料プランでCron Jobサービスを提供
- Vercel HobbyのCronは1日2回まで

---

## Vercelの優位点

### 1. スリープ問題がない
- サーバーレスなのでスリープの概念自体がない
- Render Freeは15分でスリープ → 復帰に30-60秒かかる

### 2. Next.jsとの最高の相性
- VercelはNext.jsの開発元
- ISR（Incremental Static Regeneration）の完全サポート
- Image Optimization（`next/image`の最適化が自動、Hobby: 月1,000枚まで）
- Font Optimization（`next/font`のビルド時最適化）
- Edge Middleware対応
- ゼロコンフィグデプロイ（`vercel.json`不要）

### 3. コールドスタートがほぼない
- Fluid Computeにより99%以上のリクエストでコールドスタートなし
- Render Freeのスリープ復帰（30-60秒）と比較すると圧倒的に速い

### 4. カード不要で始められる
- Hobbyプランはカード登録不要
- Render Starterはカード必須

### 5. グローバルCDN
- 静的アセットがグローバルに配信される
- Renderは単一リージョン

---

## Fumulyにとっての重要な比較ポイント

### 書類画像のアップロード（4.5MB制限）
- 現状: スマホカメラの元画像（3-5MB）をBase64でそのまま送信
- Base64化で33%増 → 最大6-7MBになりVercel制限に引っかかる
- **対策**: フロント側で長辺1568pxにリサイズ → 1枚300-500KBに圧縮
- Claude APIは内部で1568pxに自動縮小するため、**解析精度に影響なし**
- リサイズ後なら複数枚（10枚）でも約4MB以下で収まる → task-017

### 有料化時のコスト
- Render Starter: **$7/月**
- Vercel Pro: **$20/月**
- 月$13の差。年間で$156の差

### Web Push通知のCron Job（task-005）
- 「毎日朝にチェックして通知を送る」Cronが必要
- Vercel Hobbyは1日2回まで → **Supabase Edge Functionで代替可能**
- Render有料プランならCron Jobサービスあり

### 商用利用
- Fumulyは将来有料化予定 → Vercel Hobbyでは商用不可
- 有料化のタイミングでVercel Pro ($20) or Render Starter ($7) への移行が必要

---

## 結論

### 現時点の選択
**カードが通らない** → Vercel Hobbyが最も現実的。
画像リサイズ対応（task-017）を入れれば4.5MB制限も問題なし。

### 有料化時の選択
カードが通るようになったら、コスト面では**Render Starter ($7/月)**が有利。
ただしNext.jsの最適化やCDNの恩恵を重視するなら**Vercel Pro ($20/月)**も選択肢。

### 移行作業（Vercelを選ぶ場合）
1. `next.config.ts` から `output: "standalone"` を削除
2. GitHub リポジトリを Vercel にインポート
3. 環境変数5つを Vercel ダッシュボードで設定
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
4. Supabase Auth の Redirect URL に Vercel ドメインを追加
5. fumuly.com をカスタムドメインとして設定（Hobby でも無料）
6. 動作確認（スキャン・チャット・認証フロー）
