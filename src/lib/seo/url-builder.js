/**
 * SINGLE SOURCE OF TRUTH for all NameVerse URLs
 * 
 * Every URL on the site MUST go through this file.
 * Database, sitemap, internal links, breadcrumbs, canonicals,
 * structured data — ALL use the same builder.
 * 
 * RULES ENFORCED:
 * 1. Lowercase only
 * 2. No trailing slashes
 * 3. Only valid ASCII a-z0-9-hyphen slugs
 * 4. Absolute URLs for canonicals
 * 5. Relative paths for internal links
 * 6. Consistent religion names: islamic, christian, hindu
 * 7. Reject invalid slugs (empty, single char, numeric-only)
 */

import { getSiteUrl } from './site.js';

// Valid route prefixes (must match middleware whitelist)
const VALID_RELIGIONS = ['islamic', 'christian', 'hindu'];

// Valid slug pattern
const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Reserved words that cannot be used as slugs
const RESERVED_SLUGS = new Set([
  'admin', 'api', 'blog', 'category', 'categories', 'guide', 'guides',
  'letter', 'letters', 'name', 'names', 'origin', 'origins', 'page',
  'pages', 'religion', 'religions', 'search', 'tag', 'tags',
]);

/**
 * Create a safe lowercase URL slug from any string.
 * Returns empty string for invalid inputs.
 */
export function createSlug(input = '') {
  if (!input || typeof input !== 'string') return '';
  
  const cleaned = String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove non-ASCII, special chars
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')     // Spaces to hyphens
    .replace(/-+/g, '-')      // Collapse multiple hyphens
    .replace(/^-|-$/g, '');   // Trim leading/trailing hyphens

  // Reject invalid slugs
  if (cleaned.length < 2) return '';
  if (/^\d+$/.test(cleaned)) return '';
  if (RESERVED_SLUGS.has(cleaned)) return '';

  return cleaned;
}

/**
 * Validate a slug follows canonical format
 */
export function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  const cleaned = slug.toLowerCase().trim();
  if (cleaned.length < 2 || cleaned.length > 100) return false;
  if (/^\d+$/.test(cleaned)) return false;
  if (RESERVED_SLUGS.has(cleaned)) return false;
  return VALID_SLUG.test(cleaned);
}

/**
 * Normalize religion name to canonical form
 */
export function normalizeReligion(religion) {
  if (!religion) return null;
  const r = religion.toLowerCase().trim();
  if (r === 'islam' || r === 'muslim') return 'islamic';
  if (r === 'christianity') return 'christian';
  if (r === 'hinduism') return 'hindu';
  return VALID_RELIGIONS.includes(r) ? r : null;
}

/**
 * Build a RELATIVE URL for a name page
 * Used by: internal links, breadcrumbs, navigation
 * 
 * @param {string} religion - islamic/christian/hindu
 * @param {string} slug - valid lowercase slug
 * @returns {string|null} e.g. /names/islamic/abdullah or null if invalid
 */
export function nameRelativeUrl(religion, slug) {
  const r = normalizeReligion(religion);
  const s = createSlug(slug);
  if (!r || !s || !isValidSlug(s)) return null;
  return `/names/${r}/${s}`;
}

/**
 * Build an ABSOLUTE URL for a name page
 * Used by: canonical tags, sitemap, structured data, OG tags
 * 
 * @param {string} religion - islamic/christian/hindu
 * @param {string} slug - valid lowercase slug
 * @returns {string|null} e.g. https://nameverse.site/names/islamic/abdullah or null if invalid
 */
export function nameAbsoluteUrl(religion, slug) {
  const relative = nameRelativeUrl(religion, slug);
  if (!relative) return null;
  return `${getSiteUrl()}${relative}`;
}

/**
 * Build a RELATIVE URL for a collection/listing page
 * 
 * @param {string} type - religion/letter/origin/categories
 * @param {string} religion - islamic/christian/hindu
 * @param {string} value - letter, origin, or category name
 * @param {number} page - page number (default 1)
 * @returns {string|null} e.g. /names/religion/islamic/1 or null if invalid
 */
export function collectionRelativeUrl(type, religion, value, page = 1) {
  const r = normalizeReligion(religion);
  if (!r) return null;
  
  const p = Math.max(1, parseInt(page) || 1);
  
  const typeMap = {
    religion: `/names/religion/${r}`,
    letter: `/names/${r}/letter/${(value || '').toUpperCase()}`,
    origin: `/names/${r}/origin/${createSlug(value || '')}`,
    categories: `/names/${r}/categories/${createSlug(value || '')}`,
  };
  
  const base = typeMap[type];
  if (!base) return null;
  
  return `${base}/${p}`;
}

/**
 * Build an ABSOLUTE URL for a collection page
 */
export function collectionAbsoluteUrl(type, religion, value, page = 1) {
  const relative = collectionRelativeUrl(type, religion, value, page);
  if (!relative) return null;
  return `${getSiteUrl()}${relative}`;
}

/**
 * Validate a complete name page URL path
 * Returns true if the path is a valid name page URL
 */
export function isValidNamePath(path) {
  if (!path || typeof path !== 'string') return false;
  const segments = path.split('/').filter(Boolean);
  if (segments.length !== 3) return false;
  if (segments[0] !== 'names') return false;
  if (!normalizeReligion(segments[1])) return false;
  return isValidSlug(segments[2]);
}

export default {
  createSlug,
  isValidSlug,
  normalizeReligion,
  nameRelativeUrl,
  nameAbsoluteUrl,
  collectionRelativeUrl,
  collectionAbsoluteUrl,
  isValidNamePath,
};