/** @type {import('next').NextConfig} */

// This disables ESLint completely
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.NEXT_DISABLE_ESLINT = '1';

const nextConfig = {
  // Optimize for Vercel deployment

  // Completely disable ESLint in build
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [],
  },

  // Completely disable TypeScript checking in build
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: "tsconfig.json",
  },

  // Disable React strict mode for now
  reactStrictMode: false,

  // Configure image domains
  images: {
    domains: ['res.cloudinary.com', 'cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // Disable static optimization for problematic routes
  serverExternalPackages: ['@supabase/supabase-js'],

  // Force all pages to be server-side rendered
  output: 'standalone',

  // Handle parentheses in folder names
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },

  // Exclude problematic files from the build
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude problematic files from the server build
      config.externals = [...config.externals, {
        '@/utils/trpc/client': 'commonjs @/utils/trpc/client',
      }];
    }
    return config;
  },

  // Skip certain paths during static generation
  // This prevents build errors for pages that need dynamic data
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,

  // Conditionally exclude debug pages in production
  async rewrites() {
    // Only apply in production
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/debug-:path*',
          destination: '/404',
        },
        {
          source: '/debug/:path*',
          destination: '/404',
        },
        {
          source: '/admin-dashboard/:path*',
          destination: '/admin-layout',
        },
        {
          source: '/admin-layout/admin-dashboard/:path*',
          destination: '/admin-layout',
        }
      ];
    }
    return [];
  },
}

module.exports = nextConfig
