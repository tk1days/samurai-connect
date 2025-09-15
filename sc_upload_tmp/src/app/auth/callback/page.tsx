// src/app/auth/callback/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ルート設定：動的＆キャッシュ無効（revalidate は使わない）
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function AuthCallbackInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    supabase.auth
      .exchangeCodeForSession(code) // string を渡す
      .catch((err) =>
        console.error("[auth/callback] exchange error:", err)
      );
  }, [searchParams]);

  return <div className="p-6 text-sm">Signing you in…</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Signing you in…</div>}>
      <AuthCallbackInner />
    </Suspense>
  );
}

