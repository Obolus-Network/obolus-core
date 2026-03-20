import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'github.githubassets.com',
      },
      {
        protocol: 'https',
        hostname: 'www.adobe.com',
      },
      { protocol: 'https', 
        hostname: 'upload.wikimedia.org' },
    ],
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      os: false,
      path: false,
      crypto: false,
      buffer: require.resolve("buffer"),
    };
    return config;
  },

  serverExternalPackages: ['@meshsdk/core'],
  async rewrites() {
    return [
      {
        source: '/api/minswap/:path*',
        destination: 'https://api-mainnet-prod.minswap.org/:path*',
      },
      {
        source: '/api/minswap-agg/:path*',
        destination: 'https://agg-api.minswap.org/aggregator/:path*',
      },
      {
        source: '/api/blockfrost/:path*',
        destination: 'https://cardano-preprod.blockfrost.io/api/v0/:path*',
      },
    ]
  },
}

export default nextConfig
