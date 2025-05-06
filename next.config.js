/** @type {import('next').NextConfig} */
const path = require('path');

// This disables ESLint completely
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.NEXT_DISABLE_ESLINT = '1';
process.env.NEXT_DISABLE_STATIC_GENERATION = 'true';

const nextConfig = {
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

  // Force all pages to be server-side rendered
  output: 'standalone',

  // Skip certain paths during static generation
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  
  // Disable static generation
  staticPageGenerationTimeout: 0,
  
  // External packages that should be treated as server-only
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  
  // Enhanced webpack configuration for path aliases
  webpack: (config, { isServer }) => {
    // Add path alias resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(process.cwd(), 'src'),
    };
    
    // Handle specific problematic imports
    if (isServer) {
      config.externals = [...config.externals, {
        '@/utils/trpc/client': 'commonjs @/utils/trpc/client',
      }];
    }
    
    return config;
  },
}

module.exports = nextConfig