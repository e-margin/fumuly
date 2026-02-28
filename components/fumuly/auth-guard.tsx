"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function AuthGuard() {
  const lastCheckRef = useRef(0);

  useEffect(() => {
    const checkSession = async () => {
      // Debounce: skip if checked within last 5 seconds
      const now = Date.now();
      if (now - lastCheckRef.current < 5000) return;
      lastCheckRef.current = now;

      const { data: { user }, error } = await supabase.auth.getUser();
      // Don't redirect on network errors (allow offline usage)
      if (error) return;
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
