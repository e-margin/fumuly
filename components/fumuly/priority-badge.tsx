import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Archive, Trash2 } from "lucide-react";

type Priority = "high" | "medium" | "low" | "ignore";
type Category = "urgent" | "action" | "keep" | "ignore";

const priorityConfig = {
  urgent: {
    label: "緊急対応",
    icon: AlertTriangle,
    className: "bg-[#E05252] text-white hover:bg-[#E05252]/90",
  },
  action: {
    label: "要対応",
    icon: Clock,
    className: "bg-[#F0A500] text-white hover:bg-[#F0A500]/90",
  },
  keep: {
    label: "保管",
    icon: Archive,
    className: "bg-[#52A06E] text-white hover:bg-[#52A06E]/90",
  },
  ignore: {
    label: "破棄可",
    icon: Trash2,
    className: "bg-[#ABABAB] text-white hover:bg-[#ABABAB]/90",
  },
} as const;

export function PriorityBadge({
  category,
  size = "default",
}: {
  category: Category;
  size?: "default" | "lg";
}) {
  const config = priorityConfig[category];
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        config.className,
        size === "lg" && "text-sm px-3 py-1"
      )}
    >
      <Icon className={cn("mr-1", size === "lg" ? "h-4 w-4" : "h-3 w-3")} />
      {config.label}
    </Badge>
  );
}

export function PriorityBar({ category }: { category: Category }) {
  const colorMap = {
    urgent: "bg-[#E05252]",
    action: "bg-[#F0A500]",
    keep: "bg-[#52A06E]",
    ignore: "bg-[#ABABAB]",
  };

  return <div className={cn("w-1 rounded-full", colorMap[category])} />;
}
