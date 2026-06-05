"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("サインイン処理中…");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN") {
          router.replace("/experts");
        } else if (event === "SIGNED_OUT") {
          setMsg("サインインに失敗しました。");
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-4 text-sm text-zinc-500">{msg}</p>
      </div>
    </div>
  );
}
