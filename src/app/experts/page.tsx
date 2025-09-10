// src/app/experts/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ExpertCard from "@/components/ExpertCard";
import { EXPERTS, type Expert } from "@/data/experts";

type SortKey =
  | "default"
  | "rating_desc"
  | "price_asc"
  | "price_desc"
  | "reviews_desc"
  | "online_first";

const SUGGESTS = [
  "税務", "労務", "法務", "契約書", "相続", "資金調達", "節税",
  "監査", "内部統制", "商標", "特許", "就業規則", "助成金",
  "給与計算", "年末調整", "ライフプラン", "資産運用", "保険",
  "葬儀", "終活", "ビザ", "会社設立", "中小企業",
];

// "30分/¥5,000" → 5000
function parsePriceToYen(p?: string) {
  if (!p) return Number.POSITIVE_INFINITY;
  const m = p.replaceAll(",", "").match(/¥?\s*(\d+)/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

export default function ExpertsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [sort, setSort] = useState<SortKey>("default");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // URL ?q= → 入力に同期
  useEffect(() => {
    const s = searchParams.get("q") ?? "";
    if (s !== q) setQ(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 入力 → URL ?q= に反映
  useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString());
    if (q) sp.set("q", q);
    else sp.delete("q");
    router.replace(`?${sp.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // 条件変更で1ページ目へ
  useEffect(() => setPage(1), [q, sort, pageSize]);

  // フィルタ & ソート
  const filtered: Expert[] = useMemo(() => {
    const k = q.trim().toLowerCase();

    const base = EXPERTS.filter((e) => {
      if (!k) return true;
      const hay = [
        e.name,
        e.title,
        e.license ?? "",
        ...(e.tags ?? []),
        e.location,           // ★所在地も検索対象
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(k);
    });

    const arr = [...base];
    switch (sort) {
      case "rating_desc":
        arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "price_asc":
        arr.sort((a, b) => parsePriceToYen(a.price) - parsePriceToYen(b.price));
        break;
      case "price_desc":
        arr.sort((a, b) => parsePriceToYen(b.price) - parsePriceToYen(a.price));
        break;
      case "reviews_desc":
        arr.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
        break;
      case "online_first":
        arr.sort((a, b) => Number(b.online) - Number(a.online));
        break;
      case "default":
      default:
        // オンライン優先 → 評価 → レビュー
        arr.sort(
          (a, b) =>
            Number(b.online) - Number(a.online) ||
            (b.rating ?? 0) - (a.rating ?? 0) ||
            (b.reviews ?? 0) - (a.reviews ?? 0)
        );
        break;
    }
    return arr;
  }, [q, sort]);

  // ページング
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const paged = filtered.slice(start, end);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">専門家を探す</h1>

      {/* 検索 & 並び替え */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border px-4 py-2"
            placeholder="キーワード（名前 / 資格 / タグ / 所在地）"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="shrink-0 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              aria-label="クリア"
            >
              クリア
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border px-3 py-2"
            aria-label="並び替え"
          >
            <option value="default">おすすめ（デフォルト）</option>
            <option value="rating_desc">評価が高い順</option>
            <option value="reviews_desc">レビュー数が多い順</option>
            <option value="price_asc">料金が安い順</option>
            <option value="price_desc">料金が高い順</option>
            <option value="online_first">オンライン優先</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-lg border px-3 py-2"
            aria-label="表示件数"
          >
            <option value={6}>6件/ページ</option>
            <option value={9}>9件/ページ</option>
            <option value={12}>12件/ページ</option>
            <option value={24}>24件/ページ</option>
          </select>
        </div>
      </div>

      {/* 候補チップ */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SUGGESTS.map((label) => (
          <button
            key={label}
            onClick={() => setQ(label)}
            className={`rounded-full px-3 py-1 text-sm border transition
              ${q === label
                ? "bg-black text-white border-black"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 件数とページ情報 */}
      <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
        <div>
          該当：<span className="font-medium text-gray-900">{total}</span> 件
        </div>
        <div>ページ：{safePage}/{totalPages}</div>
      </div>

      {/* 一覧 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paged.map((e) => (
          <ExpertCard key={e.id} {...e} />
        ))}
      </div>

      {/* ページャー */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            ← 前へ
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              const active = n === safePage;
              return (
                <button
                  key={`p-${n}`}
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-md text-sm ${
                    active ? "bg-black text-white" : "border hover:bg-gray-50"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            次へ →
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-gray-500">該当なし</p>
      )}
    </main>
  );
}

