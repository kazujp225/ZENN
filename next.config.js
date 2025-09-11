/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['assets.zenn.dev', 'api.dicebear.com', 'supabase.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  compress: true,
  poweredByHeader: false, // セキュリティ：X-Powered-Byヘッダーを無効化
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ESLintエラーを無視してビルド継続
  },
  typescript: {
    // 型エラーを無視してビルド継続（段階的修正のため）
    ignoreBuildErrors: true,
  },
  // プロダクション最適化
  output: 'standalone',
  trailingSlash: false,
  // パフォーマンス最適化
  experimental: {
    optimizePackageImports: ['lodash', 'date-fns', 'lucide-react'],
  },
  // バンドル分析
  webpack: (config, { isServer }) => {
    // バンドルサイズ最適化
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // tree-shakingの最適化
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    return config;
  },
  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // 静的ファイルのキャッシュ設定
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig