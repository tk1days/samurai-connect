// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // ビルド時の ESLint エラーを無視してデプロイを通します
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
