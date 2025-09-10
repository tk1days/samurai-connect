// src/app/experts/[id]/page.tsx
"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo, useState } from "react";
import { EXPERTS, type Expert } from "@/data/experts";

/** params が Promise/非Promise どちらでも安全に取り出す */
function getIdFromParams(params: { id: string } | Promise<{ id: string }>): string {
  const maybe = params as any;
  const obj =
    typeof maybe?.then === "function"
      ? (use(params as Promise<{ id: string }>) as { id: string })
      : (params as { id: string });
  return decodeURIComponent(String(obj?.id ?? ""));
}

/** 共通スター表示 */
function Stars({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(5, value ?? 0));
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(safe);
        return (
          <svg
            key={`star-${i}`}
            className={`h-4 w-4 ${filled ? "text-yellow-400" : "text-gray-300"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118L10.95 13.98a1 1 0 00-1.176 0l-2.436 1.793c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.703 8.72c-.783-.57-.38-1.81.588-1.81h3.463a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

/** モックレビュー型 */
type Review = {
  id: string;
  author: string;
  rating: number; // 1..5
  body: string;
  createdAt: string;
};

/** 事前レビュー（存在しないIDは自動生成にフォールバック） */
const PRESET_REVIEWS: Record<string, Review[]> = {
  "1": [
    {
      id: "r-1-1",
      author: "佐々木 祐介",
      rating: 5,
      body:
        "決算前の節税ポイントを具体的に示していただき、とても助かりました。説明も分かりやすかったです。",
      createdAt: "2025-03-11",
    },
    {
      id: "r-1-2",
      author: "中小企業経営者",
      rating: 4,
      body:
        "資金繰り視点の見直し案まで提案いただけたのが良かったです。オンラインでも十分でした。",
      createdAt: "2025-02-22",
    },
  ],
  "2": [
    {
      id: "r-2-1",
      author: "人事担当",
      rating: 5,
      body:
        "就業規則の改定ポイントを明確化してもらえ、助成金の可能性まで整理していただけました。",
      createdAt: "2025-03-02",
    },
    {
      id: "r-2-2",
      author: "製造業",
      rating: 4,
      body:
        "実務に落とし込める運用案が良かったです。資料テンプレも助かりました。",
      createdAt: "2025-02-14",
    },
  ],
};

function makeFallbackReviews(expertId: string, base = 4.6): Review[] {
  const names = ["匿名ユーザー", "小売業", "IT企業", "製造業"];
  const notes = [
    "初回でも丁寧に背景を理解してくれて、次のアクションまで固まりました。",
    "自社状況に合わせた選択肢提示が良かったです。",
    "短時間で論点が整理できて助かりました。",
  ];
  return Array.from({ length: 3 }).map((_, i) => ({
    id: `auto-${expertId}-${i + 1}`,
    author: names[i % names.length],
    rating: Math.max(3, Math.min(5, Math.round(base + (i % 2 ? 0 : -0.2)))),
    body: notes[i % notes.length],
    createdAt: `2025-01-0${i + 1}`,
  }));
}

type PageProps =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

export default function ExpertDetailPage(p: PageProps) {
  // params 取り出し（Next.js 15 の Promise/非Promise両対応）
  const id = getIdFromParams((p as any).params);
  if (!id) return notFound();

  const expert = EXPERTS.find((e) => String(e.id) === id);
  if (!expert) return notFound();

  const safeRating = Math.max(0, Math.min(5, expert.rating ?? 0));
  const avatarGradient =
    expert.gender === "female" ? "from-pink-400 to-rose-500" : "from-sky-500 to-indigo-500";
  const cardTint =
    expert.gender === "female"
      ? "bg-gradient-to-b from-rose-50 to-white border-rose-100 ring-rose-100/70"
      : "bg-gradient-to-b from-sky-50 to-white border-sky-100 ring-sky-100/70";

  // ボード解決（存在しない時は空配列）
  const boardMembers = useMemo(() => {
    const ids = (expert.boardMembers ?? []).filter(Boolean);
    return ids
      .map((x) => EXPERTS.find((e) => e.id === x))
      .filter(Boolean) as Expert[];
  }, [expert]);

  const joinedBoards = useMemo(() => {
    const ids = (expert.joinedBoards ?? []).filter(Boolean);
    return ids
      .map((x) => EXPERTS.find((e) => e.id === x))
      .filter(Boolean) as Expert[];
  }, [expert]);

  const reviews: Review[] = useMemo(
    () => PRESET_REVIEWS[expert.id] ?? makeFallbackReviews(expert.id, expert.rating ?? 4.6),
    [expert.id, expert.rating]
  );
  const [visibleCount, setVisibleCount] = useState(3);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* パンくず */}
      <div className="mb-4 text-sm text-gray-600">
        <Link href="/experts" className="underline">専門家を探す</Link>
        <span className="mx-1">/</span>
        {expert.name}
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,380px]">
        {/* 左：プロフィール */}
        <div className={`rounded-2xl border ${cardTint} ring-1 shadow-sm`}>
          <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br ${avatarGradient} text-2xl font-bold text-white shadow`}>
                {expert.name[0]}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">{expert.name}</h1>
                  {expert.license ? (
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/15">
                      {expert.license}
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-400/20">
                      （資格なし）
                    </span>
                  )}
                  {expert.online ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/15">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      待機中
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-300/60">
                      オフライン
                    </span>
                  )}
                </div>

                <p className="mt-1 text-gray-700">{expert.title}</p>

                {/* 所在地 */}
                <p className="mt-1 text-sm font-medium text-gray-900">所在地：{expert.location}</p>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                  <Stars value={safeRating} />
                  <span>{safeRating.toFixed(1)}</span>
                  <span className="text-gray-400">（{expert.reviews}件）</span>
                </div>

                <div className="mt-2 text-sm text-gray-700">
                  料金目安：<span className="font-semibold">{expert.price}</span>
                </div>
              </div>
            </div>

            {expert.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {expert.tags.map((tag) => (
                  <span key={`${expert.id}-${tag}`} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <section>
              <h2 className="text-xl font-semibold">自己紹介</h2>
              <p className="mt-2 whitespace-pre-wrap text-gray-800 leading-relaxed">
                {expert.bio}
              </p>
            </section>

            {/* ===== ボード領域 =====
               ・左カード：専門家ボード（しっかり表示）
               ・右カード：参加しているボード（控えめ表示）
               ・データが無いときも “ブランク” のカードを表示して高さを維持
            */}
            <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* 専門家ボード：しっかり表示（アバター+名前、グリッド） */}
              <div className="rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">専門家ボード</h3>
                  {/* 将来：編集導線 */}
                </div>
                {boardMembers.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {boardMembers.map((m) => (
                      <Link
                        key={m.id}
                        href={`/experts/${m.id}`}
                        className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 hover:bg-gray-100"
                        title={m.name}
                      >
                        <span
                          className={`h-7 w-7 shrink-0 rounded-full bg-gradient-to-br ${
                            m.gender === "female"
                              ? "from-pink-400 to-rose-500"
                              : "from-sky-500 to-indigo-500"
                          }`}
                        />
                        <span className="text-sm font-medium text-gray-900 line-clamp-1">
                          {m.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  // ブランク：高さだけ確保（装飾なし）
                  <div className="mt-3 min-h-20" />
                )}
              </div>

              {/* 参加しているボード：控えめ（小さめのリンクリスト） */}
              <div className="rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-sm">
                <h3 className="text-base font-semibold">参加しているボード</h3>
                {joinedBoards.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {joinedBoards.map((o) => (
                      <li key={o.id}>
                        <Link
                          href={`/experts/${o.id}`}
                          className="text-sm text-indigo-700 underline underline-offset-4 hover:text-indigo-900"
                        >
                          {o.name} のボード
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // ブランク：高さだけ確保（装飾なし）
                  <div className="mt-3 min-h-20" />
                )}
              </div>
            </section>

            {/* レビュー一覧 */}
            <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <section>
              <h2 className="text-xl font-semibold">レビュー</h2>
              <ul className="mt-3 space-y-4">
                {reviews.slice(0, visibleCount).map((r) => (
                  <li key={r.id} className="rounded-xl border border-gray-200 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{r.author}</div>
                      <div className="text-xs text-gray-500">{r.createdAt}</div>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-sm text-gray-700">
                      <Stars value={r.rating} />
                      <span className="ml-1 text-sm">{r.rating}.0</span>
                    </div>
                    <p className="mt-2 text-gray-700">{r.body}</p>
                  </li>
                ))}
              </ul>

              {visibleCount < reviews.length && (
                <button
                  onClick={() => setVisibleCount((v) => Math.min(v + 3, reviews.length))}
                  className="mt-4 w-full rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  もっと見る
                </button>
              )}
            </section>
          </div>
        </div>

        {/* 右：ライブ相談＋セッション予約（控えめ） */}
        <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm space-y-8">
          {/* ライブ相談（主） */}
          <div>
            <h3 className="text-lg font-semibold">ライブ相談</h3>
            <p className="mt-1 text-sm text-gray-600">
              すぐに専門家と接続します（待機中であれば即時開始）。
            </p>
            <Link
              href="/session"
              className="mt-3 block w-full rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 px-4 py-2 text-center text-white hover:brightness-105"
            >
              ライブ相談を開始
            </Link>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* セッション予約（副・控えめ） */}
          <div>
            <h3 className="text-lg font-semibold">セッション予約</h3>
            <p className="mt-1 text-sm text-gray-600">
              相談概要を送っておけば、専門家が後から確認します（モック）。
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("予約（モック）: まだバックエンド未接続です。");
              }}
              className="mt-3 space-y-3"
            >
              <input
                required
                className="w-full rounded-lg border px-3 py-2"
                placeholder="お名前"
              />
              <input
                type="email"
                required
                className="w-full rounded-lg border px-3 py-2"
                placeholder="メールアドレス"
              />
              <input
                type="text"
                className="w-full rounded-lg border px-3 py-2"
                placeholder="希望日時（任意）"
              />
              <textarea
                required
                rows={3}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="相談概要（簡単でOK）"
              />
              <button
                type="submit"
                className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                予約リクエスト送信（モック）
              </button>
            </form>
          </div>
        </aside>
      </div>
    </main>
  );
}

