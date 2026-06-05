import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Samurai Connect",
  description: "今すぐ、顔を見て、専門家に相談できるリアルタイム相談プラットフォーム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
