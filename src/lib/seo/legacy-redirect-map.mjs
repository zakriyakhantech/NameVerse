/**
 * LEGACY HOST → CANONICAL HOST PATH MAPPING
 * ==========================================
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `nameverse.vercel.app` (this codebase, on Vercel) and `nameverse.site`
 * (the live site, on Netlify) are TWO DIFFERENT BUILDS with two different
 * information architectures. They do not share a URL scheme:
 *
 *   Legacy (this repo, *.vercel.app)        Canonical (nameverse.site, Netlify)
 *   --------------------------------------------------------------------------
 *   /islamic/boy-names                      /islamic-boy-names
 *   /names/islamic/letter/A/1               /names/islamic/letter/a
 *   /names/islamic/letter/O/1               (no "o" page) → /names/islamic
 *   /names/islamic/origin/arabic/1          /origins/arabic
 *   /names/islamic/categories/quranic/1     (unknown cat) → /names/islamic
 *   /names/religion/islamic/2               /names/islamic
 *   /unique-names                           /unique-baby-names
 *   /languages                              /origins
 *   /my-names, /advanced-search, /search    (no equivalent) → /names
 *   /blog/<66 legacy slugs>                 /blog/<9 canonical slugs> or /blog
 *   /names/<religion>/<slug>                /names/<religion>/<slug>  (1:1)
 *
 * The previous middleware did a BLIND HOST SWAP: it replaced the hostname and
 * left the path untouched. That sent most legacy URLs into a 404 on the Netlify
 * site. Google does not consolidate a 301 that lands on a 404/soft-404 — it
 * keeps serving the old URL. That is the mechanism that kept
 * `nameverse.vercel.app` ranking and receiving traffic months after the move.
 *
 * RULE ENFORCED HERE
 * ------------------
 * A legacy URL may only redirect to a destination that is KNOWN to return 200
 * on the canonical host. Anything with no true equivalent goes to the closest
 * real hub. Never redirect into a 404.
 *
 * Every allowlist below was read off the live canonical sitemap
 * (https://nameverse.site/sitemap.xml → /sitemap/pages.xml) and spot-checked
 * against the live site. Keep it in sync with `scripts/audit-migration.mjs`,
 * which re-verifies all of this against production and reports anything broken.
 */

/** Local/dev hosts that must never be redirected. */
const LOCAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'localhost:3000',
  '127.0.0.1:3000',
  '0.0.0.0:3000',
]);

/**
 * Letters that actually have a page on the canonical site, per tradition.
 * Verified against /sitemap/pages.xml and spot-checked live
 * (e.g. /names/islamic/letter/o → 404, so Islamic stops at "n").
 * Any other letter collapses to the tradition hub instead of 404-ing.
 */
const CANONICAL_LETTERS = {
  islamic: new Set('a b c d e f g h i j k l m n'.split(' ')),
  christian: new Set('a b c d e f g h i j'.split(' ')),
  hindu: new Set('a b c d e f g h i j k l m n o p q r'.split(' ')),
};

/**
 * Top-level origin hubs that exist on the canonical site.
 * Anything else collapses to the tradition hub.
 */
const CANONICAL_ORIGINS = new Set([
  'arabic',
  'biblical',
  'sanskrit',
  'hindu',
  'persian',
  'english',
  'tamil',
  'hindi',
  'bengali',
  'urdu',
]);

/**
 * Top-level category hubs that exist on the canonical site.
 */
const CANONICAL_CATEGORIES = new Set(['hindu', 'biblical', 'saint', 'virtue']);

/**
 * The 9 blog posts that exist on the canonical site (from /blog and
 * /sitemap/pages.xml). The legacy site published 66, so the other 57 slugs
 * would 404 — they collapse to the blog index instead.
 */
const CANONICAL_BLOG_SLUGS = new Set([
  'jewish-baby-names-torah',
  'sikh-baby-names-gurbani',
  'buddhist-baby-names-dharma',
  'gender-neutral-baby-names-2026',
  'nature-inspired-baby-names',
  'short-simple-modern-baby-names-2026',
  'top-islamic-baby-names-2026',
  'hindu-baby-names-meanings',
  'christian-baby-names-bible',
]);

