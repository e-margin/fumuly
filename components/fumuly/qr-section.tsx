"use client";

import { QRCodeSVG } from "qrcode.react";
import { Smartphone } from "lucide-react";

export function QRSection() {
  return (
    <section className="hidden md:block py-16 px-4 bg-[#F7F8FA]">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Smartphone className="h-5 w-5 text-[#2C4A7C]" />
          <h2 className="text-xl font-bold text-[#2D2D2D]">
            スマホで使おう
          </h2>
        </div>
        <p className="text-sm text-[#757575] mb-6">
          カメラでQRコードをスキャンしてね
        </p>
        <div className="inline-block bg-white rounded-2xl p-6 shadow-sm">
          <QRCodeSVG
            value="https://fumuly.com"
            size={160}
            fgColor="#2C4A7C"
            level="M"
          />
        </div>
      </div>
    </section>
  );
}
