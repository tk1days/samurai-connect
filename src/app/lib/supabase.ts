import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ================= 修正箇所 START: 遅延生成パターンに修正 =================

// 1. Supabaseクライアントのインスタンスを保持する変数を宣言します（最初は null）
let supabaseClient: SupabaseClient | null = null;

/**
 * Supabaseクライアントをシングルトン（アプリ内で唯一のインスタンス）として取得します。
 * 環境変数が読み込まれていないビルド時などはエラーにならず、
 * 実際に必要になったタイミングで初めてインスタンスを生成します。
 */
export function getSupabase() {
  // 2. まだインスタンスが作られていなければ、新しく作成します
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 3. Vercelのビルド時など、環境変数が設定されていない場合はエラーを投げる
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and Anon Key are required.');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  // 4. 既に存在するか、新しく作ったインスタンスを返します
  return supabaseClient;
}

// 5. 従来の `supabase` という名前の定数は削除し、この関数をエクスポートします
// (従来のコード) export const supabase = createClient(...)

// ================= 修正箇所 END =================