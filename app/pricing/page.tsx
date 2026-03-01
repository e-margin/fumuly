"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/fumuly/back-link";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PlanKey = "monthly" | "yearly";

const plans = [
  {
    name: "無料",
    price: "0",
    unit: "円",
    period: "",
    description: "まずは試してみたい方に",
    features: ["月5通までスキャン", "AI書類解析", "AIチャット相談"],
  },
  {
    name: "月額",
    price: "480",
    unit: "円/月",
    period: "（税込）",
    description: "書類が毎月届く方に",
    features: [
      "スキャン無制限",
      "AI書類解析",
      "AIチャット相談",
      "リマインダー通知",
      "対応履歴の保存",
    ],
    planKey: "monthly" as PlanKey,
    recommended: true,
  },
  {
    name: "年額",
    price: "4,400",
    unit: "円/年",
    period: "（税込・約23%OFF）",
    description: "長く使いたい方におすすめ",
    features: [
      "スキャン無制限",
      "AI書類解析",
      "AIチャット相談",
      "リマインダー通知",
      "対応履歴の保存",
    ],
    planKey: "yearly" as PlanKey,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<PlanKey | null>(null);

  const handleSubscribe = async (planKey: PlanKey) => {
    setLoading(planKey);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/register";
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "エラーが発生しました");
        setLoading(null);
      }
    } catch {
      alert("エラーが発生しました。もう一度お試しください");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto flex items-center px-4 h-14">
          <BackLink />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">料金プラン</h1>
          <p className="text-sm text-sub mt-2">
            無料で始めて、必要なときにアップグレード
          </p>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border-2 p-5 ${
                plan.recommended
                  ? "border-[#F4845F] bg-[#F4845F]/5"
                  : "border-border"
              }`}
            >
              {plan.recommended && (
                <div className="inline-flex items-center gap-1 bg-[#F4845F] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                  <Sparkles className="h-3 w-3" />
                  おすすめ
                </div>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-sub">{plan.unit}</span>
                {plan.period && (
                  <span className="text-xs text-ignore">{plan.period}</span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground mt-1">
                {plan.name}プラン
              </p>
              <p className="text-xs text-sub mt-0.5">{plan.description}</p>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-keep shrink-0" />
                    <span className="text-sub">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.planKey ? (
                <Button
                  className={`w-full mt-4 h-11 rounded-xl ${
                    plan.recommended
                      ? "bg-[#F4845F] hover:bg-[#F4845F]/90 text-white"
                      : ""
                  }`}
                  variant={plan.recommended ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.planKey!)}
                  disabled={loading !== null}
                >
                  {loading === plan.planKey ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "アップグレードする"
                  )}
                </Button>
              ) : (
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="w-full mt-4 h-11 rounded-xl"
                  >
                    無料で始める
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-ignore mt-6">
          有料プランはいつでも解約できます。解約後も契約期間の終了まで利用可能です。
        </p>
      </div>
    </div>
  );
}
