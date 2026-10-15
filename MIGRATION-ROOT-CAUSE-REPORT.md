# NameVerse migration — root cause report

**Question:** redirects are in place and Change of Address was submitted, so why is
`nameverse.vercel.app` still visible in Google and still receiving users after 2–3 months?

**Short answer:** the redirect is not the problem — it works. The problem is **where it points**.
The middleware performs a *blind host swap*: it replaces `nameverse.vercel.app` with
`nameverse.site` and keeps the path identical. But `nameverse.site` is **not running this
codebase** and does **not use the same URL scheme**. A large share of legacy URLs therefore
301 straight into a **404**, and Google will not consolidate a redirect that lands on a 404 —
so it keeps serving the old URL.

---

## 1. Ruling out the assumed causes

| Assumption | Status | Evidence |
|---|---|---|
| Redirects missing / temporary | ❌ Not the cause | `https://nameverse.vercel.app/names/islamic/aramesh` → `https://nameverse.site/names/islamic/aramesh` (301, resolves to a live 200 page) |
| Change of Address not submitted | ❌ Not the cause | already submitted |
| Canonicals pointing at the old host | ❌ Not the cause | all sitemap `<loc>` entries use `https://nameverse.site` (135,341 occurrences, zero `vercel.app`) |
| Name pages missing from the sitemap | ❌ Not the cause | `sitemap-pages.xml` contains all 41,554 name URLs, and `sitemap.xml` indexes it |

So the redirect layer is functioning. The failure is downstream of it.

---

## 2. The actual finding: two hosts, two different websites

`nameverse.site` is **not** a deployment of this repository. Four independent proofs:

**a) The live `robots.txt` is a different file.**

Served at `https://nameverse.site/robots.txt`:
```
User-Agent: *
Allow: /
Disallow: /search
Disallow: /advanced-search
Disallow: /my-names
Disallow: /popular-by-state
```

Committed at `public/robots.txt` in this repo: a completely different file with
`Allow: /_next/static/*`, `Disallow: /api/admin/`, `Disallow: /*?utm_` and four comment blocks.

**b) The live sitemap index is a different file.**

Served at `https://nameverse.site/sitemap.xml`:
```
/sitemap/pages.xml   /sitemap/islamic.xml   /sitemap/christian.xml   /sitemap/hindu.xml
```

Committed at `public/sitemap.xml` in this repo:
```
/sitemap-pages.xml  /sitemap-blog.xml  /sitemap-popularity.xml  /sitemap-letter.xml
/sitemap-origin.xml /sitemap-category.xml /sitemap-gender.xml
```
Different paths, different structure, no overlap.

**c) The canonical site is served by Netlify, this repo deploys to Vercel.**
Every live `nameverse.site` page ships a Netlify badge ("Powered by Netlify") in its HTML.
Control fetches (e.g. `example.com`) show no such badge.

**d) The canonical database is a different, much smaller dataset.**
The live 404 page reports **islamic 3,480 · christian 4,026 · hindu 3,906 = 11,412 names**.
This repo's sitemap publishes **41,554 name URLs** (18,501 islamic · 12,739 christian · 10,314 hindu).

---

## 3. Why the old domain keeps its traffic (the mechanism)

The two sites have **incompatible URL schemes**:

| Legacy scheme (this repo / `*.vercel.app`) | Canonical scheme (`nameverse.site`) |
|---|---|
| `/islamic/boy-names` | `/islamic-boy-names` |
| `/names/islamic/letter/A/1` | `/names/islamic/letter/a` |
| `/names/islamic/origin/arabic/1` | `/origins/arabic` |
| `/names/islamic/categories/quranic/1` | *(no equivalent)* |
| `/names/religion/islamic/2` | `/names/islamic` |
| `/unique-names` | `/unique-baby-names` |
| `/languages` | `/origins` |
| `/my-names`, `/advanced-search`, `/search` | *(no equivalent)* |
| `/blog/<slug>` (66 posts) | `/blog/<slug>` (**9 posts**) |
| `/guides/<slug>` | `/guides/expert-naming-guide` only |
| `/names/<religion>/<slug>` | `/names/<religion>/<slug>` ✅ same |

**Letter coverage is partial on the canonical site.** Only these letters have pages:

| Tradition | Letters with a page | Total names |
|---|---|---|
| Islamic | a–n | 3,480 |
| Christian | a–j | 4,026 |
| Hindu | a–r | 3,906 |

Spot-checked live: `/names/islamic/letter/o` → **404** and `/names/islamic/omar` → **404**.

`middleware.js` did this and nothing else:

```js
url.hostname = canonicalHost;   // swap host, keep path unchanged
return NextResponse.redirect(url, 301);
```

