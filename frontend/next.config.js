/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/:path*',
      },
    ];
  },
  // Optimize for iOS web
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/webp'],
  },
};

module.exports = nextConfig;
