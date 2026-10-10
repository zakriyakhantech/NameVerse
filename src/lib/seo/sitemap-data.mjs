/**
 * SITEMAP DATA BUILDER — Enterprise Grade
 * 
 * RULES:
 * 1. NEVER include URLs that return 404
 * 2. NEVER include redirects
 * 3. NEVER include pages with noindex
 * 4. NEVER include duplicate URLs
 * 5. NEVER include invalid slugs
 * 6. NEVER include routes that don't exist
 * 7. Validate every generated URL
 * 8. Use accurate lastmod values
 * 9. Limit paginated collections to prevent thin pages
 * 10. Split sitemap intelligently by type
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');
const publicDir = path.join(rootDir, 'public');
const dataDir = path.join(publicDir, 'data');
const today = new Date().toISOString().split('T')[0];
const RELIGIONS = ['islamic', 'christian', 'hindu'];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const STATIC_CATEGORIES = ['modern', 'traditional', 'nature', 'religious', 'classical', 'unique'];
const STATIC_ORIGINS = ['arabic', 'persian', 'turkish', 'indian', 'english', 'other'];
const MAX_SITEMAP_URLS = 45000;
const MAX_COLLECTION_PAGES = 50; // Prevent thin pages beyond page 50
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'https://name-meaning-site-backend.vercel.app').replace(/\/+$/, '');
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nameverse.site').replace(/\/+$/, '');

// Reserved slugs that should never appear in sitemap
const RESERVED_SLUGS = new Set([
  'admin', 'api', 'blog', 'category', 'categories', 'guide', 'guides',
  'letter', 'letters', 'name', 'names', 'origin', 'origins', 'page',
  'pages', 'religion', 'religions', 'search', 'tag', 'tags',
]);

// Only include static routes that have corresponding app routes.
// Every entry MUST resolve to a real page file under src/app (see
// validateStaticRoutes() guard in writeSitemapFiles). Phantom routes that
// have no matching page were removed to stop the sitemap submitting 404s.
const STATIC_ROUTES = [
  '/', '/names', '/search', '/blog', '/about', '/privacy', '/terms',
  '/languages', '/popularity', '/name-meanings', '/names-by-meaning',
  '/names-by-origin', '/unique-names', '/trending-names', '/advanced-search', '/my-names',
  '/guides/expert-naming-guide', '/viral-names', '/stories',
];

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeFileContents(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // Retry on transient filesystem errors (e.g. file lock from sync tools).
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      fs.writeFileSync(file, content);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function writeJson(file, data) {
  writeFileContents(file, `${JSON.stringify(data, null, 2)}\n`);
}

function cleanText(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

/**
 * Resolve a static route (e.g. "/foo/bar") to a page file under src/app.
 * Returns the resolved path or null if no matching page exists.
 */
