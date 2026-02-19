
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.tiktok.com https://sf16-website.neutral.ttwstatic.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://p16-sign-sg.tiktokcdn.com https://p16-sign-va.tiktokcdn.com https://p16-sign.tiktokcdn-us.com",
              "font-src 'self'",
              "connect-src 'self' https://www.tiktok.com https://api.tiktok.com",
              "frame-src 'self' https://www.tiktok.com https://m.tiktok.com",
              "frame-ancestors 'self'",
              "media-src 'self' https://*.tiktokcdn.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
