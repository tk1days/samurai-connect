import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Supabaseクライアントをシングルトンとして取得します。
 */
// ================= 修正箇所 START: export を追加 =================
export function getSupabase() {
// ================= 修正箇所 END =================
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // エラーメッセージをより分かりやすく変更
      throw new Error('Supabase URL or Anon Key is not defined in environment variables.');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}