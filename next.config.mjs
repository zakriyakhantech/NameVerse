const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'https://name-meaning-site-backend.vercel.app').replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable TypeScript checking during build (already validated in CI)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Performance Optimizations
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // Trailing slash policy: NO trailing slashes — single URL version only
  // This eliminates: /names/islamic/abdullah vs /names/islamic/abdullah/ duplication
  skipTrailingSlashRedirect: false,
  trailingSlash: false,

  // Image Optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'nameverse.vercel.app',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // REDIRECT CLEANUP: All redirects in one place — no chains, no loops
  // Rule: ONE URL → ONE redirect → final 200 page
  //
  // NOTE: Religion-path normalization (islam/muslim/christianity/hinduism →
  // canonical islamic/christian/hindu) lives in middleware.js, NOT here, to
  // avoid double-hop redirect chains. Do not re-add those four rules below.
  async redirects() {
    const HOST_OLD = 'nameverse.vercel.app';
    const HOST_NEW = 'https://nameverse.site';

    const hostRule = (source, destination) => ({
      source,
      has: [{ type: 'host', value: HOST_OLD }],
      destination,
      permanent: true,
    });

    return [
      // ── DOMAIN MIGRATION: nameverse.vercel.app → nameverse.site ──
      // Host-scoped rules: only fire when Host = nameverse.vercel.app.
      // Requests already on nameverse.site are never touched (no loop).
      hostRule('/', `${HOST_NEW}/`),
      hostRule('/names', `${HOST_NEW}/names`),
      hostRule('/search', `${HOST_NEW}/search`),
      hostRule('/blog', `${HOST_NEW}/blog`),
      hostRule('/about', `${HOST_NEW}/about`),
      hostRule('/privacy', `${HOST_NEW}/privacy`),
      hostRule('/terms', `${HOST_NEW}/terms`),
      hostRule('/languages', `${HOST_NEW}/languages`),
      hostRule('/popularity', `${HOST_NEW}/popularity`),
      hostRule('/name-meanings', `${HOST_NEW}/name-meanings`),
      hostRule('/names-by-meaning', `${HOST_NEW}/names-by-meaning`),
      hostRule('/names-by-origin', `${HOST_NEW}/names-by-origin`),
      hostRule('/unique-names', `${HOST_NEW}/unique-names`),
      hostRule('/trending-names', `${HOST_NEW}/trending-names`),
      hostRule('/advanced-search', `${HOST_NEW}/advanced-search`),
      hostRule('/my-names', `${HOST_NEW}/my-names`),
      hostRule('/guides/expert-naming-guide', `${HOST_NEW}/guides/expert-naming-guide`),
      hostRule('/viral-names', `${HOST_NEW}/viral-names`),
      hostRule('/stories', `${HOST_NEW}/stories`),
      // Gender listing pages
      hostRule('/(islamic|christian|hindu)/(boy-names|girl-names)', `${HOST_NEW}/:1/:2`),
      // Name detail pages
      hostRule('/names/:religion(islamic|christian|hindu)/:slug', `${HOST_NEW}/names/:religion/:slug`),
      // Blog posts
      hostRule('/blog/:slug', `${HOST_NEW}/blog/:slug`),
      // Collection: religion listing
      hostRule('/names/religion/:religion(islamic|christian|hindu)/:page([0-9]+)', `${HOST_NEW}/names/religion/:religion/:page`),
      // Collection: letter
      hostRule('/names/:religion(islamic|christian|hindu)/letter/:letter([A-Za-z])/:page([0-9]+)', `${HOST_NEW}/names/:religion/letter/:letter/:page`),
      // Collection: origin
      hostRule('/names/:religion(islamic|christian|hindu)/origin/:origin([a-z0-9-]+)/:page([0-9]+)', `${HOST_NEW}/names/:religion/origin/:origin/:page`),
      // Collection: categories
      hostRule('/names/:religion(islamic|christian|hindu)/categories/:category([a-z0-9-]+)/:page([0-9]+)', `${HOST_NEW}/names/:religion/categories/:category/:page`),
      // Legacy paths
      hostRule('/baby-names/:path*', `${HOST_NEW}/names/:path*`),
      hostRule('/baby-names', `${HOST_NEW}/names`),
      hostRule('/name/:path*', `${HOST_NEW}/names/:path*`),
      hostRule('/article/:path*', `${HOST_NEW}/blog/:path*`),
      hostRule('/meaning/:path*', `${HOST_NEW}/name-meanings`),
      hostRule('/stories/:path*', `${HOST_NEW}/blog`),
      hostRule('/religions/:path*', `${HOST_NEW}/names`),

      // ── LEGACY INTERNAL REDIRECTS (no host condition) ──
      {
        source: '/baby-names/:path*',
        destination: '/names/:path*',
        permanent: true,
      },
      {
        source: '/baby-names',
        destination: '/names',
        permanent: true,
      },
      {
        source: '/name/:path*',
        destination: '/names/:path*',
        permanent: true,
      },
      {
        source: '/article/:path*',
        destination: '/blog/:path*',
        permanent: true,
      },
    ];
  },

  // Headers for Performance & Edge Caching
  async headers() {
    return [
      // API routes - no cache + noindex
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      // OG image generation - noindex, nofollow
      {
        source: '/api/og/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      // Main pages with comprehensive CSP
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: https://quge5.com https://revolthem.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://adservice.google.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: https://quge5.com https://revolthem.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
              "connect-src 'self' https: data: blob: https://quge5.com https://revolthem.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
              "font-src 'self' data: https://fonts.gstatic.com",
              "frame-src 'self' https: data: https://quge5.com https://revolthem.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
              "worker-src 'self' blob:",
              "frame-ancestors 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "manifest-src 'self'",
              "media-src 'self' https: http:"
            ].join('; '),
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      // Next.js data
      {
        source: '/_next/data/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, stale-while-revalidate=2592000' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      // Static assets - long-term caching + noindex
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Manifest.json - public, no auth required
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      // Ad proxy route - allow all origins
      {
        source: '/dstar/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
        ],
      },
      {
        source: '/dstar',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
        ],
      },
    ];
  },

  // Rewrites for image fallbacks (keep minimal, no API exposure)
  async rewrites() {
    return [
      {
        source: '/images/articles/:path*',
        destination: '/logo.png',
      },
    ];
  },

  // Optimize package imports
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-slot',
      '@heroicons/react',
    ],
  },

  turbopack: {},
};

export default nextConfig;