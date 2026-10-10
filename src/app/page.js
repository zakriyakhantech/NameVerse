import fs from 'fs';
import path from 'path';
import HomePageClient from '@/components/HomePage/Homepage';
import { validateMetaDescription, validateMetaTitle } from '@/lib/seo/meta-helpers';
import { getSiteUrl } from '@/lib/seo/site';

export const revalidate = 31536000; // 365 days

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || getSiteUrl();
const DOMAIN = (() => {
  try {
    const candidate = /^https?:\/\//i.test(rawSiteUrl) ? rawSiteUrl : `https://${rawSiteUrl}`;
    return new URL(candidate).origin;
  } catch {
    return 'https://nameverse.site';
  }
})();
const publishedDate = new Date().toISOString().split('T')[0];
const homepageUrl = `${DOMAIN}/`;
const ogImage = `${DOMAIN}/og-home.png`;

const blogPostsPath = path.join(process.cwd(), 'public', 'data', 'blog-posts.json');
let latestArticles = [];
try {
  const fileContents = fs.readFileSync(blogPostsPath, 'utf8');
  const allPosts = JSON.parse(fileContents);
  latestArticles = allPosts
    .filter((post) => post.publishDate)
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    .slice(0, 6);
} catch {
  latestArticles = [];
}

export const metadata = {
  title: validateMetaTitle('Baby Names, Meanings, Origins & Lucky Numbers | NameVerse'),
  description: validateMetaDescription(
    'Discover baby names with verified meanings, origins, lucky numbers, pronunciation guides, and cultural context across Islamic, Hindu, Christian and global traditions. Browse Arabic, Urdu, Persian, Sanskrit, Hebrew and Greek name traditions on NameVerse.'
  ),
  keywords: [
    'baby names with meanings',
    'Islamic names with meaning',
    'Muslim baby names',
    'Hindu baby names',
    'Christian baby names',
    'Arabic names',
    'Urdu names',
    'Sanskrit names',
    'unique baby names',
    'trending baby names',
    'popular baby names',
    'names by meaning',
    'names by origin',
    'baby name search',
    'NameVerse',
    'baby names 2026',
    'baby name meanings',
    'lucky numbers for names'
  ].join(', '),
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  authors: [{ name: 'NameVerse Editorial Team', url: `${DOMAIN}/about` }],
  creator: 'NameVerse',
  publisher: 'NameVerse',
  metadataBase: new URL(DOMAIN),
  alternates: {
    canonical: homepageUrl,
  },
  openGraph: {
    title: validateMetaTitle('Baby Names, Meanings, Origins & Lucky Numbers | NameVerse'),
    description: validateMetaDescription(
      'Discover baby names with verified meanings, origins, lucky numbers, pronunciation guides, and cultural context across Islamic, Hindu, Christian and global traditions.'
    ),
    url: homepageUrl,
    type: 'website',
    siteName: 'NameVerse',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'NameVerse — Baby Names with Meanings, Origins & Lucky Numbers'
      }
    ],
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: validateMetaTitle('Baby Names, Meanings, Origins & Lucky Numbers | NameVerse'),
    description: validateMetaDescription(
      'Discover baby names with verified meanings, origins, lucky numbers, pronunciation guides, and cultural context across Islamic, Hindu, Christian and global traditions.'
    ),
    images: [ogImage],
    creator: '@NameVerseOfficial',
    site: '@NameVerseOfficial'
  },
  other: {
    'content-language': 'en',
    'article:published_time': publishedDate,
    'article:modified_time': publishedDate,
  }
};

const homepageStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${DOMAIN}/#website`,
      'url': DOMAIN,
      'name': 'NameVerse',
      'alternateName': 'NameVerse — Baby Names with Meanings, Origins and Cultural Roots',
      'description': 'NameVerse helps parents search baby names with meanings, origins, trends and cultural context across Islamic, Hindu, Christian and global traditions.',
      'inLanguage': 'en-US',
      'publisher': {
        '@id': `${DOMAIN}/#organization`
      },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${DOMAIN}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'Organization',
      '@id': `${DOMAIN}/#organization`,
      'name': 'NameVerse',
      'url': DOMAIN,
      'logo': {
        '@type': 'ImageObject',
        'url': `${DOMAIN}/logo.png`,
        'width': 512,
        'height': 512
      },
      'sameAs': ['https://twitter.com/NameVerseOfficial'],
      'description': 'NameVerse is a baby name knowledge base for meanings, origins, cultural roots, trends and trusted name research.'
    },
    {
      '@type': 'WebPage',
      '@id': `${DOMAIN}/#webpage`,
      'url': homepageUrl,
      'name': 'NameVerse — Baby Names with Meanings, Origins and Cultural Roots',
      'description': 'Search baby names by meaning, origin, religion, gender and trend. Browse Islamic, Hindu, Christian, Arabic, Urdu, Persian, Sanskrit and global name hubs.',
      'isPartOf': {
        '@id': `${DOMAIN}/#website`
      },
      'primaryImageOfPage': {
        '@type': 'ImageObject',
        'url': ogImage,
        'width': 1200,
        'height': 630
      },
      'about': [
        {
          '@type': 'Thing',
          'name': 'Baby Names with Meanings'
        },
        {
          '@type': 'Thing',
          'name': 'Islamic, Hindu and Christian Name Origins'
        },
        {
          '@type': 'Thing',
          'name': 'Trending Baby Names'
        }
      ]
    },
    {
      '@type': 'FAQPage',
      '@id': `${DOMAIN}/#faq`,
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How do I find the best baby name with meaning?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Start by searching a name, meaning, origin, religion or theme. NameVerse connects each query to curated name lists, cultural context and related browsing paths so you can compare options quickly.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Which baby names are trending in 2026?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Parents are searching for short, meaningful and globally pronounceable names. Popular homepage picks include Muhammad, Aisha, Rayan, Noah, Olivia, Aarav, Diya and Ananya, with more options in the trending names hub.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can I search names by religion, origin or meaning?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. Browse Islamic, Hindu and Christian names by religion, then narrow by origins such as Arabic, Urdu, Persian, Sanskrit, Hebrew, Greek or Latin. You can also search meanings such as light, love, strength or peace.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Are NameVerse meanings verified?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'NameVerse prioritizes verified meanings and cultural context. Entries are reviewed for linguistic origin, common usage and faith-aware interpretation before being surfaced in search and curated lists.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Is NameVerse free to use?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. NameVerse search, name meanings, browsing pages, FAQs and name discovery tools are free for parents, families and researchers.'
          }
        }
      ]
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${DOMAIN}/#breadcrumb`,
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': homepageUrl
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Baby Names',
          'item': `${DOMAIN}/names`
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Search Names',
          'item': `${DOMAIN}/search`
        }
      ]
    },
    {
      '@type': 'ItemList',
      '@id': `${DOMAIN}/#homepage-trending-names`,
      'name': 'Homepage Trending Baby Names',
      'description': 'Curated trending names featured on the NameVerse homepage.',
      'numberOfItems': 12,
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Muhammad', 'url': `${DOMAIN}/names/islamic/muhammad` },
        { '@type': 'ListItem', 'position': 2, 'name': 'Aisha', 'url': `${DOMAIN}/names/islamic/aisha` },
        { '@type': 'ListItem', 'position': 3, 'name': 'Rayan', 'url': `${DOMAIN}/names/islamic/rayan` },
        { '@type': 'ListItem', 'position': 4, 'name': 'Zainab', 'url': `${DOMAIN}/names/islamic/zainab` },
        { '@type': 'ListItem', 'position': 5, 'name': 'Ayaan', 'url': `${DOMAIN}/names/islamic/ayaan` },
        { '@type': 'ListItem', 'position': 6, 'name': 'Noah', 'url': `${DOMAIN}/names/christian/noah` },
        { '@type': 'ListItem', 'position': 7, 'name': 'Olivia', 'url': `${DOMAIN}/names/christian/olivia` },
        { '@type': 'ListItem', 'position': 8, 'name': 'Sophia', 'url': `${DOMAIN}/names/christian/sophia` },
        { '@type': 'ListItem', 'position': 9, 'name': 'Aarav', 'url': `${DOMAIN}/names/hindu/aarav` },
        { '@type': 'ListItem', 'position': 10, 'name': 'Diya', 'url': `${DOMAIN}/names/hindu/diya` },
        { '@type': 'ListItem', 'position': 11, 'name': 'Ananya', 'url': `${DOMAIN}/names/hindu/ananya` },
        { '@type': 'ListItem', 'position': 12, 'name': 'Vihaan', 'url': `${DOMAIN}/names/hindu/vihaan` }
      ]
    }
  ]
};

export default async function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageStructuredData) }}
      />
      <HomePageClient latestArticles={latestArticles} />
    </>
  );
}
