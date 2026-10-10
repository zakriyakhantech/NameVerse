import NameTable from "./NameTable";
import {
  boysNames,
  girlsNames,
  lastUpdated,
  dataYear,
  totalBirthsTop100Boys,
  totalBirthsTop100Girls,
  biggestRisersBoys,
  biggestFallersBoys,
  biggestRisersGirls,
  biggestFallersGirls,
} from "../../data/top100Names2025";

// ---- CONFIG: update these two if your domain changes ----
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nameverse.site";
const PAGE_PATH = "/top-baby-names-usa";
// -----------------------------------------------------------

const topBoy = boysNames[0];
const topGirl = girlsNames[0];
const top10Boys = boysNames.slice(0, 10);
const top10Girls = girlsNames.slice(0, 10);

const pronunciationAndNicknames = {
  Liam: { pronounce: "LEE-um", nicknames: "Li, Lee" },
  Noah: { pronounce: "NOH-uh", nicknames: "No, Noey" },
  Oliver: { pronounce: "AH-liv-er", nicknames: "Ollie, Oli" },
  Theodore: { pronounce: "THEE-oh-dor", nicknames: "Theo, Ted, Teddy" },
  Henry: { pronounce: "HEN-ree", nicknames: "Hank, Harry, Hen" },
  James: { pronounce: "JAYMZ", nicknames: "Jamie, Jim, Jimmy" },
  Elijah: { pronounce: "ee-LY-juh", nicknames: "Eli, Lije" },
  Mateo: { pronounce: "mah-TAY-oh", nicknames: "Teo, Mattie" },
  William: { pronounce: "WIL-yum", nicknames: "Will, Liam, Bill, Billy" },
  Lucas: { pronounce: "LOO-kus", nicknames: "Luke, Luca" },
  Olivia: { pronounce: "oh-LIV-ee-uh", nicknames: "Liv, Livvy, Ollie" },
  Charlotte: { pronounce: "SHAR-lut", nicknames: "Charlie, Lottie" },
  Emma: { pronounce: "EM-uh", nicknames: "Em, Emmy" },
  Amelia: { pronounce: "uh-MEEL-yuh", nicknames: "Amy, Millie, Mia" },
  Sophia: { pronounce: "soh-FEE-uh", nicknames: "Sophie, Fifi" },
  Mia: { pronounce: "MEE-uh", nicknames: "Mimi" },
  Isabella: { pronounce: "iz-uh-BEL-uh", nicknames: "Bella, Izzy" },
  Evelyn: { pronounce: "EV-uh-lin", nicknames: "Evie, Eve, Lyn" },
  Sofia: { pronounce: "soh-FEE-uh", nicknames: "Sofi, Fifi" },
  Eliana: { pronounce: "el-ee-AH-nuh", nicknames: "Ellie, Ana, Ani" },
};

