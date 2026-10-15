/**
 * LEGACY HOST → CANONICAL HOST PATH MAPPING
 * ==========================================
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `nameverse.vercel.app` (this codebase) and `nameverse.site` (the current live
 * site) no longer share the same URL scheme. They are two different builds with
 * two different information architectures:
 *
 *   Legacy (this repo, on Vercel)     Canonical (nameverse.site)
 *   ------------------------------------------------------------------------
 *   /islamic/boy-names                /islamic-boy-names
 *   /names/islamic/letter/A/1         /names/islamic/letter/a
 *   /names/islamic/origin/arabic/1    /origins/arabic
 *   /names/islamic/categories/quranic/1  /categories/biblical (quranic: n/a)
 *   /names/religion/islamic/2         /names/islamic
 *   /unique-names                     /unique-baby-names
 *   /languages                        /origins
 *   /my-names, /advanced-search       (no equivalent → /names)
 *   /names/<religion>/<slug>          /names/<religion>/<slug>   (same — 1:1)
 *
 * The previous middleware did a *blind host swap*: it only replaced the
 * hostname and kept the path identical. That sent a large share of legacy URLs
 * to a 404 on the new site. When Google follows a 301 into a 404/soft-404 it
 * does not consolidate — it keeps serving the old URL. That is the mechanism
 * that kept `nameverse.vercel.app` alive in the results months after the move.
 *
 * RULE ENFORCED HERE
 * ------------------
 * A legacy URL is only allowed to redirect to a destination that is known to
 * return 200 on the canonical host. Anything with no true equivalent is sent to
 * the closest relevant hub — never to a 404.
 *
 * Keep this table in sync with `scripts/audit-migration.mjs`, which verifies
 * every rule against the live site and reports any destination that 404s.
 */

/** Religions that exist as listing hubs on BOTH sites. */
const VALID_RELIGIONS = ['islamic', 'christian', 'hindu'];

/**
 * Top-level origin hubs that actually exist on nameverse.site.
 * Anything else collapses to the religion hub rather than 404-ing.
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
 * Top-level category hubs that actually exist on nameverse.site.
 */
const CANONICAL_CATEGORIES = new Set(['hindu', 'biblical', 'saint', 'virtue']);

/**
 * Exact legacy path → canonical path renames.
 * Only entries verified to return 200 on nameverse.site belong here.
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

  // Features that do not exist on the canonical site. These are the pages most
  // likely to be 404-ing today. They collapse to the closest real hub so the
  // 301 lands on a 200 instead of an error page.
  ['/my-names', '/names'],
  ['/advanced-search', '/names'],
  ['/boy-names', '/names'],
  ['/girl-names', '/names'],
  ['/sibling-names', '/names'],
  ['/name-generator', '/names'],
]);

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
 * True for every Vercel-generated hostname: the project system domain
 * (`nameverse.vercel.app`) as well as branch/preview deployments
 * (`nameverse-git-*-<scope>.vercel.app`, `nameverse-<hash>-<scope>.vercel.app`).
 *
 * These all serve THIS codebase, so they all use the legacy URL scheme and all
 * need path translation. Redirecting them also stops preview deployments from
 * being crawled and indexed as a third copy of the site.
 */
export function isLegacySchemeHost(host = '') {
  const h = String(host).toLowerCase().replace(/\.$/, '');
  return h === 'nameverse.vercel.app' || h.endsWith('.vercel.app');
}

export function isLocalHost(host = '') {
  return LOCAL_HOSTS.has(String(host).toLowerCase());
}

