import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto flex items-center px-4 h-14">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            戻る
          </Link>
        </div>
      </header>

      <article className="max-w-2xl mx-auto px-4 py-8 prose prose-sm prose-neutral">
        <h1 className="text-xl font-bold text-foreground">
          プライバシーポリシー
        </h1>
        <p className="text-sub text-sm">制定日：2026年2月23日</p>

        <p>
          E-margin（以下「当方」）は、Fumuly（フムリー）（以下「本サービス」）における個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
        </p>

        <h2 className="text-base font-bold mt-8">第1条（取得する情報）</h2>
        <p>本サービスでは、以下の情報を取得します。</p>
        <p className="font-semibold">1. ユーザーが入力・撮影した情報</p>
        <ul>
          <li>郵便物・書類の画像（撮影データ）</li>
          <li>メールアドレス（アカウント登録時）</li>
        </ul>
        <p className="font-semibold">2. 自動的に取得される情報</p>
        <ul>
          <li>ログイン日時・利用状況などのアクセスログ</li>
          <li>端末情報・ブラウザ情報</li>
        </ul>

        <h2 className="text-base font-bold mt-8">第2条（利用目的）</h2>
        <p>取得した情報は、以下の目的のために利用します。</p>
        <ul>
          <li>本サービスの提供・運営・改善</li>
          <li>ユーザーへのサポート・お問い合わせ対応</li>
          <li>期限・対応事項のリマインダー通知</li>
          <li>利用規約違反等の調査・対応</li>
        </ul>

        <h2 className="text-base font-bold mt-8">
          第3条（画像データの取り扱い）
        </h2>
        <p>撮影された書類の画像データは、以下のとおり取り扱います。</p>
        <ul>
          <li>
            画像データはお使いの端末内（ローカルストレージ）にのみ保存されます
          </li>
          <li>
            画像はAI解析のためAnthropicが提供するClaude
            API（以下「外部AIサービス」）に送信されます
          </li>
          <li>
            外部AIサービスへの送信は解析処理のみを目的とし、当方のサーバーには画像を保存しません
          </li>
          <li>
            解析結果のテキストデータのみをクラウド上のデータベースに保存します
          </li>
        </ul>

        <h2 className="text-base font-bold mt-8">第4条（第三者提供）</h2>
        <p>
          当方は、以下の場合を除き、取得した個人情報を第三者に提供しません。
        </p>
        <ul>
          <li>ユーザーの同意がある場合</li>
          <li>法令に基づく場合</li>
          <li>人の生命・身体・財産の保護のために必要な場合</li>
        </ul>
        <p className="font-semibold">外部サービスへの送信について</p>
        <p>
          本サービスは、書類解析のためにAnthropicのClaude
          APIを使用しています。送信される情報は書類の画像データであり、Anthropicの
          <a
            href="https://www.anthropic.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            プライバシーポリシー
          </a>
          に基づいて処理されます。
        </p>

        <h2 className="text-base font-bold mt-8">
          第5条（データの保管・セキュリティ）
        </h2>
        <ul>
          <li>
            テキスト解析結果はSupabaseが提供するデータベースに暗号化して保存します
          </li>
          <li>
            当方は適切なセキュリティ対策を講じますが、完全な安全性を保証するものではありません
          </li>
        </ul>

        <h2 className="text-base font-bold mt-8">第6条（ユーザーの権利）</h2>
        <p>ユーザーは以下の権利を有します。</p>
        <ul>
          <li>自身のデータの閲覧・確認</li>
          <li>自身のデータの修正・削除</li>
          <li>アカウントおよびすべてのデータの削除</li>
        </ul>
        <p>
          データの削除はアプリ内の設定画面から行えます。設定画面からの削除が困難な場合は、下記お問い合わせ先までご連絡ください。
        </p>

        <h2 className="text-base font-bold mt-8">
          第7条（Cookie・トラッキング）
        </h2>
        <p>
          本サービスは、サービス改善のためにCookieおよびローカルストレージを使用する場合があります。ブラウザの設定によりCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。
        </p>

        <h2 className="text-base font-bold mt-8">第8条（広告について）</h2>
        <p>
          本サービスは現在、広告を表示しておらず、広告目的での情報利用は行っていません。
        </p>

        <h2 className="text-base font-bold mt-8">
          第9条（未成年者の利用）
        </h2>
        <p>
          本サービスは、13歳未満の方の利用を想定していません。13歳未満の方が利用する場合は、保護者の同意のもとでご利用ください。
        </p>

        <h2 className="text-base font-bold mt-8">
          第10条（プライバシーポリシーの変更）
        </h2>
        <p>
          当方は、必要に応じて本ポリシーを変更することがあります。重要な変更がある場合は、本サービス上でお知らせします。変更後も本サービスを継続してご利用いただいた場合、変更後のポリシーに同意したものとみなします。
        </p>

        <h2 className="text-base font-bold mt-8">第11条（お問い合わせ）</h2>
        <p>
          本ポリシーに関するお問い合わせは、以下の窓口までご連絡ください。
        </p>
        <p>
          <strong>運営者</strong>：E-margin
          <br />
          <strong>メールアドレス</strong>：contact@fumuly.com
        </p>
      </article>
    </div>
  );
}