const faqs = [
  {
    q: "What is the most popular baby name in the USA right now?",
    a: `Based on the Social Security Administration's most recent official data (2025 births, released May 2026), Liam is the top boy's name with ${topBoy.births.toLocaleString()} babies and Olivia is the top girl's name with ${topGirl.births.toLocaleString()} babies. It's Liam's ninth year in a row at #1 and Olivia's seventh.`,
  },
  {
    q: "How does the Social Security Administration decide which names are most popular?",
    a: "The SSA counts every Social Security card application filed for a newborn during the year. Since most parents apply for a card within the child's first year, this covers roughly 96% of all U.S. births, making it the most complete public source for name popularity.",
  },
  {
    q: "When does the SSA release the new baby names list each year?",
    a: "The SSA publishes the list annually around Mother's Day (early-to-mid May) for births from the previous calendar year. The 2025 birth-year list was released on May 8, 2026.",
  },
  {
    q: "Are Sophia and Sofia counted as one name or two?",
    a: "Two separate names. The SSA counts each exact spelling on the Social Security application separately, so Sophia, Sofia, Aiden and Ayden are each ranked on their own rather than combined.",
  },
  {
    q: "Which baby names are rising the fastest this year?",
    a: `Comparing 2025 to 2024, the fastest-climbing names in the top 100 include ${biggestRisersBoys[0].name} (up ${biggestRisersBoys[0].delta} spots) and ${biggestRisersBoys[1].name} (up ${biggestRisersBoys[1].delta}) among boys, and ${biggestRisersGirls[1].name} (up ${biggestRisersGirls[1].delta}) and ${biggestRisersGirls[2].name} (up ${biggestRisersGirls[2].delta}) among girls.`,
  },
  {
    q: "Which popular names are losing ground?",
    a: `Both Dylan and Maverick fell 13 spots each among boys' names from 2024 to 2025, and Luna dropped 14 spots among girls' names — one of the largest single-year declines in this year's top 100.`,
  },
  {
    q: "Why isn't my state's most popular name showing up near the top?",
    a: "This list reflects national totals. Name popularity varies a lot by state and region — a name can be #5 in one state and outside the top 50 nationally. The SSA also publishes state-level breakdowns if you want to check a specific state.",
  },
  {
    q: "Does the top 100 list include every name given to babies in the U.S.?",
    a: "No. It only shows the 100 most common name spellings per gender. The SSA also excludes any name given to fewer than 5 babies nationally in a given year, to protect privacy — so thousands of rarer names given in 2025 simply don't appear in any public ranking.",
  },
  {
    q: "How many babies does the top 100 list actually represent?",
    a: `The top 100 boy names cover ${totalBirthsTop100Boys.toLocaleString()} births and the top 100 girl names cover ${totalBirthsTop100Girls.toLocaleString()} births in 2025 — together representing just over 1.15 million of the roughly 3.6 million Social Security card applications filed for newborns that year.`,
  },
  {
    q: "What's a 'combined' top 100 baby names list?",
    a: "Since the SSA ranks boys' and girls' names separately (each with its own top 1000), a single 'Top 100 Baby Names' list is usually built by combining the top 50 boy names and top 50 girl names into one table, which is the format used on this page.",
  },
  {
    q: "Will next year's list look very different?",
    a: "Usually not at the very top — the top 4–5 names in each gender tend to be stable year over year. Most of the real movement happens between roughly rank 20 and rank 100, where names can rise or fall by 10+ spots in a single year.",
  },
  {
    q: "Is a name 'popular' the same as a name 'trending'?",
    a: "Not quite. Popular usually means high total volume (like Liam or Olivia, which have topped the list for years). Trending refers to year-over-year movement — a name like Cooper or Eloise can be trending up fast while still ranking outside the top 20 overall.",
  },
  {
    q: "Where can I see the full top 1,000 names, not just the top 100?",
    a: "The Social Security Administration publishes the complete top 1,000 names per gender, per year, along with historical data back to 1880, at ssa.gov/oact/babynames.",
  },
  {
    q: "Do unisex or gender-neutral names appear on this list?",
    a: "The SSA tracks name counts separately by the sex recorded on each Social Security application, so a name like Riley appears once in the boys' list and once in the girls' list with two different ranks and birth counts, rather than as a single unisex entry.",
  },
];