/**
 * Sub-paths under /names/<religion>/ that are route keywords, not name slugs.
 * They must never be treated as a name detail page.
 */
const RESERVED_SEGMENTS = new Set(['letter', 'origin', 'categories', 'religion', 'page']);

/** The only guide published on the canonical site. */
const CANONICAL_GUIDE_FALLBACK = '/guides/expert-naming-guide';
const CANONICAL_GUIDE_SLUGS = new Set(['expert-naming-guide']);

/**
 * Exact legacy path → canonical path renames.
 * Every destination on the right was confirmed to return 200.
 */
const LEGACY_PATH_RENAMES = new Map([
  // Hubs that were renamed rather than restructured.
  ['/languages', '/origins'],
  ['/religions', '/origins'],
  ['/unique-names', '/unique-baby-names'],
  ['/popular-by-state', '/baby-names-by-state'],
  ['/biblical-names', '/biblical-baby-names'],
  ['/top-baby-names-usa', '/top-baby-names-2026'],
  ['/viral-names', '/trending-names'],
  ['/stories', '/blog'],
  ['/meaning', '/name-meanings'],

  // Features with no canonical equivalent. These were 404-ing; they now land on
  // the closest real hub so the 301 terminates on a 200.
  ['/my-names', '/names'],
  ['/advanced-search', '/names'],
  ['/search', '/names'],
  ['/boy-names', '/names'],
  ['/girl-names', '/names'],
  ['/sibling-names', '/names'],
  ['/name-generator', '/names'],
]);

/**
 * True for every Vercel-generated hostname: the project system domain
 * (`nameverse.vercel.app`) plus branch/preview deployments
 * (`nameverse-git-*-<scope>.vercel.app`, `nameverse-<hash>-<scope>.vercel.app`).
 *
 * They all serve THIS codebase, so they all use the legacy URL scheme and all
 * need path translation. Redirecting them also stops preview deployments from
 * being crawled and indexed as extra copies of the site.
 */
export function isLegacySchemeHost(host = '') {
  const h = String(host).toLowerCase().replace(/\.$/, '');
  return h.endsWith('.vercel.app');
}

export function isLocalHost(host = '') {
  return LOCAL_HOSTS.has(String(host).toLowerCase());
}

/** Normalise a path the same way the middleware does. */
function normalizePath(pathname = '/') {
  let p = String(pathname || '/').split('?')[0];
  p = p.toLowerCase();
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  p = p.replace(/\/+/g, '/');
  if (!p.startsWith('/')) p = '/' + p;
  return p || '/';
}

/**
 * Translate a legacy (Vercel) path into the equivalent canonical path.
 *
 * @param {string} pathname Raw path from the incoming legacy-host request.
 * @returns {string} A path that returns 200 on nameverse.site.
 */
