"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { EXPERTS } from "@/data/experts";

/** 共有データ（既存ロジック参照のみ） */
type SharePayload = {
  expertId: string;
  expertName: string;
  createdAt: string;     // ISO
  hint: string | null;
  fileName: string | null;
  storagePath: string | null;
  signedUrl: string | null; // 180秒有効
};

function readLastShare(): SharePayload | null {
  try {
    const raw = localStorage.getItem("sc:lastShare");
    if (!raw) return null;
    return JSON.parse(raw) as SharePayload;
  } catch {
    return null;
  }
}

function prettyRemain(sec: number) {
  if (sec <= 0) return "期限切れ";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** 星（黄色） */
function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value ?? 0));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const box = { width: 14, height: 14 };
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span className="inline-flex items-center gap-0.5 text-yellow-400">
        {Array.from({ length: full }).map((_, i) => (
          <svg key={`f-${i}`} viewBox="0 0 20 20" style={box} aria-hidden>
            <path d="M10 1.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1L1.2 7.9l6.1-.9L10 1.5z" fill="#FACC15" />
          </svg>
        ))}
        {half && (
          <svg viewBox="0 0 20 20" style={box} aria-hidden>
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path d="M10 1.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1L1.2 7.9l6.1-.9L10 1.5z" fill="url(#half)" stroke="#FACC15" />
          </svg>
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <svg key={`e-${i}`} viewBox="0 0 20 20" style={box} aria-hidden>
            <path d="M10 1.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1L1.2 7.9l6.1-.9L10 1.5z" fill="none" stroke="#FACC15" strokeOpacity="0.25" />
          </svg>
        ))}
      </span>
      <span className="text-gray-900">{v.toFixed(1)}</span>
    </span>
  );
}

