"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentCard } from "@/components/fumuly/document-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";

interface PastDocument {
  id: string;
  sender: string;
  type: string;
  amount: number | null;
  deadline: string | null;
  category: "urgent" | "action" | "keep" | "ignore";
  summary: string;
  recommended_action: string;
  is_done: boolean;
  is_archived: boolean;
  done_at: string | null;
  archived_at: string | null;
  created_at: string;
}

type Tab = "done" | "archived";

function daysUntilDeletion(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const elapsed = Date.now() - new Date(dateStr).getTime();
  const remaining = 30 - Math.floor(elapsed / (1000 * 60 * 60 * 24));
  return Math.max(0, remaining);
}

export default function PastDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<PastDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("done");

  useEffect(() => {
    const fetchPastDocuments = async () => {
      const res = await fetch("/api/documents?mode=past");
      if (res.ok) {
        const docs = await res.json();
        setDocuments(docs || []);
      }
      setLoading(false);
    };

    fetchPastDocuments();
  }, []);

  const filtered =
    tab === "done"
      ? documents.filter((d) => d.is_done && !d.is_archived)
      : documents.filter((d) => d.is_archived);

  const counts = {
    done: documents.filter((d) => d.is_done && !d.is_archived).length,
    archived: documents.filter((d) => d.is_archived).length,
  };

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-sub mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        設定に戻る
      </button>

      <h1 className="text-xl font-bold text-foreground mb-4">
        過去の書類
      </h1>

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as Tab)}
        className="mb-4"
      >
        <TabsList className="w-full h-auto bg-transparent p-0 gap-1">
          <TabsTrigger
            value="done"
            className="flex-1 text-xs px-3 py-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            対応済み
            {counts.done > 0 && (
              <span className="ml-1 text-[10px]">{counts.done}</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="archived"
            className="flex-1 text-xs px-3 py-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            アーカイブ
            {counts.archived > 0 && (
              <span className="ml-1 text-[10px]">{counts.archived}</span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sub">
            {tab === "done"
              ? "対応済みの書類はありません"
              : "アーカイブした書類はありません"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((doc) => {
            const dateStr = tab === "done" ? doc.done_at : doc.archived_at;
            const days = daysUntilDeletion(dateStr);
            return (
              <div key={doc.id}>
                <DocumentCard
                  id={doc.id}
                  sender={doc.sender}
                  type={doc.type}
                  amount={doc.amount}
                  deadline={doc.deadline}
                  category={doc.category}
                  summary={doc.summary}
                  recommended_action={doc.recommended_action}
                  is_done={doc.is_done}
                />
                {days !== null && (
                  <p className={`text-[11px] mt-1 ml-1 ${days <= 7 ? "text-urgent" : "text-ignore"}`}>
                    あと{days}日で自動削除されます
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-ignore text-center mt-8">
        対応済み・アーカイブした書類は30日後に自動で削除されます
      </p>
    </div>
  );
}