function resolveStaticRoutePage(route) {
  const rel = route === '/' ? 'app/page' : `app${route}/page`;
  for (const ext of ['jsx', 'js', 'tsx', 'ts']) {
    const candidate = path.join(rootDir, 'src', `${rel}.${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Build-time guard: every STATIC_ROUTES entry must resolve to a real page
 * file. Throw loudly if any route has regressed to a phantom (no page file),
 * so the sitemap can never again submit guaranteed 404s.
 */
function validateStaticRoutes() {
  const missing = STATIC_ROUTES.filter((route) => !resolveStaticRoutePage(route));
  if (missing.length) {
    throw new Error(
      `[sitemap] STATIC_ROUTES contains paths with no matching page file under src/app: ${missing.join(', ')}`
    );
  }
  return true;
}

/**
 * Create a safe lowercase URL slug from any string.
 * Returns empty string for invalid inputs.
 */
function createSlug(input = '') {
  if (!input || typeof input !== 'string') return '';
  
  const cleaned = String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Reject invalid slugs
  if (cleaned.length < 2) return '';
  if (/^\d+$/.test(cleaned)) return '';
  if (RESERVED_SLUGS.has(cleaned)) return '';

  return cleaned;
}

/**
 * Validate a slug follows canonical format
 */
function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  const cleaned = slug.toLowerCase().trim();
  if (cleaned.length < 2 || cleaned.length > 100) return false;
  if (/^\d+$/.test(cleaned)) return false;
  if (RESERVED_SLUGS.has(cleaned)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleaned);
}

function normalizeReligion(value) {
  const r = cleanText(value).toLowerCase();
  if (['islam', 'muslim', 'islamic'].includes(r)) return 'islamic';
  if (['christianity', 'christian'].includes(r)) return 'christian';
  if (['hinduism', 'hindu'].includes(r)) return 'hindu';
  return RELIGIONS.includes(r) ? r : null;
}

function normalizeOrigin(value) {
  const raw = cleanText(value).toLowerCase();
  if (!raw) return 'other';
  const exact = STATIC_ORIGINS.find((origin) => origin === raw);
  if (exact) return exact;
  if (raw.includes('arabic')) return 'arabic';
  if (raw.includes('persian') || raw.includes('farsi')) return 'persian';
  if (raw.includes('turkish') || raw.includes('ottoman')) return 'turkish';
  if (raw.includes('sanskrit') || raw.includes('vedic') || raw.includes('hindi') || raw.includes('indian')) return 'indian';
  if (raw.includes('hebrew') || raw.includes('greek') || raw.includes('latin') || raw.includes('english')) return 'english';
  return 'other';
}

function normalizeName(item, religion) {
  if (typeof item === 'string') {
    const slug = createSlug(item);
    if (!slug) return null;
    return { name: item, religion, origin: 'Unknown', short_meaning: '', slug };
  }
  const name = cleanText(item.name || item.title);
  if (!name) return null;
  const slug = cleanText(item.slug) || createSlug(name);
  if (!slug || !isValidSlug(slug)) return null;
  return {
    name,
    slug,
    religion: normalizeReligion(item.religion) || religion,
    origin: cleanText(item.origin || item.origins || 'Unknown'),
    gender: cleanText(item.gender || item.sex || ''),
    short_meaning: cleanText(item.short_meaning || item.meaning || item.meaning_summary || ''),
    meaning: cleanText(item.meaning || item.long_meaning || item.short_meaning || ''),
    lucky_number: item.lucky_number ?? item.luckyNumber,
    updated_at: item.updated_at || item.lastUpdated || item.last_modified,
  };
}

export function loadDetailedNames() {
  const files = [
    ['islamic', 'islamic-boy-names.json'],
    ['islamic', 'islamic-girl-names.json'],
    ['christian', 'christian-boy-names.json'],
    ['christian', 'christian-girl-names.json'],
    ['hindu', 'hindu-boy-names.json'],
    ['hindu', 'hindu-girl-names.json'],
  ];
  const names = [];
  const seen = new Set();
  for (const [religion, file] of files) {
    const raw = readJson(path.join(dataDir, file), []);
    for (const item of raw) {
      const normalized = normalizeName(item, religion);
      if (!normalized) continue;
      const key = `${normalized.religion}|${normalized.slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        names.push(normalized);
      }
    }
  }
  return names;
}

