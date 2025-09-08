// src/app/chat/[id]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { use } from "react";
import Link from "next/link";

// params（Next.js 15のPromise/非Promise両対応）
type P = { params: { id: string } } | { params: Promise<{ id: string }> };
function getId(params: any): string {
  const obj = typeof params?.then === "function" ? use(params) : params;
  return decodeURIComponent(String(obj?.id ?? ""));
}

// メッセージ型
type Msg = {
  id: string;        // 一意ID
  role: "client" | "expert";
  text: string;
  at: number;        // epoch ms
};

// ローカル保存キー
const lsKey = (roomId: string) => `sc_chat_${roomId}`;
// ブロードキャストチャンネル名
const bcName = (roomId: string) => `sc-chat-${roomId}`;

export default function ChatPage(p: P) {
  const roomId = getId((p as any).params);
  const [role, setRole] = useState<"client" | "expert">("client"); // 片方を「専門家」に切替えると2役で試せる
  const [list, setList] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(true);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 初期ロード：localStorageから読み込み
  useEffect(() => {
    try {
      const raw = localStorage.getItem(lsKey(roomId));
      if (raw) setList(JSON.parse(raw));
    } catch {}
  }, [roomId]);

  // 保存＆オートスクロール
  useEffect(() => {
    try {
      localStorage.setItem(lsKey(roomId), JSON.stringify(list));
    } catch {}
    // 一番下へ
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
    });
  }, [list]);

  // BroadcastChannel購読
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const ch = new BroadcastChannel(bcName(roomId));
    bcRef.current = ch;
    ch.onmessage = (ev) => {
      const data = ev.data;
      if (data?.type === "msg") {
        setList((prev) => (prev.some((m) => m.id === data.msg.id) ? prev : [...prev, data.msg]));
      } else if (data?.type === "status") {
        setConnected(Boolean(data.connected));
      }
    };
    // 自分が接続中であることを通知
    ch.postMessage({ type: "status", connected: true });

    return () => {
      ch.postMessage({ type: "status", connected: false });
      ch.close();
    };
  }, [roomId]);

  // 送信
  const send = () => {
    const t = text.trim();
    if (!t) return;
    const msg: Msg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      text: t,
      at: Date.now(),
    };
    setList((prev) => [...prev, msg]);
    setText("");
    try {
      bcRef.current?.postMessage({ type: "msg", msg });
    } catch {}
  };

  const title = useMemo(() => `チャット #${roomId.slice(-6)}`, [roomId]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      {/* 上部バー */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/experts" className="text-sm underline">専門家を探す</Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-lg font-bold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "client" | "expert")}
            className="rounded-md border px-2 py-1 text-sm"
            title="このタブの役割"
          >
            <option value="client">依頼者として参加</option>
            <option value="expert">専門家として参加</option>
          </select>
          <span className={`rounded-full px-2 py-0.5 text-xs ${connected ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" : "bg-gray-50 text-gray-600 ring-1 ring-gray-400/20"}`}>
            {connected ? "相手 接続中" : "相手 未接続"}
          </span>
        </div>
      </div>

      {/* チャットウィンドウ */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div
          ref={scrollRef}
          className="h-[60vh] overflow-y-auto p-4 space-y-3"
        >
          {list.map((m) => {
            const mine = m.role === role;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow
                    ${mine ? "bg-black text-white" : "bg-gray-100 text-gray-900"}`}
                  title={new Date(m.at).toLocaleString()}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="grid h-full place-items-center text-gray-500">
              ここにメッセージが表示されます（2つのタブで同じURLを開いて試してください）
            </div>
          )}
        </div>

        {/* 入力欄 */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="border-t p-3 flex items-center gap-2"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="メッセージを入力…"
            className="flex-1 rounded-lg border px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900"
          >
            送信
          </button>
        </form>
      </div>

      {/* 補助リンク（デモ遷移） */}
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
        <Link href="/session" className="underline">セッション作成</Link>
        <span>・</span>
        <Link href="/inbox" className="underline">受信箱</Link>
      </div>
    </main>
  );
}