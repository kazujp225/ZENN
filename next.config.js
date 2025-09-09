/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['assets.zenn.dev'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Warning only, not errors
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Disable static generation to fix useSearchParams prerendering issues
  output: 'standalone',
  trailingSlash: false,
}

module.exports = nextConfig