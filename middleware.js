/**
 * SEO FIREWALL MIDDLEWARE — Vercel Edge
 *
 * SINGLE-HOP REDIRECT ARCHITECTURE:
 * Every URL is normalized in ONE redirect, never multiple.
 * This eliminates redirect chains and redirect errors in GSC.
 *
 * Responsibilities:
 * 1. Normalize ALL URL issues in ONE pass (uppercase, trailing slash, etc.)
 * 2. Redirect non-canonical religion URLs → 301 to canonical
 * 3. Redirect old URL patterns → 301 to new canonical
 * 4. Validate route patterns against whitelist → 410 for invalid
 * 5. Allow system routes (API, assets) → pass through
 * 6. Allow valid application routes → pass through
 *
 * Page-level validation (dataset checks) happens in individual route handlers.
 */

import { NextResponse } from 'next/server';

const VALID_RELIGIONS = ['islamic', 'christian', 'hindu'];

// Valid static routes (must match app/ directory exactly)
const VALID_STATIC_ROUTES = new Set([
  '/',
  '/names',
  '/search',
  '/blog',
  '/about',
  '/privacy',
  '/terms',
  '/languages',
  '/popularity',
  '/name-meanings',
  '/names-by-meaning',
  '/unique-names',
  '/trending-names',
  '/advanced-search',
  '/my-names',
  '/guides/expert-naming-guide',
]);

// Valid gender listing pages
const VALID_GENDER_PAGES = new Set([
  '/islamic/boy-names',
  '/islamic/girl-names',
  '/christian/boy-names',
  '/christian/girl-names',
  '/hindu/boy-names',
  '/hindu/girl-names',
]);

// Old URL patterns that need 301 redirects to new locations
const OLD_URL_REDIRECTS = [
  // Old meaning pages → name-meanings listing
  { pattern: /^\/meaning\//, replacement: '/name-meanings' },
  // Old story pages → blog
  { pattern: /^\/stories\//, replacement: '/blog' },
  // Old religion pages → names listing
  { pattern: /^\/religions\//, replacement: '/names' },
  // Old API-based name pages → new canonical
  { pattern: /^\/api\/names\//, replacement: '/names' },
];

/**
 * Normalize religion name to canonical form
 */
function normalizeReligion(religion) {
  if (!religion) return null;
  const r = religion.toLowerCase().trim();
  if (r === 'islam' || r === 'muslim') return 'islamic';
  if (r === 'hinduism') return 'hindu';
  if (r === 'christianity') return 'christian';
  return VALID_RELIGIONS.includes(r) ? r : null;
}

/**
 * Validate a slug pattern: lowercase alphanumeric + hyphens only
 */
function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  const trimmed = slug.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  if (/^\d+$/.test(trimmed)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed);
}

/**
 * Validate page number
 */
function isValidPage(page) {
  if (!page) return false;
  const num = parseInt(page, 10);
  return !isNaN(num) && num >= 1 && num <= 1000;
}

/**
 * Validate single letter
 */
function isValidLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

/**
 * Check if path is a system/static route that should pass through
 */
function isSystemRoute(pathname) {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/feed.xml' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/sitemap-') ||
    pathname === '/manifest.json' ||
    pathname === '/ads.txt' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/dstar') ||
    /\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|json|xml|txt|woff|woff2|ttf|eot)$/i.test(pathname)
  );
}

/**
 * Normalize a URL path in a single pass.
 * Returns the normalized path or null if no normalization needed.
 */
function normalizePath(pathname) {
  let normalized = pathname;

  // Step 1: Lowercase
  normalized = normalized.toLowerCase();

  // Step 2: Remove trailing slash (except for root)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  // Step 3: Collapse double slashes
  normalized = normalized.replace(/\/+/g, '/');

  // Step 4: Check if any normalization happened.
  // IMPORTANT: compare against the ORIGINAL pathname, not pathname.toLowerCase(),
  // otherwise pure-case differences (e.g. /Names/Islamic/Abdullah/) would never
  // trigger a redirect and would instead fall through to a 404.
  if (normalized !== pathname) {
    return normalized;
  }

  return null; // No normalization needed
}

// Inline trace example (verified):
//   normalizePath('/Names/Islamic/Abdullah/')
//     -> lowercased  '/names/islamic/abdullah/'
//     -> trailing slash removed '/names/islamic/abdullah'
//     -> !== original '/Names/Islamic/Abdullah/'  => returns '/names/islamic/abdullah' (301)

/**
 * Handle old URL pattern redirects
 */
function handleOldUrlRedirect(path) {
  for (const { pattern, replacement } of OLD_URL_REDIRECTS) {
    if (pattern.test(path)) {
      return replacement;
    }
  }
  return null;
}

