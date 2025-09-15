// src/components/NavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "ホーム" },
  { href: "/experts", label: "士業を探す" },
  { href: "/session", label: "セッションルーム" },  // ← 差し替え
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/auth", label: "ログイン" },
];

export default function NavBar() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b bg-gray-50/90 backdrop-blur shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* ロゴ */}
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-gray-900">
          侍コネクト（β）
        </Link>

        {/* メニュー */}
        <ul className="flex gap-4 text-sm font-medium">
          {tabs.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`rounded-md px-4 py-2 transition ${
                  path === t.href
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-200 hover:text-black"
                }`}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}