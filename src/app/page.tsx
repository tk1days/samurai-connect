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
    <div>
      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-400 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-semibold tracking-wide mb-6">
            税理士・司法書士・社労士が今すぐ対応
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            専門家に、今すぐ<br />顔を見て相談できる
          </h1>
          <p className="text-lg text-white/80 mb-10">
            予約不要・初回30分無料。待機中の専門家とビデオ通話で即つながる。
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); goSearch(q); }}
            className="mx-auto max-w-xl flex gap-2"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 rounded-xl px-5 py-3.5 text-sm text-zinc-900 outline-none shadow"
              placeholder="悩みやキーワードで検索（例：相続、節税、会社設立）"
            />
            <button
              type="submit"
              className="rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-zinc-700 shadow"
            >
              検索
            </button>
          </form>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => router.push(`/experts?category=${cat.slug}`)}
                className="rounded-full bg-white/15 border border-white/30 px-3 py-1.5 text-xs text-white hover:bg-white/25"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 実績バー */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-3 divide-x text-center">
          <div className="px-4">
            <p className="text-2xl font-bold text-indigo-600">1,200+</p>
            <p className="text-xs text-zinc-500 mt-0.5">登録専門家</p>
          </div>
          <div className="px-4">
            <p className="text-2xl font-bold text-indigo-600">4.8</p>
            <p className="text-xs text-zinc-500 mt-0.5">平均評価</p>
          </div>
          <div className="px-4">
            <p className="text-2xl font-bold text-indigo-600">30秒</p>
            <p className="text-xs text-zinc-500 mt-0.5">平均接続時間</p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-14 space-y-16">

        {/* 専門家一覧 */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">今すぐ相談できる専門家</h2>
              <p className="text-sm text-zinc-400 mt-0.5">待機中の専門家に今すぐビデオ通話で相談</p>
            </div>
            <button
              onClick={() => router.push('/experts')}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              すべて見る
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => (
              <ExpertCard key={e.id} expert={e} />
            ))}
          </div>
        </section>

        {/* 特徴 */}
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-8 text-center">選ばれる3つの理由</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { num: "01", icon: "⚡", title: "予約不要・即つながる", desc: "待機中の専門家にワンクリックで即接続。問い合わせも不要。" },
              { num: "02", icon: "🎥", title: "顔を見て安心相談", desc: "ビデオ通話で対面感覚。資料の画面共有もできる。" },
              { num: "03", icon: "✅", title: "初回30分完全無料", desc: "費用ゼロでお試し。合えば継続、合わなければOK。" },
            ].map((f) => (
              <div key={f.num} className="rounded-2xl border border-zinc-100 bg-white p-7 shadow-sm hover:shadow-md transition">
                <span className="text-xs font-bold text-indigo-400 tracking-widest">{f.num}</span>
                <div className="text-3xl mt-3 mb-4">{f.icon}</div>
                <h3 className="font-bold text-zinc-900 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-zinc-900 text-white px-10 py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">今すぐ専門家に相談してみる</h2>
          <p className="text-zinc-400 text-sm mb-8">予約不要・初回30分無料・すぐつながる</p>
          <button
            onClick={() => router.push('/experts')}
            className="rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-10 py-3.5 text-sm shadow-lg transition"
          >
            専門家を探す
          </button>
        </section>

      </main>
    </div>
  );
}
