"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const NAV = [
    { label: "ホーム", href: "/" },
    { label: "専門家を探す", href: "/" }, // ← 修正済み
    { label: "待機ルーム", href: "/wait" },
    { label: "ダッシュボード", href: "/dashboard" },
    { label: "ログイン", href: "/auth" },
  ];

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          侍コネクト（β）
        </Link>
        <nav className="flex gap-4 text-sm text-gray-700">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "font-semibold underline" : ""}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}s