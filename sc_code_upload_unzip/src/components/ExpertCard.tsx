"use client";

import Link from "next/link";
import { useEffect, useState, useId } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  name: string;
  license?: string;
  title: string;
  tags?: string[];
  price?: string; // 例: "30分/¥3,000"
  online?: boolean;
  rating?: number;
  reviews?: number;
  gender?: "male" | "female";
  location: string;
  headline?: string;
};

const LS_FAVS = "sc_favorites_v1";

/* ===== 星（黄色固定） ===== */
function RatingStars({
  value,
  reviews,
  idSuffix,
  size = 14,
}: {
  value: number;
  reviews?: number;
  idSuffix: string;
  size?: number;
}) {
  const v = Math.max(0, Math.min(5, value));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const gid = `halfGrad-${idSuffix}`;
  const box = { width: size, height: size };

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5 text-yellow-400">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f-${i}`} type="full" box={box} />
        ))}
        {half && <Star type="half" gid={gid} box={box} />}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e-${i}`} type="empty" box={box} />
        ))}
      </span>
      <span className="text-gray-900 text-[13px] leading-none">{v.toFixed(1)}</span>
      <span className="text-gray-400 text-[12px] leading-none">
        ({typeof reviews === "number" ? reviews : 0})
      </span>
      {/* ハーフ塗り用グラデ定義 */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={gid}>
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
function Star({
  type,
  gid,
  box = { width: 14, height: 14 },
}: {
  type: "full" | "half" | "empty";
  gid?: string;
  box?: { width: number; height: number };
}) {
  const cls = "inline-block";
  if (type === "full") {
    return (
      <svg viewBox="0 0 20 20" className={cls} style={box} aria-hidden="true">
        <path d="M10 1.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1L1.2 7.9l6.1-.9L10 1.5z" fill="#FACC15" />
      </svg>
    );
  }
  if (type === "half") {
    return (
      <svg viewBox="0 0 20 20" className={cls} style={box} aria-hidden="true">
        <path d="M10 1.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1L1.2 7.9l6.1-.9L10 1.5z" fill={`url(#${gid})`} stroke="#FACC15" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" className={cls} style={box} aria-hidden="true">
      <path d="M10 1.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1L1.2 7.9l6.1-.9L10 1.5z" fill="none" stroke="#FACC15" strokeOpacity="0.25" />
    </svg>
  );
}

/* ===== カード ===== */
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
  headline,
}: Props) {
  const router = useRouter();
  const uid = useId();
  const initial = name?.[0] ?? "識";
  const safeRating = Math.max(0, Math.min(5, rating ?? 0));

  // トーン
  const genderGrad = gender === "female" ? "from-rose-50" : "from-sky-50";
  const cardTint = `bg-gradient-to-b ${genderGrad} to-white border-gray-100 ring-gray-100/70`;
  const avatarGradient =
    gender === "female" ? "from-pink-400 to-rose-500" : "from-sky-500 to-indigo-500";

  // お気に入り
  const [isFav, setIsFav] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_FAVS);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      setIsFav(Array.isArray(arr) && arr.includes(String(id)));
    } catch {}
  }, [id]);

  // タグ：一行・省略「…」
  const MAX_TAGS = 6;
  const shown = tags.slice(0, MAX_TAGS);
  const hasMore = tags.length > shown.length;

  const PricePill = price ? (
    <div
      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm"
      title={price}
    >
      {price}
    </div>
  ) : null;

  const OnlineBadge = (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 whitespace-nowrap ${
        online
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
          : "bg-gray-50 text-gray-600 ring-gray-300/60"
      }`}
      aria-label={online ? "オンライン" : "オフライン"}
    >
      <span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-gray-300"}`} />
      {online ? "待機中" : "オフライン"}
    </span>
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/experts/${encodeURIComponent(String(id))}`)}
      className={`group relative h-full rounded-2xl border ${cardTint} ring-1 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className="h-[3px] w-full rounded-t-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

      <div className="p-4 sm:p-5">
        {/* ヘッダ */}
        <div className="flex items-start gap-3">
          <div className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${avatarGradient} text-white font-bold shadow-sm`}>
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium">
              {license ? (
                <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-indigo-700 ring-1 ring-indigo-600/15">
                  {license}
                </span>
              ) : (
                <span className="inline-block rounded-full bg-gray-50 px-2.5 py-0.5 text-gray-500 ring-1 ring-gray-400/15">
                  （資格なし）
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold tracking-tight text-gray-900">{name}</h3>
              <div className="ms-2 hidden items-center sm:flex">{OnlineBadge}</div>
            </div>

            <p className="mt-0.5 text-sm text-gray-700">{title}</p>

            {/* 住所：ピンアイコンあり */}
            <div className="mt-2 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5">
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

          <div className="ms-auto flex flex-col items-end gap-2 sm:hidden">{OnlineBadge}</div>
        </div>

        {/* タグ */}
        <div className="mt-2 pl-16 pr-2">
          <div className="flex flex-nowrap items-center gap-2 overflow-hidden">
            {shown.map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
            {hasMore && (
              <span className="shrink-0 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-500">
                …
              </span>
            )}
            <span className="min-w-0 flex-1 truncate" />
          </div>
        </div>

        {/* 星＋料金 */}
        <div className="mt-2 pl-16 pr-2 flex items-end justify-between">
          <RatingStars idSuffix={uid} value={safeRating} reviews={reviews} />
          {PricePill}
        </div>

        <div className="my-3 h-px bg-gray-100" />

        {/* CTA（左: プロフィール / 右: すぐ相談） */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/experts/${encodeURIComponent(String(id))}`}
            prefetch={false}
            onClick={(e) => e.stopPropagation()}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-gray-800 transition hover:bg-gray-50"
          >
            プロフィール
          </Link>
          <Link
            href="/wait"
            onClick={(e) => e.stopPropagation()}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-3 py-2 text-center text-white shadow-sm transition hover:brightness-105 active:brightness-95"
          >
            すぐ相談
          </Link>
        </div>
      </div>
    </div>
  );
}

