import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';   // 追加

export const metadata: Metadata = {
  title: 'Samurai Connect',
  description: '専門家と相談者をリアルタイムにつなぐプラットフォーム',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        {/* 共通ヘッダー */}
        <Header />

        {/* 各ページ内容 */}
        <main>{children}</main>
      </body>
    </html>
  );
}