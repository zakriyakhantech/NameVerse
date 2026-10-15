#!/usr/bin/env node
/**
 * MIGRATION AUDIT — legacy (nameverse.vercel.app) → canonical (nameverse.site)
 * ============================================================================
 *
 * Proves (or disproves) that every legacy URL now 301s to a destination that
 * actually returns 200 on the canonical host.
 *
 * It does three things:
 *   1. Reads the legacy URL universe from this repo's public/sitemap*.xml.
 *   2. Downloads the canonical site's real sitemaps and builds the set of URLs
 *      that genuinely exist on nameverse.site.
 *   3. Runs every legacy path through `mapLegacyPath()` and checks the resulting
 *      destination against that set.
 *
 * Output (written to ./migration-audit/):
 *   - report.json                 machine-readable summary
 *   - missing-name-slugs.csv      legacy name pages with NO canonical equivalent
 *   - legacy-to-canonical.csv     full old → new mapping (for GSC / Netlify)
 *
 * USAGE
 *   node scripts/audit-migration.mjs
 *
 * Requires network access to nameverse.site (run it locally, not in CI).
 */

import fs from 'node:fs';
import path from 'node:path';
import { mapLegacyPath } from '../src/lib/seo/legacy-redirect-map.mjs';

const ROOT = process.cwd();
const CANONICAL = 'https://nameverse.site';
const OUT_DIR = path.join(ROOT, 'migration-audit');

/** Extract every <loc> from an XML string. */
function extractLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) locs.push(m[1].trim());
  return locs;
}

async function getXml(url) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'NameVerse-Migration-Audit/1.0' } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

/** Legacy URLs = union of every sitemap referenced by public/sitemap.xml. */
function loadLegacyUrls() {
  const indexPath = path.join(ROOT, 'public', 'sitemap.xml');
  const indexXml = fs.readFileSync(indexPath, 'utf8');
  const children = extractLocs(indexXml);

  const urls = new Set();
  for (const child of children) {
    const fileName = child.replace(/^https?:\/\/[^/]+\//, '');
    const filePath = path.join(ROOT, 'public', fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ! missing local sitemap: ${fileName}`);
      continue;
    }
    for (const loc of extractLocs(fs.readFileSync(filePath, 'utf8'))) urls.add(loc);
  }
  return { urls, children };
}

/** Canonical URLs = every URL published on nameverse.site. */
async function loadCanonicalUrls() {
  const indexXml = await getXml(`${CANONICAL}/sitemap.xml`);
  const children = extractLocs(indexXml);
  console.log(`  canonical sitemap index → ${children.length} child sitemap(s)`);

  const urls = new Set();
  for (const child of children) {
    const locs = extractLocs(await getXml(child));
    console.log(`    ${child.replace(CANONICAL, '')} → ${locs.length} urls`);
    for (const loc of locs) urls.add(loc.replace(/\/+$/, ''));
  }
  return urls;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('\n▸ Loading legacy URLs from public/sitemap*.xml …');
  const { urls: legacyUrls } = loadLegacyUrls();
  console.log(`  ${legacyUrls.size} legacy URLs`);

  return loadCanonicalUrls().then((canonicalUrls) => {
    console.log(`\n  ${canonicalUrls.size} canonical URLs exist on ${CANONICAL}\n`);
    console.log('▸ Mapping legacy paths → canonical paths …');

    let ok = 0;
    const missing = [];
    const mappingRows = [];

    for (const legacyUrl of legacyUrls) {
      const legacyPath = legacyUrl.replace(/^https?:\/\/[^/]+/, '') || '/';
      const newPath = mapLegacyPath(legacyPath);
      const target = `${CANONICAL}${newPath}`;
      const exists = canonicalUrls.has(target);

      mappingRows.push({ legacy: legacyUrl, canonical: target, status: exists ? 'ok' : 'MISSING' });

      if (exists) {
        ok += 1;
      } else {
        missing.push(legacyUrl);
      }
    }

    const missingNamePages = missing.filter((u) => /\/names\/(islamic|christian|hindu)\/[^/]+$/.test(new URL(u).pathname));
    const missingOther = missing.filter((u) => !missingNamePages.includes(u));

    const pct = ((ok / legacyUrls.size) * 100).toFixed(2);
    console.log(`\n  ✅ ${ok} / ${legacyUrls.size} legacy URLs land on a real page (${pct}%)`);
    console.log(`  ❌ ${missing.length} legacy URLs still have no destination`);
    console.log(`       • ${missingNamePages.length} name detail pages (slug absent from canonical database)`);
    console.log(`       • ${missingOther.length} other (mapping table needs a new rule — fix these first)`);

    // Report
    fs.writeFileSync(
      path.join(OUT_DIR, 'report.json'),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          canonical: CANONICAL,
          legacyUrlCount: legacyUrls.size,
          canonicalUrlCount: canonicalUrls.size,
          mappedOk: ok,
          mappedMissing: missing.length,
          mappedOkPercent: Number(pct),
          missingNamePages: missingNamePages.length,
          missingOther: missingOther.length,
          missingOtherSample: missingOther.slice(0, 200),
        },
        null,
        2
      )
    );

    // Full mapping (handy for GSC change-of-address spot checks or Netlify rules)
    fs.writeFileSync(
      path.join(OUT_DIR, 'legacy-to-canonical.csv'),
      ['legacy_url,canonical_url,status', ...mappingRows.map((r) => `${r.legacy},${r.canonical},${r.status}`)].join('\n')
    );

    // Slugs the canonical database is missing — this is the list to re-import.
    fs.writeFileSync(
      path.join(OUT_DIR, 'missing-name-slugs.csv'),
      ['religion,slug,legacy_url', ...missingNamePages.map((u) => {
        const p = new URL(u).pathname.split('/').filter(Boolean); // names/<religion>/<slug>
        return `${p[1]},${p[2]},${u}`;
      })].join('\n')
    );

    console.log(`\n▸ Wrote reports to ./migration-audit/`);
    console.log('    report.json · legacy-to-canonical.csv · missing-name-slugs.csv\n');

    if (missingOther.length) {
      console.log('  ⚠ These non-name URLs have no destination — add rules to');
      console.log('    src/lib/seo/legacy-redirect-map.mjs:\n');
      for (const u of missingOther.slice(0, 25)) console.log(`      ${u}`);
      console.log('');
    }
  });
}

main().catch((err) => {
  console.error('\n✖ Audit failed:', err.message);
  console.error('  This script needs network access to https://nameverse.site.');
  process.exit(1);
});
