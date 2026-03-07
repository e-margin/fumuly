"use client";

import { useState } from "react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Download, X, Share, Plus, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function PwaInstallBanner() {
  const { canInstall, isInstalled, install } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  // インストール済み or 閉じた場合は表示しない
  if (isInstalled || dismissed) return null;

  // iOS: beforeinstallpromptが発火しないので独自判定
  const ios = isIos();

  // Android でも iOS でもない、またはインストール不可の場合は非表示
  if (!canInstall && !ios) return null;

  return (
    <div className="mb-4 bg-[#2C4A7C]/5 border border-[#2C4A7C]/15 rounded-xl p-3 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 text-sub hover:text-foreground"
        aria-label="閉じる"
      >
        <X className="h-4 w-4" />
      </button>

      {canInstall ? (
        // Android: ワンタップインストール
        <div className="flex items-center gap-3 pr-6">
          <div className="w-10 h-10 bg-[#2C4A7C]/10 rounded-xl flex items-center justify-center shrink-0">
            <Download className="h-5 w-5 text-[#2C4A7C]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              ホーム画面に追加
            </p>
            <p className="text-xs text-sub">
              アプリのようにすぐ開けます
            </p>
          </div>
          <Button
            onClick={install}
            size="sm"
            className="bg-[#2C4A7C] hover:bg-[#2C4A7C]/90 text-white rounded-full px-4 shrink-0"
          >
            追加
          </Button>
        </div>
      ) : ios ? (
        // iOS: 手順ガイド
        <div className="pr-6">
          <button
            onClick={() => setShowIosGuide(!showIosGuide)}
            className="flex items-center gap-3 w-full text-left"
          >
            <div className="w-10 h-10 bg-[#2C4A7C]/10 rounded-xl flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-[#2C4A7C]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                ホーム画面に追加できます
              </p>
              <p className="text-xs text-[#2C4A7C]">
                {showIosGuide ? "閉じる" : "やり方を見る"}
              </p>
            </div>
          </button>
          {showIosGuide && (
            <div className="mt-3 ml-[52px] space-y-2">
              <div className="flex items-center gap-2 text-xs text-foreground">
                <Share className="h-3.5 w-3.5 text-[#2C4A7C] shrink-0" />
                <span>
                  下部の <span className="font-bold">共有ボタン</span> をタップ
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground">
                <Plus className="h-3.5 w-3.5 text-[#2C4A7C] shrink-0" />
                <span>
                  「<span className="font-bold">ホーム画面に追加</span>
                  」を選択
                </span>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
