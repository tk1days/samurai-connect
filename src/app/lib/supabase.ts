import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabaseクライアントのインスタンスを保持する変数です
let supabaseClient: SupabaseClient | null = null;

/**
 * Supabaseクライアントを取得するための関数です。
 * この関数を他のファイルから呼び出して使います。
 */
export function getSupabase() {
  // まだインスタンスが作られていなければ、新しく作成します
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 環境変数が設定されていない場合はエラーを出します
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL or Anon Key is not defined in environment variables.');
    }

    // ここで初めてクライアントを作成します
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  // 作成済みのクライアントを返します
  return supabaseClient;
}