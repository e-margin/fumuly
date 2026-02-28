import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QRSection } from "@/components/fumuly/qr-section";
import {
  Camera,
  Shield,
  MessageCircle,
  Bell,
  ChevronRight,
  Mail,
  Sparkles,
  Heart,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <span className="text-xl font-bold text-[#2C4A7C]">Fumuly</span>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[#2C4A7C]">
                ログイン
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-[#F4845F] hover:bg-[#F4845F]/90 text-white"
              >
                無料で始める
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-background to-white">
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#2C4A7C]/10 text-[#2C4A7C] rounded-full px-3 py-1 text-sm font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            書類が苦手なあなたのためのアプリ
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2D2D2D] leading-tight">
            封筒、無理ー！
            <br />
            <span className="text-[#2C4A7C]">を解決する。</span>
          </h1>
          <p className="mt-4 text-[#757575] text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            写真を撮るだけでAIが書類を読んで整理。
            <br />
            督促も、年金も、何をすべきか教えてくれる。
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#F4845F] hover:bg-[#F4845F]/90 text-white text-base px-8 h-12 rounded-full shadow-lg"
              >
                無料で始める
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-xs text-ignore">
              クレジットカード不要・1分で登録
            </p>
          </div>

          {/* Phone mockup area */}
          <div className="mt-12 mx-auto max-w-xs">
            <div className="bg-[#F7F8FA] rounded-3xl border-2 border-[#E5E7EB] p-4 shadow-xl">
              <div className="space-y-3">
                {/* Mock urgent card */}
                <div className="bg-urgent-bg rounded-xl p-3 text-left border border-urgent/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-urgent text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      緊急対応
                    </span>
                  </div>
                  <p className="font-bold text-sm text-[#2D2D2D]">
                    八王子市 徴収課
                  </p>
                  <p className="text-xs text-[#757575]">差押調書（謄本）</p>
                  <p className="text-xs text-[#2C4A7C] mt-1 bg-white/60 rounded px-2 py-1">
                    💡 市役所の窓口で分割納付の相談ができます
                  </p>
                </div>
                {/* Mock action card */}
                <div className="bg-action-bg rounded-xl p-3 text-left border border-action/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-action text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      要対応
                    </span>
                  </div>
                  <p className="font-bold text-sm text-[#2D2D2D]">JASSO</p>
                  <p className="text-xs text-[#757575]">奨学金返還の督促</p>
                  <p className="text-xs text-[#2C4A7C] mt-1 bg-white/60 rounded px-2 py-1">
                    💡 Webから猶予申請が可能です
                  </p>
                </div>
                {/* Mock keep card */}
                <div className="bg-keep-bg rounded-xl p-3 text-left border border-keep/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-keep text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      保管
                    </span>
                  </div>
                  <p className="font-bold text-sm text-[#2D2D2D]">日本年金機構</p>
                  <p className="text-xs text-[#757575]">被保険者資格通知</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#2D2D2D] mb-12">
            使い方は、たったの3ステップ
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#F4845F]/10 rounded-2xl flex items-center justify-center mb-4">
                <Camera className="h-7 w-7 text-[#F4845F]" />
              </div>
              <div className="text-sm font-bold text-[#F4845F] mb-1">
                Step 1
              </div>
              <h3 className="font-bold text-[#2D2D2D] mb-1">写真を撮る</h3>
              <p className="text-sm text-[#757575]">
                封筒の中身をスマホで撮影。
                <br />
                開封するだけでOK。
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#2C4A7C]/10 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="h-7 w-7 text-[#2C4A7C]" />
              </div>
              <div className="text-sm font-bold text-[#2C4A7C] mb-1">
                Step 2
              </div>
              <h3 className="font-bold text-[#2D2D2D] mb-1">AIが読む</h3>
              <p className="text-sm text-[#757575]">
                送付元、金額、期限を自動抽出。
                <br />
                緊急度を色で表示。
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-keep/10 rounded-2xl flex items-center justify-center mb-4">
                <MessageCircle className="h-7 w-7 text-keep" />
              </div>
              <div className="text-sm font-bold text-keep mb-1">
                Step 3
              </div>
              <h3 className="font-bold text-[#2D2D2D] mb-1">相談する</h3>
              <p className="text-sm text-[#757575]">
                「これどうすれば？」をAIに相談。
                <br />
                電話なしの対処法を案内。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-[#F7F8FA]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#2D2D2D] mb-12">
            Fumulyがあなたを守る
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 bg-urgent/10 rounded-xl flex items-center justify-center mb-3">
                <Bell className="h-5 w-5 text-urgent" />
              </div>
              <h3 className="font-bold text-[#2D2D2D] mb-1">
                期限を見逃さない
              </h3>
              <p className="text-sm text-[#757575]">
                差押や督促など、緊急の書類を自動で最優先表示。
                期限が近づくとリマインドします。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 bg-[#2C4A7C]/10 rounded-xl flex items-center justify-center mb-3">
                <Shield className="h-5 w-5 text-[#2C4A7C]" />
              </div>
              <h3 className="font-bold text-[#2D2D2D] mb-1">
                電話しなくていい
              </h3>
              <p className="text-sm text-[#757575]">
                Web申請、コンビニ払い、郵送など
                電話不要の対処法を優先的にご案内。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 bg-action/10 rounded-xl flex items-center justify-center mb-3">
                <Heart className="h-5 w-5 text-action" />
              </div>
              <h3 className="font-bold text-[#2D2D2D] mb-1">
                あなたの状況を理解する
              </h3>
              <p className="text-sm text-[#757575]">
                収入、借金、あなたの特性を踏まえて、
                あなたに合ったアドバイスを提供。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 bg-keep/10 rounded-xl flex items-center justify-center mb-3">
                <Mail className="h-5 w-5 text-keep" />
              </div>
              <h3 className="font-bold text-[#2D2D2D] mb-1">
                「読まなくていい」も教える
              </h3>
              <p className="text-sm text-[#757575]">
                DMや広告は「無視OK」と明確に判定。
                大事な書類だけに集中できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Story */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-lg text-[#2D2D2D] leading-relaxed">
            「机の上の封筒、何日も開けてなかった。
            <br />
            <span className="text-urgent font-bold">
              差押の通知
            </span>
            が混ざってたなんて知らなかった」
          </p>
          <p className="mt-4 text-sm text-[#757575]">
            ── そんな経験から生まれたアプリです。
          </p>
        </div>
      </section>

      {/* QR Code (PC only) */}
      <QRSection />

      {/* CTA */}
      <section className="py-16 px-4 bg-[#2C4A7C] text-white text-center">
        <h2 className="text-2xl font-bold mb-3">
          封筒を開けるのは、あなた。
          <br />
          中身を読むのは、Fumuly。
        </h2>
        <p className="text-white/70 mb-8 text-sm">
          まずは1通、写真を撮ってみてください。
        </p>
        <Link href="/register">
          <Button
            size="lg"
            className="bg-[#F4845F] hover:bg-[#F4845F]/90 text-white text-base px-8 h-12 rounded-full shadow-lg"
          >
            無料で始める
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#F7F8FA] text-center">
        <p className="text-sm text-[#757575]">
          © 2026 Fumuly. All rights reserved.
        </p>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-ignore">
          <Link href="/privacy" className="hover:text-[#757575]">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="hover:text-[#757575]">
            利用規約
          </Link>
          <Link href="/legal" className="hover:text-[#757575]">
            特定商取引法
          </Link>
        </div>
      </footer>
    </div>
  );
}
