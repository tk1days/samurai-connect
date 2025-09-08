// src/app/session/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { EXPERTS } from "@/data/experts";

type Invite = {
  id: string;           // チャットID（/chat/[id]）
  expertId: string;     // 受けてもらいたい専門家
  clientName: string;   // 依頼者名
  topic: string;        // 相談テーマ
  createdAt: number;    // 発行時刻
  ttlSec: number;       // 有効期限（秒）
  unread: number;       // 未読数（モック）
  note?: string;        // 補足
};

const TTL_DEFAULT = 180;              // 3分
const BC_NAME = "sc-inbox";
const LS_KEY = "sc_inbox_new";        // /inbox 側が拾うキー

export default function SessionRoomPage() {
  const [expertId, setExpertId] = useState(EXPERTS[0]?.id ?? "1");
  const [clientName, setClientName] = useState("（あなたの名前）");
  const [topic, setTopic] = useState("今すぐ相談したい件があります");
  const [note, setNote] = useState("");
  const [ttl, setTtl] = useState(TTL_DEFAULT);

  // Hydration差分を避けるため、クライアントで判定してから表示する
  const [canBC, setCanBC] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      setCanBC(typeof window !== "undefined" && "BroadcastChannel" in window);
    } catch {
      setCanBC(false);
    }
  }, []);

  // 選択中の専門家
  const expert = useMemo(
    () => EXPERTS.find((e) => e.id === expertId),
    [expertId]
  );

  // 送信処理：/inbox へ「着信」通知し、即 /chat/[id] へ遷移（モック）
  const startLive = () => {
    const now = Date.now();
    const id = String(now); // 簡易ID

    const payload: Invite = {
      id,
      expertId,
      clientName: clientName.trim() || "匿名ユーザー",
      topic: topic.trim() || "相談があります",
      createdAt: now,
      ttlSec: Math.max(30, Math.min(600, Number(ttl) || TTL_DEFAULT)),
      unread: 1,
      note: note.trim() || undefined,
    };

    // 1) BroadcastChannel
    try {
      if (canBC) {
        const ch = new BroadcastChannel(BC_NAME);
        ch.postMessage({ type: "add", ...payload });
        ch.close();
      }
    } catch {
      // noop
    }

    // 2) localStorage（/inbox 初回オープン時用の保険）
    try {
      const prev = localStorage.getItem(LS_KEY);
      const arr: Invite[] = prev ? JSON.parse(prev) : [];
      arr.unshift(payload);
      localStorage.setItem(LS_KEY, JSON.stringify(arr));
    } catch {
      // noop
    }

    // 3) 依頼者側はすぐチャット画面へ（モック）
    window.location.href = `/chat/${encodeURIComponent(id)}`;
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">セッションルーム（モック）</h1>
      <p className="mt-1 text-gray-600">
        ここから「ライブ相談」を開始します。作成された招待は <code>/inbox</code> に届き、
        有効期限（既定3分）の間に専門家が受けると <code>/chat/[id]</code> に接続します。
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl border bg-white p-5 shadow-sm">
        {/* 専門家選択 */}
        <div>
          <label className="text-sm text-gray-700">相手（専門家）</label>
          <select
            value={expertId}
            onChange={(e) => setExpertId(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            {EXPERTS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}（{e.license ?? "資格なし"}）{e.online ? " / 待機中" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* 依頼者名 */}
        <div>
          <label className="text-sm text-gray-700">あなたの表示名</label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="例）株式会社〇〇 代表"
          />
        </div>

        {/* 相談テーマ */}
        <div>
          <label className="text-sm text-gray-700">相談テーマ（ひとことで）</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="例）決算前の節税チェック"
          />
        </div>

        {/* 補足 */}
        <div>
          <label className="text-sm text-gray-700">補足（任意）</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="簡単な背景や共有したい資料の概要など"
          />
        </div>

        {/* TTL */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">有効期限（秒）</label>
          <input
            type="number"
            min={30}
            max={600}
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
            className="w-28 rounded-lg border px-3 py-2"
          />
          <span className="text-sm text-gray-500">※ 推奨 180 秒（3分）</span>
        </div>

        {/* 送信 */}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={startLive}
            className="flex-1 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900"
          >
            ライブ相談を開始
          </button>
          <a
            href="/inbox"
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            受信箱（専門家側）を見る
          </a>
        </div>

        {/* 接続方式の状態（Hydration対策：クライアント判定が終わるまで表示を固定） */}
        <div className="text-xs text-gray-500">
          接続方式：BroadcastChannel{" "}
          {canBC === null ? "判定中…" : canBC ? "使用可" : "不可（localStorage 経由にフォールバック）"}
        </div>
      </div>
    </main>
  );
}