// ./src/app/auth/callback/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase"; // ← getSupabase ではなく supabase を使用

function AuthCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    // OAuth コードをセッションへ交換
    supabase.auth
      .exchangeCodeForSession({ code })
      .catch((err) => console.error("[auth/callback] exchange error:", err));
  }, [searchParams]);

  return <div className="p-6 text-sm">Signing you in…</div>;
}

export default function Page() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