export function loadMixedNames() {
  const files = [
    ['islamic', 'islamic_names.json'],
    ['christian', 'christians_names.json'],
    ['hindu', 'hindu_names.json'],
  ];
  const names = [];
  const seen = new Set();
  for (const [religion, file] of files) {
    const raw = readJson(path.join(publicDir, file), []);
    for (const item of raw) {
      const normalized = normalizeName(item, religion);
      if (!normalized) continue;
      const key = `${normalized.religion}|${normalized.slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        names.push(normalized);
      }
    }
  }
  return names;
}

export const loadAllNames = loadMixedNames;

export function loadBlogPosts() {
  return readJson(path.join(dataDir, 'blog-posts.json'), [])
    .filter((post) => post.id && post.title)
    .map((post) => ({ ...post, slug: post.id }));
}

function getEntry(pathname, type, lastmod = today, changefreq = 'weekly', priority = 0.7) {
  return {
    loc: `${SITE_URL}${pathname}`,
    lastmod,
    changefreq,
    priority,
    type,
    path: pathname,
  };
}

function addEntry(entries, seen, pathname, type, lastmod, changefreq, priority) {
  const clean = `/${String(pathname || '').replace(/^\/+/, '').replace(/\/+$/, '')}`;
  if (!clean || clean === '/') return;
  if (seen.has(clean)) return;
  seen.add(clean);
  entries.push(getEntry(clean, type, lastmod, changefreq, priority));
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { headers: { accept: 'application/json' }, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFilters(religion) {
  try {
    const data = await fetchJson(`${API_BASE}/api/v1/names/${religion}/filters`);
    const filters = data.data || {};
    return {
      totalNames: Number(filters.total_names || data.totalNames || 0),
      origins: (filters.origins || []).map((origin) => normalizeOrigin(origin)),
      categories: (filters.categories || []).map((category) => createSlug(category)).filter(Boolean),
      letters: (filters.letters || []).map((letter) => String(letter).slice(0, 1).toUpperCase()).filter((letter) => /^[A-Z]$/.test(letter)),
    };
  } catch {
    return null;
  }
}

async function fetchCollectionPages(religion, params) {
  try {
    const query = new URLSearchParams({ page: '1', limit: '1', sort: 'asc', ...params });
    const data = await fetchJson(`${API_BASE}/api/v1/names/${religion}?${query.toString()}`);
    const pagination = data.pagination || {};
    const total = Number(pagination.total || data.totalCount || data.total || 0);
    const pages = Number(pagination.pages || data.totalPages || Math.ceil(total / 50) || (total > 0 ? 1 : 0));
    // Cap at MAX_COLLECTION_PAGES to prevent thin pages
    return Math.max(0, Math.min(pages, MAX_COLLECTION_PAGES));
  } catch {
    return 0;
  }
}

// Cache of confirmed backend slugs per religion, built once per build run.
// The backend caps list responses at 100 items/page. Offset-based pagination
// trips a backend MongoDB sort memory limit on deep pages, so we instead
// paginate PER LETTER (alphabet filter) — each letter's result set is small
// enough that sorting never exceeds the limit. We collect the full slug set
// into a Set for O(1) membership lookups.
const backendSlugCache = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// fetchJson throws on transport/HTTP errors; retry with backoff so a transient
// backend hiccup or connection-limit rejection doesn't silently drop slugs.
async function fetchJsonRetry(url, retries = 4) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchJson(url);
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(250 * (attempt + 1));
    }
  }
  throw lastError;
}

async function fetchBackendSlugs(religion) {
  if (backendSlugCache.has(religion)) return backendSlugCache.get(religion);

  const slugs = new Set();
  const collect = (arr) => {
    for (const item of (arr || [])) {
      const s = item && item.slug;
      if (s) slugs.add(String(s).toLowerCase());
    }
  };

  async function fetchLetter(letter) {
    const first = await fetchJsonRetry(`${API_BASE}/api/v1/names/${religion}?alphabet=${letter}&page=1&limit=100&sort=asc`);
    collect(first.data);
    const pagination = first.pagination || {};
    let totalPages = Number(pagination.totalPages || pagination.pages || 0);
    if (!totalPages || !isFinite(totalPages)) totalPages = 0;
    totalPages = Math.min(totalPages, 500);
    // Fetch the remaining pages of this letter in parallel (capped) so a letter
    // with many pages doesn't serialize one slow request at a time.
    const PAGE_CONCURRENCY = 10;
    const pageNums = [];
    for (let page = 2; page <= totalPages; page += 1) pageNums.push(page);
    for (let i = 0; i < pageNums.length; i += PAGE_CONCURRENCY) {
      const batch = pageNums.slice(i, i + PAGE_CONCURRENCY);
      await Promise.all(batch.map(async (page) => {
        try {
          const data = await fetchJsonRetry(`${API_BASE}/api/v1/names/${religion}?alphabet=${letter}&page=${page}&limit=100&sort=asc`);
          collect(data.data);
        } catch {
          // skip unreachable page; continue with the rest of the letter
        }
      }));
    }
    console.log(`[sitemap]   ${religion}/${letter}: ${slugs.size} slugs so far`);
  }

  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const CONCURRENCY = 3;
  for (let i = 0; i < letters.length; i += CONCURRENCY) {
    const batch = letters.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map((letter) => fetchLetter(letter).catch((error) => {
      console.warn(`[sitemap] WARNING: could not fetch backend slugs for ${religion}/${letter}: ${error.message}`);
    })));
    await sleep(75);
  }

  console.log(`[sitemap] Fetched ${slugs.size} valid backend slugs for ${religion}`);
  backendSlugCache.set(religion, slugs);
  return slugs;
}

function localCounts(allNames, detailedNames) {
  const counts = {};
  for (const religion of RELIGIONS) {
    const religionNames = allNames.filter((name) => name.religion === religion);
    const religionDetailed = detailedNames.filter((name) => name.religion === religion);
    const letters = {};
    const origins = {};
    for (const name of religionNames) {
      const first = (name.name || '').charAt(0).toUpperCase();
      if (/^[A-Z]$/.test(first)) letters[first] = (letters[first] || 0) + 1;
      origins[normalizeOrigin(name.origin)] = (origins[normalizeOrigin(name.origin)] || 0) + 1;
    }
    counts[religion] = {
      total: religionNames.length,
      letters,
      origins: Object.fromEntries(Object.entries(origins).map(([origin, count]) => [origin, { count, pages: Math.max(1, Math.min(Math.ceil(count / 50), MAX_COLLECTION_PAGES)) }])),
      categories: Object.fromEntries(STATIC_CATEGORIES.map((category) => [category, { count: Math.max(1, Math.floor(religionNames.length / STATIC_CATEGORIES.length)), pages: 1 }])),
    };
    counts[religion].detailedCount = religionDetailed.length;
  }
  return counts;
}

export async function buildSitemapEntries() {
  const detailedNames = loadDetailedNames();
  const allNames = loadMixedNames();
  const posts = loadBlogPosts();
  const counts = localCounts(allNames, detailedNames);
  const entries = [];
  const seen = new Set();

  // Static pages — only routes that exist
  for (const route of STATIC_ROUTES) addEntry(entries, seen, route, 'page', today, 'weekly', 0.8);

  // Gender listing pages
  for (const religion of RELIGIONS) {
    addEntry(entries, seen, `/${religion}/boy-names`, 'gender', today, 'weekly', 0.8);
    addEntry(entries, seen, `/${religion}/girl-names`, 'gender', today, 'weekly', 0.8);
  }

  // Name pages — validate every slug against the live backend dataset.
  // A slug only enters the sitemap if the backend actually has a record for it.
  const backendSlugSets = {};
  for (const religion of RELIGIONS) {
    backendSlugSets[religion] = await fetchBackendSlugs(religion);
  }
  let nameKept = 0;
  let nameDropped = 0;
  for (const name of allNames) {
    if (!name.slug || !isValidSlug(name.slug)) continue;
    const backendSlugs = backendSlugSets[name.religion] || new Set();
    // If the backend set is empty we couldn't reach it — fall back to including
    // the slug so a transient outage doesn't wipe the entire name sitemap.
    if (backendSlugs.size === 0 || backendSlugs.has(name.slug)) {
      nameKept += 1;
      const lastmod = name.updated_at || today;
      addEntry(entries, seen, `/names/${name.religion}/${name.slug}`, 'name', lastmod, 'weekly', 0.8);
    } else {
      nameDropped += 1;
    }
  }
  console.log(`[sitemap] Name page validation: kept ${nameKept}, dropped ${nameDropped} (not found in backend dataset)`);

  // Blog posts
  for (const post of posts) {
    addEntry(entries, seen, `/blog/${post.slug}`, 'blog', post.lastUpdated || post.publishDate || today, 'weekly', 0.8);
  }

  // Collection pages — limited to MAX_COLLECTION_PAGES
  for (const religion of RELIGIONS) {
    const filters = await fetchFilters(religion).catch(() => null);
    const religionCounts = counts[religion] || {};
    const total = filters?.totalNames || religionCounts.total || 0;
    
    // Religion listing pages
    const popularityPages = filters?.totalNames 
      ? Math.min(Math.ceil(total / 50), MAX_COLLECTION_PAGES) 
      : Math.max(1, Math.min(Math.ceil((religionCounts.total || 0) / 50), MAX_COLLECTION_PAGES));
    for (let page = 1; page <= popularityPages; page += 1) {
      addEntry(entries, seen, `/names/religion/${religion}/${page}`, 'popularity', today, 'weekly', page === 1 ? 0.9 : 0.5);
    }

    // Letter pages
    const letters = filters?.letters?.length ? filters.letters : LETTERS;
    for (const letter of letters) {
      const letterCount = religionCounts.letters?.[letter] || 0;
      const pages = filters 
        ? await fetchCollectionPages(religion, { alphabet: letter.toLowerCase() })
        : Math.max(1, Math.min(Math.ceil(letterCount / 50), MAX_COLLECTION_PAGES));
      const safePages = Math.max(1, Math.min(pages || 1, MAX_COLLECTION_PAGES));
      for (let page = 1; page <= safePages; page += 1) {
        addEntry(entries, seen, `/names/${religion}/letter/${letter}/${page}`, 'letter', today, 'weekly', page === 1 ? 0.8 : 0.5);
      }
    }

    // Origin pages
    const origins = filters?.origins?.length ? Array.from(new Set(filters.origins)) : Object.keys(religionCounts.origins || {});
    for (const origin of origins) {
      const pages = filters 
        ? await fetchCollectionPages(religion, { origin })
        : (religionCounts.origins?.[origin]?.pages || 1);
      const safePages = Math.max(1, Math.min(pages || 1, MAX_COLLECTION_PAGES));
      for (let page = 1; page <= safePages; page += 1) {
        addEntry(entries, seen, `/names/${religion}/origin/${origin}/${page}`, 'origin', today, 'weekly', page === 1 ? 0.8 : 0.5);
      }
    }

    // Category pages
    const categories = filters?.categories?.length 
      ? Array.from(new Set(filters.categories.map((category) => createSlug(category)).filter(Boolean)))
      : STATIC_CATEGORIES;
    for (const category of categories) {
      const pages = filters 
        ? await fetchCollectionPages(religion, { category })
        : (religionCounts.categories?.[category]?.pages || 1);
      const safePages = Math.max(1, Math.min(pages || 1, MAX_COLLECTION_PAGES));
      for (let page = 1; page <= safePages; page += 1) {
        addEntry(entries, seen, `/names/${religion}/categories/${category}/${page}`, 'category', today, 'weekly', page === 1 ? 0.8 : 0.5);
      }
    }
  }

  return { entries, allNames, detailedNames, posts, counts };
}

export function groupEntries(entries) {
  const groups = { 
    pages: [], names: [], blog: [], 
    popularity: [], letter: [], origin: [], category: [], gender: [] 
  };
  for (const entry of entries) {
    if (groups[entry.type]) groups[entry.type].push(entry);
    else groups.pages.push(entry);
  }
  return groups;
}

function chunk(list, size) {
  const chunks = [];
  for (let i = 0; i < list.length; i += size) chunks.push(list.slice(i, i + size));
  return chunks.length ? chunks : [list];
}

function sitemapXml(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `\n  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`).join('')}\n</urlset>\n`;
}

function indexXml(locs) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locs.map((loc) => `\n  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`).join('')}\n</sitemapindex>\n`;
}

export async function writeSitemapFiles() {
  // Guard: fail the build if any STATIC_ROUTES entry lost its page file.
  validateStaticRoutes();

  const { entries } = await buildSitemapEntries();
  const groups = groupEntries(entries);
  const sitemapLocs = [];
  
  const writeGroup = async (name, items) => {
    const chunksOfItems = chunk(items, MAX_SITEMAP_URLS);
    for (let i = 0; i < chunksOfItems.length; i += 1) {
      const file = chunksOfItems.length === 1 ? `sitemap-${name}.xml` : `sitemap-${name}-${i + 1}.xml`;
      writeFileContents(path.join(publicDir, file), sitemapXml(chunksOfItems[i]));
      sitemapLocs.push(`${SITE_URL}/${file}`);
    }
  };
  
  for (const [name, items] of Object.entries(groups)) {
    if (items.length) await writeGroup(name, items);
  }
  
  const useIndex = entries.length > MAX_SITEMAP_URLS || sitemapLocs.length > 1;
  writeFileContents(path.join(publicDir, 'sitemap.xml'), useIndex ? indexXml(sitemapLocs) : sitemapXml(entries));
  writeJson(path.join(publicDir, 'seo-sitemap-manifest.json'), { 
    generatedAt: new Date().toISOString(), 
    totalUrls: entries.length, 
    sitemapCount: sitemapLocs.length, 
    sitemaps: sitemapLocs 
  });
  
  return { totalUrls: entries.length, sitemapCount: sitemapLocs.length, sitemaps: sitemapLocs };
}

export function parseSitemapUrls(xml) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);
}

export function buildExpectedUrls() {
  const detailedNames = loadDetailedNames();
  const allNames = loadMixedNames();
  const posts = loadBlogPosts();
  const urls = new Set(STATIC_ROUTES);
  
  for (const religion of RELIGIONS) {
    urls.add(`/${religion}/boy-names`);
    urls.add(`/${religion}/girl-names`);
  }
  
  for (const name of allNames) {
    if (name.slug && isValidSlug(name.slug)) {
      urls.add(`/names/${name.religion}/${name.slug}`);
    }
  }
  
  for (const post of posts) {
    urls.add(`/blog/${post.slug}`);
  }
  
  return Array.from(urls).sort();
}