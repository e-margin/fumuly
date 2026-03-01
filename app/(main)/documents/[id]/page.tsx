"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/fumuly/priority-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Loader2,
  MessageCircle,
  Pencil,
  Check,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface DocumentDetail {
  id: string;
  sender: string;
  type: string;
  amount: number | null;
  deadline: string | null;
  category: "urgent" | "action" | "keep" | "ignore";
  priority: "high" | "medium" | "low" | "ignore";
  summary: string;
  recommended_action: string;
  detailed_summary: string;
  is_done: boolean;
  created_at: string;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingAmount, setEditingAmount] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [savingAmount, setSavingAmount] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("id", params.id)
        .single();

      setDoc(data as DocumentDetail);
      setLoading(false);
    };

    fetchDocument();
  }, [params.id]);

  const toggleDone = async () => {
    if (!doc) return;
    setUpdating(true);

    await supabase
      .from("documents")
      .update({ is_done: !doc.is_done })
      .eq("id", doc.id);

    setDoc({ ...doc, is_done: !doc.is_done });
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (!doc) return;
    setDeleting(true);

    await supabase.from("documents").delete().eq("id", doc.id);
    router.push("/documents");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-sub">書類が見つかりません</p>
        <Link href="/documents" className="text-primary text-sm mt-2 inline-block">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-sub mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        戻る
      </button>

      <div className="space-y-4">
        {/* Priority & status */}
        <div className="flex items-center gap-3">
          <PriorityBadge category={doc.category} size="lg" />
          {doc.is_done && (
            <span className="flex items-center gap-1 text-sm text-keep font-medium">
              <CheckCircle2 className="h-4 w-4" />
              対応済み
            </span>
          )}
        </div>

        {/* Main info */}
        <div className="bg-white rounded-2xl border p-4 space-y-3">
          <div>
            <p className="text-xs text-sub">送付元</p>
            <p className="font-bold text-lg text-foreground">
              {doc.sender}
            </p>
          </div>
          <div>
            <p className="text-xs text-sub">書類種別</p>
            <p className="text-foreground">{doc.type}</p>
          </div>
          {doc.amount != null && (
            <div>
              <p className="text-xs text-sub">金額</p>
              {editingAmount ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">¥</span>
                  <input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-36 text-xl font-bold text-foreground font-[family-name:var(--font-inter)] border-b-2 border-primary bg-transparent outline-none"
                    autoFocus
                  />
                  <button
                    onClick={async () => {
                      const val = parseInt(amountInput, 10);
                      if (isNaN(val) || val < 0) {
                        setEditingAmount(false);
                        return;
                      }
                      setSavingAmount(true);
                      const { error } = await supabase
                        .from("documents")
                        .update({ amount: val })
                        .eq("id", doc.id);
                      if (!error) {
                        setDoc({ ...doc, amount: val });
                      }
                      setSavingAmount(false);
                      setEditingAmount(false);
                    }}
                    disabled={savingAmount}
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                  >
                    {savingAmount ? (
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    ) : (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-foreground font-[family-name:var(--font-inter)]">
                    ¥{new Intl.NumberFormat("ja-JP").format(doc.amount)}
                  </p>
                  <button
                    onClick={() => {
                      setAmountInput(String(doc.amount));
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
          {doc.deadline && (
            <div>
              <p className="text-xs text-sub">期限</p>
              <p className="font-medium text-foreground">
                {doc.deadline}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-sub">一言サマリー</p>
            <p className="text-foreground">{doc.summary}</p>
          </div>
          <p className="text-[11px] text-ignore pt-1">
            AIによる読み取りです。金額・期限は原本と照合してください。
          </p>
        </div>

        {/* Recommended action */}
        <div className="bg-primary/5 rounded-2xl p-4">
          <p className="text-xs text-primary font-medium mb-1">
            💡 次にすべきこと
          </p>
          <p className="text-sm text-foreground">
            {doc.recommended_action}
          </p>
        </div>

        {/* Detailed summary */}
        {doc.detailed_summary && (
          <div className="bg-white rounded-2xl border p-4">
            <p className="text-xs text-sub mb-2">詳しい説明</p>
            <div className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none prose-headings:text-foreground prose-p:my-1 prose-ul:my-1 prose-li:my-0">
              <ReactMarkdown>{doc.detailed_summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Chat link */}
        <Link href="/chat">
          <div className="bg-white rounded-2xl border p-4 flex items-center gap-3 active:bg-background transition-colors">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                この書類について相談する
              </p>
              <p className="text-xs text-sub">
                AIに質問や相談ができます
              </p>
            </div>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={toggleDone}
            disabled={updating}
            variant={doc.is_done ? "outline" : "default"}
            className={
              doc.is_done
                ? "flex-1 h-12 rounded-xl"
                : "flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white"
            }
          >
            {updating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : doc.is_done ? (
              "未対応に戻す"
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                対応済みにする
              </>
            )}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-xl border-urgent/30 text-urgent hover:bg-urgent/5"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>この書類を削除しますか？</DialogTitle>
                <DialogDescription>
                  削除すると元に戻せません。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "削除する"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
