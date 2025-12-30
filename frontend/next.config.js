/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable PWA support
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'geolocation=*, accelerometer=*, gyroscope=*'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
