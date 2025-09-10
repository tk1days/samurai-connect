// src/components/ExpertCard.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  location: string;     // ★ 追加表示：所在地（必須）
};

const LS_FAVS = "sc_favorites_v1";

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
  location,
}: Props) {
  const initial = name?.[0] ?? "識";
  const safeRating = Math.max(0, Math.min(5, rating ?? 0));

  // 性別トーン（カード背景＆枠色）
  const cardTint =
    gender === "female"
      ? "bg-gradient-to-b from-rose-50 to-white border-rose-100 ring-rose-100/70"
      : "bg-gradient-to-b from-sky-50 to-white border-sky-100 ring-sky-100/70";

  // アバターのグラデ
  const avatarGradient =
    gender === "female" ? "from-pink-400 to-rose-500" : "from-sky-500 to-indigo-500";

  // === お気に入り ===
  const [isFav, setIsFav] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_FAVS);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      setIsFav(Array.isArray(arr) && arr.includes(String(id)));
    } catch {}
  }, [id]);

  const toggleFav = () => {
    setIsFav((prev) => {
      const next = !prev;
      try {
        const raw = localStorage.getItem(LS_FAVS);
        const arr: string[] = raw ? JSON.parse(raw) : [];
        let out: string[] = Array.isArray(arr) ? arr : [];
        if (next) {
          out = Array.from(new Set([...out, String(id)]));
        } else {
          out = out.filter((x) => x !== String(id));
        }
        localStorage.setItem(LS_FAVS, JSON.stringify(out));
      } catch {}
      return next;
    });
  };

  return (
    <div
      className={`group relative rounded-2xl border ${cardTint} ring-1 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg h-full`}
    >
      <div className="h-[3px] w-full rounded-t-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

      {/* お気に入りトグル（右上） */}
      <button
        type="button"
        onClick={toggleFav}
        aria-pressed={isFav}
        title={isFav ? "お気に入りから削除" : "お気に入りに追加"}
        className={`absolute right-3 top-3 inline-flex items-center justify-center rounded-full border px-2.5 py-2 text-sm shadow-sm transition
          ${isFav
            ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${isFav ? "fill-current" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M12.001 21.35l-1.45-1.32C5.4 15.36 2 12.279 2 8.5 2 6.015 4.015 4 6.5 4c1.74 0 3.41.99 4.22 2.49C11.33 4.99 13 4 14.74 4 17.225 4 19.24 6.015 19.24 8.5c0 3.779-3.4 6.86-8.55 11.54l-0.689.64z"
          />
        </svg>
      </button>

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${avatarGradient} text-white font-bold shadow-sm`}
          >
            {initial}
          </div>

          <div className="min-w-0 flex-1">
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
              <h3
                className="text-base font-semibold tracking-tight text-gray-900 truncate"
                title={name}
              >
                {name}
              </h3>
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

            <p className="mt-0.5 text-sm text-gray-700 line-clamp-2" title={title}>
              {title}
            </p>

            {/* ★ 所在地（一覧では必ず表示） */}
            <div className="mt-2 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
                {location}
              </span>
            </div>
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
                    aria-hidden="true"
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