export default function WaitRoomPage() {
  const [share, setShare] = useState<SharePayload | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  // デモ用：相手未特定のとき、初回マウント時刻を起点に3分カウント
  const demoStartRef = useRef<number>(Date.now());

  useEffect(() => {
    setShare(readLastShare());
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 相手プロフィール（未特定時はデモデータ）
  let expert = useMemo(
    () => (share ? EXPERTS.find((e) => String(e.id) === String(share.expertId)) : undefined),
    [share]
  );
  if (!expert) {
    expert = {
      id: "demo",
      name: "渡邉 武",
      license: "税理士",
      title: "法人税・決算相談",
      tags: ["法人税", "節税", "中小企業"],
      price: "30分/¥5,000",
      online: true,
      rating: 4.8,
      reviews: 132,
      gender: "male",
      bio: "中小企業向けの法人税務を中心に活動。節税や資金繰り改善のアドバイスが得意です。",
      location: "東京都 千代田区",
    };
  }

  // 残り時間：shareがあればその作成時刻、なければ demoStartRef から3分
  const remainSec = useMemo(() => {
    const created = share
      ? new Date(share.createdAt).getTime()
      : demoStartRef.current;
    const expireAt = created + 180 * 1000;
    return Math.max(0, Math.floor((expireAt - now) / 1000));
  }, [share, now]);

  const expired = remainSec <= 0;

  // カウントダウンリング
  const ratio = Math.max(0, Math.min(1, remainSec / 180));
  const C = 120;
  const dash = C * ratio;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* ヘッダー */}
      <header className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`grid h-10 w-10 place-items-center rounded-full text-white font-bold
              ${expert.gender === "female" ? "bg-gradient-to-br from-pink-400 to-rose-500" : "bg-gradient-to-br from-sky-500 to-indigo-500"}`}
            >
              {expert.name[0]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-semibold">{expert.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-600/20">
                  呼び出し中…
                </span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-sm text-gray-600">{expert.title}</p>
            </div>
          </div>

          {/* カウントダウン */}
          <div className="relative h-12 w-12">
            <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
              <circle cx="24" cy="24" r="19" stroke="#e5e7eb" strokeWidth="6" fill="none" />
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke={expired ? "#ef4444" : "#6366f1"}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${dash} ${C}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-[11px] font-semibold text-indigo-700">
              {prettyRemain(remainSec)}
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
        {/* チャットエリア */}
        <section className="rounded-2xl border bg-white p-0 shadow-sm overflow-hidden">
          <div className="h-[460px] overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-4">
            <div className="mx-auto mb-3 w-fit rounded-full bg-gray-100 px-3 py-1 text-[12px] text-gray-600">
              {expired ? "招待の有効期限が切れました。" : "相手の入室を待っています…"}
            </div>

            {/* 自分 → 最初の一言 */}
            <div className="flex items-end gap-2">
              <div className="ml-auto max-w-[70%] rounded-2xl rounded-br-sm bg-indigo-600 px-3 py-2 text-sm text-white shadow-sm">
                よろしくお願いします。接続されたらご相談を始めたいです。
              </div>
            </div>

            {/* 相手プレースホルダー */}
            <div className="mt-3 flex items-end gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-200 text-xs text-white">…</div>
              <div className="max-w-[70%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-gray-700 shadow-sm ring-1 ring-gray-200">
                （接続されると相手のメッセージが表示されます）
              </div>
            </div>
          </div>

          {/* 入力欄（送信＝メッセージアイコン） */}
          <div className="flex items-center gap-2 border-t bg-white p-3">
            <input
              disabled
              className="w-full rounded-lg border px-3 py-2 text-sm text-gray-500 placeholder:text-gray-400 disabled:bg-gray-50"
              placeholder={expired ? "期限切れ：再度お試しください" : "接続後にメッセージを送信できます"}
            />
            <button
              disabled
              className="rounded-lg bg-gray-200 p-2 text-gray-600"
              title="接続後に送信できます"
              aria-label="送信"
            >
              {/* メッセージ（吹き出し）アイコン */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v7A3.5 3.5 0 0 1 16.5 16H10l-3.5 3.5A1 1 0 0 1 5 18.6V16A3.5 3.5 0 0 1 4 12.5v-7Z"/>
                <path d="M8 7.75h8a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1 0-1.5Zm0 3h5a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1 0-1.5Z" fill="#fff"/>
              </svg>
            </button>
          </div>
        </section>

        {/* プロフィールサイド（デモ含む） */}
        <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">プロフィール</h2>
          <div className="mt-3 flex items-start gap-3">
            <div
              className={`grid h-12 w-12 place-items-center rounded-full text-white font-bold shadow-sm
              ${expert.gender === "female" ? "bg-gradient-to-br from-pink-400 to-rose-500" : "bg-gradient-to-br from-sky-500 to-indigo-500"}`}
            >
              {expert.name[0]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-semibold">{expert.name}</div>
                {expert.online ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-600/15">
                    待機中
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-gray-300/60">
                    オフライン
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-gray-700">{expert.title}</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {expert.license ? (
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-700 ring-1 ring-indigo-600/15">
                {expert.license}
              </span>
            ) : (
              <span className="rounded-full bg-gray-50 px-2.5 py-0.5 text-gray-600 ring-1 ring-gray-400/20">
                （資格なし）
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
              {expert.location}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-gray-700">
              ★ {expert.rating.toFixed(1)}（{expert.reviews}）
            </span>
            {expert.price && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-gray-700">
                {expert.price}
              </span>
            )}
          </div>

          {expert.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {expert.tags.slice(0, 6).map((t, i) => (
                <span key={`${t}-${i}`} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] text-gray-700">
                  {t}
                </span>
              ))}
              {expert.tags.length > 6 && (
                <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[11px] text-gray-500">
                  +{expert.tags.length - 6}
                </span>
              )}
            </div>
          )}

          {expert.bio && (
            <p className="mt-3 text-sm leading-relaxed text-gray-800 line-clamp-5">{expert.bio}</p>
          )}

          <div className="mt-4 flex gap-2">
            <Link
              href={`/experts/${expert.id}`}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-sm hover:bg-gray-50"
            >
              全プロフィールを見る
            </Link>
          </div>
        </aside>
      </div>

      {/* フッタ操作（最小限） */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
        <div>{expired ? "招待が失効しました。" : "接続待機中です。"}</div>
        <div className="flex gap-2">
          <Link href="/experts" className="rounded-lg border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50">
            一覧に戻る
          </Link>
          <Link href={`/experts/${expert.id}`} className="rounded-lg border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50">
            プロフィール
          </Link>
        </div>
      </div>
    </main>
  );
}

