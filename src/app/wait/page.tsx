"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Suspense } from "react";

type ExpertInfo = {
  display_name: string;
  title: string;
  license: string;
  location: string;
  rating: number;
  review_count: number;
  price_label: string;
  gender: string;
};

function WaitRoom() {
  const searchParams = useSearchParams();
  const expertId = searchParams.get("expert");
  const [now, setNow] = useState(Date.now());
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [expert, setExpert] = useState<ExpertInfo | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [userName, setUserName] = useState("");
  const startRef = useRef(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!expertId) return;
    supabase
      .from("experts")
      .select("room_url, title, license, location, rating, review_count, price_label, gender, profiles(display_name)")
      .eq("id", expertId)
      .single()
      .then(({ data }) => {
        if (data?.room_url) setRoomUrl(data.room_url);
        if (data) {
          setExpert({
            display_name: (data.profiles as any)?.display_name ?? "専門家",
            title: data.title ?? "",
            license: data.license ?? "",
            location: data.location ?? "",
            rating: data.rating ?? 0,
            review_count: data.review_count ?? 0,
            price_label: data.price_label ?? "",
            gender: data.gender ?? "male",
          });
        }
      });
  }, [expertId]);

  const remainSec = Math.max(0, 180 - Math.floor((now - startRef.current) / 1000));
  const expired = remainSec === 0;
  const mm = String(Math.floor(remainSec / 60)).padStart(2, "0");
  const ss = String(remainSec % 60).padStart(2, "0");

  const avatarGrad = expert?.gender === "female"
    ? "from-pink-400 to-rose-500"
    : "from-sky-500 to-indigo-500";

  const startVideo = () => {
    if (roomUrl) {
      setShowNameModal(true);
    } else {
      alert("ビデオルームが設定されていません。専門家にお問い合わせください。");
    }
  };

  const joinRoom = () => {
    if (!userName.trim()) return;
    const url = roomUrl + "?t=" + encodeURIComponent(userName);
    window.open(url, "_blank");
    setShowNameModal(false);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-80 rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-semibold">お名前を入力してください</h2>
            <p className="mb-4 text-sm text-zinc-500">通話内での表示名になります</p>
            <input
              autoFocus
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") joinRoom(); }}
              placeholder="例：山田 太郎"
              className="w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 rounded-xl border py-2 text-sm text-zinc-600 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={joinRoom}
                disabled={!userName.trim()}
                className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                通話に参加する
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={"grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br " + avatarGrad + " font-bold text-white"}>
            {expert?.display_name?.[0] ?? "？"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{expert?.display_name ?? "読み込み中..."}</span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                {expired ? "期限切れ" : "呼び出し中…"}
              </span>
            </div>
            <p className="text-sm text-zinc-500">{expert?.title ?? ""}</p>
          </div>
        </div>
        <div className={"text-2xl font-bold tabular-nums " + (expired ? "text-red-500" : "text-indigo-600")}>
          {expired ? "00:00" : (mm + ":" + ss)}
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
            <p className="font-medium text-zinc-900">{expert?.display_name ?? "―"}</p>
            <p>{expert?.license ?? "―"}</p>
            <p>{expert?.title ?? "―"}</p>
            {expert?.location && <p>📍 {expert.location}</p>}
            {expert && <p>⭐ {expert.rating.toFixed(1)} ({expert.review_count}件)</p>}
            {expert?.price_label && <p className="font-medium text-indigo-600">{expert.price_label}</p>}
          </div>
          <Link
            href={"/experts/" + expertId}
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
