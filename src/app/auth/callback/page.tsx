// ./src/app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    // Supabase v2: string を渡す
    supabase.auth
      .exchangeCodeForSession(code)
      .catch((err) => console.error("[auth/callback] exchange error:", err));
  }, [searchParams]);

  return <div className="p-6 text-sm">Signing you in…</div>;
}
