"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DocumentCard } from "@/components/fumuly/document-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface Document {
  id: string;
  sender: string;
  type: string;
  amount: number | null;
  deadline: string | null;
  category: "urgent" | "action" | "keep" | "ignore";
  summary: string;
  recommended_action: string;
  is_done: boolean;
}

type Filter = "all" | "urgent" | "action" | "keep" | "ignore";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const fetchDocuments = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setDocuments((data as Document[]) || []);
      setLoading(false);
    };

    fetchDocuments();
  }, []);

  const filtered =
    filter === "all"
      ? documents
      : documents.filter((d) => d.category === filter);

  const counts = {
    all: documents.length,
    urgent: documents.filter((d) => d.category === "urgent").length,
    action: documents.filter((d) => d.category === "action").length,
    keep: documents.filter((d) => d.category === "keep").length,
    ignore: documents.filter((d) => d.category === "ignore").length,
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-xl font-bold text-foreground mb-4">
        書類一覧
      </h1>

      {/* Filter tabs */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as Filter)}
        className="mb-4"
      >
        <TabsList className="w-full h-auto flex-wrap gap-1 bg-transparent p-0">
          {[
            { value: "all", label: "すべて" },
            { value: "urgent", label: "緊急" },
            { value: "action", label: "要対応" },
            { value: "keep", label: "保管" },
            { value: "ignore", label: "破棄可" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs px-3 py-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {tab.label}
              {counts[tab.value as Filter] > 0 && (
                <span className="ml-1 text-[10px]">
                  {counts[tab.value as Filter]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sub">
            {filter === "all"
              ? "まだ書類がありません"
              : "該当する書類がありません"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} {...doc} />
          ))}
        </div>
      )}
    </div>
  );
}
