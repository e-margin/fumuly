# 🤖 Claude Code 引き渡しプロンプト

*作成日：2026-02-23*
*用途：Claude CodeでFumuly MVPの実装を開始する際に使用*

---

## プロンプト本文

以下をClaude Codeの最初のメッセージとして貼り付けてください。

---

```
# Fumuly（フムリー）MVP実装

## プロジェクト概要

ADHDや認知的負荷の高いユーザーが、郵便物・封筒の内容を把握・管理するPWAアプリ。
写真を撮るだけでClaude APIが内容を解析し、重要度・種類・期限を自動分類して記録する。

コアコンセプト：「熟読しなくていい」「開封してスキャンするだけでいい」

## 技術スタック

- フレームワーク：Next.js（App Router）
- CSS：Tailwind CSS + shadcn/ui
- データベース：Supabase（PostgreSQL）
- ローカルストレージ：IndexedDB（画像データのみ）
- AI解析：Claude API（claude-sonnet-4-6・Vision）
- 認証：Supabase Auth
- ホスティング：Render
- PWA：@ducanh2912/next-pwa
- 決済：Stripe（後フェーズ）

## ブランドカラー

```css
--color-primary:   #2C4A7C;  /* ソフトネイビー */
--color-accent:    #F4845F;  /* ウォームオレンジ */
--color-bg:        #F7F8FA;  /* オフホワイト */
--color-text:      #2D2D2D;  /* チャコール */
--color-urgent:    #E05252;  /* 緊急 */
--color-action:    #F0A500;  /* 要対応 */
--color-keep:      #52A06E;  /* 保管 */
--color-ignore:    #ABABAB;  /* 破棄可 */
```

## ディレクトリ構成

```
fumuly/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (main)/
│   │   ├── home/
│   │   ├── scan/
│   │   ├── documents/
│   │   │   └── [id]/
│   │   └── settings/
│   └── api/
│       ├── analyze/
│       ├── documents/
│       └── stripe/
├── components/
│   ├── ui/
│   └── fumuly/
├── lib/
│   ├── supabase.ts
│   ├── claude.ts
│   └── stripe.ts
└── public/
    └── manifest.json
```

## データベース設計（Supabase）

```sql
CREATE TABLE documents (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id),
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sender             TEXT,
  type               TEXT,
  amount             INTEGER,
  deadline           DATE,
  action_required    BOOLEAN,
  priority           TEXT CHECK (priority IN ('high', 'medium', 'low', 'ignore')),
  category           TEXT CHECK (category IN ('urgent', 'action', 'keep', 'ignore')),
  summary            TEXT,
  recommended_action TEXT,
  is_done            BOOLEAN DEFAULT FALSE,
  local_image_id     TEXT
);

-- Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own documents"
  ON documents FOR ALL USING (auth.uid() = user_id);
```

## Claude API設計

モデル：claude-sonnet-4-6

システムプロンプト方針：
- ADHDで生活に困難を抱えるユーザーに向けて、やさしく・具体的に説明する
- 電話不要の手段（Web・コンビニ・郵送）を必ず優先して案内する
- 差押・強制執行・最終通告・督促のキーワードは必ずpriority: "high"
- 金額が複数ある場合は直近の支払い義務額を優先
- 免除・猶予・減額制度の可能性があれば必ず言及する
- 直近10件の解析履歴をコンテキストとして渡し、状況を横断的に判断する
- 必ずJSON形式のみで返答（説明文不要）

レスポンスJSON：
```json
{
  "sender": "送付元名",
  "type": "書類種別",
  "amount": 12000,
  "deadline": "2026-03-31",
  "action_required": true,
  "priority": "high",
  "category": "urgent",
  "summary": "電気料金の督促状",
  "recommended_action": "コンビニまたはWebから3/31までに支払い。支払いが困難な場合は分割・猶予の相談が可能。"
}
```

## 画面構成

1. オンボーディング（初回のみ）
   - Claude APIへの画像送信について同意確認
   - ユーザープロフィール入力（収入・負債概要・特性・現在の状況）

2. ホーム
   - 未対応の緊急書類を優先表示
   - 下部固定のスキャンボタン（アクセントカラー）
   - ボトムナビゲーション（ホーム・一覧・設定）

3. スキャン
   - カメラ起動→撮影→解析中ローディング→結果確認→保存
   - 撮影ガイド（影・反射を避けるよう案内）
   - オフライン時はIndexedDBにキューとして保存

4. 一覧
   - 優先度タブ（すべて・緊急・要対応・保管・破棄可）
   - 期限順・登録日順ソート

5. 書類詳細
   - 解析結果・推奨アクション・ローカル画像表示
   - 対応済みフラグ・削除機能

6. 設定
   - 通知設定
   - プロフィール更新
   - 全データ削除

## 重要な実装方針

### 画像データの取り扱い
- 画像はIndexedDBのみに保存（クラウドに送らない）
- Claude APIへは解析のみを目的として送信
- 解析後はテキスト結果のみをSupabaseに保存

### オフライン対応
- Service Worker（Workbox）で過去の解析結果をキャッシュ
- オフライン時はキューに保存し、オンライン復帰時に自動送信

### セキュリティ
- Claude APIキーはサーバーサイド（api/analyze）のみで使用
- フロントに露出しない
- Supabase RLS有効化済み

### UX原則
- 一画面一アクション
- 緊急度を色で直感的に伝える
- 「次に何をすべきか」を必ず提示する
- 電話を勧めない（Web・コンビニ・郵送を優先）

## MVPのスコープ

以下のみ実装する（課金・通知・カレンダー連携はv1.1以降）：
- ユーザー認証（Supabase Auth）
- オンボーディング・プロフィール設定
- 書類スキャン・AI解析
- 解析結果の保存・一覧・詳細表示
- 対応済みフラグ
- データ削除機能

## 環境変数

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NODE_ENV=development
```

まずプロジェクトのセットアップから始めてください。
Next.jsプロジェクトの作成、shadcn/uiの初期設定、Supabaseとの接続確認までを最初のステップとします。
```

---

## 使い方

1. Claude Codeを起動
2. 上記プロンプトをそのまま貼り付けて送信
3. 「まずプロジェクトのセットアップから」という指示に従って進める

## 補足

実装を進める中で追加の指示が必要な場合は、このドキュメントの各セクションを参照して適宜追加してください。特に以下は実装フェーズで詳細を詰める必要があります。

- Claude APIのシステムプロンプト全文（技術メモ参照）
- shadcn/uiのテーマ設定（デザイン・UI設計参照）
- IndexedDBの実装詳細（`idb`または`Dexie.js`を使用）
