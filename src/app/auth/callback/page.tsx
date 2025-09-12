// ./src/app/auth/callback/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// SSG を禁止して動的に実行（プリレンダーエラー回避）
export const dynamic = "force-dynamic";
export const revalidate = 0;

function AuthCallbackInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    // Supabase v2: string を渡す
    supabase.auth
      .exchangeCodeForSession(code)
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
