"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_EXPERTS } from "@/lib/mock";
import { supabase } from "@/lib/supabase";
import { Suspense } from "react";

function WaitRoom() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const expertId = searchParams.get("expert");
  const [now, setNow] = useState(Date.now());
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Supabaseからroom_urlを取得
  useEffect(() => {
    if (!expertId) return;
    supabase
      .from("experts")
      .select("room_url")
      .eq("id", expertId)
      .single()
      .then(({ data }) => {
        if (data?.room_url) setRoomUrl(data.room_url);
      });
  }, [expertId]);

  const expert = useMemo(
    () => expertId ? MOCK_EXPERTS.find((e) => e.id === expertId) : MOCK_EXPERTS[0],
    [expertId]
  );

  const remainSec = Math.max(0, 180 - Math.floor((now - startRef.current) / 1000));
  const expired = remainSec === 0;
  const mm = String(Math.floor(remainSec / 60)).padStart(2, "0");
  const ss = String(remainSec % 60).padStart(2, "0");

  const avatarGrad = expert?.gender === "female"
    ? "from-pink-400 to-rose-500"
    : "from-sky-500 to-indigo-500";

  const startVideo = () => {
    if (roomUrl) {
      window.open(roomUrl, "_blank");
    } else {
      alert("ビデオルームが設定されていません。専門家にお問い合わせください。");
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${avatarGrad} font-bold text-white`}>
            {expert?.display_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{expert?.display_name}</span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                {expired ? "期限切れ" : "呼び出し中…"}
              </span>
            </div>
            <p className="text-sm text-zinc-500">{expert?.title}</p>
          </div>
        </div>
        <div className={`text-2xl font-bold tabular-nums ${expired ? "text-red-500" : "text-indigo-600"}`}>
          {expired ? "00:00" : `${mm}:${ss}`}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex h-80 flex-col items-center justify-center gap-6 bg-gradient-to-b from-indigo-50 to-white p-8 text-center">
            {expired ? (
              <>
                <div className="text-4xl">⏰</div>
                <p className="text-zinc-500">招待の有効期限が切れました</p>
                <Link href="/experts" className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  専門家一覧に戻る
                </Link>
              </>
            ) : (
              <>
                <div className="h-16 w-16 animate-pulse rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                  📹
                </div>
                <div>
                  <p className="font-semibold text-zinc-900">ビデオ通話の準備ができています</p>
                  <p className="mt-1 text-sm text-zinc-500">ボタンを押すと新しいタブでビデオ通話が始まります</p>
                </div>
                <button
                  onClick={startVideo}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-8 py-3 font-medium text-white shadow-sm hover:brightness-105"
                >
                  ビデオ通話を開始する
                </button>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="font-semibold">相手の専門家</h3>
          <div className="mt-3 space-y-2 text-sm text-zinc-600">
            <p className="font-medium text-zinc-900">{expert?.display_name}</p>
            <p>{expert?.license}</p>
            <p>{expert?.title}</p>
            <p>📍 {expert?.location}</p>
            <p>⭐ {expert?.rating.toFixed(1)} ({expert?.review_count}件)</p>
            <p className="font-medium text-indigo-600">{expert?.price_label}</p>
          </div>
          <Link
            href={`/experts/${expert?.id}`}
            className="mt-4 block w-full rounded-xl border py-2 text-center text-sm hover:bg-gray-50"
          >
            プロフィールを見る
          </Link>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Link href="/experts" className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-gray-50">
          一覧に戻る
        </Link>
      </div>
    </main>
  );
}

export default function WaitPage() {
  return <Suspense><WaitRoom /></Suspense>;
}
