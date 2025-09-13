// /src/app/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LS_MOCK_SESSION = "sc_mock_session_v1";

export default function LoginPage() {
  const router = useRouter();

  // 既にログイン扱いならプロ用マイページへ
  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem(LS_MOCK_SESSION) : null;
    if (v === "1") router.replace("/pro/mypage");
  }, [router]);

  const mockLogin = () => {
    try {
      localStorage.setItem(LS_MOCK_SESSION, "1");
    } catch {}
    router.push("/pro/mypage");
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">ログイン（モック）</h1>
      <p className="mt-1 text-sm text-subtle">今は見た目確認用です。認証は未接続。</p>

      <div className="card mt-6 space-y-4 p-5">
        <button onClick={mockLogin} className="btn btn-primary w-full">
          ログイン
        </button>
        <p className="text-xs text-subtle">
          ボタンを押すと <code>/pro/mypage</code> に遷移し、ヘッダー右上が「ログアウト」表示になります。
        </p>
      </div>
    </main>
  );
}