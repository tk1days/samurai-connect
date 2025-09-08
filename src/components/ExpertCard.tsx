// src/components/ExpertCard.tsx
"use client";

import Link from "next/link";

type Props = {
  id: string;
  name: string;
  license?: string;    // 無資格は undefined
  title: string;
  tags?: string[];
  price?: string;
  online?: boolean;
  rating?: number;
  reviews?: number;
  gender?: "male" | "female";
};

export default function ExpertCard({
  id,
  name,
  license,
  title,
  tags = [],
  price = "30分/¥3,000",
  online = false,
  rating = 4.6,
  reviews = 120,
  gender = "male",
}: Props) {
  const initial = name?.[0] ?? "識";
  const safeRating = Math.max(0, Math.min(5, rating ?? 0));

  // ▼ 性別トーン（カード背景＆枠色）
  const cardTint =
    gender === "female"
      ? "bg-gradient-to-b from-rose-50 to-white border-rose-100 ring-rose-100/70"
      : "bg-gradient-to-b from-sky-50 to-white border-sky-100 ring-sky-100/70";

  // アバターのグラデ
  const avatarGradient =
    gender === "female" ? "from-pink-400 to-rose-500" : "from-sky-500 to-indigo-500";

  return (
    <div
      className={`group relative rounded-2xl border ${cardTint} ring-1 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className="h-[3px] w-full rounded-t-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${avatarGradient} text-white font-bold shadow-sm`}
          >
            {initial}
          </div>

          <div className="flex-1">
            {/* 資格バッジ */}
            <div className="text-xs font-medium">
              {license ? (
                <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-indigo-700 ring-1 ring-indigo-600/15">
                  {license}
                </span>
              ) : (
                <span className="inline-block rounded-full bg-gray-50 px-2.5 py-0.5 text-gray-600 ring-1 ring-gray-400/20">
                  （資格なし）
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold tracking-tight text-gray-900">{name}</h3>
              {online ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/15">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  待機中
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-300/60">
                  オフライン
                </span>
              )}
            </div>

            <p className="mt-0.5 text-sm text-gray-700">{title}</p>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.round(safeRating);
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
            <span>{safeRating.toFixed(1)}</span>
            <span className="text-gray-400">({reviews})</span>
          </div>
          <div className="text-sm font-semibold text-gray-900">{price}</div>
        </div>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/wait"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-3 py-2 text-center text-white shadow-sm transition hover:brightness-105 active:brightness-95"
          >
            すぐ相談
          </Link>
          <Link
            href={`/experts/${String(id)}`}
            prefetch={false}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-gray-800 transition hover:bg-gray-50"
          >
            プロフィール
          </Link>
        </div>
      </div>
    </div>
  );
}