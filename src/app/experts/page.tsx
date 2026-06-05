"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ExpertCard from "@/components/ExpertCard";
import { MOCK_CATEGORIES } from "@/lib/mock";
import { supabase } from "@/lib/supabase";
import type { Expert } from "@/types";

export default function ExpertsPage() {
  const searchParams = useSearchParams();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sort, setSort] = useState<"default" | "rating" | "reviews">("default");

  useEffect(() => {
    const fetchExperts = async () => {
      const { data, error } = await supabase
        .from("experts")
        .select(`
          id,
          license,
          title,
          bio,
          location,
          price_label,
          gender,
          is_online,
          is_approved,
          is_priority,
          rating,
          review_count,
          profiles!inner(display_name, avatar_url),
          expert_categories(category_id, categories(name, slug))
        `)
        .eq("is_approved", true);

      if (error) { console.error(error); setLoading(false); return; }

      const mapped: Expert[] = (data ?? []).map((e: any) => ({
        id: e.id,
        display_name: e.profiles?.display_name ?? "専門家",
        avatar_url: e.profiles?.avatar_url,
        license: e.license,
        title: e.title,
        bio: e.bio,
        location: e.location,
        price_label: e.price_label,
        gender: e.gender,
        is_online: e.is_online,
        is_approved: e.is_approved,
        is_priority: e.is_priority,
        rating: e.rating,
        review_count: e.review_count,
        categories: e.expert_categories?.map((ec: any) => ec.categories?.slug).filter(Boolean) ?? [],
      }));

      setExperts(mapped);
      setLoading(false);
    };

    fetchExperts();

    // リアルタイムでオンライン状態を監視
    const channel = supabase
      .channel("experts-online")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "experts" }, () => {
        fetchExperts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    let list = experts.filter((e) => {
      if (onlineOnly && !e.is_online) return false;
      if (category && !e.categories?.includes(category)) return false;
      if (q) {
        const hay = [e.display_name, e.license ?? "", e.title].join(" ").toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (a.is_priority !== b.is_priority) return Number(b.is_priority) - Number(a.is_priority);
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "reviews") return b.review_count - a.review_count;
      return Number(b.is_online) - Number(a.is_online) || b.rating - a.rating;
    });

    return list;
  }, [experts, q, category, onlineOnly, sort]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">専門家を探す</h1>

      <section className="mb-6">
        <p className="mb-2 text-sm font-medium text-zinc-600">悩みのカテゴリから探す</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("")}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              !category ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-200 bg-white text-zinc-700 hover:bg-gray-50"
            }`}
          >
            すべて
          </button>
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                category === cat.slug
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-200 bg-white text-zinc-700 hover:bg-gray-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="名前・資格・キーワード"
          className="flex-1 rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm">
          <button
            type="button"
            onClick={() => setOnlineOnly((v) => !v)}
            className={`relative h-5 w-9 rounded-full transition ${onlineOnly ? "bg-emerald-500" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${onlineOnly ? "left-[18px]" : "left-0.5"}`} />
          </button>
          今すぐ相談できる
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-xl border bg-white px-3 py-2 text-sm"
        >
          <option value="default">おすすめ順</option>
          <option value="rating">評価が高い順</option>
          <option value="reviews">レビュー数順</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : filtered.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-zinc-500">{filtered.length}人の専門家が見つかりました</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <ExpertCard key={e.id} expert={e} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed bg-gray-50 py-16 text-center text-zinc-400">
          条件に合う専門家が見つかりませんでした
        </div>
      )}
    </main>
  );
}
