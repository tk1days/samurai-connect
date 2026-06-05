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

  const gradients: Record<string, string> = {
    female: "from-rose-400 to-pink-500",
    male: "from-indigo-400 to-blue-500",
  };

  return (
    <div className="bg-white">

      {/* ━━━ HERO ━━━ */}
      <section className="relative overflow-hidden bg-[#0a0f1e] text-white min-h-[92vh] flex items-center">
        {/* 背景グリッド */}
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
        {/* グロー */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }}
        />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* 左：コピー */}
            <div>
              {/* リアルタイムバッジ */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-white/70 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                現在 <span className="text-emerald-400 font-bold">{onlineCount}名</span>の専門家が待機中 · {time}更新
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
                税務・法律の悩み<br />
                <span style={{
                  background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #f472b6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>今すぐ、顔を見て</span><br />
                解決できる
              </h1>

              <p className="text-zinc-400 text-lg mb-3 leading-relaxed">
                待機中の税理士・司法書士・社労士に<br />
                ワンクリックでビデオ通話。
              </p>
              <p className="text-zinc-500 text-sm mb-10">
                予約不要・初回30分無料・平均接続30秒
              </p>

              {/* CTA ボタン 2つ */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  onClick={() => router.push("/experts")}
                  className="rounded-xl px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}
                >
                  今すぐ無料で相談する →
                </button>
                <button
                  onClick={() => router.push("/experts")}
                  className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white/80 hover:bg-white/10 hover:text-white transition backdrop-blur"
                >
                  専門家を探す
                </button>
              </div>

              {/* 信頼バッジ */}
              <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                {["✓ 予約不要・即つながる", "✓ 初回30分完全無料", "✓ 全員有資格の専門家"].map(t => (
                  <span key={t} className="text-zinc-400">{t}</span>
                ))}
              </div>
            </div>

            {/* 右：専門家カード */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-3">
                {onlineExperts.map((e) => {
                  const grad = e.gender === "female" ? gradients.female : gradients.male;
                  return (
                    <div
                      key={e.id}
                      onClick={() => router.push(`/wait?expert=${e.id}`)}
                      className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 cursor-pointer hover:border-indigo-500/50 hover:bg-white/10 transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg`}>
                          {e.display_name[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-semibold text-sm text-white truncate">{e.display_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                            <span className="text-[10px] text-emerald-400">待機中</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 truncate mb-2">{e.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-400">★ {e.rating.toFixed(1)} <span className="text-zinc-600">({e.review_count}件)</span></span>
                        <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">{e.price_label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => router.push("/experts")}
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                他の専門家を見る →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 実績バー ━━━ */}
      <section className="bg-zinc-950 border-y border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-3 divide-x divide-white/10 text-center">
          {[
            { val: "1,200+", label: "登録専門家" },
            { val: "4.8", label: "平均評価" },
            { val: "30秒", label: "平均接続時間" },
          ].map(item => (
            <div key={item.label} className="px-4">
              <p className="text-2xl font-bold text-white">{item.val}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-16 space-y-24">

        {/* ━━━ 専門家一覧 ━━━ */}
        <section>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-2">EXPERTS ONLINE NOW</p>
              <h2 className="text-2xl font-bold text-zinc-900">今すぐ相談できる専門家</h2>
              <p className="text-sm text-zinc-400 mt-1">待機中の専門家にワンクリックでビデオ通話</p>
            </div>
            <button onClick={() => router.push("/experts")} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              すべて見る <span>→</span>
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
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">WHY SAMURAI CONNECT</p>
            <h2 className="text-3xl font-bold text-zinc-900 mb-3">選ばれる3つの理由</h2>
            <p className="text-zinc-500">面倒な手続きなし。今すぐ始められる。</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                icon: "⚡",
                title: "予約不要・即つながる",
                desc: "待機中の専門家にワンクリックで即接続。問い合わせフォームも、メールも不要。今すぐ話せる。",
                img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop&q=80",
                accent: "#6366f1",
              },
              {
                num: "02",
                icon: "🎥",
                title: "顔を見て安心相談",
                desc: "ビデオ通話で対面と同じ安心感。画面共有で書類を一緒に確認できる。",
                img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&auto=format&fit=crop&q=80",
                accent: "#8b5cf6",
              },
              {
                num: "03",
                icon: "🎁",
                title: "初回30分完全無料",
                desc: "費用ゼロでお試し。相性が合えば継続、合わなければそれでOK。リスクゼロ。",
                img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
                accent: "#f59e0b",
              },
            ].map((f) => (
              <div key={f.num} className="group rounded-2xl overflow-hidden border border-zinc-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <span className="text-xl">{f.icon}</span>
                    <span className="text-white font-bold text-sm">{f.title}</span>
                  </div>
                  <span className="absolute top-3 right-3 text-xs font-bold text-white/60 bg-black/30 rounded-full px-2.5 py-1">{f.num}</span>
                </div>
                <div className="p-5 border-t-2" style={{ borderColor: f.accent }}>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ━━━ 使い方 ━━━ */}
        <section className="rounded-3xl bg-zinc-50 border border-zinc-100 px-8 py-14">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">HOW IT WORKS</p>
            <h2 className="text-2xl font-bold text-zinc-900">3ステップで相談完了</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-8 left-1/4 right-1/4 h-px bg-zinc-200" />
            {[
              { step: "1", title: "専門家を選ぶ", desc: "分野・評価・空き状況で絞り込み" },
              { step: "2", title: "名前を入力", desc: "アカウント不要。名前だけでOK" },
              { step: "3", title: "すぐ相談開始", desc: "ビデオ通話が自動でつながる" },
            ].map((s) => (
              <div key={s.step} className="text-center relative">
                <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                  {s.step}
                </div>
                <h3 className="font-bold text-zinc-900 mb-1">{s.title}</h3>
                <p className="text-sm text-zinc-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ━━━ CTA ━━━ */}
        <section className="relative overflow-hidden rounded-3xl text-white px-10 py-16 text-center"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)" }}>
          <div className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(168,85,247,0.2) 0%, transparent 50%)" }}
          />
          <div className="relative">
            <p className="text-indigo-300 text-sm font-semibold mb-4 uppercase tracking-widest">今すぐ始められます</p>
            <h2 className="text-3xl font-bold mb-3">専門家に無料で相談してみる</h2>
            <p className="text-indigo-200 text-sm mb-10">予約不要 · 初回30分無料 · すぐつながる</p>
            <button
              onClick={() => router.push("/experts")}
              className="rounded-xl bg-white text-indigo-700 font-bold px-12 py-4 text-base hover:bg-indigo-50 transition shadow-2xl"
            >
              今すぐ無料で相談する →
            </button>
          </div>
        </section>

        {/* ━━━ フッターリンク ━━━ */}
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
