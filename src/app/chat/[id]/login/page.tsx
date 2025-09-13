// /src/app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 既にログインしてたら飛ばす
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/pro/mypage");
    });
  }, [router]);

  const sendOtp = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setErr(e?.message ?? "送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 既にリンク経由で戻ってきたら、セッションを拾ってダッシュボードへ
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/pro/mypage");
    });
    return () => sub.data.subscription.unsubscribe();
  }, [router]);

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">ログイン</h1>
      <p className="mt-1 text-sm text-subtle">メールに送られる6桁コードでログインします。</p>

      <div className="card mt-6 p-5 space-y-3">
        <label className="text-sm">メールアドレス</label>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <button
          className="btn btn-primary w-full disabled:opacity-50"
          onClick={sendOtp}
          disabled={loading || !email}
        >
          {loading ? "送信中…" : "ログインリンクを送る"}
        </button>

        {sent && (
          <p className="text-sm text-success">
            送信しました。メールのリンク（または6桁コード）でログインしてください。
          </p>
        )}
        {err && <p className="text-sm text-danger">{err}</p>}
      </div>
    </main>
  );
}