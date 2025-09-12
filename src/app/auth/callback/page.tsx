"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation"; // 1. useSearchParams をインポート
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  // 2. useSearchParams フックを使って、URLのクエリパラメータを取得できるようにする
  const searchParams = useSearchParams();

  useEffect(() => {
    const run = async () => {
      // 3. URLから 'code' という名前のパラメータを取得する
      const code = searchParams.get("code");

      // 4. codeが存在する場合のみ、処理を実行する
      if (code) {
        // Google から返ってきたコードをセッションに交換
        // 5. 取得したcodeを引数として関数に渡す
        await supabase.auth.exchangeCodeForSession(code);

        // セッション確定後にダッシュボードへ
        window.location.href = "/dashboard";
      }
    };
    run();
  }, [searchParams]); // 6. useEffectの依存配列にsearchParamsを追加

  return <div className="p-6">認証処理中…</div>;
}