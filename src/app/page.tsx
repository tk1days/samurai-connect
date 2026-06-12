"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ExpertCard from "@/components/ExpertCard";
import { MOCK_EXPERTS, MOCK_CATEGORIES } from "@/lib/mock";

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);

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
  }, []);

  const goSearch = (value: string) => {
    const k = value.trim();
    router.push(k ? `/experts?q=${encodeURIComponent(k)}` : "/experts");
  };

  const avatarColor: Record<string, string> = {
    female: "linear-gradient(135deg,#ec4899,#f472b6)",
    male: "linear-gradient(135deg,#6366f1,#3b82f6)",
  };

  return (
    <div style={{
      background: "radial-gradient(circle at 85% 8%,rgba(91,75,255,.12),transparent 28%), radial-gradient(circle at 12% 18%,rgba(20,184,166,.08),transparent 24%), linear-gradient(180deg,#fbfcff 0%,#f6f8fc 100%)",
      minHeight: "100vh",
    }}>

      {/* ━━━ HERO ━━━ */}
      <section style={{ padding: "86px 0 60px", position: "relative", overflow: "hidden" }}>
        {/* 背景グロー */}
        <div style={{
          position: "absolute", width: 460, height: 460, borderRadius: "50%",
          right: -180, top: -100,
          background: "radial-gradient(circle,rgba(91,75,255,.15),transparent 68%)",
          pointerEvents: "none",
        }} />

        <div className="mx-auto px-5" style={{ maxWidth: 1180 }}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* 左：コピー */}
            <div>
              {/* eyebrow */}
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full font-bold text-sm"
                style={{ border: "1px solid rgba(20,184,166,.25)", background: "rgba(236,253,245,.9)", color: "#047857" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 5px rgba(16,185,129,.12)", display: "inline-block" }} />
                現在 {onlineCount}名の専門家が待機中
              </div>

              <h1 style={{ fontSize: "clamp(40px,5.5vw,68px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.05em", margin: "0 0 24px" }}>
                税務・法律の悩みを<br />
                <span style={{
                  background: "linear-gradient(135deg,#5b4bff,#2563eb,#14b8a6)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>今すぐ、顔を見て</span><br />
                解決できる
              </h1>

              <p style={{ fontSize: 18, lineHeight: 1.85, color: "#687086", margin: "0 0 32px", maxWidth: 560 }}>
                待機中の税理士・司法書士・社労士に<br />ワンクリックでビデオ通話。予約不要・初回30分無料。
              </p>

              {/* 検索ボックス */}
              <form onSubmit={(e) => { e.preventDefault(); goSearch(q); }}
                style={{
                  display: "flex", gap: 10, padding: 10,
                  background: "rgba(255,255,255,.95)", border: "1px solid rgba(20,24,39,.08)",
                  borderRadius: 19, boxShadow: "0 10px 35px rgba(39,48,90,.08)", maxWidth: 620, marginBottom: 20,
                }}>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="例：相続、節税、会社設立…"
                  style={{
                    flex: 1, border: 0, outline: 0, padding: "0 14px",
                    background: "transparent", fontSize: 15, color: "#141827",
                  }}
                />
                <button type="submit" style={{
                  border: 0, cursor: "pointer", padding: "0 24px", borderRadius: 12,
                  fontWeight: 800, fontSize: 15, color: "#fff", minHeight: 48,
                  background: "linear-gradient(135deg,#5b4bff,#2563eb)",
                  boxShadow: "0 8px 22px rgba(79,70,229,.28)",
                }}>
                  検索
                </button>
              </form>

              {/* CTAボタン */}
              <button
                onClick={() => router.push("/experts")}
                style={{
                  border: 0, cursor: "pointer", display: "inline-flex", alignItems: "center",
                  gap: 8, padding: "0 32px", minHeight: 54, borderRadius: 16,
                  fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 22,
                  background: "linear-gradient(135deg,#5b4bff,#2563eb)",
                  boxShadow: "0 14px 36px rgba(79,70,229,.28)",
                  transition: ".2s ease",
                }}>
                今すぐ無料で相談する →
              </button>

              {/* trust badges */}
              <div className="flex flex-wrap gap-5" style={{ fontSize: 13, fontWeight: 700, color: "#71788c" }}>
                {["✓ 予約不要・即つながる", "✓ 初回30分完全無料", "✓ 全員有資格の専門家"].map(t => (
                  <span key={t} style={{ color: "#10b981" }}>{t}</span>
                ))}
              </div>
            </div>

            {/* 右：専門家パネル */}
            <div className="hidden lg:block">
              <div style={{
                padding: 22, borderRadius: 28,
                background: "rgba(255,255,255,.75)", border: "1px solid rgba(255,255,255,.7)",
                boxShadow: "0 20px 60px rgba(39,48,90,.12)", backdropFilter: "blur(18px)",
              }}>
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontWeight: 900, fontSize: 16 }}>待機中の専門家</span>
                  <span style={{ fontSize: 12, color: "#059669", fontWeight: 800 }}>● {onlineCount}名オンライン</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {onlineExperts.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => router.push(`/wait?expert=${e.id}`)}
                      style={{
                        background: "rgba(255,255,255,.95)", border: "1px solid rgba(20,24,39,.07)",
                        borderRadius: 18, padding: 16, cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(39,48,90,.06)",
                        transition: ".2s ease",
                      }}
                      onMouseEnter={e2 => (e2.currentTarget.style.transform = "translateY(-2px)")}
                      onMouseLeave={e2 => (e2.currentTarget.style.transform = "")}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                          background: e.gender === "female" ? avatarColor.female : avatarColor.male,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 900, fontSize: 15,
                        }}>
                          {e.display_name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14, color: "#141827" }}>{e.display_name}</div>
                          <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>● 待機中</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#687086", marginBottom: 8 }}>{e.title}</div>
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>★ {e.rating.toFixed(1)}</span>
                        <span style={{ fontSize: 12, color: "#5b4bff", fontWeight: 800 }}>{e.price_label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push("/experts")}
                  style={{
                    marginTop: 14, width: "100%", border: "1px solid rgba(20,24,39,.08)",
                    borderRadius: 14, padding: "12px 0", fontSize: 14, fontWeight: 700,
                    color: "#687086", background: "transparent", cursor: "pointer",
                    transition: ".2s ease",
                  }}>
                  他の専門家を見る →
                </button>
              </div>
            </div>
          </div>

          {/* 実績バー */}
          <div style={{
            marginTop: 64, padding: "20px 40px",
            background: "rgba(255,255,255,.75)", border: "1px solid rgba(20,24,39,.07)",
            borderRadius: 22, boxShadow: "0 10px 35px rgba(39,48,90,.07)",
            backdropFilter: "blur(18px)",
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center",
          }}>
            {[
              { val: "1,200+", label: "登録専門家" },
              { val: "4.8", label: "平均評価" },
              { val: "30秒", label: "平均接続時間" },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: "0 20px", borderLeft: i > 0 ? "1px solid rgba(20,24,39,.08)" : "none" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#141827" }}>{s.val}</div>
                <div style={{ fontSize: 13, color: "#687086", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 専門家一覧 ━━━ */}
      <section style={{ padding: "80px 0" }}>
        <div className="mx-auto px-5" style={{ maxWidth: 1180 }}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#5b4bff", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>
                Experts online now
              </div>
              <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#141827" }}>今すぐ相談できる専門家</h2>
              <p style={{ margin: "8px 0 0", fontSize: 15, color: "#687086" }}>待機中の専門家にワンクリックでビデオ通話</p>
            </div>
            <button onClick={() => router.push("/experts")}
              style={{ border: 0, background: "none", cursor: "pointer", fontSize: 14, fontWeight: 800, color: "#5b4bff" }}>
              すべて見る →
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => (
              <ExpertCard key={e.id} expert={e} />
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ How it works ━━━ */}
      <section style={{ padding: "80px 0", background: "rgba(255,255,255,.5)" }}>
        <div className="mx-auto px-5" style={{ maxWidth: 1180 }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#5b4bff", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>
              How it works
            </div>
            <h2 style={{ margin: 0, fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", color: "#141827" }}>相談まで、わずか3ステップ</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { num: "1", title: "相談内容を入力", desc: "キーワードや悩みを入力すると、相談内容に合う専門家を表示します。" },
              { num: "2", title: "専門家を選ぶ", desc: "資格、得意分野、評価、待機状況を比較して相談相手を選べます。" },
              { num: "3", title: "すぐビデオ相談", desc: "予約は不要。待機中の専門家なら、そのままオンライン相談を開始できます。" },
            ].map((s) => (
              <div key={s.num} style={{
                background: "rgba(255,255,255,.92)", border: "1px solid rgba(20,24,39,.07)",
                borderRadius: 22, padding: 32, boxShadow: "0 8px 28px rgba(39,48,90,.07)",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 18, marginBottom: 20,
                  background: "linear-gradient(135deg,#5b4bff,#2563eb)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 900, fontSize: 22,
                  boxShadow: "0 10px 28px rgba(79,70,229,.22)",
                }}>
                  {s.num}
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 900, color: "#141827" }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "#687086" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section style={{ padding: "80px 20px" }}>
        <div style={{
          maxWidth: 1180, margin: "0 auto", padding: "64px 40px",
          borderRadius: 28, textAlign: "center",
          background: "linear-gradient(135deg,#5b4bff 0%,#2563eb 60%,#14b8a6 100%)",
          boxShadow: "0 24px 60px rgba(79,70,229,.30)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(circle at 20% 50%,rgba(255,255,255,.12),transparent 50%), radial-gradient(circle at 80% 50%,rgba(20,184,166,.2),transparent 50%)",
          }} />
          <div style={{ position: "relative" }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,.7)", letterSpacing: ".1em", textTransform: "uppercase" }}>
              今すぐ始められます
            </p>
            <h2 style={{ margin: "0 0 12px", fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>
              悩みを、一人で抱えない。
            </h2>
            <p style={{ margin: "0 0 36px", fontSize: 16, color: "rgba(255,255,255,.75)" }}>
              信頼できる専門家へ、今すぐ相談してみませんか。
            </p>
            <button
              onClick={() => router.push("/experts")}
              style={{
                border: 0, cursor: "pointer", padding: "0 44px", minHeight: 56,
                borderRadius: 16, fontWeight: 900, fontSize: 16,
                color: "#5b4bff", background: "#fff",
                boxShadow: "0 12px 36px rgba(0,0,0,.15)",
                transition: ".2s ease",
              }}>
              無料で相談を始める →
            </button>
          </div>
        </div>
      </section>

      {/* ━━━ フッター ━━━ */}
      <footer style={{
        borderTop: "1px solid rgba(20,24,39,.08)", padding: "28px 20px",
      }}>
        <div className="mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 px-5"
          style={{ maxWidth: 1180, fontSize: 13, color: "#9aa1b3", fontWeight: 600 }}>
          <span>© 2026 Samurai Connect</span>
          <div className="flex gap-6">
            {["利用規約", "プライバシーポリシー", "特定商取引法に基づく表記", "専門家として登録する"].map(l => (
              <a key={l} href="#" style={{ color: "#9aa1b3" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
