"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { PriorityBadge } from "@/components/fumuly/priority-badge";
import {
  Camera,
  X,
  Loader2,
  RotateCcw,
  Save,
  ImagePlus,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/claude";
import ReactMarkdown from "react-markdown";

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert("画像サイズが大きすぎます（10MB以下にしてください）");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      // Extract base64 data (remove data:image/...;base64, prefix)
      setBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!base64) return;
    setAnalyzing(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
        body: JSON.stringify({ image: base64 }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setResult(data);
    } catch {
      alert("解析に失敗しました。もう一度お試しください。");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("documents").insert({
      user_id: user.id,
      sender: result.sender,
      type: result.type,
      amount: result.amount,
      deadline: result.deadline,
      action_required: result.action_required,
      priority: result.priority,
      category: result.category,
      summary: result.summary,
      recommended_action: result.recommended_action,
      detailed_summary: result.detailed_summary,
    });

    if (error) {
      alert("保存に失敗しました");
      setSaving(false);
      return;
    }

    router.push("/home");
  };

  const handleRetake = () => {
    setPreview(null);
    setBase64(null);
    setResult(null);
  };

  // Analysis result view
  if (result) {
    return (
      <div className="px-4 pt-6 pb-24">
        <h1 className="text-lg font-bold text-foreground mb-4">
          解析結果
        </h1>
        <div className="space-y-4">
          {/* Priority */}
          <div className="flex items-center gap-3">
            <PriorityBadge category={result.category} size="lg" />
          </div>

          {/* Summary card */}
          <div className="bg-white rounded-2xl border p-4 space-y-3">
            <div>
              <p className="text-xs text-sub">送付元</p>
              <p className="font-bold text-foreground">
                {result.sender}
              </p>
            </div>
            <div>
              <p className="text-xs text-sub">書類種別</p>
              <p className="text-foreground">{result.type}</p>
            </div>
            {result.amount != null && (
              <div>
                <p className="text-xs text-sub">金額</p>
                <p className="text-lg font-bold text-foreground font-[family-name:var(--font-inter)]">
                  ¥{new Intl.NumberFormat("ja-JP").format(result.amount)}
                </p>
              </div>
            )}
            {result.deadline && (
              <div>
                <p className="text-xs text-sub">期限</p>
                <p className="font-medium text-foreground">
                  {result.deadline}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-sub">一言サマリー</p>
              <p className="text-foreground">{result.summary}</p>
            </div>
          </div>

          {/* Recommended action */}
          <div className="bg-primary/5 rounded-2xl p-4">
            <p className="text-xs text-primary font-medium mb-1">
              💡 次にすべきこと
            </p>
            <p className="text-sm text-foreground">
              {result.recommended_action}
            </p>
          </div>

          {/* Detailed summary */}
          {result.detailed_summary && (
            <div className="bg-white rounded-2xl border p-4">
              <p className="text-xs text-sub mb-2">詳しい説明</p>
              <div className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none prose-headings:text-foreground prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                <ReactMarkdown>{result.detailed_summary}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleRetake}
              className="flex-1 h-12 rounded-xl"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              撮り直す
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white rounded-xl"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存する
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Camera / capture view
  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-lg font-bold text-foreground mb-4">
        書類をスキャン
      </h1>

      {!preview ? (
        <div className="space-y-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[3/4] bg-white rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 active:bg-primary/5 transition-colors"
          >
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <Camera className="h-7 w-7 text-accent" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                タップして撮影
              </p>
              <p className="text-xs text-sub mt-1">
                書類を平らに置いて撮影してください
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCapture}
            className="hidden"
          />
          <button
            onClick={() => {
              // Open file picker without camera
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) =>
                handleCapture(
                  e as unknown as React.ChangeEvent<HTMLInputElement>
                );
              input.click();
            }}
            className="w-full flex items-center justify-center gap-2 text-sm text-sub py-2"
          >
            <ImagePlus className="h-4 w-4" />
            ライブラリから選択
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative">
            <img
              src={preview}
              alt="撮影した書類"
              className="w-full rounded-2xl border"
            />
            <button
              onClick={handleRetake}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Analyze button */}
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full h-12 bg-accent hover:bg-accent/90 text-white rounded-xl text-base"
          >
            {analyzing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                AIが読んでいます...
              </div>
            ) : (
              "解析する"
            )}
          </Button>

          {analyzing && (
            <p className="text-center text-xs text-sub">
              書類の内容を読み取っています。少しお待ちください。
            </p>
          )}
        </div>
      )}
    </div>
  );
}
