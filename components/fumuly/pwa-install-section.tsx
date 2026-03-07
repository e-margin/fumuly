"use client";

import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Share,
  Plus,
  MoreVertical,
  Download,
} from "lucide-react";

export function PwaInstallSection() {
  const { canInstall, isInstalled, install } = usePwaInstall();

  return (
    <section className="py-16 lg:py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 lg:mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#2C4A7C]/10 rounded-2xl mb-4">
            <Smartphone className="h-7 w-7 text-[#2C4A7C]" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#2D2D2D] mb-3">
            ホーム画面に追加して
            <br />
            アプリのように使える
          </h2>
          <p className="text-sm text-[#757575]">
            アプリストアからのダウンロードは不要です
          </p>

          {/* Android向けインストールボタン */}
          {canInstall && (
            <Button
              onClick={install}
              size="lg"
              className="mt-6 bg-[#F4845F] hover:bg-[#F4845F]/90 text-white text-base px-8 h-12 rounded-full shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              ホーム画面に追加
            </Button>
          )}

          {isInstalled && (
            <p className="mt-6 text-sm text-keep font-medium">
              インストール済みです
            </p>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-2xl mx-auto">
          {/* iOS */}
          <div className="bg-[#F7F8FA] rounded-2xl p-5 lg:p-7">
            <p className="text-xs font-bold text-[#757575] mb-3">
              iPhone / iPad
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-[#2C4A7C] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  1
                </span>
                <p className="text-sm text-[#2D2D2D]">
                  <span className="font-bold">Safari</span> で fumuly.com
                  を開く
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-[#2C4A7C] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  2
                </span>
                <div className="flex items-center gap-1.5 text-sm text-[#2D2D2D]">
                  <Share className="h-4 w-4 text-[#2C4A7C] shrink-0" />
                  <span>共有ボタンをタップ</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-[#2C4A7C] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  3
                </span>
                <div className="flex items-center gap-1.5 text-sm text-[#2D2D2D]">
                  <Plus className="h-4 w-4 text-[#2C4A7C] shrink-0" />
                  <span>「ホーム画面に追加」を選択</span>
                </div>
              </div>
            </div>
          </div>
          {/* Android */}
          <div className="bg-[#F7F8FA] rounded-2xl p-5 lg:p-7">
            <p className="text-xs font-bold text-[#757575] mb-3">Android</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-[#2C4A7C] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  1
                </span>
                <p className="text-sm text-[#2D2D2D]">
                  <span className="font-bold">Chrome</span> で fumuly.com
                  を開く
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-[#2C4A7C] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  2
                </span>
                <div className="flex items-center gap-1.5 text-sm text-[#2D2D2D]">
                  <MoreVertical className="h-4 w-4 text-[#2C4A7C] shrink-0" />
                  <span>右上のメニューをタップ</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-[#2C4A7C] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  3
                </span>
                <div className="flex items-center gap-1.5 text-sm text-[#2D2D2D]">
                  <Smartphone className="h-4 w-4 text-[#2C4A7C] shrink-0" />
                  <span>「ホーム画面に追加」を選択</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
