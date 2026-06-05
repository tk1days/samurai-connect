"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      setLoading(false);
      if (!u) router.replace("/auth");
    });
  }, [router]);

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );

  if (!user) return null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">マイページ</h1>

      {/* ユーザー情報 */}
      <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} className="h-14 w-14 rounded-full" alt="" />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
              {user.email?.[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold">{user.user_metadata?.full_name ?? "ユーザー"}</p>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* メニュー */}
      <div className="space-y-3">
        <Link href="/experts" className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm hover:bg-gray-50">
          <div>
            <h3 className="font-semibold">専門家を探す</h3>
            <p className="text-sm text-zinc-500">今すぐ相談できる専門家を見つける</p>
          </div>
          <span className="text-zinc-400">→</span>
        </Link>

        <div className="rounded-2xl border bg-white p-5 shadow-sm opacity-60">
          <h3 className="font-semibold">相談履歴</h3>
          <p className="text-sm text-zinc-500">準備中</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm opacity-60">
          <h3 className="font-semibold">お気に入り専門家</h3>
          <p className="text-sm text-zinc-500">準備中</p>
        </div>
      </div>

      {/* 専門家登録案内 */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <h3 className="font-semibold text-indigo-900">専門家として登録する</h3>
        <p className="mt-1 text-sm text-indigo-700">
          税理士・司法書士・社労士など、空き時間に相談を受け付けませんか？
        </p>
        <Link
          href="/pro/profile"
          className="mt-3 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          専門家登録はこちら
        </Link>
      </div>
    </main>
  );
}
