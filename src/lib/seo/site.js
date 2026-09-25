/**
 * Single source of truth for public site URL (no trailing slash)
 * SEO-safe + canonical-safe version
 *
 * Set NEXT_PUBLIC_SITE_URL in Vercel to your production domain, such as:
 * https://nameverse.site
 */

const rawSiteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://nameverse.site"
).trim();

// Guarantee a protocol so consumers using `new URL(SITE_URL)` never throw
// (e.g. an env value like "localhost:3000" without a scheme).
const normalizedSiteUrl = /^https?:\/\//i.test(rawSiteUrl)
  ? rawSiteUrl
  : `https://${rawSiteUrl}`;

export const SITE_URL = normalizedSiteUrl.replace(/\/+$/, ""); // removes ALL trailing slashes safely

/**
 * Normalize path to avoid duplicate URL issues:
 * /page, page, //page -> /page
 */
function normalizePath(path = "") {
  if (!path) return "";

  // if full URL, return as-is
  if (/^https?:\/\//i.test(path)) return path;

  // remove spaces + fix multiple slashes
  let clean = path.trim().replace(/\/+/g, "/");

  // ensure single leading slash
  if (!clean.startsWith("/")) {
    clean = "/" + clean;
  }

  return clean;
}

/**
 * Base site URL
 */
export function getSiteUrl() {
  return SITE_URL;
}

/**
 * Absolute URL builder (SEO-safe)
 * Used for:
 * - OG tags
 * - canonical URLs
 * - sitemap URLs
 */
export function absoluteUrl(path) {
  if (!path) return SITE_URL;

  if (/^https?:\/\//i.test(path)) return path;

  const cleanPath = normalizePath(path);

  return `${SITE_URL}${cleanPath}`;
}

/**
 * Canonical URL helper (VERY IMPORTANT FOR YOUR INDEXING ISSUES)
 */
export function canonicalUrl(path) {
  return absoluteUrl(path).split("?")[0]; // removes query params
}

/**
 * Safe OG image generator
 */
export function ogImageUrl(path = "/logo.png") {
  return absoluteUrl(path || "/logo.png");
}

export const DEFAULT_OG_PATH = "/logo.png";