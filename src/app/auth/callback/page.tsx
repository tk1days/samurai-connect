"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const _sp = useSearchParams();
  const [msg, setMsg] = useState("サインイン処理中…");

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseBrowser();

        // OAuth コード → セッション交換（URL を渡す）
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );
        if (error) {
          console.error(error);
          setMsg(`サインイン失敗：${error.message}`);
          return;
        }

        setMsg("サインイン完了。リダイレクトします…");
        router.replace("/pro/mypage");
      } catch (e: any) {
        console.error(e);
        setMsg(`エラー：${e?.message ?? String(e)}`);
      }
    })();
  }, [router, _sp]);

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-bold mb-2">Auth Callback</h1>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{msg}</p>
    </div>
  );
}



