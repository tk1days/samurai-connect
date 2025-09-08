// src/app/wait/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

export default function WaitRoomPage() {
  const [share, setShare] = useState<SharePayload | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  // 初期読込
  useEffect(() => {
    setShare(readLastShare());
  }, []);

  // 1秒ごと残り時間更新
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainSec = useMemo(() => {
    if (!share) return 0;
    const created = new Date(share.createdAt).getTime();
    const expireAt = created + 180 * 1000; // 3分
    return Math.max(0, Math.floor((expireAt - now) / 1000));
  }, [share, now]);

  const expired = remainSec <= 0;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">待機ルーム</h1>
      <p className="mt-1 text-gray-600">
        ここでは、直前に共有されたメモ/資料を表示します（共有リンクは <b>3分</b> で失効）。
      </p>

      <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">直前の共有</h2>
          <button
            onClick={() => setShare(readLastShare())}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            再読込
          </button>
        </div>

        {!share ? (
          <p className="mt-4 text-gray-500">共有データが見つかりません。プロフィール詳細から「共有リンクを作成」をお試しください。</p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-700">
              対象：<b>{share.expertName}</b>（ID: {share.expertId}）
            </div>

            {share.hint && (
              <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-800">
                <div className="mb-1 font-medium text-gray-700">メモ</div>
                <p className="whitespace-pre-wrap">{share.hint}</p>
              </div>
            )}

            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  添付：{share.fileName ? <b>{share.fileName}</b> : <span className="text-gray-500">なし</span>}
                </div>
                <div className={`text-sm ${expired ? "text-red-600" : "text-gray-600"}`}>
                  残り：{prettyRemain(remainSec)}
                </div>
              </div>

              {share.signedUrl ? (
                expired ? (
                  <p className="mt-2 text-sm text-red-600">リンクの有効期限が切れました。プロフィール詳細で再度「共有リンクを作成」してください。</p>
                ) : (
                  <a
                    href={share.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
                  >
                    ファイルを開く
                  </a>
                )
              ) : (
                <p className="mt-2 text-sm text-gray-500">ファイルは添付されていません（メモのみ）。</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Link
                href={`/experts/${share.expertId}`}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                プロフィールへ戻る
              </Link>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem("sc:lastShare");
                  } catch {}
                  setShare(null);
                }}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                共有データをクリア
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        ※ 本ページはモックです。将来は「専門家が入室したら自動で受信」「複数ファイル」「チャット・通話開始」などに拡張します。
      </div>
    </main>
  );
}