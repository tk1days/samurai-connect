// src/app/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ExpertCard from "@/components/ExpertCard";
import { EXPERTS } from "@/data/experts";

const QUICK = ["税務", "労務", "法務", "契約書", "相続", "資金調達", "ライフプラン", "葬儀"];

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");

  // ホームではオンライン優先→評価順で上位6名だけ表示
  const featured = useMemo(() => {
    return [...EXPERTS]
      .sort((a, b) => Number(b.online) - Number(a.online) || (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 6);
  }, []);

  const goSearch = (value: string) => {
    const k = value.trim();
    router.push(k ? `/experts?q=${encodeURIComponent(k)}` : "/experts");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* ヒーロー（タイトルは削除して重複回避） */}
      <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-gray-600">
          今すぐ、専門家とつながる。リアルタイム相談にも対応。
        </p>

        {/* 検索行（ボタン2つを横一列・同じ高さ・改行禁止） */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goSearch(q);
          }}
          className="mt-4 flex flex-nowrap gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
            placeholder="キーワードで検索（例：税務、契約書、保険…）"
          />

          <div className="flex flex-shrink-0 gap-2">
            <button
              type="submit"
              className="h-10 rounded-lg bg-blue-600 px-4 text-white hover:bg-blue-700"
            >
              検索
            </button>

            <a
              href="/experts"
              className="h-10 rounded-lg border px-4 text-center leading-10 hover:bg-gray-50 whitespace-nowrap"
              aria-label="専門家一覧へ"
            >
              一覧へ
            </a>
          </div>
        </form>

        {/* クイックカテゴリ → /experts?q=... へ */}
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK.map((t) => (
            <button
              key={t}
              onClick={() => goSearch(t)}
              className="rounded-full border bg-gray-50 px-3 py-1 text-sm hover:bg-gray-100"
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* 注目の専門家 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">注目の専門家</h2>
          <a href="/experts" className="text-sm underline">
            すべて見る
          </a>
        </div>

        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((e) => (
            <div key={e.id} className="h-full">
              <ExpertCard {...e} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}