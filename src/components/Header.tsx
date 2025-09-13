// /src/components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserRole = "pro" | "user" | null;

export default function Header() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const readSession = async () => {
      try {
        if (!supabase) return; // env 未設定時は何もしない
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        const r = (data.user?.user_metadata?.role as UserRole) ?? null;
        setRole(r);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    readSession();

    // 認証状態の変化を監視（ログイン/ログアウト）
    const sub = supabase?.auth.onAuthStateChange(() => {
      readSession();
    });

    return () => {
      mounted = false;
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  const isPro = role === "pro";
  const handleLogout = async () => {
    try {
      await supabase?.auth.signOut();
    } finally {
      // サインアウト後はトップへ
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight">Samurai Connect</span>
          <span className="rounded-full bg-indigo-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            β
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/experts" className="text-zinc-700 hover:text-zinc-900">
            専門家を探す
          </Link>

          {/* 利用者マイページ */}
          <Link href="/mypage" className="text-zinc-700 hover:text-zinc-900">
            マイページ
          </Link>

          {/* ダッシュボード（必要なら残す） */}
          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-700 hover:bg-zinc-50"
          >
            ダッシュボード
          </Link>

          {/* 右端：プロはログアウト、そうでなければプロ用マイページ */}
          {isPro ? (
            <button
              onClick={handleLogout}
              className="rounded-lg bg-rose-600 px-3 py-1.5 font-medium text-white hover:bg-rose-700"
              aria-busy={loading}
            >
              ログアウト
            </button>
          ) : (
            <Link
              href="/pro/mypage"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
            >
              プロ用マイページ
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

