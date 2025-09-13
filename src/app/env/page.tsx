// src/app/env/page.tsx
// 診断用ページ（公開可：NEXT_PUBLICのみ表示）
export default function EnvPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <main style={{ padding: 24, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Env Diagnostics</h1>
      <pre style={{ background: "#f6f8fa", padding: 16, borderRadius: 8 }}>
{JSON.stringify(
  {
    NEXT_PUBLIC_SUPABASE_URL: url ?? "(undefined)",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon ? anon.slice(0, 8) + "…" : "(undefined)",
  },
  null,
  2
)}
      </pre>
      <p>※ ここに値が出ていれば、Production ビルドに環境変数が埋め込まれています。</p>
    </main>
  );
}