/** Normalise a path in the same way the middleware does. */
function normalizePath(pathname = '/') {
  let p = String(pathname || '/');
  p = p.split('?')[0];
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
 * @returns {string} A path that is intended to return 200 on nameverse.site.
 */
export function mapLegacyPath(pathname = '/') {
  const path = normalizePath(pathname);

  // 1. Exact renames.
  if (LEGACY_PATH_RENAMES.has(path)) {
    return LEGACY_PATH_RENAMES.get(path);
  }

  // 2. /{religion}/{boy|girl}-names → /{religion}-{boy|girl}-names
  //    Legacy: /islamic/boy-names  Canonical: /islamic-boy-names
  const genderHub = path.match(/^\/(islamic|christian|hindu)\/(boy|girl)-names$/);
  if (genderHub) {
    return `/${genderHub[1]}-${genderHub[2]}-names`;
  }

  // 3. Letter pagination.
  //    Legacy: /names/islamic/letter/A/1 … /names/islamic/letter/A/9
  //    Canonical: /names/islamic/letter/a   (+ /page/{n} for deeper pages)
  //
  //    The canonical site lowercases the letter and paginates far less
  //    aggressively than the legacy site, so a legacy page number has no
  //    reliable equivalent. Every legacy page is collapsed onto the letter hub,
  //    which always contains the full A–Z list for that tradition. That
  //    guarantees a 200 and consolidates ranking signals on the strongest URL.
  const letterHub = path.match(/^\/names\/(islamic|christian|hindu)\/letter\/([a-z0-9]+)\/(\d+)$/);
  if (letterHub) {
    return `/names/${letterHub[1]}/letter/${letterHub[2]}`;
  }
  const plainLetter = path.match(/^\/names\/(islamic|christian|hindu)\/letter\/([a-z0-9]+)$/);
  if (plainLetter) {
    return `/names/${plainLetter[1]}/letter/${plainLetter[2]}`;
  }

  // 4. Origin pagination.
  //    Legacy: /names/islamic/origin/arabic/1   Canonical: /origins/arabic
  //    Unknown origins collapse to the religion hub instead of 404-ing.
  const originHub = path.match(/^\/names\/(islamic|christian|hindu)\/origin\/([a-z0-9-]+)\/(\d+)$/);
  if (originHub) {
    const [, religion, origin] = originHub;
    return CANONICAL_ORIGINS.has(origin) ? `/origins/${origin}` : `/names/${religion}`;
  }

  // 5. Category pagination.
  //    Legacy: /names/islamic/categories/quranic/1  → /categories/... (if known)
  //    The canonical site only publishes a handful of categories, so unknown
  //    ones fall back to the religion hub.
  const categoryHub = path.match(/^\/names\/(islamic|christian|hindu)\/categories\/([a-z0-9-]+)\/(\d+)$/);
  if (categoryHub) {
    const [, religion, category] = categoryHub;
    return CANONICAL_CATEGORIES.has(category) ? `/categories/${category}` : `/names/${religion}`;
  }

  // 6. Religion pagination.
  //    Legacy: /names/religion/islamic/1 … /99   Canonical: /names/islamic
  const religionHub = path.match(/^\/names\/religion\/(islamic|christian|hindu)\/(\d+)$/);
  if (religionHub) {
    return `/names/${religionHub[1]}`;
  }

  // 7. Name detail pages keep a 1:1 mapping and need no translation:
  //    /names/<religion>/<slug> → /names/<religion>/<slug>
  //
  //    NOTE: the canonical database holds fewer names than the legacy database,
  //    so some slugs legitimately have no destination. Run
  //    `node scripts/audit-migration.mjs` to get the exact list; the real fix for
  //    those is restoring the missing records on the canonical site, not another
  //    redirect.

  // 8. Everything else (/ , /names , /blog , /about , /privacy , /terms ,
  //    /contact , /trending-names , /popularity , /name-meanings ,
  //    /names-by-meaning , /names-by-origin , /guides/... , /blog/<slug> ,
  //    /names/<religion> , /names/<religion>/<slug>) keeps the same path.
  return path;
}

/** Exported for the audit script and for unit tests. */
export const LEGACY_REDIRECT_RULES = {
  staticRenames: LEGACY_PATH_RENAMES,
  canonicalOrigins: CANONICAL_ORIGINS,
  canonicalCategories: CANONICAL_CATEGORIES,
  religions: VALID_RELIGIONS,
};
