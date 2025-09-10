// src/app/mypage/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EXPERTS, type Expert } from "@/data/experts";

/** ====== LocalStorage Keys ====== */
const LS_FAVS = "sc_favorites_v1";      // お気に入り: string[]（expertId）
const LS_CONNECTS = "sc_connects_v1";    // コネクト履歴: Connect[]
const LS_PAYMENTS = "sc_payments_v1";    // 決済履歴: Payment[]

/** ====== Types（モック） ====== */
type Connect = {
  id: string;          // 例: chatId
  expertId: string;
  topic: string;
  startedAt: string;   // ISO
  minutes: number;     // 通話分
  note?: string;
};

type Payment = {
  id: string;          // 決済ID
  expertId: string;
  amountYen: number;
  when: string;        // ISO
  summary: string;     // 例: 「30分相談」
  status: "paid" | "refunded" | "pending";
};

/** ====== Utilities ====== */
const fmt = (iso: string) =>
  new Date(iso).toLocaleString("ja-JP", { hour12: false });

function StatusPill({ s }: { s: Payment["status"] }) {
  const cls =
    s === "paid"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : s === "refunded"
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : "bg-gray-50 text-gray-700 ring-1 ring-gray-300";
  const label = s === "paid" ? "支払い済み" : s === "refunded" ? "返金" : "保留";
  return <span className={`rounded-md px-2 py-0.5 text-xs ${cls}`}>{label}</span>;
}

/** ====== Page ====== */
export default function UserMyPage() {
  // --- お気に入り ---
  const [favIds, setFavIds] = useState<string[]>([]);
  // --- コネクト履歴 ---
  const [connects, setConnects] = useState<Connect[]>([]);
  // --- 決済履歴 ---
  const [payments, setPayments] = useState<Payment[]>([]);

  // 初回ロード（なければ軽いモックを自動生成）
  useEffect(() => {
    try {
      const f = JSON.parse(localStorage.getItem(LS_FAVS) || "[]");
      setFavIds(Array.isArray(f) ? f : []);
    } catch {}
    try {
      const c = JSON.parse(localStorage.getItem(LS_CONNECTS) || "null");
      if (Array.isArray(c)) setConnects(c);
      else {
        setConnects([
          {
            id: "C-1001",
            expertId: "1",
            topic: "決算前の節税チェック",
            startedAt: new Date(Date.now() - 86400_000).toISOString(),
            minutes: 28,
          },
          {
            id: "C-1002",
            expertId: "3",
            topic: "相続登記の流れ確認",
            startedAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
            minutes: 15,
            note: "必要書類の整理を依頼",
          },
        ]);
      }
    } catch {}
    try {
      const p = JSON.parse(localStorage.getItem(LS_PAYMENTS) || "null");
      if (Array.isArray(p)) setPayments(p);
      else {
        setPayments([
          {
            id: "P-24001",
            expertId: "1",
            amountYen: 5000,
            when: new Date(Date.now() - 86000_000).toISOString(),
            summary: "30分相談",
            status: "paid",
          },
          {
            id: "P-24002",
            expertId: "3",
            amountYen: 3000,
            when: new Date(Date.now() - 3 * 86400_000).toISOString(),
            summary: "20分相談",
            status: "paid",
          },
        ]);
      }
    } catch {}
  }, []);

  // 保存
  useEffect(() => {
    try { localStorage.setItem(LS_FAVS, JSON.stringify(favIds)); } catch {}
  }, [favIds]);
  useEffect(() => {
    try { localStorage.setItem(LS_CONNECTS, JSON.stringify(connects)); } catch {}
  }, [connects]);
  useEffect(() => {
    try { localStorage.setItem(LS_PAYMENTS, JSON.stringify(payments)); } catch {}
  }, [payments]);

  // 表示用に展開（型安全）
  const favExperts: Expert[] = useMemo(
    () =>
      favIds
        .map((id) => EXPERTS.find((e) => e.id === id))
        .filter((e): e is Expert => Boolean(e)),
    [favIds]
  );

  const removeFav = (id: string) =>
    setFavIds((prev) => prev.filter((x) => x !== id));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold">マイページ</h1>
        <p className="mt-1 text-sm text-gray-600">
          「お気に入り」「コネクト履歴」「決済履歴」を確認・管理します。
        </p>
      </header>

      {/* お気に入り */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">お気に入り</h2>
          <Link href="/experts" className="text-sm underline">
            専門家を探す
          </Link>
        </div>

        {favExperts.length === 0 ? (
          <p className="text-sm text-gray-500">
            お気に入りはまだありません。専門家一覧から追加してください。
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favExperts.map((e) => (
              <li
                key={e.id}
                className="rounded-xl border border-gray-200 bg-white p-4 ring-1 ring-black/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">
                      {e.license ?? "（資格なし）"}
                    </div>
                    <Link
                      href={`/experts/${e.id}`}
                      className="block truncate text-base font-semibold hover:underline"
                    >
                      {e.name}
                    </Link>
                    <div className="truncate text-sm text-gray-700">{e.title}</div>
                    <div className="mt-1 text-xs text-gray-600">
                      所在地：{e.location}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFav(e.id)}
                    className="shrink-0 rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* コネクト履歴 */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">コネクト履歴</h2>
          <button
            onClick={() => setConnects([])}
            className="text-xs text-gray-600 underline"
            title="モックを消去"
            type="button"
          >
            すべてクリア
          </button>
        </div>

        {connects.length === 0 ? (
          <p className="text-sm text-gray-500">まだ履歴がありません。</p>
        ) : (
          <ul className="divide-y">
            {connects.map((c) => {
              const ex = EXPERTS.find((e) => e.id === c.expertId);
              return (
                <li key={c.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500">
                        {fmt(c.startedAt)} ／ {c.minutes}分
                      </div>
                      <div className="truncate text-sm">
                        相手：
                        {ex ? (
                          <Link
                            href={`/experts/${ex.id}`}
                            className="underline"
                          >
                            {ex.name}
                          </Link>
                        ) : (
                          "（不明）"
                        )}
                      </div>
                      <div className="truncate text-gray-800">
                        {c.topic}
                        {c.note ? `（${c.note}）` : ""}
                      </div>
                    </div>
                    <a
                      href={`/chat/${encodeURIComponent(c.id)}`}
                      className="shrink-0 rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
                    >
                      チャットを開く
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 決済履歴 */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">決済履歴</h2>
          <button
            onClick={() => setPayments([])}
            className="text-xs text-gray-600 underline"
            title="モックを消去"
            type="button"
          >
            すべてクリア
          </button>
        </div>

        {payments.length === 0 ? (
          <p className="text-sm text-gray-500">まだ決済履歴がありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2 pr-4">日時</th>
                  <th className="py-2 pr-4">相手</th>
                  <th className="py-2 pr-4">内容</th>
                  <th className="py-2 pr-4">金額</th>
                  <th className="py-2">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const ex = EXPERTS.find((e) => e.id === p.expertId);
                  return (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {fmt(p.when)}
                      </td>
                      <td className="py-2 pr-4">
                        {ex ? (
                          <Link
                            href={`/experts/${ex.id}`}
                            className="underline"
                          >
                            {ex.name}
                          </Link>
                        ) : (
                          "（不明）"
                        )}
                      </td>
                      <td className="py-2 pr-4">{p.summary}</td>
                      <td className="py-2 pr-4 tabular-nums">
                        ¥{p.amountYen.toLocaleString()}
                      </td>
                      <td className="py-2">
                        <StatusPill s={p.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}