// src/app/pro/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EXPERTS } from "@/data/experts";

/**
 * モック前提のプロフィール編集ページ
 * - 認証やDBは未接続のため localStorage に保存します
 * - ログイン中の専門家IDは暫定で "1" として扱います（必要に応じて差し替え）
 */
const MOCK_EXPERT_ID = "1";
const LS_KEY = (id: string) => `sc_pro_profile_${id}`;

type Form = {
  name: string;
  license?: string;
  title: string;
  location: string;
  price: string;
  tagsCsv: string; // 表示はカンマ区切り
  bio: string;
  online: boolean;
};

export default function ProProfilePage() {
  // 既存データ（モック）：まず既存EXPERTから初期値を作る
  const base = useMemo(() => {
    const e = EXPERTS.find((x) => x.id === MOCK_EXPERT_ID);
    return e
      ? ({
          name: e.name,
          license: e.license ?? "",
          title: e.title,
          location: e.location ?? "",
          price: e.price ?? "",
          tagsCsv: (e.tags ?? []).join(","),
          bio: e.bio ?? "",
          online: Boolean(e.online),
        } as Form)
      : ({
          name: "",
          license: "",
          title: "",
          location: "",
          price: "",
          tagsCsv: "",
          bio: "",
          online: false,
        } as Form);
  }, []);

  const [form, setForm] = useState<Form>(base);
  const [loaded, setLoaded] = useState(false);

  // 初回：localStorage に保存済みならそちらを採用
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY(MOCK_EXPERT_ID));
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Form>;
        setForm((prev) => ({ ...prev, ...saved }));
      }
    } catch {
      // noop
    } finally {
      setLoaded(true);
    }
  }, []);

  // 保存
  const save = () => {
    try {
      localStorage.setItem(LS_KEY(MOCK_EXPERT_ID), JSON.stringify(form));
      alert("プロフィールを保存しました（ローカル保存：モック）");
    } catch (e) {
      alert("保存に失敗しました");
    }
  };

  // 変更ハンドラ
  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  if (!loaded) {
    return <div className="p-6 text-sm text-gray-600">読み込み中…</div>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4 text-sm text-zinc-600">
        <Link href="/pro/mypage" className="underline">
          プロ用マイページ
        </Link>
        <span className="mx-1">/</span>
        プロフィール編集
      </div>

      <h1 className="text-2xl font-bold">プロフィール編集</h1>
      <p className="mt-1 text-zinc-600">
        表示名・肩書・自己紹介・所在地などを編集します（保存先：ブラウザの
        <code className="mx-1 rounded bg-zinc-100 px-1">localStorage</code>）。
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl border bg-white p-5 shadow-sm">
        {/* 表示名 */}
        <div>
          <label className="text-sm text-zinc-700">表示名</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="例）山田 太郎"
          />
        </div>

        {/* 資格 */}
        <div>
          <label className="text-sm text-zinc-700">資格（任意）</label>
          <input
            value={form.license ?? ""}
            onChange={(e) => set("license", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="例）税理士（無資格の場合は空欄）"
          />
        </div>

        {/* 肩書 */}
        <div>
          <label className="text-sm text-zinc-700">肩書 / 提供メニュー</label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="例）法人税・決算相談"
          />
        </div>

        {/* 所在地 */}
        <div>
          <label className="text-sm text-zinc-700">所在地</label>
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="例）東京都 千代田区"
          />
        </div>

        {/* 料金表示（目安） */}
        <div>
          <label className="text-sm text-zinc-700">料金（表示用）</label>
          <input
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="例）30分/¥5,000"
          />
        </div>

        {/* タグ */}
        <div>
          <label className="text-sm text-zinc-700">タグ（カンマ区切り）</label>
          <input
            value={form.tagsCsv}
            onChange={(e) => set("tagsCsv", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="例）法人税,節税,中小企業"
          />
          <p className="mt-1 text-xs text-zinc-500">
            一覧・詳細ページの検索や表示で使用します。
          </p>
        </div>

        {/* 自己紹介 */}
        <div>
          <label className="text-sm text-zinc-700">自己紹介</label>
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="経歴や得意分野、相談スタイルなどを記載してください。"
          />
        </div>

        {/* オンライン待機フラグ */}
        <div className="flex items-center gap-2">
          <input
            id="online"
            type="checkbox"
            checked={form.online}
            onChange={(e) => set("online", e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="online" className="text-sm text-zinc-700">
            オンライン待機中として表示する（一覧で優先表示）
          </label>
        </div>

        {/* 保存操作 */}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-lg bg-black px-4 py-2 text-white hover:bg-zinc-900"
          >
            保存する
          </button>

          <Link
            href="/pro/mypage"
            className="rounded-lg border px-4 py-2 hover:bg-zinc-50"
          >
            プロ用マイページに戻る
          </Link>

          <Link
            href={`/experts/${MOCK_EXPERT_ID}`}
            className="text-sm text-indigo-700 underline underline-offset-4 hover:text-indigo-900"
            title="公開プロフィール（モック）を確認"
          >
            公開プロフィールを確認
          </Link>
        </div>

        {/* 注意 */}
        <p className="text-xs text-zinc-500">
          ※ 現在はモック版です。保存内容はブラウザ内にのみ保持されます。実データ反映（/src/data/experts.ts など）は次段階で接続します。
        </p>
      </div>
    </main>
  );
}