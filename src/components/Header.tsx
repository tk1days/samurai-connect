// src/components/Header.tsx
import Link from 'next/link';

export default function Header() {
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
          <Link href="/inbox" className="text-zinc-700 hover:text-zinc-900">
            受信箱
          </Link>
          <Link href="/session" className="text-zinc-700 hover:text-zinc-900">
            セッション作成
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-700 hover:bg-zinc-50"
          >
            ダッシュボード
          </Link>
        </nav>
      </div>
    </header>
  );
}
