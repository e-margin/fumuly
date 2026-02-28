"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, MessageCircle, Settings, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKeyboardOpen } from "@/hooks/use-keyboard-open";

const navItems = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/documents", label: "一覧", icon: FileText },
  { href: "/scan", label: "スキャン", icon: Camera, accent: true },
  { href: "/chat", label: "相談", icon: MessageCircle },
  { href: "/settings", label: "設定", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const keyboardOpen = useKeyboardOpen();

  if (keyboardOpen) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-sm safe-area-bottom">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;

          if (item.accent) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4845F] text-white shadow-lg active:scale-95 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="mt-1 text-[10px] text-[#F4845F] font-medium">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 min-w-[48px] min-h-[44px] justify-center",
                isActive ? "text-[#2C4A7C]" : "text-[#757575]"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className={cn("text-[10px]", isActive && "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
