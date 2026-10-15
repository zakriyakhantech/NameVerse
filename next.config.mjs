const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'https://name-meaning-site-backend.vercel.app').replace(/\/+$/, '');
const CANONICAL_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nameverse.site').replace(/\/+$/, '');
const CANONICAL_HOST = CANONICAL_SITE_URL.replace(/^https?:\/\//i, '');

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

  // REDIRECT CLEANUP
  // Rule: ONE URL → ONE redirect → final 200 page
  //
  // ⚠ INCIDENT (2026-10) — DO NOT REINTRODUCE HOST-SCOPED REDIRECTS HERE.
  //
  // The legacy→canonical migration used to be driven by ~30 `host:`-scoped
  // rules in this file, including a '/:path*' catch-all. Two problems:
  //
  //   1. They were a BLIND HOST SWAP — only the hostname was replaced, the path
  //      was passed through unchanged. But nameverse.site is a separate Netlify
  //      build with a different URL scheme, so /islamic/boy-names became
  //      nameverse.site/islamic/boy-names → 404, and /names/islamic/letter/A/1
  //      became nameverse.site/names/islamic/letter/A/1 → 404.
  //      Google does not consolidate a 301 that lands on a 404, which is why
  //      nameverse.vercel.app kept ranking and traffic for months.
  //
  //   2. In Next.js 16 these redirects run BEFORE the proxy, so the catch-all
  //      consumed every legacy request before src/proxy.js could map it.
  //
  // The authoritative mapping now lives in src/lib/seo/legacy-redirect-map.mjs,
  // applied by src/proxy.js. Verify with: npm run migration:audit

  async redirects() {
    // ── DOMAIN MIGRATION ────────────────────────────────────────────────────
    // The legacy→canonical mapping now lives entirely in src/proxy.js
    // (Next.js 16 renamed middleware to proxy).
    //
    // DO NOT add host-scoped rules back here, especially a '/:path*' catch-all.
    // Next.js 16 runs next.config redirects BEFORE the proxy, so any catch-all
    // here consumed every legacy request and redirected it with the path
    // unchanged — a blind host swap that landed on 404s at nameverse.site.
    // That is what kept nameverse.vercel.app ranking for months.
    //
    // Legacy internal path fixes (host-agnostic) only:
    return [
      { source: '/baby-names/:path*', destination: '/names/:path*', permanent: true },
      { source: '/baby-names', destination: '/names', permanent: true },
      { source: '/name/:path*', destination: '/names/:path*', permanent: true },
      { source: '/article/:path*', destination: '/blog/:path*', permanent: true },
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