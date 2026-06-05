"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VideoPage() {
  const params = useParams<{ roomName: string }>();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<"loading" | "connected" | "ended">("loading");

  const roomUrl = `https://samurai-connect.daily.co/${params.roomName}`;

  useEffect(() => {
    const timer = setTimeout(() => setStatus("connected"), 2000);
    return () => clearTimeout(timer);
  }, []);

  const endCall = () => {
    setStatus("ended");
    setTimeout(() => router.push("/experts"), 2000);
  };

  if (status === "ended") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="text-4xl">✅</div>
        <h2 className="text-xl font-bold">相談が終了しました</h2>
        <p className="text-zinc-500">専門家一覧に戻ります…</p>
      </div>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-zinc-900">
      {/* ヘッダー */}
      <div className="flex items-center justify-between bg-zinc-800 px-4 py-2">
        <span className="text-sm font-medium text-white">Samurai Connect ビデオ相談</span>
        <div className="flex items-center gap-3">
          {status === "loading" && (
            <span className="text-sm text-zinc-400">接続中…</span>
          )}
          {status === "connected" && (
            <span className="flex items-center gap-1 text-sm text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              接続中
            </span>
          )}
          <button
            onClick={endCall}
            className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            通話を終了
          </button>
        </div>
      </div>

      {/* Daily.coのiframe */}
      <iframe
        ref={iframeRef}
        src={roomUrl}
        allow="camera; microphone; fullscreen; speaker; display-capture"
        className="flex-1 w-full border-0"
        title="ビデオ通話"
      />
    </main>
  );
}