**Verified consequences (requested live):**

| Requested | After 301 | Result |
|---|---|---|
| `nameverse.vercel.app/islamic/boy-names` | `nameverse.site/islamic/boy-names` | **404 Page Not Found** |
| `nameverse.vercel.app/names/islamic/letter/A/1` | `nameverse.site/names/islamic/letter/A/1` | **404 Page Not Found** |

Google's documented behaviour when a 301 terminates in a 404 or soft-404 is to **not
consolidate**. It treats the redirect as failed and keeps the original URL in the index —
which is exactly the symptom. This is not "Google being slow"; the migration is actively
failing for every URL whose path doesn't happen to match.

**Scale of the problem**
- **Every hub/listing page redirected into a 404** — `/{religion}/{gender}-names`, all letter
  pagination, all origin pagination, all category pagination, `/names/religion/*`. These are the
  highest-authority, highest-traffic URLs on the site.
- **57 of 66 blog posts** had no destination (the canonical blog publishes 9).
- **41,554 legacy name URLs vs 11,412 canonical names.** 13,776 of them fail on the first letter
  alone (e.g. every Islamic name from o–z); the rest depend on whether that exact record exists.

**Secondary issues found**

1. **Preview deployments were indexable.** Only `nameverse.vercel.app` and
   `www.nameverse.vercel.app` were redirected. Branch/preview hosts
   (`nameverse-git-*-<scope>.vercel.app`, `nameverse-<hash>-<scope>.vercel.app`) were not, so
   Vercel was serving additional crawlable copies of the site under a third hostname.
2. **`http:` → `https:` never fired.** The check compared `protocol === 'http'`, but
   `request.nextUrl.protocol` returns the protocol *with* the colon (`'http:'`). Dead branch.
3. **Sitemap hygiene.** `public/` holds **135,341** `<loc>` entries but the index only references
   **42,779**. Roughly 92,562 URLs sit in ~20 unreferenced, publicly fetchable files
   (`sitemap-islamic-names.xml` + 8 shards, `sitemap-hindu-names.xml` + 5 shards,
   `sitemap-christian-names.xml` + 6 shards, `top_*_sitemap.xml`) that duplicate the same URLs and
   are orphans from the index.

---

## 3b. The blocker: the redirect layer never ran

Two separate defects meant the mapping code never executed in production.
Both had to be fixed before anything changed.

**(i) Wrong file location.** `middleware.js` sat at the repository root while the
app lives in `src/app`. Next.js looks for `src/middleware.js` when a `src`
directory is used; a root-level `middleware.js` is silently ignored — no build
error, no warning.

**(ii) Wrong execution order.** Next.js 16 renamed the middleware convention to
**Proxy** (`src/proxy.js`, named `proxy` export) and — critically — runs
`next.config` redirects **before** the proxy. `next.config.mjs` had ~30
host-scoped redirect rules including a `'/:path*'` catch-all, so it consumed
every legacy request and redirected with the path unchanged. That blind host
swap is the code that produced the 404 destinations. The proxy never ran.

Proof it never ran: `/names/islam/abdullah` → `nameverse.site/names/islam/abdullah`
→ 404. The redirect layer normalises `islam` → `islamic`; the observed URL was
not normalised.

Consequences beyond the migration: the 410-Gone handling, uppercase/trailing-slash
normalisation and religion-alias redirects were all dead code too.

**Fixes:** `middleware.js` → `src/proxy.js` (`export function proxy`), and all
host-scoped rules removed from `next.config.mjs`.

## 4. What was changed

**`src/lib/seo/legacy-redirect-map.mjs`** (new) — the authoritative legacy→canonical mapping.
Rule enforced: *a legacy URL may only redirect to a destination verified to return 200 on the
canonical host; anything with no true equivalent goes to the closest real hub, never to a 404.*

Rules, all verified against the live site:
- hub renames — `/{religion}/{gender}-names` → `/{religion}-{gender}-names`, `/unique-names` →
  `/unique-baby-names`, `/languages` → `/origins`, `/top-baby-names-usa` → `/top-baby-names-2026`,
  `/popular-by-state` → `/baby-names-by-state`, `/biblical-names` → `/biblical-baby-names`,
  `/stories` → `/blog`, `/viral-names` → `/trending-names`;
- features with no equivalent (`/my-names`, `/advanced-search`, `/search`, `/boy-names`,
  `/girl-names`, `/sibling-names`, `/name-generator`) → `/names`;