export function middleware(request) {
  const { pathname, host, protocol } = request.nextUrl;
  const path = pathname;
  const canonicalHost = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nameverse.site').replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase();
  const normalizedHost = (host || '').replace(/\.$/, '').toLowerCase();

  // Redirect old Vercel host or www to the canonical domain in ONE hop.
  if (normalizedHost === 'nameverse.vercel.app' || normalizedHost === 'www.nameverse.vercel.app' || normalizedHost === `www.${canonicalHost}`) {
    const url = new URL(request.url);
    url.hostname = canonicalHost;
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  if (normalizedHost === canonicalHost && protocol === 'http') {
    const url = new URL(request.url);
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // ── SYSTEM ROUTES: Pass through immediately ──
  if (isSystemRoute(path)) {
    return NextResponse.next();
  }

  // ── NON-ASCII / IPA / ENCODED CHARACTERS: 410 Gone ──
  if (/[^\x00-\x7F]/.test(path)) {
    return new NextResponse('Gone — This URL contains invalid characters and has been permanently removed.', {
      status: 410,
      headers: {
        'Content-Type': 'text/plain',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // ── PERCENT-ENCODED SEQUENCES: 410 Gone ──
  if (/%[0-9A-Fa-f]{2}/.test(path)) {
    return new NextResponse('Gone — This URL contains encoded invalid characters and has been permanently removed.', {
      status: 410,
      headers: {
        'Content-Type': 'text/plain',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // ── SINGLE-PASS URL NORMALIZATION ──
  // This handles: uppercase, trailing slash, double slashes ALL AT ONCE
  const normalizedPath = normalizePath(path);
  if (normalizedPath) {
    const search = request.nextUrl.search || '';
    return NextResponse.redirect(new URL(normalizedPath + search, request.url), 301);
  }

  // ── OLD URL PATTERN REDIRECTS ──
  const oldUrlRedirect = handleOldUrlRedirect(path);
  if (oldUrlRedirect) {
    return NextResponse.redirect(new URL(oldUrlRedirect, request.url), 301);
  }

  // ── RELIGION NORMALIZATION REDIRECTS ──
  // /names/islam/... → /names/islamic/...
  // /names/muslim/... → /names/islamic/...
  // /names/christianity/... → /names/christian/...
  // /names/hinduism/... → /names/hindu/...
  const religionMatch = path.match(/^\/names\/(islam|muslim|christianity|hinduism)(\/.*)?$/);
  if (religionMatch) {
    const canonicalReligion = normalizeReligion(religionMatch[1]);
    const rest = religionMatch[2] || '';
    return NextResponse.redirect(
      new URL(`/names/${canonicalReligion}${rest}`, request.url),
      301
    );
  }

  // ── STATIC ROUTES: Allow ──
  if (VALID_STATIC_ROUTES.has(path)) {
    return NextResponse.next();
  }

  // ── GENDER PAGES: Allow ──
  if (VALID_GENDER_PAGES.has(path)) {
    return NextResponse.next();
  }

  // ── DYNAMIC ROUTE VALIDATION ──
  const segments = path.split('/').filter(Boolean);

  // /names/[religion]/[slug]
  if (segments[0] === 'names' && segments.length === 3) {
    const religion = normalizeReligion(segments[1]);
    if (!religion) {
      return new NextResponse('Gone — Invalid religion.', {
        status: 410,
        headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
    }
    if (!isValidSlug(segments[2])) {
      return new NextResponse('Gone — Invalid URL slug.', {
        status: 410,
        headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
    }
    return NextResponse.next();
  }

  // /names/[religion]/letter/[letter]/[page]
  if (segments[0] === 'names' && segments[2] === 'letter' && segments.length === 5) {
    const religion = normalizeReligion(segments[1]);
    if (!religion || !isValidLetter(segments[3]) || !isValidPage(segments[4])) {
      return new NextResponse('Gone — Invalid URL.', {
        status: 410,
        headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
    }
    // Canonical letter pages use uppercase (sitemap-letter.xml only lists A-Z).
    // Redirect a lowercase/mixed-case letter to its uppercase canonical form
    // so /names/islamic/letter/a/1 → 301 /names/islamic/letter/A/1 instead of
    // returning a duplicate 200.
    if (segments[3] !== segments[3].toUpperCase()) {
      const canonical = `/names/${religion}/letter/${segments[3].toUpperCase()}/${segments[4]}`;
      return NextResponse.redirect(new URL(canonical, request.url), 301);
    }
    return NextResponse.next();
  }

  // /names/[religion]/origin/[origin]/[page]
  if (segments[0] === 'names' && segments[2] === 'origin' && segments.length === 5) {
    const religion = normalizeReligion(segments[1]);
    if (!religion || !isValidSlug(segments[3]) || !isValidPage(segments[4])) {
      return new NextResponse('Gone — Invalid URL.', {
        status: 410,
        headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
    }
    return NextResponse.next();
  }

  // /names/[religion]/categories/[category]/[page]
  if (segments[0] === 'names' && segments[2] === 'categories' && segments.length === 5) {
    const religion = normalizeReligion(segments[1]);
    if (!religion || !isValidSlug(segments[3]) || !isValidPage(segments[4])) {
      return new NextResponse('Gone — Invalid URL.', {
        status: 410,
        headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
    }
    return NextResponse.next();
  }

  // /names/religion/[religion]/[page]
  if (segments[0] === 'names' && segments[1] === 'religion' && segments.length === 4) {
    const religion = normalizeReligion(segments[2]);
    if (!religion || !isValidPage(segments[3])) {
      return new NextResponse('Gone — Invalid URL.', {
        status: 410,
        headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
    }
    return NextResponse.next();
  }

  // /blog/[slug]
  if (segments[0] === 'blog' && segments.length === 2) {
    if (!isValidSlug(segments[1])) {
      return new NextResponse('Gone — Invalid blog slug.', {
        status: 410,
        headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
    }
    return NextResponse.next();
  }

  // /search/[term] — allow ASCII search terms
  if (segments[0] === 'search' && segments.length === 2) {
    const term = segments[1];
    if (!term || term.length > 200 || /[^\x20-\x7E]/.test(term)) {
      return new NextResponse('Gone — Invalid search term.', {
        status: 410,
        headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
    }
    return NextResponse.next();
  }

  // /guides/[slug]
  if (segments[0] === 'guides' && segments.length === 2) {
    if (!isValidSlug(segments[1])) {
      return new NextResponse('Gone — Invalid guide slug.', {
        status: 410,
        headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
    }
    return NextResponse.next();
  }

  // ── UNKNOWN ROUTE: Let Next.js handle (will show not-found page) ──
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dstar/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};