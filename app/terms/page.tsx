import { BackLink } from "@/components/fumuly/back-link";

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto flex items-center px-4 h-14">
          <BackLink />
        </div>
      </header>

      <article className="max-w-2xl mx-auto px-4 py-8 prose prose-sm prose-neutral">
        <h1 className="text-xl font-bold text-foreground">利用規約</h1>
        <p className="text-sub text-sm">制定日：2026年2月23日</p>

        <p>
          E-margin（以下「当方」）は、Fumuly（フムリー）（以下「本サービス」）の利用について、以下のとおり利用規約を定めます。本サービスをご利用いただく場合は、本規約に同意したものとみなします。
        </p>

        <h2 className="text-base font-bold mt-8">
          第1条（サービスの概要）
        </h2>
        <p>
          本サービスは、郵便物・書類の画像をAIで解析し、内容の要約・優先度の判定・対応方法の案内を行うWebアプリケーションです。
        </p>

        <h2 className="text-base font-bold mt-8">第2条（アカウント）</h2>
        <ol>
          <li>本サービスの利用にはアカウント登録が必要です。</li>
          <li>
            ユーザーは正確な情報を登録し、登録情報に変更が生じた場合は速やかに更新するものとします。
          </li>
          <li>
            アカウントの管理はユーザー自身の責任で行うものとし、第三者による不正利用について当方は責任を負いません。
          </li>
        </ol>

        <h2 className="text-base font-bold mt-8">
          第3条（AI解析について）
        </h2>
        <ol>
          <li>
            本サービスのAI解析結果は参考情報であり、法的助言・医療的助言・金融商品の推薦を行うものではありません。
          </li>
          <li>
            AI解析の正確性について、当方は最善を尽くしますが、完全な正確性を保証するものではありません。
          </li>
          <li>
            重要な書類の内容については、必ず原本を確認し、必要に応じて専門家（弁護士・税理士・社会保険労務士等）にご相談ください。
          </li>
          <li>
            AI解析の結果に基づいてユーザーが行った判断・行動について、当方は責任を負いません。
          </li>
        </ol>

        <h2 className="text-base font-bold mt-8">第4条（禁止事項）</h2>
        <p>ユーザーは、以下の行為を行ってはなりません。</p>
        <ol>
          <li>法令または公序良俗に反する行為</li>
          <li>
            他者の個人情報を本人の同意なくアップロードする行為
          </li>
          <li>本サービスの運営を妨害する行為</li>
          <li>
            本サービスを逆コンパイル、リバースエンジニアリングする行為
          </li>
          <li>本サービスを商業目的で無断利用する行為</li>
          <li>その他、当方が不適切と判断する行為</li>
        </ol>

        <h2 className="text-base font-bold mt-8">第5条（料金）</h2>
        <ol>
          <li>本サービスには無料プランと有料プランがあります。</li>
          <li>
            有料プランの料金・内容は、本サービス上に別途定めるものとします。
          </li>
          <li>
            有料プランの解約は、アプリ内の設定画面またはお問い合わせ窓口から行えます。
          </li>
        </ol>

        <h2 className="text-base font-bold mt-8">
          第6条（サービスの変更・中断・終了）
        </h2>
        <ol>
          <li>
            当方は、事前の通知なくサービスの内容を変更することがあります。
          </li>
          <li>
            当方は、以下の場合にサービスを一時中断することがあります。
            <ul>
              <li>システムの保守・点検を行う場合</li>
              <li>天災・停電等の不可抗力が発生した場合</li>
              <li>その他、運営上必要と判断した場合</li>
            </ul>
          </li>
          <li>
            当方は、30日前までに通知することにより、本サービスを終了することができます。
          </li>
        </ol>

        <h2 className="text-base font-bold mt-8">
          第7条（知的財産権）
        </h2>
        <p>
          本サービスに含まれるコンテンツ（テキスト、画像、デザイン、プログラム等）の知的財産権は当方に帰属します。ただし、ユーザーがアップロードしたデータの権利はユーザーに帰属します。
        </p>

        <h2 className="text-base font-bold mt-8">第8条（免責事項）</h2>
        <ol>
          <li>
            当方は、本サービスの利用により生じた損害について、当方の故意または重大な過失による場合を除き、責任を負いません。
          </li>
          <li>
            当方は、ユーザー間またはユーザーと第三者との間で生じたトラブルについて、責任を負いません。
          </li>
          <li>
            本サービスは「現状有姿」で提供されるものであり、特定の目的への適合性、正確性、完全性を保証するものではありません。
          </li>
        </ol>

        <h2 className="text-base font-bold mt-8">
          第9条（データの削除）
        </h2>
        <ol>
          <li>
            ユーザーは、アプリ内の設定画面からいつでも自身のデータを削除することができます。
          </li>
          <li>アカウント削除後のデータの復旧はできません。</li>
        </ol>

        <h2 className="text-base font-bold mt-8">第10条（規約の変更）</h2>
        <ol>
          <li>
            当方は、必要に応じて本規約を変更することがあります。
          </li>
          <li>
            重要な変更がある場合は、本サービス上でお知らせします。
          </li>
          <li>
            変更後も本サービスを継続してご利用いただいた場合、変更後の規約に同意したものとみなします。
          </li>
        </ol>

        <h2 className="text-base font-bold mt-8">
          第11条（準拠法・管轄）
        </h2>
        <p>
          本規約は日本法に準拠し、本規約に関する紛争は東京地方裁判所を第一審の専属的合意管轄裁判所とします。
        </p>

        <h2 className="text-base font-bold mt-8">
          第12条（お問い合わせ）
        </h2>
        <p>
          本規約に関するお問い合わせは、以下の窓口までご連絡ください。
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
