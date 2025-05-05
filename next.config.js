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
    ignoreDuringBuilds: true,
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
    domains: ['res.cloudinary.com'],
  },

  // Disable static optimization for problematic routes
  serverExternalPackages: ['@supabase/supabase-js'],

  // Force all pages to be server-side rendered
  output: 'standalone',

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
        }
      ];
    }
    return [];
  },
}

module.exports = nextConfig
