"use client";

import Link from "next/link";
import type { Expert } from "@/types";

function Stars({ value, count }: { value: number; count: number }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="text-yellow-400">{"★".repeat(Math.round(v))}</span>
      <span className="font-medium text-zinc-900">{v.toFixed(1)}</span>
      <span className="text-zinc-400">({count}件)</span>
    </span>
  );
}

export default function ExpertCard({ expert }: { expert: Expert }) {
  const {
    id, display_name, license, title, tags = [],
    price_label, is_online, is_priority, rating, review_count,
    location, gender = "male",
  } = expert;

  const avatarGrad = gender === "female"
    ? "from-pink-400 to-rose-500"
    : "from-sky-500 to-indigo-500";

  const cardTint = gender === "female"
    ? "from-rose-50"
    : "from-sky-50";

  return (
    <div className={`group relative flex flex-col rounded-2xl border bg-gradient-to-b ${cardTint} to-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md`}>
      {/* 優先表示バッジ */}
      {is_priority && (
        <div className="absolute -top-2 right-3 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-white shadow">
          PR
        </div>
      )}

      {/* アクセントライン */}
      <div className="h-[3px] w-full rounded-t-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

      <div className="flex flex-1 flex-col p-4">
        {/* ヘッダー */}
        <div className="flex items-start gap-3">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${avatarGrad} text-lg font-bold text-white shadow`}>
            {display_name[0]}
          </div>

          <div className="min-w-0 flex-1">
            {/* 資格 */}
            {license ? (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/15">
                {license}
              </span>
            ) : (
              <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-500 ring-1 ring-gray-300/30">
                資格なし
              </span>
            )}

            <div className="mt-1 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900">{display_name}</h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                is_online
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
                  : "bg-gray-50 text-gray-500 ring-gray-300/40"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${is_online ? "bg-emerald-500" : "bg-gray-300"}`} />
                {is_online ? "待機中" : "オフライン"}
              </span>
            </div>

            <p className="mt-0.5 text-sm text-zinc-600">{title}</p>

            {location && (
              <p className="mt-1 text-xs text-zinc-500">📍 {location}</p>
            )}
          </div>
        </div>

        {/* タグ */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 5).map((tag) => (
              <span key={tag} className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-zinc-600">
                {tag}
              </span>
            ))}
            {tags.length > 5 && (
              <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-zinc-400">
                +{tags.length - 5}
              </span>
            )}
          </div>
        )}

        {/* 評価・料金 */}
        <div className="mt-3 flex items-center justify-between">
          <Stars value={rating} count={review_count} />
          <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-zinc-800">
            {price_label}
          </span>
        </div>

        <div className="my-3 h-px bg-gray-100" />

        {/* CTA */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/experts/${id}`}
            className="rounded-xl border border-gray-200 bg-white py-2 text-center text-sm text-zinc-700 hover:bg-gray-50"
          >
            プロフィール
          </Link>
          <Link
            href={`/wait?expert=${id}`}
            className={`rounded-xl py-2 text-center text-sm font-medium text-white shadow-sm transition ${
              is_online
                ? "bg-gradient-to-r from-indigo-600 to-sky-500 hover:brightness-105"
                : "cursor-not-allowed bg-gray-300"
            }`}
            aria-disabled={!is_online}
            onClick={(e) => !is_online && e.preventDefault()}
          >
            {is_online ? "すぐ相談" : "オフライン"}
          </Link>
        </div>
      </div>
    </div>
  );
}
