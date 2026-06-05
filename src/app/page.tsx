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

      {/* ヒーロー */}
      <section className="rounded-2xl border bg-gradient-to-br from-indigo-50 to-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          今すぐ、顔を見て、<br className="sm:hidden" />専門家に相談できる
        </h1>
        <p className="mt-2 text-zinc-500">
          待機中の税理士・司法書士・社労士が今すぐ対応。30分無料。
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); goSearch(q); }}
          className="mt-6 flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="悩みやキーワードで検索（例：相続、会社設立、節税…）"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
          >
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

      {/* 注目の専門家 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">今すぐ相談できる専門家</h2>
          <a href="/experts" className="text-sm text-indigo-600 hover:underline">すべて見る</a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((e) => (
            <ExpertCard key={e.id} expert={e} />
          ))}
        </div>
      </section>

      {/* サービスの特徴 */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 px-10 py-12 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">Samurai Connect が選ばれる理由</h2>
        <div className="grid gap-8 sm:grid-cols-3 text-center">
          <div>
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-bold text-lg mb-1">今すぐつながる</h3>
            <p className="text-sm text-white/75">予約不要。待機中の専門家にワンクリックで即接続。</p>
          </div>
          <div>
            <div className="text-4xl mb-3">🎥</div>
            <h3 className="font-bold text-lg mb-1">顔を見て相談</h3>
            <p className="text-sm text-white/75">ビデオ通話で対面感覚。資料の画面共有も可能。</p>
          </div>
          <div>
            <div className="text-4xl mb-3">🆓</div>
            <h3 className="font-bold text-lg mb-1">初回30分無料</h3>
            <p className="text-sm text-white/75">まず気軽に試せる。合えば継続相談・顧問契約へ。</p>
          </div>
        </div>
        <div className="mt-10 text-center">
          
            href="/experts"
            className="inline-block rounded-xl bg-white text-indigo-600 font-semibold px-8 py-3 text-sm shadow hover:bg-indigo-50"
          >
            専門家を探してみる
          </a>
        </div>
      </section>

    </main>
  );
}
