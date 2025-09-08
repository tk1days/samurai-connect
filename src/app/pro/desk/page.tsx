"use client";

import { useEffect, useMemo, useState } from "react";

type Invite = {
  id: string;
  expertId: string;
  clientName: string;
  topic: string;
  note?: string;
  createdAt: number;
  ttlSec: number;
  unread: number;
};

const BC_NAME = "sc-inbox";
const LS_KEY  = "sc_inbox_new";

function isExpired(inv: Invite) {
  return Date.now() > inv.createdAt + inv.ttlSec * 1000;
}

export default function ProDeskPage() {
  const [items, setItems] = useState<Invite[]>([]);
  const canBC = typeof window !== "undefined" && "BroadcastChannel" in window;

  // 受信：BroadcastChannel
  useEffect(() => {
    if (!canBC) return;
    const ch = new BroadcastChannel(BC_NAME);
    ch.onmessage = (ev) => {
      const msg = ev.data || {};
      if (msg.type === "add") {
        const inv: Invite = {
          id: String(msg.id),
          expertId: String(msg.expertId),
          clientName: String(msg.clientName),
          topic: String(msg.topic),
          note: msg.note ? String(msg.note) : undefined,
          createdAt: Number(msg.createdAt),
          ttlSec: Number(msg.ttlSec),
          unread: Number(msg.unread) || 1,
        };
        setItems((prev) => [inv, ...prev]);
      }
    };
    return () => ch.close();
  }, [canBC]);

  // 初回：localStorage 取り込み（フォールバック）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const arr: Invite[] = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          setItems((prev) => [...arr, ...prev]);
        }
        localStorage.removeItem(LS_KEY);
      }
    } catch {}
  }, []);

  // 期限切れクリーンアップ
  useEffect(() => {
    const t = setInterval(() => {
      setItems((prev) => prev.filter((i) => !isExpired(i)));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const grouped = useMemo(() => {
    const active = items.filter((i) => !isExpired(i));
    const expired = items.filter(isExpired);
    return { active, expired };
  }, [items]);

  const accept = (id: string) => {
    window.location.href = `/chat/${encodeURIComponent(id)}`;
  };
  const decline = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">プロ用デスク（受信箱）</h1>
      <p className="mt-1 text-gray-600">
        ここにライブ相談の招待が届きます。受けるとチャットへ遷移します。
      </p>

      {/* 有効招待 */}
      <section className="mt-6">
        <h2 className="mb-2 text-lg font-semibold">有効な招待</h2>

        {grouped.active.length === 0 ? (
          <div className="rounded-xl border bg-white/80 p-6 text-gray-500">
            いま有効な招待はありません。
          </div>
        ) : (
          <ul className="grid gap-3">
            {grouped.active.map((i) => {
              const remainMs = i.createdAt + i.ttlSec * 1000 - Date.now();
              const remain = Math.max(0, Math.ceil(remainMs / 1000));

              return (
                <li
                  key={i.id}
                  className="rounded-xl border bg-white p-4 shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        <span className="font-medium truncate">
                          {i.clientName}
                        </span>
                        <span className="text-xs text-gray-500">
                          期限 {remain}s
                        </span>
                      </div>
                      <div className="mt-1 truncate text-sm text-gray-700">
                        {i.topic}
                        {i.note ? (
                          <span className="text-gray-500">（{i.note}）</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => accept(i.id)}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                      >
                        受ける（チャットへ）
                      </button>
                      <button
                        onClick={() => decline(i.id)}
                        className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        辞退
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 期限切れログ（任意） */}
      {grouped.expired.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-gray-700">期限切れ</h2>
          <ul className="grid gap-2">
            {grouped.expired.map((i) => (
              <li key={i.id} className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-500">
                {i.clientName} / {i.topic}（期限切れ）
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}