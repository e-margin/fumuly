import { BackLink } from "@/components/fumuly/back-link";

export default function DisclaimerPage() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto flex items-center px-4 h-14">
          <BackLink />
        </div>
      </header>

      <article className="max-w-2xl mx-auto px-4 py-8 prose prose-sm prose-neutral">
        <h1 className="text-xl font-bold text-foreground">免責事項</h1>
        <p className="text-sub text-sm">制定日：2026年3月1日</p>

        <p>
          Fumuly（フムリー）（以下「本サービス」）をご利用いただくにあたり、以下の免責事項をご確認ください。
        </p>

        <h2 className="text-base font-bold mt-8">
          AI解析の精度について
        </h2>
        <p>
          本サービスはAI（人工知能）を活用して書類の内容を読み取り・解析しています。AIの特性上、以下のような誤りが発生する可能性があります。
        </p>
        <ul>
          <li>金額の読み取りミス（特にマス目形式の数字、手書き金額）</li>
          <li>日付・期限の誤認識（和暦から西暦への変換ミス等）</li>
          <li>送付元・書類種別の誤判定</li>
          <li>優先度・カテゴリ分類の誤り（「保管」と判定された書類が実際は「要対応」等）</li>
          <li>不鮮明な画像・特殊なレイアウトの書類における認識精度の低下</li>
        </ul>
        <p>
          <strong>
            解析結果は必ず原本と照合し、重要な金額・期限は原本を正としてください。
          </strong>
        </p>

        <h2 className="text-base font-bold mt-8">
          AIアドバイスの範囲について
        </h2>
        <p>
          本サービスのAIチャットが提供するアドバイスは、一般的な情報提供を目的としたものです。以下の行為には該当しません。
        </p>
        <ul>
          <li>法律相談・法的助言（弁護士・司法書士にご相談ください）</li>
          <li>税務相談・申告支援（税理士にご相談ください）</li>
          <li>医療に関する判断（医師にご相談ください）</li>
          <li>金融商品の推薦・投資助言（ファイナンシャルプランナー等にご相談ください）</li>
          <li>行政手続きの代行（社会保険労務士・行政書士にご相談ください）</li>
        </ul>
        <p>
          AIが提案する「次にすべきこと」は参考情報です。ご自身の状況に合わせて、必要に応じて各分野の専門家にご相談ください。
        </p>

        <h2 className="text-base font-bold mt-8">
          損害に関する免責
        </h2>
        <ul>
          <li>
            AI解析結果の誤りにより、支払い遅延・期限超過・手続き漏れ等が生じた場合でも、当方は責任を負いません
          </li>
          <li>
            本サービスは書類管理の「補助」を目的としており、確実な期限管理・支払管理を保証するサービスではありません
          </li>
          <li>
            通信環境やAIモデルの仕様変更等により、サービスの品質が変動する場合があります
          </li>
        </ul>

        <h2 className="text-base font-bold mt-8">
          データの取り扱いについて
        </h2>
        <p>
          書類の画像はAI解析のためにAnthropic社のClaude APIに送信されます。画像は解析処理のみに使用され、当方のサーバーには保存されません。詳しくは
          <a href="/privacy" className="text-primary underline">
            プライバシーポリシー
          </a>
          をご覧ください。
        </p>

        <h2 className="text-base font-bold mt-8">
          お問い合わせ
        </h2>
        <p>
          ご不明な点がございましたら、以下までご連絡ください。
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
