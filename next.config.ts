/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Disable ESLint during production build
  eslint: {
    // Only run ESLint on local development, not during builds
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig