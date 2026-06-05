"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ExpertCard from "@/components/ExpertCard";
import { MOCK_EXPERTS, MOCK_CATEGORIES } from "@/lib/mock";

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const featured = useMemo(() =>
    [...MOCK_EXPERTS]
      .sort((a, b) => Number(b.is_online) - Number(a.is_online) || b.rating - a.rating)
      .slice(0, 6),
  []);

  const goSearch = (value: string) => {
    const k = value.trim();
    router.push(k ? `/experts?q=${encodeURIComponent(k)}` : "/experts");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-16">
      <section className="rounded-2xl border bg-gradient-to-br from-indigo-50 to-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          今すぐ、顔を見て、専門家に相談できる
        </h1>
        <p className="mt-2 text-zinc-500">待機中の税理士・司法書士・社労士が今すぐ対応。30分無料。</p>
        <form onSubmit={(e) => { e.preventDefault(); goSearch(q); }} className="mt-6 flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="悩みやキーワードで検索（例：相続、会社設立、節税…）"
          />
          <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700">
            検索
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => router.push(`/experts?category=${cat.slug}`)}
              className="rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-50"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">今すぐ相談できる専門家</h2>
          <button onClick={() => router.push('/experts')} className="text-sm text-indigo-600 hover:underline">すべて見る</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((e) => (
            <ExpertCard key={e.id} expert={e} />
          ))}
        </div>
      </section>

      <section className="border-t pt-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 text-center mb-3">Why Samurai Connect</p>
        <h2 className="text-3xl font-bold text-center text-zinc-900 mb-4">専門家相談を、もっとシンプルに</h2>
        <p className="text-center text-zinc-400 text-sm mb-14">予約もメールも不要。今すぐ、顔を見て話せる。</p>

        <div className="grid sm:grid-cols-3 gap-px bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-100">
          <div className="bg-white px-8 py-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl mb-5">⚡</div>
            <h3 className="font-semibold text-zinc-900 mb-2">即時接続</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">待機中の専門家にワンクリックでつながる。予約も問い合わせも不要。</p>
          </div>
          <div className="bg-white px-8 py-10 border-l border-r border-zinc-100">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-xl mb-5">🎥</div>
            <h3 className="font-semibold text-zinc-900 mb-2">ビデオで対面相談</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">高画質ビデオ通話で、まるでオフィスに行ったような安心感。</p>
          </div>
          <div className="bg-white px-8 py-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl mb-5">🆓</div>
            <h3 className="font-semibold text-zinc-900 mb-2">初回30分無料</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">費用ゼロで試せる。合えば継続、合わなければそれでOK。</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => router.push('/experts')}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white font-medium px-7 py-3 text-sm hover:bg-zinc-700 transition"
          >
            専門家を探してみる
          </button>
        </div>
      </section>
    </main>
  );
}