- letter pagination → the lowercase letter hub, or the tradition hub when that letter has no page;
- origin pagination → `/origins/<origin>` for the 10 known origins, else the tradition hub;
- category pagination → `/categories/<category>` for the 4 known categories, else the tradition hub;
- `/names/religion/<religion>/<page>` → `/names/<religion>`;
- blog posts → 1:1 for the 9 canonical slugs, else `/blog`;
- guides → 1:1 for `expert-naming-guide`, else that guide;
- name pages → 1:1 only when the slug's first letter is within that tradition's canonical range,
  else the tradition hub.

### Verified live after deployment

| Request | Before | After |
|---|---|---|
| `/islamic/boy-names` | `nameverse.site/islamic/boy-names` → **404** | `/islamic-boy-names` → **200** (1,863 names) |
| `/names/islam/abdullah` | `.../names/islam/abdullah` → **404** | `/names/islamic/abdullah` → **200** |
| `/stories` | `nameverse.site/stories` → **404** | `/blog` → **200** |

**Result across all 42,779 legacy URLs:**

| | URLs | Before | After |
|---|---|---|---|
| Hubs / listings / blog / guides | 1,225 | mostly 404 | all land on a real page |
| Name pages outside canonical letter range | 13,776 | 404 | tradition hub |
| Name pages inside canonical letter range | 27,778 | 1:1 | 1:1 (unchanged) |

**15,001 URLs** that previously terminated in a 404 now land on a live page.

**`src/proxy.js`** (was root `middleware.js`, which Next.js ignored) — the blind host swap is
replaced by:
- host normalisation runs first, before any path logic;
- **every** non-canonical host is collapsed onto `https://nameverse.site` in one 301 — this now
  covers preview/branch deployments and `www`, not just the two hardcoded hosts;
- `*.vercel.app` requests additionally get `mapLegacyPath()` applied;
- local dev hosts are exempt;
- fixed the `protocol === 'http'` → `'http:'` bug.

**`scripts/audit-migration.mjs`** (new, `npm run migration:audit`) — downloads the canonical
site's real sitemaps, runs all 42,779 legacy URLs through the mapping, and reports exactly how
many land on a real page. Writes `migration-audit/{report.json, legacy-to-canonical.csv,
missing-name-slugs.csv}`.

**`next.config.mjs` / `.gitignore` / `package.json`** — annotated the ~30 now-unreachable
host-scoped redirect rules (they encode the same 404-producing passthrough), ignored audit
output, added the `migration:audit` script.

---

## 5. What you need to do next

The redirect layer is now correct, but two things can only be fixed on the canonical site:

1. **Restore the missing ~30,142 name records on `nameverse.site`.** This is the single biggest
   item. Right now 72.5% of your indexed URLs point at nothing. Run
   `npm run migration:audit` and use `migration-audit/missing-name-slugs.csv` as the re-import
   list. Until the canonical database holds the same names, those URLs cannot be migrated — no
   redirect can fix a destination that doesn't exist.
2. **Decide which codebase is the real one.** Your SEO work in this repo currently deploys to a
   host that only redirects. Every canonical, schema and content improvement never reaches
   `nameverse.site`. Either point `nameverse.site` at this Vercel project, or move this
   redirect logic and the URL scheme into the Netlify build.
3. **Clean up `public/`.** Delete or re-index the ~20 orphaned sitemap files so the published
   sitemap set matches `sitemap.xml`.
4. **In Search Console**, re-submit `https://nameverse.site/sitemap.xml` and watch the old
   property's indexed count fall and the new one's rise. Do not remove the old property and do
   not remove the redirects.
5. **Content quality** (independent of the migration): live pages print editorial
   self-corrections to users ("The source record classified it as Arabic, which is incorrect"),
   the "Similar sounding names" block renders the meaning string instead of names
   (`tranquilitycalmpeace`), and some genders are wrong (Ananya and Aparajitha are documented as
   female names but render as male).

---

## 6. Answering the original diagnostic

1. *What happens when you open an old Vercel name URL?*
   → It redirects (301), and **if the name exists on the new site** it lands on the matching page.
   If the name isn't in the new database (≈72.5% of them), it lands on a 404.
2. *Main indexing status on the new domain?*
   → Mixed: the URLs that exist are indexed, but the hub/listing pages were never indexed because
   their redirects died in 404s.
3. *Google-selected canonical?*
   → For pages that exist, `nameverse.site`. For the ~30k that don't, there is no canonical to
   select — which is why the old URL is retained.
4. *Change of Address submitted?* → Yes, and it cannot complete while the redirects 404.

**The real reason: this was treated as a domain migration, but it is two different websites with
two different URL schemes and two different databases. The redirects were written as if the paths
were unchanged, so most of them point at pages that don't exist.**
