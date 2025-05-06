const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Completely disable TypeScript and ESLint checks
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Disable static generation
  staticPageGenerationTimeout: 1,

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

  // Critical: Enhanced webpack configuration for Vercel
  webpack: (config, { isServer }) => {
    // Add explicit module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(process.cwd(), 'src'),
      '@/utils/trpc/client': path.join(process.cwd(), 'src/utils/trpc/client.js'),
      '@/components/ui': path.join(process.cwd(), 'src/components/ui'),
      // Use real Supabase clients instead of mocks
      // '@supabase/auth-helpers-nextjs': path.join(process.cwd(), 'src/utils/supabase/mock-client.js'),
      // '@supabase/supabase-js': path.join(process.cwd(), 'src/utils/supabase/mock-client.js'),
    };

    // Add fallbacks for problematic modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // Handle specific problematic imports in server context
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        {
          '@/utils/trpc/client': 'commonjs ' + path.join(process.cwd(), 'src/utils/trpc/client.js'),
        },
      ];
    }

    return config;
  },

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: { allowedOrigins: ['*'] },
  },

  // External packages that should be treated as server-only
  serverExternalPackages: ['@supabase/supabase-js'],

  // Disable static generation
  staticPageGenerationTimeout: 1,

  // Add rewrites for route normalization
  async rewrites() {
    return [
      // Agent portal rewrites
      { source: '/agent', destination: '/agent-layout/agent/dashboard' },
      { source: '/agent/dashboard', destination: '/agent-layout/agent/dashboard' },
      { source: '/agent-layout/dashboard', destination: '/agent-layout/agent/dashboard' },
      { source: '/agent/transactions', destination: '/agent-layout/agent/transactions' },
      { source: '/agent/transactions/:path*', destination: '/agent-layout/agent/transactions/:path*' },
      { source: '/agent/clients', destination: '/agent-layout/agent/clients' },
      { source: '/agent/profile', destination: '/agent-layout/agent/profile' },

      // Admin portal rewrites
      { source: '/admin', destination: '/admin-layout/admin-dashboard' },
      { source: '/admin/dashboard', destination: '/admin-layout/admin-dashboard' },
      { source: '/admin-layout/dashboard', destination: '/admin-layout/admin-dashboard' },
      { source: '/admin/transactions', destination: '/admin-layout/admin-dashboard/transactions' },
      { source: '/admin/transactions/:path*', destination: '/admin-layout/admin-dashboard/transactions/:path*' },
      { source: '/admin/agents', destination: '/admin-layout/admin-dashboard/agents' },
      { source: '/admin/commission', destination: '/admin-layout/admin-dashboard/commission' },
      { source: '/admin/commission-details', destination: '/admin-layout/admin-dashboard/commission-details' },
    ];
  },
};

module.exports = nextConfig;