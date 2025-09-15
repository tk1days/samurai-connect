// /src/components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const LS_PRO = "sc_is_pro"; // 擬似ログイン判定（ローカル）

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPro, setIsPro] = useState(false);

  // 初期ロード
  useEffect(() => {
    try {
      setIsPro(localStorage.getItem(LS_PRO) === "1");
    } catch {}
  }, []);

  // 擬似ログイン（イメージ重視フェーズ）
  const mockLogin = () => {
    try { localStorage.setItem(LS_PRO, "1"); } catch {}
    setIsPro(true);
    router.push("/pro/mypage");
  };

  const logout = () => {
    try { localStorage.removeItem(LS_PRO); } catch {}
    setIsPro(false);
    // どのページからでもトップへ
    router.push("/");
  };

  // プロ中は“プロ用マイページ”への戻り導線を常設
  const showProBackLink = isPro && pathname !== "/pro/mypage";

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight">Samurai Connect</span>
          <span className="rounded-full bg-indigo-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">β</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/experts" className="text-zinc-700 hover:text-zinc-900">専門家を探す</Link>
          <Link href="/mypage" className="text-zinc-700 hover:text-zinc-900">マイページ</Link>

          {/* プロ中は“戻る導線”を常時表示 */}
          {showProBackLink && (
            <Link
              href="/pro/mypage"
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-700 hover:bg-zinc-50"
              title="プロ用マイページへ戻る"
            >
              プロ用マイページ
            </Link>
          )}

          {/* 右端の主ボタン：プロ状態で切替 */}
          {isPro ? (
            <button
              onClick={logout}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
              aria-label="ログアウト"
            >
              ログアウト
            </button>
          ) : (
            <button
              onClick={mockLogin}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
              aria-label="ログイン"
              title="（暫定）押すとプロ用マイページへ"
            >
              ログイン
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}