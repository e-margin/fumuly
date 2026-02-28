import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PriorityBadge, PriorityBar } from "./priority-badge";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface DocumentCardProps {
  id: string;
  sender: string;
  type: string;
  amount: number | null;
  deadline: string | null;
  category: "urgent" | "action" | "keep" | "ignore";
  summary: string;
  recommended_action?: string;
  is_done: boolean;
}

const categoryBg = {
  urgent: "bg-[#FDF0F0]",
  action: "bg-[#FDF8EC]",
  keep: "bg-[#F0F8F3]",
  ignore: "bg-[#F5F5F5]",
};

export function DocumentCard({
  id,
  sender,
  type,
  amount,
  deadline,
  category,
  summary,
  recommended_action,
  is_done,
}: DocumentCardProps) {
  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat("ja-JP").format(amt);
  };

  const formatDeadline = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const formatted = `${date.getMonth() + 1}/${date.getDate()}`;
    if (diff < 0) return { text: `${formatted}（期限切れ）`, urgent: true };
    if (diff <= 3) return { text: `${formatted}（あと${diff}日）`, urgent: true };
    if (diff <= 7) return { text: `${formatted}（あと${diff}日）`, urgent: false };
    return { text: formatted, urgent: false };
  };

  return (
    <Link href={`/documents/${id}`} className="block">
      <Card
        className={cn(
          "flex overflow-hidden transition-all active:scale-[0.98] py-0",
          categoryBg[category],
          is_done && "opacity-60"
        )}
      >
        <PriorityBar category={category} />
        <div className="flex-1 p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <PriorityBadge category={category} />
                {is_done && (
                  <span className="flex items-center gap-0.5 text-xs text-[#52A06E]">
                    <CheckCircle2 className="h-3 w-3" />
                    対応済み
                  </span>
                )}
              </div>
              <p className="mt-1.5 font-bold text-sm text-[#2D2D2D] truncate">
                {sender}
              </p>
              <p className="text-xs text-[#757575]">{type}</p>
            </div>
          </div>
          <p className="text-sm text-[#2D2D2D] line-clamp-2">{summary}</p>
          <div className="flex items-center justify-between text-xs">
            {amount != null && (
              <span className="font-bold text-[#2D2D2D] font-[family-name:var(--font-inter)]">
                ¥{formatAmount(amount)}
              </span>
            )}
            {deadline && (() => {
              const dl = formatDeadline(deadline);
              return (
                <span className={cn("ml-auto", dl.urgent ? "text-[#E05252] font-bold" : "text-[#757575]")}>
                  期限 {dl.text}
                </span>
              );
            })()}
          </div>
          {recommended_action && (
            <p className="text-xs text-[#2C4A7C] bg-white/60 rounded px-2 py-1">
              💡 {recommended_action}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
