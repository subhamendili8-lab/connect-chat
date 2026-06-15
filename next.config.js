const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack Line ପୁରା Delete କରିଦିଅ
  
  // Google Image ପାଇଁ
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'user-images.githubusercontent.com',
      },
    ],
  },
  
  // Build ବେଳେ ESLint ବନ୍ଦ
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = withPWA(nextConfig)