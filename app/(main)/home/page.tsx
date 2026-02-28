"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { DocumentCard } from "@/components/fumuly/document-card";
import { Button } from "@/components/ui/button";
import { Camera, MessageCircle, AlertTriangle, Loader2 } from "lucide-react";

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

export default function HomePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (profile?.display_name) {
        setDisplayName(profile.display_name);
      }

      // Get urgent/action documents not done
      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("is_done", false)
        .in("category", ["urgent", "action"])
        .order("deadline", { ascending: true, nullsFirst: false })
        .limit(10);

      setDocuments((data as Document[]) || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const urgentCount = documents.filter((d) => d.category === "urgent").length;

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-sub">
            {displayName ? `${displayName}さん` : "こんにちは"}
          </p>
          <h1 className="text-xl font-bold text-foreground">
            今日やること
          </h1>
        </div>
        {urgentCount > 0 && (
          <div className="flex items-center gap-1 bg-urgent/10 text-urgent px-3 py-1.5 rounded-full">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">{urgentCount}件 緊急</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : documents.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
            <Camera className="h-8 w-8 text-primary/40" />
          </div>
          <div>
            <p className="font-bold text-foreground">
              対応が必要な書類はありません
            </p>
            <p className="text-sm text-sub mt-1">
              封筒を開けたら、写真を撮ってみましょう
            </p>
          </div>
          <Link href="/scan">
            <Button className="mt-2 bg-accent hover:bg-accent/90 text-white rounded-full px-6">
              <Camera className="h-4 w-4 mr-2" />
              書類をスキャン
            </Button>
          </Link>
        </div>
      ) : (
        /* Document list */
        <div className="space-y-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} {...doc} />
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-2">
        <div className="max-w-md mx-auto flex gap-2">
          <Link href="/chat" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-11 rounded-full border-primary/20 text-primary"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              AIに相談
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
