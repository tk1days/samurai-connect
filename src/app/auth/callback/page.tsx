"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    const run = async () => {
      // Google から返ってきたコードをセッションに交換
      await supabase.auth.exchangeCodeForSession();
      // セッション確定後にダッシュボードへ
      window.location.href = "/dashboard";
    };
    run();
  }, []);

  return <div className="p-6">認証処理中…</div>;
}