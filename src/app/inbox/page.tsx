// src/app/inbox/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EXPERTS } from "@/data/experts";

type Invite = {
  id: string;        // /chat/[id]
  expertId: string;  // 宛先の専門家
  clientName: string;
  topic: string;
  createdAt: number; // ms
  ttlSec: number;    // 秒
  unread: number;
  note?: string;
};

const BC_NAME = "sc-inbox";
const LS_KEY = "sc_inbox_new";

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

function secondsLeft(inv: Invite) {
  const end = Math.floor(inv.createdAt / 1000) + inv.ttlSec;
  return end - nowSec();
}

export default function InboxPage() {
  const [items, setItems] = useState<Invite[]>([]);
  const tickRef = useRef<number | null>(null);

  // 初回：localStorageの保険分を読み込み
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const arr: Invite[] = JSON.parse(raw);
        // 期限切れを除外し、重複排除
        setItems((prev) => {
          const merged = [...arr, ...prev].reduce<Invite[]>((acc, cur) => {
            if (secondsLeft(cur) <= 0) return acc;
            if (acc.find((x) => x.id === cur.id)) return acc;
            return acc.concat(cur);
          }, []);
          return merged;
        });
        localStorage.removeItem(LS_KEY);
      }
    } catch {
      /* noop */
    }
  }, []);

  // BroadcastChannel で受信
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const ch = new BroadcastChannel(BC_NAME);
    const handler = (ev: MessageEvent) => {
      const msg = ev.data;
      if (msg?.type === "add") {
        const inv: Invite = {
          id: msg.id,
          expertId: msg.expertId,
          clientName: msg.clientName,
          topic: msg.topic,
          createdAt: msg.createdAt,
          ttlSec: msg.ttlSec,
          unread: msg.unread,
          note: msg.note,
        };
        setItems((prev) => {
          if (prev.find((x) => x.id === inv.id)) return prev;
          return [inv, ...prev];
        });
      }
    };
    ch.addEventListener("message", handler);
    return () => {
      ch.removeEventListener("message", handler);
      ch.close();
    };
  }, []);

  // 1秒ごとにTTLチェックして期限切れを掃除
  useEffect(() => {
    tickRef.current = window.setInterval(() => {
      setItems((prev) => prev.filter((it) => secondsLeft(it) > 0));
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  // 表示用に残秒をつける
  const view = useMemo(() => {
    return items
      .map((it) => ({ it, left: secondsLeft(it) }))
      .filter(({ left }) => left > 0)
      .sort((a, b) => b.it.createdAt - a.it.createdAt);
  }, [items]);

  const accept = (id: string) => {
    const hit = items.find((x) => x.id === id);
    if (!hit) return;
    // 受諾したらチャットへ移動（モック）
    window.location.href = `/chat/${encodeURIComponent(id)}`;
  };

  const decline = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">受信箱（専門家側・モック）</h1>
      <p className="mt-1 text-gray-600">
        セッションルームから届いた「ライブ相談」の着信一覧です。期限内に受けるとチャットに接続します。
      </p>

      <div className="mt-6 grid gap-4">
        {view.length === 0 && (
          <div className="rounded-2xl border bg-white p-6 text-gray-600">
            いま着信はありません。<br />
            テストするには <code>/session</code> から「ライブ相談を開始」を押してください。
          </div>
        )}

        {view.map(({ it, left }) => {
          const expert = EXPERTS.find((e) => e.id === it.expertId);
          return (
            <div
              key={it.id}
              className="rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-black/[0.03]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">チャットID: {it.id}</div>
                  <h2 className="text-lg font-semibold">
                    {it.clientName} さんからの相談
                  </h2>
                  <p className="text-gray-700">テーマ：{it.topic}</p>
                  {it.note && (
                    <p className="mt-1 text-sm text-gray-600">補足：{it.note}</p>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    宛先：{expert ? `${expert.name}（${expert.license ?? "資格なし"}）` : it.expertId}
                  </div>
                  <div className={`mt-1 text-sm font-medium ${left <= 10 ? "text-red-600" : "text-gray-700"}`}>
                    残り {left} 秒
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => accept(it.id)}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 px-4 py-2 text-white hover:brightness-105"
                >
                  受ける（チャットへ）
                </button>
                <button
                  onClick={() => decline(it.id)}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                >
                  辞退
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}