export function generateMetadata() {
  const title = `Top 100 Baby Names in USA (${dataYear} SSA Data) — Boys & Girls`;
  const description = `The 50 most popular boy names and 50 most popular girl names in the U.S., ranked by real Social Security Administration data, with meanings, origins, and year-over-year trend for every name.`;
  const url = `${SITE_URL}${PAGE_PATH}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "NameVerse",
      // Replace with a real 1200x630 image once you've made one.
      images: [{ url: `${SITE_URL}/og/top-baby-names-usa.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/og/top-baby-names-usa.png`],
    },
  };
}

export default function TopBabyNamesUSA() {
  const url = `${SITE_URL}${PAGE_PATH}`;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Top 100 Baby Names in USA (${dataYear})`,
    description: "Top 50 boy names and top 50 girl names in the U.S., ranked by Social Security Administration data.",
    numberOfItems: 100,
    itemListElement: [...boysNames, ...girlsNames].map((n, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: n.name,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Top Baby Names USA", item: url },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Top 100 Baby Names in USA (${dataYear} SSA Data)`,
    url,
    datePublished: "2026-05-08",
    dateModified: lastUpdated,
    isPartOf: { "@type": "WebSite", name: "NameVerse", url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main className="tbn-page">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <a href="/">Home</a> <span aria-hidden="true">/</span> <span>Top Baby Names USA</span>
        </nav>

        {/* HERO */}
        <header className="hero">
          <p className="eyebrow">Social Security Administration Data · {dataYear} Release</p>
          <h1>The Top 100 Baby Names in the USA</h1>
          <p className="hero-sub">
            The 50 most popular boy names and 50 most popular girl names, straight from official U.S. Social
            Security records — with real meanings, origins, and year-over-year movement for every single name.
          </p>
          <p className="meta-line">
            Last updated {new Date(lastUpdated).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            {" · "}
            <a href="#methodology">How this list is built</a>
          </p>
        </header>

        {/* QUICK ANSWER / FEATURED SNIPPET BLOCK */}
        <section className="quick-answer" aria-label="Quick answer">
          <p>
            <strong>{topBoy.name}</strong> is the most popular boy's name in the U.S. in {dataYear}, given to{" "}
            {topBoy.births.toLocaleString()} newborns — its ninth year in a row at #1.{" "}
            <strong>{topGirl.name}</strong> is the most popular girl's name, given to {topGirl.births.toLocaleString()}{" "}
            newborns, its seventh consecutive year at the top. Both rankings come directly from Social Security card
            applications filed at birth.
          </p>
        </section>

        {/* STATS ROW */}
        <section className="stats-row" aria-label="Key statistics">
          <div className="stat-card">
            <span className="stat-label">#1 Boy Name</span>
            <span className="stat-value">{topBoy.name}</span>
            <span className="stat-sub">{topBoy.births.toLocaleString()} births</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">#1 Girl Name</span>
            <span className="stat-value">{topGirl.name}</span>
            <span className="stat-sub">{topGirl.births.toLocaleString()} births</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Top 100 Boys Cover</span>
            <span className="stat-value">{totalBirthsTop100Boys.toLocaleString()}</span>
            <span className="stat-sub">births in {dataYear}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Top 100 Girls Cover</span>
            <span className="stat-value">{totalBirthsTop100Girls.toLocaleString()}</span>
            <span className="stat-sub">births in {dataYear}</span>
          </div>
        </section>

        {/* TOC */}
        <nav className="toc" aria-label="Table of contents">
          <a href="#movers">Biggest Movers</a>
          <a href="#top-boys">Top 10 Boy Names</a>
          <a href="#top-girls">Top 10 Girl Names</a>
          <a href="#full-list">Full List of 100</a>
          <a href="#methodology">Methodology</a>
          <a href="#faq">FAQ</a>
        </nav>

        {/* MOVERS */}
        <section id="movers" aria-labelledby="movers-h2">
          <h2 id="movers-h2">Biggest Movers: {dataYear} vs. {dataYear - 1}</h2>
          <p>
            Comparing this year's SSA rankings against last year's shows exactly which names are gaining momentum
            and which are cooling off, inside the top 100 for each gender.
          </p>
          <div className="movers-grid">
            <div className="movers-col">
              <h3>Boys — Rising</h3>
              <ul className="movers-list">
                {biggestRisersBoys.map((m) => (
                  <li key={m.name}>
                    <span>{m.name}</span>
                    <span className="movers-delta up">▲ {m.delta}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="movers-col">
              <h3>Boys — Falling</h3>
              <ul className="movers-list">
                {biggestFallersBoys.map((m) => (
                  <li key={m.name}>
                    <span>{m.name}</span>
                    <span className="movers-delta down">▼ {Math.abs(m.delta)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="movers-col">
              <h3>Girls — Rising</h3>
              <ul className="movers-list">
                {biggestRisersGirls.map((m) => (
                  <li key={m.name}>
                    <span>{m.name}</span>
                    <span className="movers-delta up">{m.delta === "NEW" ? "NEW" : `▲ ${m.delta}`}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="movers-col">
              <h3>Girls — Falling</h3>
              <ul className="movers-list">
                {biggestFallersGirls.map((m) => (
                  <li key={m.name}>
                    <span>{m.name}</span>
                    <span className="movers-delta down">▼ {Math.abs(m.delta)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="note">
            Ailany is marked "NEW" because it wasn't in the {dataYear - 1} top 100 for girls at all — it entered the
            list for the first time this year.
          </p>
        </section>

        {/* TOP 10 BOYS SPOTLIGHT */}
        <section id="top-boys" aria-labelledby="top-boys-h2">
          <h2 id="top-boys-h2">Top 10 Boy Names, In Depth</h2>
          <div className="spotlight-grid">
            {top10Boys.map((n) => {
              const extra = pronunciationAndNicknames[n.name];
              return (
                <article className="spotlight-card" key={n.name}>
                  <span className="spotlight-rank">#{n.rank}</span>
                  <h3>{n.name}</h3>
                  {extra && <p className="pronounce">/{extra.pronounce}/</p>}
                  <dl className="spotlight-facts">
                    <dt>Meaning</dt>
                    <dd>{n.meaning}</dd>
                    <dt>Origin</dt>
                    <dd>{n.origin}</dd>
                    <dt>{dataYear} Births</dt>
                    <dd>{n.births.toLocaleString()}</dd>
                    {extra && (
                      <>
                        <dt>Nicknames</dt>
                        <dd>{extra.nicknames}</dd>
                      </>
                    )}
                  </dl>
                </article>
              );
            })}
          </div>
        </section>

        {/* TOP 10 GIRLS SPOTLIGHT */}
        <section id="top-girls" aria-labelledby="top-girls-h2">
          <h2 id="top-girls-h2">Top 10 Girl Names, In Depth</h2>
          <div className="spotlight-grid">
            {top10Girls.map((n) => {
              const extra = pronunciationAndNicknames[n.name];
              return (
                <article className="spotlight-card" key={n.name}>
                  <span className="spotlight-rank">#{n.rank}</span>
                  <h3>{n.name}</h3>
                  {extra && <p className="pronounce">/{extra.pronounce}/</p>}
                  <dl className="spotlight-facts">
                    <dt>Meaning</dt>
                    <dd>{n.meaning}</dd>
                    <dt>Origin</dt>
                    <dd>{n.origin}</dd>
                    <dt>{dataYear} Births</dt>
                    <dd>{n.births.toLocaleString()}</dd>
                    {extra && (
                      <>
                        <dt>Nicknames</dt>
                        <dd>{extra.nicknames}</dd>
                      </>
                    )}
                  </dl>
                </article>
              );
            })}
          </div>
        </section>

        {/* FULL TABLE */}
        <section id="full-list" aria-labelledby="full-list-h2">
          <h2 id="full-list-h2">The Full List: All 100 Names</h2>
          <p>
            Search, filter by gender, or sort by biggest riser. This table combines the top 50 boy names and top 50
            girl names of {dataYear} into one list of 100.
          </p>
          <NameTable boysNames={boysNames} girlsNames={girlsNames} />
        </section>

        {/* METHODOLOGY / E-E-A-T */}
        <section id="methodology" aria-labelledby="methodology-h2">
          <h2 id="methodology-h2">Methodology &amp; Sources</h2>
          <p>
            Every rank, name, and birth count on this page comes from the U.S. Social Security Administration's
            national baby names file, published at{" "}
            <a href="https://www.ssa.gov/oact/babynames/" target="_blank" rel="noopener noreferrer">
              ssa.gov/oact/babynames
            </a>
            . The SSA compiles this from Social Security card applications filed for newborns, which covers
            approximately 96% of U.S. births. Names given to fewer than five babies nationally in a year are excluded
            from the public file to protect privacy.
          </p>
          <p>
            Trend figures compare each name's {dataYear} rank to its {dataYear - 1} rank within the same gender's
            top 100 list. A name marked "NEW" did not appear in the {dataYear - 1} top 100 for that gender. Meanings
            and origins reflect commonly cited etymology from standard name-reference sources; where a name's
            documented meaning is uncertain (such as newer coinages), we say so rather than guessing.
          </p>
          <p className="update-note">
            <strong>Data year:</strong> {dataYear} (most recent SSA release, published May 8, 2026). This page will
            be updated when the SSA publishes {dataYear + 1} data next Mother's Day.
          </p>
        </section>

        {/* FAQ */}
        <section id="faq" aria-labelledby="faq-h2">
          <h2 id="faq-h2">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((f) => (
              <details className="faq-item" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* RELATED LINKS — update hrefs to match your real routes */}
        <section aria-labelledby="related-h2">
          <h2 id="related-h2">Explore More</h2>
          <ul className="related-links">
            <li><a href="/boy-names">All Boy Names</a></li>
            <li><a href="/girl-names">All Girl Names</a></li>
            <li><a href="/biblical-names">Biblical Names</a></li>
            <li><a href="/unique-names">Unique & Rare Names</a></li>
            <li><a href="/popular-by-state">Popular Names by State</a></li>
            <li><a href="/sibling-names">Sibling Name Pairings</a></li>
          </ul>
        </section>

        <style>{`
          .tbn-page {
            --paper: #faf6ef;
            --ink: #221d18;
            --ink-soft: #55493f;
            --accent: #a63d53;
            --accent-2: #3d5a50;
            --line: #e4dbcb;
            --gold: #b8863b;
            --font-display: 'Fraunces', Georgia, serif;
            --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
            max-width: 880px;
            margin: 0 auto;
            padding: 1.5rem 1.25rem 4rem;
            color: var(--ink);
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            background: var(--paper);
          }
          .breadcrumb { font-size: 0.8rem; color: var(--ink-soft); margin-bottom: 1.5rem; }
          .breadcrumb a { color: var(--ink-soft); text-decoration: underline; }
          .hero { border-bottom: 3px double var(--line); padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
          .eyebrow {
            font-family: var(--font-mono);
            font-size: 0.75rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--accent);
            margin: 0 0 0.6rem;
          }
          h1 {
            font-family: var(--font-display);
            font-size: clamp(2rem, 5vw, 3rem);
            line-height: 1.05;
            margin: 0 0 0.75rem;
          }
          .hero-sub { font-size: 1.05rem; color: var(--ink-soft); max-width: 60ch; margin: 0 0 0.75rem; }
          .meta-line { font-family: var(--font-mono); font-size: 0.78rem; color: var(--ink-soft); }
          .meta-line a { color: var(--accent); }
          .quick-answer {
            background: #fff;
            border-left: 4px solid var(--accent);
            padding: 1rem 1.25rem;
            margin-bottom: 2rem;
            font-size: 1.02rem;
          }
          .stats-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1px;
            background: var(--line);
            border: 1px solid var(--line);
            margin-bottom: 2rem;
          }
          .stat-card { background: #fff; padding: 1rem; display: flex; flex-direction: column; gap: 0.2rem; }
          .stat-label { font-family: var(--font-mono); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-soft); }
          .stat-value { font-family: var(--font-display); font-size: 1.7rem; color: var(--accent); }
          .stat-sub { font-size: 0.78rem; color: var(--ink-soft); }
          .toc {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem 1.25rem;
            padding: 0.9rem 0;
            border-top: 1px solid var(--line);
            border-bottom: 1px solid var(--line);
            margin-bottom: 2.5rem;
            font-family: var(--font-mono);
            font-size: 0.82rem;
          }
          .toc a { color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--accent); }
          .toc a:hover { color: var(--accent); }
          section { margin-bottom: 3rem; scroll-margin-top: 1rem; }
          h2 {
            font-family: var(--font-display);
            font-size: 1.6rem;
            border-bottom: 1px solid var(--line);
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
          }
          h3 { font-family: var(--font-display); font-size: 1.15rem; margin: 0 0 0.3rem; }
          .movers-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin: 1.25rem 0;
          }
          .movers-col { background: #fff; border: 1px solid var(--line); padding: 1rem; }
          .movers-list { list-style: none; margin: 0; padding: 0; }
          .movers-list li {
            display: flex;
            justify-content: space-between;
            padding: 0.4rem 0;
            border-bottom: 1px dashed var(--line);
            font-size: 0.92rem;
          }
          .movers-list li:last-child { border-bottom: none; }
          .movers-delta.up { color: var(--accent-2); font-family: var(--font-mono); font-weight: 600; }
          .movers-delta.down { color: var(--accent); font-family: var(--font-mono); font-weight: 600; }
          .note { font-size: 0.85rem; color: var(--ink-soft); font-style: italic; }
          .spotlight-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 1rem;
          }
          .spotlight-card {
            background: #fff;
            border: 1px solid var(--line);
            padding: 1.1rem;
            position: relative;
          }
          .spotlight-rank {
            position: absolute;
            top: 0.7rem;
            right: 0.9rem;
            font-family: var(--font-mono);
            font-size: 1.4rem;
            font-weight: 700;
            color: var(--line);
          }
          .spotlight-card h3 { margin-top: 0.2rem; }
          .pronounce { font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent); margin: 0 0 0.7rem; }
          .spotlight-facts { margin: 0; font-size: 0.88rem; }
          .spotlight-facts dt { font-family: var(--font-mono); font-size: 0.68rem; text-transform: uppercase; color: var(--ink-soft); margin-top: 0.5rem; }
          .spotlight-facts dd { margin: 0.1rem 0 0; }
          .faq-list { display: flex; flex-direction: column; gap: 0.6rem; }
          .faq-item { background: #fff; border: 1px solid var(--line); padding: 0.9rem 1.1rem; }
          .faq-item summary { font-weight: 600; cursor: pointer; }
          .faq-item p { margin: 0.7rem 0 0; color: var(--ink-soft); }
          .related-links { list-style: none; display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 0; }
          .related-links li a {
            display: inline-block;
            border: 1px solid var(--line);
            padding: 0.5rem 0.9rem;
            color: var(--ink);
            text-decoration: none;
            font-size: 0.88rem;
            background: #fff;
          }
          .related-links li a:hover { border-color: var(--accent); color: var(--accent); }
          .update-note { font-size: 0.85rem; color: var(--ink-soft); }
        `}</style>
      </main>
    </>
  );
}
