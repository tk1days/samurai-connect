"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight">Samurai Connect</span>
          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">β</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/experts" className="text-zinc-700 hover:text-zinc-900">
            専門家を探す
          </Link>

          {user ? (
            <>
              <Link href="/mypage" className="text-zinc-700 hover:text-zinc-900">
                マイページ
              </Link>
              <Link
                href="/pro/mypage"
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-700 hover:bg-zinc-50"
              >
                専門家メニュー
              </Link>
              <button
                onClick={logout}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
