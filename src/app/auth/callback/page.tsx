"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase"; // getSupabaseを正しくインポート

function AuthCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = getSupabase();

    const run = async () => {
      const code = searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        window.location.href = "/dashboard";
      }
    };
    run();
  }, [searchParams]);

  return <div className="p-6">認証処理中…</div>;
}

export default function AuthCallback() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}