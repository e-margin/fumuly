---
id: task-042
title: セッション永続化（アプリ閉じるとログアウトされる問題）
parents: [セキュリティ, バグ修正]
status: in-progress
priority: critical
depends_on: []
this_week: true
completed_at: null
progress: 30
note: 調査完了、原因特定済み。修正実装待ち
estimated_hours: 3
---

## 問題

アプリ（PWA）を閉じて再度開くと、ログアウト状態になってしまう。
ユーザー体験として致命的な問題。

## 調査結果（原因特定済み）

### 原因1: AuthGuardがセッションリフレッシュを試みていない

`components/fumuly/auth-guard.tsx` にて、`supabase.auth.getUser()` でユーザーを取得し、
nullの場合は即座に `/login` にリダイレクトしている。

しかし、`getUser()` はアクセストークンが期限切れの場合にnullを返すことがある。
この時 `supabase.auth.refreshSession()` を先に呼べばリフレッシュトークンで
セッションを復活できる可能性があるが、その処理がない。

### 原因2: Cookieのdomain属性が未設定

`lib/supabase.ts` の `setAll` でCookieを設定する際、`domain` 属性を明示していない。
PWA環境ではドメイン指定がないと、Cookieの永続性に影響する場合がある。

### 原因3: 明示的なセッションリフレッシュがどこにもない

アプリ全体で `supabase.auth.refreshSession()` が一切呼ばれていない。
`middleware.ts` で `getUser()` を呼んでいるが、これはミドルウェアレベルの処理であり、
クライアントサイドでアプリを再開した際のリフレッシュロジックがない。

## 修正方針

### 修正1: AuthGuardにrefreshSession()を追加

```typescript
// 現在の実装（問題あり）
const { data: { user } } = await supabase.auth.getUser();
if (!user) router.push("/login");

// 修正後
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  // リフレッシュトークンでセッション復活を試みる
  const { data: refreshData } = await supabase.auth.refreshSession();
  if (!refreshData.session) {
    router.push("/login");
  }
}
```

### 修正2: Cookie設定の改善

`lib/supabase.ts` の `setAll` で適切なCookie属性を設定:
- `maxAge`: 十分な期間（例: 30日 = 2592000秒）
- `path`: `/`
- `sameSite`: `lax`

### 修正3: visibilitychange時のリフレッシュ強化

AuthGuardの `visibilitychange` ハンドラで、タブ復帰時にも
`refreshSession()` → `getUser()` の順で呼ぶようにする。

## 関連ファイル

- `components/fumuly/auth-guard.tsx` — メイン修正対象
- `lib/supabase.ts` — Cookie設定の改善
- `middleware.ts` — 参考（現状のミドルウェアセッションリフレッシュ）
