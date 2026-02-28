"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function SessionKeeper() {
  useEffect(() => {
    // アプリがフォアグラウンドに復帰した時にセッションをリフレッシュ
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // セッションが存在すればリフレッシュを試みる
          await supabase.auth.refreshSession();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 初回ロード時もセッションリフレッシュ
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.auth.refreshSession();
      }
    });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
