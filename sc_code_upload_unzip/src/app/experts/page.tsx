// /src/app/experts/page.tsx
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
  "税務","労務","法務","契約書","相続","資金調達","節税",
  "監査","内部統制","商標","特許","就業規則","助成金",
  "給与計算","年末調整","ライフプラン","資産運用","保険",
  "葬儀","終活","ビザ","会社設立","中小企業",
];

// "30分/¥5,000" → 5000
function parsePriceToYen(p?: string) {
  if (!p) return Number.POSITIVE_INFINITY;
  const m = p.replaceAll(",", "").match(/¥?\s*(\d+)/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

// 重複なし配列（順序保持）
const uniqKeep = <T,>(arr: T[]) => {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const x of arr) if (!seen.has(x)) { seen.add(x); out.push(x); }
  return out;
};

// location "東京都 千代田区" を [pref, city] に分解
function splitLocation(loc: string): [string, string] {
  const parts = loc.trim().split(/\s+/);
  return [parts[0] ?? "", parts[1] ?? ""];
}

// 日本の都道府県（北→南）
const PREF_ORDER = [
  "北海道",
  "青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県",
  "沖縄県",
];

// 色トークン（選択トーンを統一）
const CHIP_SELECTED = "bg-black text-white border-black";
const CHIP_UNSELECTED = "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200";

// データから候補
const ALL_TAGS = uniqKeep(EXPERTS.flatMap((e) => e.tags)).sort((a,b)=>a.localeCompare(b,"ja"));

// データに存在する都道府県のみ（北→南）
const PREFS = PREF_ORDER.filter((p) => EXPERTS.some((e) => splitLocation(e.location)[0] === p));

// 都道府県ごとの市区
const CITIES_BY_PREF: Record<string, string[]> = PREFS.reduce((acc, pref) => {
  const cities = uniqKeep(
    EXPERTS
      .filter((e) => splitLocation(e.location)[0] === pref)
      .map((e) => splitLocation(e.location)[1])
      .filter(Boolean)
  ).sort((a,b)=>a.localeCompare(b,"ja"));
  acc[pref] = cities;
  return acc;
}, {} as Record<string, string[]>);

// 文字列q → トークン配列
const toTokens = (q: string) => q.trim().split(/\s+/).filter(Boolean);
// トークン配列 → 文字列q
const fromTokens = (tokens: string[]) => tokens.join(" ");

export default function ExpertsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ===== 検索語（内部はトークン配列で管理） =====
  const [qInput, setQInput] = useState(() => searchParams.get("q") ?? "");
  const [qTokens, setQTokens] = useState<string[]>(() => toTokens(searchParams.get("q") ?? ""));

  // ===== ファセット =====
  const [onlineOnly, setOnlineOnly] = useState(() => searchParams.get("online") === "1");
  const [pref, setPref] = useState(() => searchParams.get("pref") ?? "");
  const [city, setCity] = useState(() => searchParams.get("city") ?? "");
  const [selTags, setSelTags] = useState<string[]>(() => {
    const raw = searchParams.get("tags") ?? "";
    return raw ? raw.split(",").filter(Boolean) : [];
  });

  // ===== 既存：並び替え・ページング =====
  const [sort, setSort] = useState<SortKey>("default");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // URL → state 同期（後方互換：area→pref/city）
  useEffect(() => {
    // q
    const q = searchParams.get("q") ?? "";
    if (q !== qInput) setQInput(q);
    const tokens = toTokens(q);
    if (tokens.join(" ") !== qTokens.join(" ")) setQTokens(tokens);

    // online
    const on = searchParams.get("online") === "1";
    if (on !== onlineOnly) setOnlineOnly(on);

    // pref/city
    const legacyArea = searchParams.get("area");
    const spPref = searchParams.get("pref") ?? "";
    const spCity = searchParams.get("city") ?? "";
    if (legacyArea && !spPref && !spCity) {
      const [lp, lc] = splitLocation(legacyArea);
      if (lp !== pref) setPref(lp);
      if (lc !== city) setCity(lc);
    } else {
      if (spPref !== pref) setPref(spPref);
      if (spCity !== city) setCity(spCity);
    }

    // tags
    const rawTags = searchParams.get("tags") ?? "";
    const t = rawTags ? rawTags.split(",").filter(Boolean) : [];
    if (t.length !== selTags.length || t.some((x,i)=>x!==selTags[i])) setSelTags(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // state → URL（qはトークン配列から生成）
  useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString());
    const q = fromTokens(qTokens);
    if (q) sp.set("q", q); else sp.delete("q");
    if (onlineOnly) sp.set("online","1"); else sp.delete("online");
    if (pref) sp.set("pref", pref); else sp.delete("pref");
    if (city) sp.set("city", city); else sp.delete("city");
    sp.delete("area");
    if (selTags.length) sp.set("tags", selTags.join(",")); else sp.delete("tags");
    router.replace(`?${sp.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qTokens, onlineOnly, pref, city, selTags]);

  // 都道府県変更で市区をリセット
  useEffect(() => {
    if (city && pref && !CITIES_BY_PREF[pref]?.includes(city)) setCity("");
  }, [pref]); // eslint-disable-line react-hooks/exhaustive-deps

  // 条件変更で1ページ目へ
  useEffect(() => setPage(1), [qTokens, sort, pageSize, onlineOnly, pref, city, selTags]);

  // ============= 絞り込み & ソート =============
  const filtered: Expert[] = useMemo(() => {
    const tokens = qTokens.map((t) => t.toLowerCase());

    const base = EXPERTS.filter((e) => {
      // キーワード（AND）
      if (tokens.length) {
        const hay = [e.name, e.title, e.license ?? "", ...(e.tags ?? []), e.location]
          .join(" ").toLowerCase();
        if (!tokens.every((t) => hay.includes(t))) return false;
      }
      // オンライン
      if (onlineOnly && !e.online) return false;
      // エリア
      const [p,c] = splitLocation(e.location);
      if (pref && p !== pref) return false;
      if (city && c !== city) return false;
      // タグ（AND）
      if (selTags.length && !selTags.every((t)=>e.tags.includes(t))) return false;

      return true;
    });

    const arr = [...base];
    switch (sort) {
      case "rating_desc":
        arr.sort((a,b)=>(b.rating??0)-(a.rating??0)); break;
      case "price_asc":
        arr.sort((a,b)=>parsePriceToYen(a.price)-parsePriceToYen(b.price)); break;
      case "price_desc":
        arr.sort((a,b)=>parsePriceToYen(b.price)-parsePriceToYen(a.price)); break;
      case "reviews_desc":
        arr.sort((a,b)=>(b.reviews??0)-(a.reviews??0)); break;
      case "online_first":
        arr.sort((a,b)=>Number(b.online)-Number(a.online)); break;
      case "default":
      default:
        arr.sort(
          (a,b)=>
            Number(b.online)-Number(a.online) ||
            (b.rating??0)-(a.rating??0) ||
            (b.reviews??0)-(a.reviews??0)
        );
        break;
    }
    return arr;
  }, [qTokens, sort, onlineOnly, pref, city, selTags]);

  // ===== ページング =====
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const paged = filtered.slice(start, end);

  // ===== UI 操作関数 =====
  const addToken = (t: string) => {
    const val = t.trim();
    if (!val) return;
    setQTokens((prev)=>uniqKeep([...prev, val]));
    setQInput(""); // 入力はクリア
  };
  const toggleToken = (t: string) => {
    setQTokens((prev)=>prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]);
  };
  const removeFilter = (kind: "online"|"pref"|"city"|{tag:string}|{kw:string}) => {
    if (kind === "online") setOnlineOnly(false);
    else if (kind === "pref") { setPref(""); setCity(""); }
    else if (kind === "city") setCity("");
    else if ("tag" in kind) setSelTags((prev)=>prev.filter(x=>x!==kind.tag));
    else if ("kw" in kind) setQTokens((prev)=>prev.filter(x=>x!==kind.kw));
  };
  const toggleTag = (t: string) =>
    setSelTags((prev)=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t]);
  const clearAll = () => {
    setQTokens([]);
    setQInput("");
    setOnlineOnly(false);
    setPref(""); setCity("");
    setSelTags([]);
  };

  // 市区候補
  const cityOptions = pref ? CITIES_BY_PREF[pref] ?? [] : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">専門家を探す</h1>

      {/* 検索 & 並び替え */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-2">
          <input
            value={qInput}
            onChange={(e)=>setQInput(e.target.value)}
            onKeyDown={(e)=>{
              if (e.key==="Enter") {
                e.preventDefault();
                // スペース区切りで複数登録
                const add = toTokens(qInput);
                if (add.length) {
                  setQTokens((prev)=>uniqKeep([...prev, ...add]));
                  setQInput("");
                }
              }
            }}
            className="w-full rounded-lg border px-4 py-2"
            placeholder="キーワード（名前 / 資格 / タグ / 所在地） ー Enterで確定、スペースで分割"
            aria-label="キーワード入力"
          />
          {qInput && (
            <button
              onClick={()=>setQInput("")}
              className="shrink-0 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              aria-label="入力をクリア"
            >
              クリア
            </button>
          )}
          {qInput && (
            <button
              onClick={()=>{ const add = toTokens(qInput); if (add.length){ setQTokens(prev=>uniqKeep([...prev, ...add])); setQInput(""); } }}
              className="shrink-0 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              aria-label="キーワードを追加"
            >
              追加
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e)=>setSort(e.target.value as SortKey)}
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
            onChange={(e)=>setPageSize(Number(e.target.value))}
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

      {/* ファセット（カード化） */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {/* オンライン */}
        <div className="flex items-center justify-between rounded-xl border bg-white p-3">
          <div>
            <div className="text-sm font-medium text-gray-900">オンラインのみ</div>
            <div className="text-xs text-gray-500">今すぐ相談できる可能性が高い専門家</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={onlineOnly}
            onClick={()=>setOnlineOnly(v=>!v)}
            className={`relative h-6 w-11 rounded-full transition ${onlineOnly ? "bg-emerald-500" : "bg-gray-300"}`}
            aria-label="オンラインのみ切り替え"
          >
            <span className={`absolute top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition ${onlineOnly ? "left-6" : "left-0.5"}`} />
          </button>
        </div>

        {/* 都道府県 */}
        <div className="rounded-xl border bg-white p-3">
          <div className="mb-1 text-sm text-gray-600">都道府県</div>
          <select
            value={pref}
            onChange={(e)=>setPref(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            aria-label="都道府県"
          >
            <option value="">すべて</option>
            {PREFS.map((p)=>(
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* 市区 */}
        <div className="rounded-xl border bg-white p-3">
          <div className="mb-1 text-sm text-gray-600">市区</div>
          <select
            value={city}
            onChange={(e)=>setCity(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            aria-label="市区"
            disabled={!pref}
          >
            <option value="">すべて</option>
            {(pref ? CITIES_BY_PREF[pref] ?? [] : []).map((c)=>(
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 適用中の条件ピル（色トーン統一） */}
      {(onlineOnly || pref || city || selTags.length>0 || qTokens.length>0) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {qTokens.map((kw)=>(
            <button
              key={`kw-${kw}`}
              onClick={()=>removeFilter({kw})}
              className={`group rounded-full border px-3 py-1 text-sm ${CHIP_SELECTED}`}
              aria-label={`キーワード ${kw} を削除`}
              title="クリックで削除"
            >
              {kw}
              <span className="ml-1 text-white/80 group-hover:text-white">×</span>
            </button>
          ))}
          {onlineOnly && (
            <button
              onClick={()=>removeFilter("online")}
              className={`group rounded-full border px-3 py-1 text-sm ${CHIP_SELECTED}`}
              aria-label="オンライン条件を削除"
            >
              オンライン
              <span className="ml-1 text-white/80 group-hover:text-white">×</span>
            </button>
          )}
          {pref && (
            <button
              onClick={()=>removeFilter("pref")}
              className={`group rounded-full border px-3 py-1 text-sm ${CHIP_SELECTED}`}
              aria-label="都道府県条件を削除"
            >
              {pref}
              <span className="ml-1 text-white/80 group-hover:text-white">×</span>
            </button>
          )}
          {city && (
            <button
              onClick={()=>removeFilter("city")}
              className={`group rounded-full border px-3 py-1 text-sm ${CHIP_SELECTED}`}
              aria-label="市区条件を削除"
            >
              {city}
              <span className="ml-1 text-white/80 group-hover:text-white">×</span>
            </button>
          )}
          {selTags.map((t)=>(
            <button
              key={`sel-${t}`}
              onClick={()=>removeFilter({tag:t})}
              className={`group rounded-full border px-3 py-1 text-sm ${CHIP_SELECTED}`}
              aria-label={`タグ ${t} を削除`}
            >
              {t}
              <span className="ml-1 text-white/80 group-hover:text-white">×</span>
            </button>
          ))}
          <button
            onClick={clearAll}
            className="ms-auto rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
          >
            条件リセット
          </button>
        </div>
      )}

      {/* キーワード（チップ／候補と同一UI／トグル） */}
      <div className="mb-4 rounded-xl border bg-white p-3">
        <div className="mb-2 text-sm text-gray-600">キーワード（複数選択可）</div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTS.map((label)=>{
            const active = qTokens.includes(label);
            return (
              <button
                key={label}
                onClick={()=>toggleToken(label)}
                className={`rounded-full px-3 py-1 text-sm border transition ${active ? CHIP_SELECTED : CHIP_UNSELECTED}`}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* タグ（複数選択） */}
      <div id="tags" className="mb-4 rounded-xl border bg-white p-3">
        <div className="mb-2 text-sm text-gray-600">タグ（複数選択可）</div>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((t)=>{
            const active = selTags.includes(t);
            return (
              <button
                key={t}
                onClick={()=>toggleTag(t)}
                className={`rounded-full px-3 py-1 text-sm border transition ${active ? CHIP_SELECTED : CHIP_UNSELECTED}`}
                aria-pressed={active}
              >
                {t}
              </button>
            );
          })}
        </div>
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
        {paged.map((e)=>(
          <ExpertCard key={e.id} {...e} />
        ))}
      </div>

      {/* ページャー */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={()=>setPage((p)=>Math.max(1, p-1))}
            disabled={safePage===1}
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
                  onClick={()=>setPage(n)}
                  className={`h-9 w-9 rounded-md text-sm ${active ? "bg-black text-white" : "border hover:bg-gray-50"}`}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <button
            onClick={()=>setPage((p)=>Math.min(totalPages, p+1))}
            disabled={safePage===totalPages}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            次へ →
          </button>
        </div>
      )}

      {filtered.length === 0 && <p className="mt-12 text-center text-gray-500">該当なし</p>}
    </main>
  );
}
