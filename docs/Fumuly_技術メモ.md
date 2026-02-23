# 🔧 Fumuly 技術メモ

*最終更新：2026-02-23*

---

## 技術スタック

| レイヤー | 技術 | 補足 |
|--------|------|------|
| フロントエンド | React PWA | Create React App or Vite |
| バックエンド | Node.js / Express | REST API |
| データベース | Supabase（PostgreSQL） | テキストデータのみ保存 |
| ローカルストレージ | IndexedDB | 画像データはここに保持 |
| AI解析 | Claude API（Vision） | `claude-sonnet-4-6` |
| ホスティング | Render（フロント＋バック） | Starter プラン |
| 認証 | Supabase Auth | メール認証 |
| オフライン | Service Worker（Workbox） | 過去データのキャッシュ |
| 決済 | Stripe | 月額・年額サブスク |

---

## インフラ構成

```
ユーザー（スマホ）
  │
  ├─ React PWA（Render）
  │     └─ IndexedDB（画像をローカル保存）
  │
  ├─ Express API（Render）
  │     ├─ Supabase（解析結果テキスト）
  │     └─ Claude API（画像解析・一時送信のみ）
  │
  └─ Supabase Auth（認証）
```

---

## データ設計

### 画像の取り扱いフロー

```
撮影
  ↓
IndexedDB（端末内）に一時保存
  ↓
base64エンコード → Claude APIへ送信（解析のみ）
  ↓
解析結果テキストをSupabaseへ保存
  ↓
画像はIndexedDB内に保持（ユーザーが削除可能）
```

### documentsテーブル（Supabase）

```sql
CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sender        TEXT,
  type          TEXT,
  amount        INTEGER,
  deadline      DATE,
  action_required BOOLEAN,
  priority      TEXT CHECK (priority IN ('high', 'medium', 'low', 'ignore')),
  category      TEXT CHECK (category IN ('urgent', 'action', 'keep', 'ignore')),
  summary       TEXT,
  recommended_action TEXT,
  is_done       BOOLEAN DEFAULT FALSE,
  local_image_id TEXT  -- IndexedDB上の画像参照キー
);
```

---

## Claude API設計

### モデル
`claude-sonnet-4-6`

### システムプロンプト方針
- 督促・差押などのキーワードを確実に`high`判定させる
- 金額が複数ある場合は直近の支払い義務額を優先
- 手書き・印字混在に対応
- 必ずJSON形式のみで返答させる（説明文不要）

### レスポンスJSON形式

```json
{
  "sender": "送付元名",
  "type": "書類種別",
  "amount": 12000,
  "deadline": "2026-03-31",
  "action_required": true,
  "priority": "high",
  "summary": "電気料金の督促状",
  "recommended_action": "コンビニまたはWebから3/31までに支払い"
}
```

---

## オフライン対応

- Service Worker（Workbox）で過去の解析結果をキャッシュ
- オフライン時に撮影した場合はIndexedDBにキューとして保存
- オンライン復帰時に自動で解析・同期

```javascript
if (!navigator.onLine) {
  await saveToOfflineQueue(imageData);
  showToast("オフラインです。ネット接続時に自動で解析します");
} else {
  await analyzeAndSave(imageData);
}
```

---

## 通知・リマインダー機能

### MVP（v1.0）
- Web Push通知（ブラウザ標準）
- Supabase Cron Jobで毎日チェック → 期限3日前・当日に通知

### v1.5以降：カレンダー連携
- Google Calendar API連携
  - 期限をGoogleカレンダーに自動追加
  - ユーザーはGoogleアカウント連携が必要
- iCal形式でのエクスポート（Appleカレンダー等にも対応）

---

## Notion連携（v2以降）

**実装可能性**：Notion APIで技術的には連携可能

**課題**：
- ユーザー側でNotionインテグレーション設定が必要
- ADHDユーザーへのセットアップ手順が負担になるリスクがある
- まずカレンダー連携の利用状況を見てから判断する

**想定する連携内容**（v2）：
- 書類の解析結果をNotionデータベースに自動追加
- 対応済みステータスの同期

---

## 決済（Stripe）

- 月額480円・年額4,800円のサブスクリプション
- Supabase × Stripeの連携にはStripe Webhookを使用
- 有料ユーザーの判定はSupabaseのusersテーブルで管理

```sql
ALTER TABLE auth.users ADD COLUMN
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'paid'));
```

---

## セキュリティ方針

- Supabase Row Level Security（RLS）を有効化
- ユーザーは自分のデータのみ読み書き可能
- APIキーは環境変数で管理（`.env`）
- Claude APIキーはバックエンドのみで保持（フロントに露出しない）

---

## 開発ロードマップ

