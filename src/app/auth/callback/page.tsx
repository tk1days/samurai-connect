"use client";

import { Suspense, useEffect } from "react"; // 1. Suspense を react からインポートします
import { useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

// 2. useSearchParamsを使う実際の処理を、新しいコンポーネントに切り出します
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

  // このコンポーネントが表示されるのは一瞬ですが、認証中の表示を出しておきます
  return <div className="p-6">認証処理中…</div>;
}

// 3. 元のページコンポーネントを「Suspenseで囲うだけ」のシンプルな役割にします
export default function AuthCallback() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}