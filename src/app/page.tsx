"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ExpertCard from "@/components/ExpertCard";
import { MOCK_EXPERTS, MOCK_CATEGORIES } from "@/lib/mock";

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [time, setTime] = useState("");

  const featured = useMemo(() =>
    [...MOCK_EXPERTS]
      .sort((a, b) => Number(b.is_online) - Number(a.is_online) || b.rating - a.rating)
      .slice(0, 6),
  []);

  const onlineExperts = useMemo(() =>
    MOCK_EXPERTS.filter(e => e.is_online).slice(0, 4),
  []);

  useEffect(() => {
    setOnlineCount(MOCK_EXPERTS.filter(e => e.is_online).length);
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  const goSearch = (value: string) => {
    const k = value.trim();
    router.push(k ? `/experts?q=${encodeURIComponent(k)}` : "/experts");
  };

  return (
    <div className="bg-white">

      {/* ━━━ HERO ━━━ */}
      <section className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-4 py-16 grid lg:grid-cols-2 gap-16 items-center">

          {/* 左：コピー */}
          <div>
            {/* リアルタイムバッジ */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-semibold text-emerald-700 mb-7">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              現在 {onlineCount}名の専門家が待機中
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.15] mb-5 text-zinc-900 tracking-tight">
              税務・法律の悩みを<br />
              <span className="text-indigo-600">今すぐ</span>、顔を見て<br />
              解決できる
            </h1>

            <p className="text-zinc-600 text-base mb-2 leading-relaxed">
              待機中の税理士・司法書士・社労士に<br />
              ワンクリックでビデオ通話。
            </p>
            <p className="text-zinc-400 text-sm mb-8">
              予約不要・初回30分無料・平均接続30秒
            </p>

            {/* 検索 */}
            <form onSubmit={(e) => { e.preventDefault(); goSearch(q); }} className="flex gap-2 mb-4">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="例：相続、節税、会社設立…"
              />
              <button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3.5 text-sm font-bold text-white transition">
                検索
              </button>
            </form>

            {/* CTA */}
            <button
              onClick={() => router.push("/experts")}
              className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 px-8 py-4 text-base font-bold text-white transition mb-6 block"
            >
              今すぐ無料で相談する →
            </button>

            {/* 信頼テキスト */}
            <div className="flex flex-wrap gap-5 text-xs text-zinc-500">
              {["✓ 予約不要・即つながる", "✓ 初回30分完全無料", "✓ 全員有資格の専門家"].map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          {/* 右：専門家カード */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-3">
              {onlineExperts.map((e) => {
                const grad = e.gender === "female" ? "from-rose-400 to-pink-500" : "from-indigo-500 to-blue-500";
                return (
                  <div
                    key={e.id}
                    onClick={() => router.push(`/wait?expert=${e.id}`)}
                    className="group rounded-2xl border border-zinc-200 bg-white p-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {e.display_name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-zinc-900 truncate">{e.display_name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="text-[10px] text-emerald-600 font-medium">待機中</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 truncate mb-2">{e.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-500 font-medium">★ {e.rating.toFixed(1)} <span className="text-zinc-400">({e.review_count}件)</span></span>
                      <span className="text-xs font-semibold text-indigo-600">{e.price_label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => router.push("/experts")}
              className="mt-3 w-full rounded-xl border border-zinc-200 py-3 text-sm text-zinc-500 hover:text-indigo-600 hover:border-indigo-300 transition"
            >
              他の専門家を見る →
            </button>
          </div>
        </div>
      </section>

      {/* ━━━ 実績バー ━━━ */}
      <section className="bg-indigo-600">
        <div className="mx-auto max-w-6xl px-4 py-5 grid grid-cols-3 divide-x divide-indigo-500 text-center">
          {[
            { val: "1,200+", label: "登録専門家" },
            { val: "4.8", label: "平均評価" },
            { val: "30秒", label: "平均接続時間" },
          ].map(item => (
            <div key={item.label} className="px-4">
              <p className="text-2xl font-bold text-white">{item.val}</p>
              <p className="text-xs text-indigo-200 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-16 space-y-24">

        {/* ━━━ 専門家一覧 ━━━ */}
        <section>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">EXPERTS ONLINE NOW</p>
              <h2 className="text-2xl font-bold text-zinc-900">今すぐ相談できる専門家</h2>
              <p className="text-sm text-zinc-500 mt-1">待機中の専門家にワンクリックでビデオ通話</p>
            </div>
            <button onClick={() => router.push("/experts")} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              すべて見る →
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => (
              <ExpertCard key={e.id} expert={e} />
            ))}
          </div>
        </section>

        {/* ━━━ 特徴カード ━━━ */}
        <section>
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">WHY SAMURAI CONNECT</p>
            <h2 className="text-3xl font-bold text-zinc-900 mb-3">選ばれる3つの理由</h2>
            <p className="text-zinc-500 text-sm">面倒な手続きなし。今すぐ始められる。</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                icon: "⚡",
                title: "予約不要・即つながる",
                desc: "待機中の専門家にワンクリックで即接続。問い合わせも不要。今すぐ話せる。",
                img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop&q=80",
                border: "border-indigo-500",
              },
              {
                num: "02",
                icon: "🎥",
                title: "顔を見て安心相談",
                desc: "ビデオ通話で対面感覚の相談。書類の画面共有も簡単にできる。",
                img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&auto=format&fit=crop&q=80",
                border: "border-blue-500",
              },
              {
                num: "03",
                icon: "🎁",
                title: "初回30分完全無料",
                desc: "費用ゼロでお試し。合えば継続、合わなければOK。リスクゼロ。",
                img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
                border: "border-emerald-500",
              },
            ].map((f) => (
              <div key={f.num} className={`group rounded-2xl overflow-hidden border-t-4 ${f.border} border border-zinc-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300`}>
                <div className="relative h-44 overflow-hidden">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <span className="text-lg">{f.icon}</span>
                    <span className="text-white font-bold text-sm drop-shadow">{f.title}</span>
                  </div>
                  <span className="absolute top-3 right-3 text-xs font-bold text-white bg-black/40 rounded-full px-2.5 py-1">{f.num}</span>
                </div>
                <div className="p-5">
                  <p className="text-sm text-zinc-600 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ━━━ 使い方 ━━━ */}
        <section className="rounded-3xl bg-zinc-50 border border-zinc-100 px-8 py-14">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">HOW IT WORKS</p>
            <h2 className="text-2xl font-bold text-zinc-900">3ステップで相談完了</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "専門家を選ぶ", desc: "分野・評価・空き状況で絞り込み" },
              { step: "2", title: "名前を入力", desc: "アカウント不要。名前だけでOK" },
              { step: "3", title: "すぐ相談開始", desc: "ビデオ通話が自動でつながる" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-zinc-900 mb-1">{s.title}</h3>
                <p className="text-sm text-zinc-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ━━━ CTA ━━━ */}
        <section className="rounded-3xl bg-indigo-600 text-white px-10 py-16 text-center">
          <h2 className="text-3xl font-bold mb-3 text-white">専門家に無料で相談してみる</h2>
          <p className="text-indigo-200 text-sm mb-10">予約不要 · 初回30分無料 · すぐつながる</p>
          <button
            onClick={() => router.push("/experts")}
            className="rounded-xl bg-white text-indigo-700 font-bold px-12 py-4 text-base hover:bg-indigo-50 transition shadow-lg"
          >
            今すぐ無料で相談する →
          </button>
        </section>

        {/* ━━━ フッター ━━━ */}
        <footer className="border-t border-zinc-100 pt-10 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
            <div>
              <p className="font-bold text-zinc-900 mb-1">Samurai Connect</p>
              <p className="text-xs text-zinc-400">士業向けリアルタイムビデオ相談プラットフォーム</p>
            </div>
            <div className="flex flex-wrap gap-6 text-xs text-zinc-400">
              {["利用規約", "プライバシーポリシー", "特定商取引法に基づく表記", "専門家として登録する"].map(l => (
                <a key={l} href="#" className="hover:text-zinc-700 transition">{l}</a>
              ))}
            </div>
          </div>
          <p className="text-xs text-zinc-300 mt-8 text-center">© 2024 Samurai Connect. All rights reserved.</p>
        </footer>

      </main>
    </div>
  );
}