| フェーズ | 内容 | 目安 |
|--------|------|------|
| MVP | スキャン・解析・一覧・基本認証 | 〜v1.0 |
| v1.1 | Stripe課金・プラン管理 | MVP後 |
| v1.5 | Web Push通知・Googleカレンダー連携 | 〜 |
| v2.0 | Notion連携・家族共有・BtoB展開 | 〜 |

---

## 今後の検討事項

- [ ] フロントエンドのフレームワーク最終決定（CRA vs Vite）
- [ ] Renderのプラン詳細確認（Starterで帯域は足りるか）
- [ ] Supabase Cron Jobの設定方法調査
- [ ] Stripe × Supabase連携の実装方針
- [ ] Google Calendar API のOAuth設定

---

## 書面詳細要約機能

### 概要

書類画像をスキャンした際に、単なる項目抽出にとどまらず「ユーザーが次に何をすべきか」を寄り添うトーンで説明する機能。

**実現できること（Claude APIで対応可能）：**
- 書類の種類・金額・期限の抽出
- 免除・猶予・減額制度などの可能性の示唆
- 電話番号・問い合わせ先の抽出
- 電話不要の代替手段（Web・コンビニ・郵送）の優先提示
- 差押・督促など法的状況の深刻度判定

### システムプロンプト方針

```
ADHDで生活に困難を抱えるユーザーに向けて、以下のトーンで説明すること：
- やさしく・具体的に・押しつけがましくなく
- 電話不要の手段を必ず優先して案内する
- 「無視し続けるとどうなるか」を穏やかに伝える
- 免除・猶予・減額などの可能性があれば必ず言及する
- 深刻な状況（差押など）は事実として伝えつつ、次の行動を示す
```

### 免責事項（アプリ内表示）

```
※ この解析結果はAIによる参考情報です。
法的・福祉的な判断の最終的な根拠としないでください。
不安な場合は専門機関にご相談ください。
```

---

## 擬似ステートフル設計（文脈保持）

Claude APIはステートレスだが、過去の解析結果JSONを文脈として渡すことで擬似的なステートフルを実現する。

### 活用場面

- 複数の債務が並行している場合に優先順位を横断判断
- 差押が執行済みの状態で新たな督促が来た場合の緊急度評価
- 免除申請中の書類と新たな請求書を紐付けた案内

### 実装方針

```javascript
// Supabaseから過去の解析結果を取得してコンテキストとして渡す
const recentDocuments = await supabase
  .from('documents')
  .select('type, sender, amount, deadline, priority, summary')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10); // 直近10件を文脈として使用

const systemPrompt = `
ユーザーの直近の書類履歴：
${JSON.stringify(recentDocuments.data)}

この履歴を踏まえて新しい書類を解析し、
状況を横断的に理解した上でアドバイスすること。
`;
```

### トークン管理

文脈が増えるほどAPIコストが上昇するため：
- 渡す履歴は直近10件・要約フィールドのみに絞る
- 優先度`high`の書類は必ず含める
- 古い`ignore`カテゴリは除外する

---

## ユーザープロフィール機能

### 概要

初期設定でユーザーの生活状況を入力してもらい、システムプロンプトに組み込むことで解析精度を大幅に向上させる。

### 入力項目（初期設定）

```json
{
  "profile": {
    "income": {
      "type": "給与 / 年金 / 生活保護 / 無職 / その他",
      "monthly_amount": 0
    },
    "debt_overview": {
      "total_amount": 0,
      "creditors": ["JASSOなど"]
    },
    "characteristics": {
      "adhd": true,
      "phone_difficulty": true,
      "other": "自由記述"
    },
    "current_situation": "自由記述（例：差押が執行済み、免除申請中など）"
  }
}
```

### システムプロンプトへの組み込み

```javascript
const userProfile = await getUserProfile(userId);

const systemPrompt = `
【ユーザーの生活状況】
収入：${userProfile.income.type}・月${userProfile.income.monthly_amount}円
負債総額：${userProfile.debt_overview.total_amount}円
特性：${userProfile.characteristics.adhd ? 'ADHD' : ''}・${userProfile.characteristics.phone_difficulty ? '電話が困難' : ''}
現在の状況：${userProfile.current_situation}

【直近の書類履歴】
${JSON.stringify(recentDocuments)}

上記の状況を踏まえて、この書類を解析し寄り添うトーンでアドバイスすること。
`;
```

### 撮影ガイド（UI）

解析精度は写真品質に依存するため、スキャン画面に以下のガイドを表示する：

- 書類全体が画角に収まっているか確認
- 影・反射が入らないよう真上から撮影
- ピントが合っていることを確認してから撮影ボタンを押す
- 複数ページある場合は1枚ずつ撮影

### プロフィール更新

生活状況は変化するため、設定画面からいつでも更新可能にする。更新日時を記録し、古いプロフィールに基づく解析結果には注記を表示する。
