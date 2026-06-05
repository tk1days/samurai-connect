"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const LICENSES = ["税理士", "司法書士", "社会保険労務士", "行政書士", "中小企業診断士", "その他"];

export default function ProProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    license: "",
    title: "",
    bio: "",
    location: "",
    gender: "male" as "male" | "female" | "other",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/auth");
      setLoading(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/auth"); return; }

    // profilesテーブルにrole=expertで登録
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id,
        role: "expert",
        display_name: session.user.user_metadata?.full_name ?? "",
        avatar_url: session.user.user_metadata?.avatar_url ?? null,
      });

    if (profileError) {
      alert("エラーが発生しました: " + profileError.message);
      setSaving(false);
      return;
    }

    // expertsテーブルに詳細情報を登録
    const { error: expertError } = await supabase
      .from("experts")
      .upsert({
        id: session.user.id,
        license: form.license,
        title: form.title,
        bio: form.bio,
        location: form.location,
        gender: form.gender,
        price_label: "30分 / 無料",
        is_online: false,
        is_approved: false,
      });

    if (expertError) {
      alert("エラーが発生しました: " + expertError.message);
      setSaving(false);
      return;
    }

    setDone(true);
    setSaving(false);
  };

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );

  if (done) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="text-4xl">✅</div>
      <h2 className="text-xl font-bold">登録申請を受け付けました</h2>
      <p className="text-zinc-500">審査完了後にご連絡します。通常1〜3営業日以内です。</p>
    </div>
  );

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">専門家として登録する</h1>
      <p className="mb-6 text-sm text-zinc-500">
        登録後、運営が資格を確認して承認します。承認後に一般公開されます。
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium">資格・肩書 *</label>
          <select
            required
            value={form.license}
            onChange={(e) => setForm({ ...form, license: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">選択してください</option>
            {LICENSES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">専門タイトル *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="例：法人税・決算・節税相談"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">自己紹介 *</label>
          <textarea
            required
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="経歴・得意分野・相談者へのメッセージなど"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">所在地</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="例：東京都 千代田区"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">性別</label>
          <div className="flex gap-4">
            {(["male", "female", "other"] as const).map((g) => (
              <label key={g} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value={g}
                  checked={form.gender === g}
                  onChange={() => setForm({ ...form, gender: g })}
                />
                {g === "male" ? "男性" : g === "female" ? "女性" : "その他"}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-700">
          💡 料金は現在「30分 / 無料」で固定です。リリース後に設定可能になります。
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "送信中…" : "登録申請する"}
        </button>
      </form>
    </main>
  );
}
