/** @type {import('next').NextConfig} */
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

  // Conditionally exclude debug pages in production
  async rewrites() {
    // Only apply in production
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/debug-:path*',
          destination: '/404',
        },
      ];
    }
    return [];
  },
}

module.exports = nextConfig