export function mapLegacyPath(pathname = '/') {
  const path = normalizePath(pathname);

  // 1. Exact renames.
  if (LEGACY_PATH_RENAMES.has(path)) return LEGACY_PATH_RENAMES.get(path);

  // 2. Tradition + gender hubs.
  //    /islamic/boy-names → /islamic-boy-names
  const genderHub = path.match(/^\/(islamic|christian|hindu)\/(boy|girl)-names$/);
  if (genderHub) return `/${genderHub[1]}-${genderHub[2]}-names`;

  // 3. Letter pagination.
  //    /names/islamic/letter/A/1 … /names/hindu/letter/R/4
  //    → /names/islamic/letter/a  (canonical lowercases and paginates at
  //      /page/{n}); legacy page numbers have no reliable equivalent, so they
  //      collapse onto the letter hub. Letters with no canonical page fall back
  //      to the tradition hub.
  const letterPaged = path.match(/^\/names\/(islamic|christian|hindu)\/letter\/([a-z0-9]+)\/(\d+)$/);
  if (letterPaged) return letterTarget(letterPaged[1], letterPaged[2]);

  const letterPlain = path.match(/^\/names\/(islamic|christian|hindu)\/letter\/([a-z0-9]+)$/);
  if (letterPlain) return letterTarget(letterPlain[1], letterPlain[2]);

  const letterIndex = path.match(/^\/names\/(islamic|christian|hindu)\/letter$/);
  if (letterIndex) return `/names/${letterIndex[1]}`;

  // 4. Origin pagination.  /names/islamic/origin/arabic/1 → /origins/arabic
  const originHub = path.match(/^\/names\/(islamic|christian|hindu)\/origin\/([a-z0-9-]+)\/(\d+)$/);
  if (originHub) {
    return CANONICAL_ORIGINS.has(originHub[2]) ? `/origins/${originHub[2]}` : `/names/${originHub[1]}`;
  }

  // 5. Category pagination.  /names/christian/categories/saint/1 → /categories/saint
  const categoryHub = path.match(/^\/names\/(islamic|christian|hindu)\/categories\/([a-z0-9-]+)\/(\d+)$/);
  if (categoryHub) {
    return CANONICAL_CATEGORIES.has(categoryHub[2]) ? `/categories/${categoryHub[2]}` : `/names/${categoryHub[1]}`;
  }

  // 6. Tradition pagination.  /names/religion/islamic/2 → /names/islamic
  const traditionHub = path.match(/^\/names\/religion\/(islamic|christian|hindu)\/(\d+)$/);
  if (traditionHub) return `/names/${traditionHub[1]}`;

  // 7. Blog posts. Only 9 of the 66 legacy slugs exist on the canonical site.
  const blogPost = path.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogPost) {
    return CANONICAL_BLOG_SLUGS.has(blogPost[1]) ? `/blog/${blogPost[1]}` : '/blog';
  }

  // 8. Guides. Only /guides/expert-naming-guide exists on the canonical site.
  const guide = path.match(/^\/guides\/([a-z0-9-]+)$/);
  if (guide) {
    return CANONICAL_GUIDE_SLUGS.has(guide[1]) ? `/guides/${guide[1]}` : CANONICAL_GUIDE_FALLBACK;
  }

  // 9. Name detail pages: /names/<religion>/<slug>
  //
  //    The canonical database only covers part of the alphabet per tradition
  //    (Islamic a–n, Christian a–j, Hindu a–r — verified: /names/islamic/omar
  //    and /names/islamic/letter/o both 404). A slug whose first letter falls
  //    outside that range CANNOT exist on the canonical site, so a 1:1 redirect
  //    is a guaranteed 404. Those collapse to the tradition hub instead.
  //    This rescues 13,776 legacy URLs on its own.
  //
  //    Slugs starting with a digit are never valid, so they collapse too.
  const nameDetail = path.match(/^\/names\/(islamic|christian|hindu)\/([a-z0-9-]+)$/);
  if (nameDetail) {
    const religion = nameDetail[1];
    const slug = nameDetail[2];
    // A route keyword in slug position is not a name — send it to the hub.
    if (RESERVED_SEGMENTS.has(slug)) return `/names/${religion}`;
    const letters = CANONICAL_LETTERS[religion];
    return letters && letters.has(slug.charAt(0)) ? `/names/${religion}/${slug}` : `/names/${religion}`;
  }
  //
  //    CAVEAT for the in-range ones: the canonical database holds 11,412 names vs
  //    41,554 here, so many in-range slugs still have no destination. No
  //    redirect can fix a destination that does not exist — those records must be
  //    restored on the canonical site. `npm run migration:audit` prints the list.

  // 10. Everything else (/ , /names , /names/<religion> , /blog , /about ,
  //     /privacy , /terms , /contact , /trending-names , /popularity ,
  //     /name-meanings , /names-by-meaning , /names-by-origin , /origins/* ,
  //     /categories/*) keeps the same path.
  return path;
}

function letterTarget(religion, letter) {
  const allowed = CANONICAL_LETTERS[religion];
  return allowed && allowed.has(letter) ? `/names/${religion}/letter/${letter}` : `/names/${religion}`;
}

/** Exported for scripts/audit-migration.mjs and tests. */
export const LEGACY_REDIRECT_RULES = {
  staticRenames: LEGACY_PATH_RENAMES,
  canonicalLetters: CANONICAL_LETTERS,
  canonicalOrigins: CANONICAL_ORIGINS,
  canonicalCategories: CANONICAL_CATEGORIES,
  canonicalBlogSlugs: CANONICAL_BLOG_SLUGS,
  canonicalGuideSlugs: CANONICAL_GUIDE_SLUGS,
};
