"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function BackLink() {
  const [href, setHref] = useState("/");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setHref("/settings");
      }
    });
  }, []);

  return (
    <Link
      href={href}
      className="flex items-center gap-1 text-sm text-primary"
    >
      <ChevronLeft className="h-4 w-4" />
      戻る
    </Link>
  );
}
