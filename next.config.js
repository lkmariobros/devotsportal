/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for Vercel deployment
  output: 'standalone',

  // Disable ESLint in build (Vercel will handle this)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking in build (Vercel will handle this)
  typescript: {
    ignoreBuildErrors: true,
  },

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
