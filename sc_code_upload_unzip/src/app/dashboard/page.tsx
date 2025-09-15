"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
      setLoading(false);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    location.href = "/auth";
  };

  if (loading) return <div className="p-6">読み込み中…</div>;

  if (!email) {
    if (typeof window !== "undefined") location.href = "/auth";
    return <div className="p-6">未ログインです。/auth へ移動します。</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>
      <p>ようこそ：<span className="font-mono">{email}</span></p>
      <button
        type="button"
        onClick={signOut}
        className="px-4 py-2 bg-gray-800 text-white rounded"
      >
        ログアウト
      </button>
    </main>
  );
}