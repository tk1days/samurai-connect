// src/data/categories.ts

export type CategoryKey =
  | "tax"        // 税務
  | "labor"      // 労務
  | "legal"      // 法務（弁護士）
  | "judicial"   // 司法書士
  | "gyosei"     // 行政書士
  | "patent"     // 知財（弁理士）
  | "accounting" // 会計・監査（公認会計士）
  | "funeral"    // 葬儀・終活
  | "fp";        // ファイナンシャルプランナー

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "tax",        label: "税務" },
  { key: "labor",      label: "労務" },
  { key: "legal",      label: "法務" },
  { key: "judicial",   label: "登記・相続" },
  { key: "gyosei",     label: "許認可・契約書" },
  { key: "patent",     label: "知財" },
  { key: "accounting", label: "会計・監査" },
  { key: "funeral",    label: "葬儀・終活" },
  { key: "fp",         label: "FP" },
];

// Expert の簡易カテゴリ推定ロジック
// （license と tags から最も近いカテゴリを1つ返す）
export function inferCategory({
  license,
  tags,
  title,
}: {
  license?: string;
  tags: string[];
  title: string;
}): CategoryKey {
  const text = [license ?? "", title, ...tags].join(" ");

  if (/税理士/.test(text) || /(相続税|贈与税|法人税|節税)/.test(text)) return "tax";
  if (/社会保険労務士/.test(text) || /(就業規則|労働|給与計算|助成金)/.test(text)) return "labor";
  if (/弁護士/.test(text) || /(企業法務|労務トラブル|顧問契約)/.test(text)) return "legal";
  if (/司法書士/.test(text) || /(登記|相続|不動産登記)/.test(text)) return "judicial";
  if (/行政書士/.test(text) || /(許認可|契約書)/.test(text)) return "gyosei";
  if (/弁理士/.test(text) || /(特許|商標)/.test(text)) return "patent";
  if (/公認会計士/.test(text) || /(監査|内部統制|上場準備)/.test(text)) return "accounting";
  if (/(葬儀|終活|供養)/.test(text)) return "funeral";
  if (/ファイナンシャルプランナー/.test(text) || /(ライフプラン|資産運用|家計)/.test(text)) return "fp";

  // デフォルトは税務寄りに
  return "tax";
}