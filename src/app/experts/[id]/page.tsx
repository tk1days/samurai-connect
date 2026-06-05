"use client";

import { useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_EXPERTS } from "@/lib/mock";

function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-yellow-400">{"★".repeat(Math.round(v))}</span>
      <span className="text-sm font-medium">{v.toFixed(1)}</span>
    </span>
  );
}

export default function ExpertDetailPage() {
  const params = useParams<{ id: string }>();
  const expert = useMemo(
    () => MOCK_EXPERTS.find((e) => e.id === params.id),
    [params.id]
  );

  if (!expert) return notFound();

  const avatarGrad = expert.gender === "female"
    ? "from-pink-400 to-rose-500"
    : "from-sky-500 to-indigo-500";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* パンくず */}
      <div className="mb-4 text-sm text-zinc-500">
        <Link href="/experts" className="hover:underline">専門家を探す</Link>
        <span className="mx-2">/</span>
        {expert.display_name}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
        {/* 左：プロフィール */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br ${avatarGrad} text-2xl font-bold text-white shadow`}>
                {expert.display_name[0]}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">{expert.display_name}</h1>
                  {expert.license && (
                    <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/15">
                      {expert.license}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                    expert.is_online
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
                      : "bg-gray-50 text-gray-500 ring-gray-300/40"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${expert.is_online ? "bg-emerald-500" : "bg-gray-300"}`} />
                    {expert.is_online ? "待機中" : "オフライン"}
                  </span>
                </div>

                <p className="mt-1 text-zinc-600">{expert.title}</p>
                {expert.location && <p className="mt-1 text-sm text-zinc-500">📍 {expert.location}</p>}

                <div className="mt-2 flex items-center gap-3">
                  <Stars value={expert.rating} />
                  <span className="text-sm text-zinc-400">({expert.review_count}件のレビュー)</span>
                </div>

                <p className="mt-1 text-sm font-medium">料金：{expert.price_label}</p>
              </div>
            </div>

            {/* タグ */}
            {expert.tags && expert.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {expert.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-zinc-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 自己紹介 */}
            {expert.bio && (
              <>
                <hr className="my-5" />
                <h2 className="text-lg font-semibold">自己紹介</h2>
                <p className="mt-2 leading-relaxed text-zinc-700">{expert.bio}</p>
              </>
            )}
          </div>
        </div>

        {/* 右：相談 */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">ライブ相談</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {expert.is_online
                ? "今すぐ接続できます。"
                : "現在オフラインです。待機中になったら通知します。"}
            </p>
            <Link
              href={expert.is_online ? `/wait?expert=${expert.id}` : "#"}
              className={`mt-3 block w-full rounded-xl py-3 text-center text-sm font-medium text-white transition ${
                expert.is_online
                  ? "bg-gradient-to-r from-indigo-600 to-sky-500 hover:brightness-105"
                  : "cursor-not-allowed bg-gray-300"
              }`}
              aria-disabled={!expert.is_online}
              onClick={(e) => !expert.is_online && e.preventDefault()}
            >
              {expert.is_online ? "ライブ相談を開始" : "オフライン中"}
            </Link>
          </div>

          <div className="rounded-2xl border bg-indigo-50 p-4 text-sm text-indigo-700">
            <p className="font-medium">30分 完全無料</p>
            <p className="mt-1 text-indigo-600">ログイン不要で相談を開始できます。合えばそのまま継続相談・顧問契約へ。</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
