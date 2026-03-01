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
  Plus,
  Pencil,
  Check,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/claude";
import ReactMarkdown from "react-markdown";
import { resizeImage } from "@/lib/image";

interface CapturedImage {
  preview: string; // dataURL for display
  base64: string; // base64 data for API
}

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingAmount, setEditingAmount] = useState(false);
  const [amountInput, setAmountInput] = useState("");

  const processFile = async (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      alert("画像サイズが大きすぎます（10MB以下にしてください）");
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.onerror = () => reject(new Error("ファイルの読み取りに失敗しました"));
      reader.readAsDataURL(file);
    });

    const resized = await resizeImage(dataUrl);
    const base64 = resized.split(",")[1];

    setImages((prev) => {
      if (prev.length >= MAX_IMAGES) {
        alert(`画像は${MAX_IMAGES}枚までです`);
        return prev;
      }
      return [...prev, { preview: resized, base64 }];
    });
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file).catch(() => {
      alert("画像の処理に失敗しました。別の画像をお試しください。");
    });
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    setAnalyzing(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: images.map((img) => img.base64) }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (res.status === 429) {
        const err = await res.json();
        alert(err.error || "利用回数の上限に達しました。しばらくしてからお試しください。");
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "サーバーエラーが発生しました");
      }
      const data = await res.json();
      if (data.error === "not_a_document") {
        alert("書類として認識できませんでした。封筒の中身やハガキなど、書類を撮影してください。");
        return;
      }
      setResult(data);
    } catch (err) {
      const isOffline = !navigator.onLine;
      const message = isOffline
        ? "ネットワークに接続されていないようです。接続を確認してからもう一度お試しください。"
        : err instanceof Error
          ? err.message
          : "解析に失敗しました。もう一度お試しください";
      alert(message);
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
    setImages([]);
    setResult(null);
  };

  // Analysis result view
  if (result) {
    return (
      <div className="px-4 pt-6 pb-24">
        <h1 className="text-lg font-bold text-foreground mb-2">
          解析結果
        </h1>
        <p className="text-xs text-sub mb-4">
          AIによる読み取りです。金額・期限は必ず原本と照合してください。
        </p>
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
                {editingAmount ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">¥</span>
                    <input
                      type="number"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-32 text-lg font-bold text-foreground font-[family-name:var(--font-inter)] border-b-2 border-primary bg-transparent outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        const val = parseInt(amountInput, 10);
                        if (!isNaN(val) && val >= 0) {
                          setResult({ ...result, amount: val });
                        }
                        setEditingAmount(false);
                      }}
                      className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                    >
                      <Check className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-foreground font-[family-name:var(--font-inter)]">
                      ¥{new Intl.NumberFormat("ja-JP").format(result.amount)}
                    </p>
                    <button
                      onClick={() => {
                        setAmountInput(String(result.amount));
                        setEditingAmount(true);
                      }}
                      className="w-7 h-7 bg-ignore/10 rounded-full flex items-center justify-center"
                    >
                      <Pencil className="h-3 w-3 text-ignore" />
                    </button>
                  </div>
                )}
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

      {images.length === 0 ? (
        <div className="space-y-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-3/4 bg-white rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 active:bg-primary/5 transition-colors"
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
          {/* Image thumbnails */}
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-3/4">
                <img
                  src={img.preview}
                  alt={`書類 ${i + 1}`}
                  className="w-full h-full object-cover rounded-xl border"
                />
                <button
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
                <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {i + 1}/{images.length}
                </span>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                onClick={() => addInputRef.current?.click()}
                className="aspect-3/4 bg-white rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-1 active:bg-primary/5 transition-colors"
              >
                <Plus className="h-5 w-5 text-primary" />
                <span className="text-[10px] text-sub">追加</span>
              </button>
            )}
          </div>

          <input
            ref={addInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCapture}
            className="hidden"
          />

          <p className="text-center text-xs text-sub">
            裏面や別ページがあれば追加してください（最大{MAX_IMAGES}枚）
          </p>

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
              `解析する${images.length > 1 ? `（${images.length}枚）` : ""}`
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
