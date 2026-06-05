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

  const onlineExperts = useMemo(() =>
    MOCK_EXPERTS.filter(e => e.is_online).slice(0, 4),
  []);

  const goSearch = (value: string) => {
    const k = value.trim();
    router.push(k ? `/experts?q=${encodeURIComponent(k)}` : "/experts");
  };

  return (
    <div>
      {/* ヒーロー */}
      <section className="bg-[#0f172a] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* 左 */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              今すぐ相談できる専門家が待機中
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.15] mb-5">
              税務・法律の悩みを<br />
              <span className="text-indigo-400">今すぐ</span>、顔を見て<br />
              解決できる
            </h1>
            <p className="text-zinc-400 text-base mb-8 leading-relaxed">
              待機中の税理士・司法書士・社労士に<br />
              ワンクリックでビデオ通話。予約不要・初回30分無料。
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); goSearch(q); }}
              className="flex gap-2 mb-5"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-5 py-3.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-400 focus:bg-white/15"
                placeholder="例：相続、節税、会社設立…"
              />
              <button
                type="submit"
                className="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-6 py-3.5 text-sm font-semibold text-white transition"
              >
                検索
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              {MOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => router.push(`/experts?category=${cat.slug}`)}
                  className="rounded-full bg-white/8 border border-white/15 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/15 hover:text-white transition"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 右：専門家グリッド */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {onlineExperts.map((e, i) => {
              const grad = e.gender === 'female' ? 'from-pink-500 to-rose-500' : 'from-indigo-500 to-sky-500';
              return (
                <div
                  key={e.id}
                  onClick={() => router.push(`/wait?expert=${e.id}`)}
                  className={`rounded-2xl bg-white/5 border border-white/10 p-4 cursor-pointer hover:bg-white/10 hover:border-indigo-500/50 transition ${i === 0 ? 'col-span-2' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {e.display_name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{e.display_name}</span>
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />待機中
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{e.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">⭐ {e.rating.toFixed(1)} ({e.review_count}件)</span>
                    <span className="text-xs font-medium text-indigo-400">{e.price_label}</span>
                  </div>
                </div>
              );
            })}
            <div className="col-span-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-3 text-center">
              <button onClick={() => router.push('/experts')} className="text-sm text-indigo-400 font-medium hover:text-indigo-300">
                他の専門家を見る →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 実績バー */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-5 grid grid-cols-3 divide-x text-center">
          <div className="px-4">
            <p className="text-2xl font-bold text-indigo-600">1,200+</p>
            <p className="text-xs text-zinc-400 mt-0.5">登録専門家</p>
          </div>
          <div className="px-4">
            <p className="text-2xl font-bold text-indigo-600">4.8</p>
            <p className="text-xs text-zinc-400 mt-0.5">平均評価</p>
          </div>
          <div className="px-4">
            <p className="text-2xl font-bold text-indigo-600">30秒</p>
            <p className="text-xs text-zinc-400 mt-0.5">平均接続時間</p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-14 space-y-20">

        {/* 専門家一覧 */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">今すぐ相談できる専門家</h2>
              <p className="text-sm text-zinc-400 mt-0.5">待機中の専門家に今すぐビデオ通話で相談</p>
            </div>
            <button onClick={() => router.push('/experts')} className="text-sm font-medium text-indigo-600 hover:underline">
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
          <h2 className="text-xl font-bold text-zinc-900 mb-2 text-center">選ばれる3つの理由</h2>
          <p className="text-sm text-zinc-400 text-center mb-10">面倒な手続きなし。今すぐ始められる。</p>
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
        <section className="rounded-2xl bg-[#0f172a] text-white px-10 py-14 text-center">
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
