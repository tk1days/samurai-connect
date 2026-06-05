"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function ProMyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (!u) { router.replace("/auth"); return; }

      // オンライン状態を取得
      const { data: expert } = await supabase
        .from("experts")
        .select("is_online")
        .eq("id", u.id)
        .single();

      if (expert) setIsOnline(expert.is_online);
      setLoading(false);
    });
  }, [router]);

  const toggleOnline = async () => {
    if (!user) return;
    const next = !isOnline;
    setIsOnline(next);

    await supabase
      .from("experts")
      .update({ is_online: next })
      .eq("id", user.id);
  };

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );

  if (!user) return null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">専門家メニュー</h1>

        {/* オンライン切替 */}
        <label className="flex cursor-pointer items-center gap-3">
          <span className="text-sm font-medium">
            {isOnline ? "🟢 待機中（受付中）" : "⚫ オフライン"}
          </span>
          <button
            onClick={toggleOnline}
            className={`relative h-7 w-12 rounded-full transition ${isOnline ? "bg-emerald-500" : "bg-zinc-300"}`}
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${isOnline ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </label>
      </div>

      {/* ステータスカード */}
      <div className={`rounded-2xl border p-5 ${isOnline ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}>
        <p className={`font-semibold ${isOnline ? "text-emerald-700" : "text-zinc-500"}`}>
          {isOnline
            ? "待機中です。相談リクエストが届いたら通知されます。"
            : "オフラインです。受付を開始するにはオンラインにしてください。"}
        </p>
      </div>

      {/* メニュー */}
      <div className="space-y-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm opacity-60">
          <h3 className="font-semibold">新規相談リクエスト</h3>
          <p className="text-sm text-zinc-500">準備中（リアルタイム通知は次フェーズで実装）</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm opacity-60">
          <h3 className="font-semibold">相談履歴</h3>
          <p className="text-sm text-zinc-500">準備中</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm opacity-60">
          <h3 className="font-semibold">売上・請求</h3>
          <p className="text-sm text-zinc-500">準備中</p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
        <p className="font-medium">β版について</p>
        <p className="mt-1">現在β版につき、リアルタイム通知・ビデオ通話・決済は順次実装予定です。</p>
      </div>
    </main>
  );
}
