import { BackLink } from "@/components/fumuly/back-link";

const rows = [
  { label: "販売業者", value: "E-margin" },
  { label: "代表者", value: "請求があった場合に遅滞なく開示いたします" },
  { label: "所在地", value: "請求があった場合に遅滞なく開示いたします" },
  { label: "電話番号", value: "請求があった場合に遅滞なく開示いたします" },
  { label: "メールアドレス", value: "contact@fumuly.com" },
  { label: "サービス名", value: "Fumuly（フムリー）" },
  { label: "サービスURL", value: "https://fumuly.vercel.app" },
  {
    label: "販売価格",
    value: "各プランの料金はサービス内の料金ページに表示します",
  },
  { label: "支払方法", value: "クレジットカード" },
  {
    label: "支払時期",
    value:
      "有料プラン申込時に即時決済。以降、契約期間に応じて自動更新時に決済",
  },
  {
    label: "サービス提供時期",
    value: "決済完了後、直ちにご利用いただけます",
  },
  {
    label: "返品・キャンセル",
    value:
      "デジタルサービスの性質上、返金はいたしません。有料プランはいつでも解約可能で、解約後は契約期間の終了まで引き続きご利用いただけます",
  },
  {
    label: "動作環境",
    value:
      "モダンブラウザ（Chrome、Safari、Edge、Firefox の最新版）。インターネット接続が必要です",
  },
  { label: "特別な販売条件", value: "なし" },
];

export default function LegalPage() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto flex items-center px-4 h-14">
          <BackLink />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-foreground mb-6">
          特定商取引法に基づく表記
        </h1>

        <div className="border rounded-xl overflow-hidden">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex ${i !== 0 ? "border-t" : ""}`}
            >
              <div className="w-32 sm:w-40 shrink-0 bg-muted px-4 py-3 text-sm font-medium text-foreground">
                {row.label}
              </div>
              <div className="px-4 py-3 text-sm text-sub">{row.value}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-ignore mt-6">制定日：2026年2月23日</p>
      </div>
    </div>
  );
}
