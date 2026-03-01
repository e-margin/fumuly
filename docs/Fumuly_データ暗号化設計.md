# Fumuly データ暗号化設計

*作成日：2026-03-01*

---

## 目的

Supabase Dashboard（Table Editor）でユーザーの機微データが平文で閲覧できてしまう状態を解消する。
アプリレベルでカラム単位の暗号化を行い、DBに保存されるデータを暗号文にする。

---

## 暗号化の位置づけ

| レイヤー | 方法 | 状態 |
|---------|------|------|
| 通信暗号化（in-transit） | HTTPS (TLS) | 済み |
| ディスク暗号化（at-rest） | Supabase標準 | 済み |
| **アプリレベル暗号化** | **AES-256-GCM（カラム単位）** | **今回実装** |

---

## 暗号化方式

### アルゴリズム

- **AES-256-GCM**（Authenticated Encryption）
- Node.js 標準の `crypto` モジュールを使用（追加パッケージ不要）
- GCM モードにより暗号化と改ざん検知を同時に実現

### 鍵管理

- 環境変数 `ENCRYPTION_KEY` に 256bit（32バイト）の鍵を hex 文字列で格納
- Vercel / `.env.local` の両方に設定
- 鍵の生成: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### データ形式

暗号化されたデータは以下の形式で DB に保存する：

```
enc:v1:<iv(hex)>:<authTag(hex)>:<ciphertext(hex)>
```

- `enc:v1` — バージョンプレフィックス（将来の鍵ローテーション対応）
- `iv` — 初期化ベクトル（12バイト、毎回ランダム生成）
- `authTag` — 認証タグ（16バイト、GCMが生成）
- `ciphertext` — 暗号文

平文データは `enc:` で始まらないため、暗号化済みかどうかの判別が可能。

---

## 対象カラム

| テーブル | カラム | 型 | 理由 |
|---------|--------|-----|------|
| `documents` | `summary` | TEXT | 督促・差押等の具体的内容 |
| `documents` | `detailed_summary` | TEXT | 書類の詳細説明 |
| `documents` | `recommended_action` | TEXT | 推奨アクション（支払い先等を含む） |
| `conversations` | `content` | TEXT | ユーザーの相談内容・AI回答 |
| `profiles` | `current_situation` | TEXT | 生活困窮の詳細記述 |

### 暗号化しないカラム

| カラム | 理由 |
|--------|------|
| `documents.amount` / `deadline` | フィルタ・ソートに使用 |
| `documents.priority` / `category` | フィルタに使用 |
| `documents.sender` / `type` | 一覧表示に使用（個人特定リスク低） |
| `documents.is_done` | boolean |
| `profiles.has_adhd` / `phone_difficulty` | boolean |
| `profiles.debt_total` / `monthly_income` | 数値のみ |
| `profiles.income_type` | 選択肢のみ |

---

## 実装設計

### 1. 暗号化ユーティリティ（`lib/encryption.ts`）

```typescript
// encrypt(plaintext: string): string
// → "enc:v1:<iv>:<authTag>:<ciphertext>"

// decrypt(encrypted: string): string
// → 元のテキスト。"enc:" で始まらない場合はそのまま返す（後方互換）

// encryptFields(obj, fields): obj
// → 指定フィールドを暗号化した新しいオブジェクトを返す

// decryptFields(obj, fields): obj
// → 指定フィールドを復号した新しいオブジェクトを返す
```

**後方互換性**: `decrypt()` は `enc:` プレフィックスがないデータ（既存の平文）をそのまま返す。これにより、暗号化移行中も既存データが正常に読める。

### 2. API Route の変更箇所

#### `/api/analyze`（書類解析）

```
Claude API → JSON解析 → encryptFields(result, ['summary', 'detailed_summary', 'recommended_action']) → DB保存
```

※ フロントへのレスポンスは暗号化前のデータを返す（復号不要）。

#### `/api/chat`（チャット）

```
# 読み出し（コンテキスト用）
documents 取得 → decryptFields(['summary']) → Claude に渡す
conversations 取得 → decryptFields(['content']) → messages に渡す

# 書き込み
ユーザーメッセージ → encrypt(content) → DB保存
AI回答 → encrypt(content) → DB保存

# レスポンス
reply は暗号化前のテキストをそのまま返す
```

#### `/api/regenerate`（サマリー再生成）

```
Claude API → JSON解析 → encryptFields(result, ['summary', 'detailed_summary', 'recommended_action']) → DB更新
```

#### プロフィール更新

```
current_situation → encrypt() → DB保存
DB読み出し → decrypt() → フロントに返す
```

### 3. フロントエンドの変更

- **変更不要**: API Route が復号済みデータを返すため、フロントの変更は一切不要

### 4. 既存データの一括暗号化

Supabase Management API を使って一括暗号化するスクリプトを作成：

```
scripts/encrypt-existing-data.ts
```

1. 全レコードを取得
2. 対象カラムが `enc:` で始まらないものをフィルタ
3. 暗号化して UPDATE
4. 処理件数をログ出力

※ 冪等（何度実行しても安全）。既に暗号化済みのレコードはスキップ。

---

## 鍵ローテーション（将来対応）

データ形式にバージョンプレフィックス（`enc:v1`）を含めているため、将来的に鍵を変更する場合：

1. 新しい鍵で `enc:v2` として暗号化
2. 復号時は `v1` / `v2` に応じて対応する鍵で復号
3. バッチで全データを `v2` に再暗号化
4. 旧鍵を廃棄

---

## 環境変数

| 変数名 | 用途 | 生成方法 |
|--------|------|---------|
| `ENCRYPTION_KEY` | AES-256-GCM 暗号鍵（hex、64文字） | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

Vercel と `.env.local` の両方に設定が必要。

---

## リスクと注意点

### 鍵紛失 = データ喪失

`ENCRYPTION_KEY` を紛失すると暗号化データを復号できなくなる。
Vercel の環境変数とは別に、安全な場所にバックアップを保管すること。

### パフォーマンス

- AES-256-GCM は高速であり、テキストデータの暗号化/復号のオーバーヘッドは無視できるレベル
- DB のデータサイズは暗号化により約2〜3倍に増加する（hex エンコードのため）

### DBでの検索不可

- 暗号化カラムでの `WHERE` / `LIKE` 検索はできなくなる
- 現在これらのカラムでDB検索は行っていないため影響なし

---

## 検証方法

1. ローカルで `ENCRYPTION_KEY` を設定し、書類をスキャン → Supabase で暗号文を確認
2. 書類一覧・詳細画面で正常に復号されて表示されることを確認
3. チャットで書類コンテキストが正常に渡されていることを確認
4. 既存データマイグレーションスクリプトの実行 → 全件暗号化を確認
5. `npm run build` が通ることを確認
