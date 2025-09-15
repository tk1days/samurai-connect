"use client";

import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${location.origin}/auth/callback` : undefined,
      },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">ログイン</h1>
      <button
        type="button"
        onClick={signInWithGoogle}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Googleでログイン
      </button>
    </div>
  );
}