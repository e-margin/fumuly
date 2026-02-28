"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function AuthGuard() {
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
      }
    };

    // Check on mount (PWA resume)
    checkSession();

    // Check when app comes back to foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return null;
}
