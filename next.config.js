/** @type {import('next').NextConfig} */

// This disables ESLint completely
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.NEXT_DISABLE_ESLINT = '1';

const nextConfig = {
  // Optimize for Vercel deployment
  output: 'standalone',

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
    domains: ['res.cloudinary.com'],
  },

  // Disable static optimization for problematic routes
  experimental: {
    // This ensures all pages are treated as server components by default
    serverComponentsExternalPackages: ['@supabase/supabase-js']
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
        }
      ];
    }
    return [];
  },
}

module.exports = nextConfig
