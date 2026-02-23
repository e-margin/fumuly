"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  User,
  Shield,
  FileText,
  Trash2,
  LogOut,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteAll = async () => {
    setDeleting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Delete all user data
    await supabase.from("conversations").delete().eq("user_id", user.id);
    await supabase.from("documents").delete().eq("user_id", user.id);
    await supabase
      .from("profiles")
      .update({
        income_type: null,
        monthly_income: null,
        debt_total: null,
        debt_creditors: null,
        has_adhd: false,
        phone_difficulty: false,
        characteristics_other: null,
        current_situation: null,
        onboarding_done: false,
      })
      .eq("id", user.id);

    setDeleting(false);
    router.push("/home");
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-xl font-bold text-foreground mb-6">
        設定
      </h1>

      <div className="space-y-1">
        {/* Profile */}
        <Link href="/onboarding">
          <div className="flex items-center gap-3 py-3 active:bg-background rounded-lg px-2 transition-colors">
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                プロフィール設定
              </p>
              <p className="text-xs text-sub">
                収入・借金・特性の情報を変更
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-ignore" />
          </div>
        </Link>

        <Separator />

        {/* Privacy */}
        <Link href="/privacy">
          <div className="flex items-center gap-3 py-3 active:bg-background rounded-lg px-2 transition-colors">
            <div className="w-9 h-9 bg-keep/10 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-keep" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                プライバシーポリシー
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-ignore" />
          </div>
        </Link>

        <Separator />

        {/* Terms */}
        <Link href="/terms">
          <div className="flex items-center gap-3 py-3 active:bg-background rounded-lg px-2 transition-colors">
            <div className="w-9 h-9 bg-action/10 rounded-full flex items-center justify-center">
              <FileText className="h-4 w-4 text-action" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                利用規約
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-ignore" />
          </div>
        </Link>

        <Separator />

        {/* Delete data */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full flex items-center gap-3 py-3 active:bg-background rounded-lg px-2 transition-colors">
              <div className="w-9 h-9 bg-urgent/10 rounded-full flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-urgent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-urgent">
                  すべてのデータを削除
                </p>
                <p className="text-xs text-sub">
                  書類・会話履歴・プロフィールを削除
                </p>
              </div>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>本当にすべてのデータを削除しますか？</DialogTitle>
              <DialogDescription>
                書類の解析結果、会話履歴、プロフィール情報がすべて削除されます。この操作は元に戻せません。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={handleDeleteAll}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "すべて削除する"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Logout */}
      <div className="mt-8">
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full h-12 rounded-xl"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </>
          )}
        </Button>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-ignore mt-6">
        Fumuly v0.1.0
      </p>
    </div>
  );
}
