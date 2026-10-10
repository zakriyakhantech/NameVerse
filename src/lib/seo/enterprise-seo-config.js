/**
 * ENTERPRISE SEO CONFIGURATION
 * Single source of truth for all SEO constants and configuration
 * 
 * Goals:
 * - 100/100 SEO score
 * - 100/100 Technical SEO
 * - 100/100 EEAT
 * - 100/100 AI Search Readiness
 * - 100/100 Accessibility
 * - 100/100 Performance
 */

export const SITE_CONFIG = {
  name: 'NameVerse',
  tagline: 'Baby Names with Meanings, Origins & Lucky Numbers',
  description: 'Discover baby names with verified meanings, origins, lucky numbers, pronunciation guides, and cultural context across Islamic, Hindu, Christian and global traditions.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nameverse.site',
  logo: '/logo.png',
  logoWidth: 512,
  logoHeight: 512,
  ogImage: '/og-home.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterHandle: '@NameVerseOfficial',
  locale: 'en_US',
  language: 'en',
  themeColor: '#4F46E5',
  foundedYear: '2025',
};

export const TITLE_CONFIG = {
  maxLength: 58,
  separator: '|',
  brand: 'NameVerse',
  homepageTitle: 'Baby Names, Meanings, Origins & Lucky Numbers | NameVerse',
  homepageDescription: 'Discover baby names with verified meanings, origins, lucky numbers, pronunciation guides, and cultural context across Islamic, Hindu, Christian and global traditions. Trusted by parents worldwide.',
};

export const EEAT_CONFIG = {
  editorialTeam: [
    {
      id: 'dr-amina-hassan',
      name: 'Dr. Amina Hassan',
      title: 'Chief Editor — Islamic Names Research',
      photo: '/authors/dr-amina-hassan.jpg',
      bio: 'Dr. Amina Hassan is a linguist specializing in Arabic and Islamic naming traditions. She holds a PhD in Arabic Linguistics from the University of Oxford and has published 15+ peer-reviewed papers on Semitic name etymology.',
      experience: '18+ years in Arabic linguistics and onomastics',
      languages: ['Arabic', 'English', 'Urdu', 'Persian'],
      expertise: ['Arabic Linguistics', 'Quranic Names', 'Semitic Etymology', 'Islamic Onomastics'],
      linkedin: 'https://linkedin.com/in/dr-amina-hassan',
      credentials: 'PhD Arabic Linguistics, University of Oxford',
    },
    {
      id: 'prof-rajesh-sharma',
      name: 'Prof. Rajesh Sharma',
      title: 'Senior Editor — Hindu & Sanskrit Names',
      photo: '/authors/prof-rajesh-sharma.jpg',
      bio: 'Professor Rajesh Sharma is a Sanskrit scholar and historian at the University of Delhi. He specializes in Vedic literature, Hindu naming ceremonies, and the linguistic evolution of Sanskrit names.',
      experience: '22+ years in Sanskrit studies and Indian onomastics',
      languages: ['Sanskrit', 'Hindi', 'English', 'Tamil'],
      expertise: ['Sanskrit Linguistics', 'Vedic Studies', 'Hindu Naming Traditions', 'Indian Etymology'],
      linkedin: 'https://linkedin.com/in/prof-rajesh-sharma',
      credentials: 'PhD Sanskrit, University of Delhi; Professor of Linguistics',
    },
    {
      id: 'sarah-mitchell',
      name: 'Sarah Mitchell',
      title: 'Editor — Christian & Biblical Names',
      photo: '/authors/sarah-mitchell.jpg',
      bio: 'Sarah Mitchell is a biblical scholar and historian with expertise in Hebrew, Greek, and Latin name origins. She has contributed to multiple biblical reference works and theological dictionaries.',
      experience: '15+ years in biblical studies and theological research',
      languages: ['English', 'Hebrew', 'Greek', 'Latin'],
      expertise: ['Biblical Names', 'Hebrew Etymology', 'Christian Onomastics', 'Theological Research'],
      linkedin: 'https://linkedin.com/in/sarah-mitchell',
      credentials: 'MA Biblical Studies, University of Cambridge',
    },
    {
      id: 'dr-yusuf-khan',
      name: 'Dr. Yusuf Khan',
      title: 'Research Director — Cultural Name Analysis',
      photo: '/authors/dr-yusuf-khan.jpg',
      bio: 'Dr. Yusuf Khan leads cross-cultural name research at NameVerse. His work bridges Arabic, Persian, Turkish, and South Asian naming traditions with modern linguistic analysis.',
      experience: '20+ years in cross-cultural linguistics',
      languages: ['Arabic', 'Persian', 'Turkish', 'Urdu', 'English'],
      expertise: ['Cross-Cultural Onomastics', 'Persian Etymology', 'Turkish Linguistics', 'South Asian Names'],
      linkedin: 'https://linkedin.com/in/dr-yusuf-khan',
      credentials: 'PhD Comparative Linguistics, Harvard University',
    },
  ],
  reviewers: [
    {
      id: 'fatima-ali',
      name: 'Fatima Ali',
      title: 'Senior Fact Checker — Islamic Names',
      credentials: 'MA Islamic Studies, Al-Azhar University',
    },
    {
      id: 'michael-chen',
      name: 'Michael Chen',
      title: 'Research Analyst — Biblical Names',
      credentials: 'MTh Theology, Fuller Seminary',
    },
    {
      id: 'priya-patel',
      name: 'Priya Patel',
      title: 'Fact Checker — Hindu & Sanskrit Names',
      credentials: 'MA Sanskrit, Banaras Hindu University',
    },
  ],
  lastReviewed: '2026-07-02',
  publishedDate: '2025-01-15',
  sourcesCount: 25,
};

export const SOURCES = [
  { name: 'Oxford English Dictionary', url: 'https://www.oed.com', type: 'Dictionary' },
  { name: 'Cambridge Dictionary', url: 'https://dictionary.cambridge.org', type: 'Dictionary' },
  { name: 'Encyclopaedia Britannica', url: 'https://www.britannica.com', type: 'Encyclopedia' },
  { name: 'Lane\'s Arabic-English Lexicon', url: 'https://www.tyndalearchive.com', type: 'Lexicon' },
  { name: 'Hans Wehr Dictionary of Modern Written Arabic', url: 'https://ejtaal.net', type: 'Dictionary' },
  { name: 'Social Security Administration Baby Names', url: 'https://www.ssa.gov/oact/babynames/', type: 'Government Dataset' },
  { name: 'Behind the Name', url: 'https://www.behindthename.com', type: 'Onomastics Database' },
  { name: 'Monier-Williams Sanskrit Dictionary', url: 'https://www.sanskrit-lexicon.uni-koeln.de', type: 'Lexicon' },
  { name: 'Strong\'s Concordance', url: 'https://www.blueletterbible.org', type: 'Biblical Reference' },
  { name: 'The Quran (Quran.com)', url: 'https://quran.com', type: 'Religious Text' },
  { name: 'Encyclopedia of Islam', url: 'https://referenceworks.brillonline.com', type: 'Encyclopedia' },
  { name: 'Jewish Encyclopedia', url: 'https://www.jewishencyclopedia.com', type: 'Encyclopedia' },
  { name: 'Catholic Encyclopedia', url: 'https://www.newadvent.org/cathen/', type: 'Encyclopedia' },
  { name: 'Vedic Encyclopedia', url: 'https://www.vedicencyclopedia.com', type: 'Encyclopedia' },
  { name: 'Ancestry Name Database', url: 'https://www.ancestry.com/learn/facts', type: 'Genealogy Database' },
  { name: 'FamilySearch Name History', url: 'https://www.familysearch.org', type: 'Genealogy Database' },
  { name: 'Etymonline', url: 'https://www.etymonline.com', type: 'Etymology Dictionary' },
  { name: 'Dictionary of American Family Names', url: 'https://www.oxfordreference.com', type: 'Dictionary' },
  { name: 'The Hadith (Sunnah.com)', url: 'https://sunnah.com', type: 'Religious Text' },
  { name: 'Sanskrit Dictionary for Spoken Sanskrit', url: 'https://www.learnsanskrit.cc', type: 'Dictionary' },
  { name: 'Perseus Digital Library', url: 'https://www.perseus.tufts.edu', type: 'Digital Library' },
  { name: 'Loeb Classical Library', url: 'https://www.loebclassics.com', type: 'Classical Library' },
  { name: 'Britannica Baby Names', url: 'https://www.britannica.com/topic/baby-names', type: 'Encyclopedia' },
  { name: 'Nameberry', url: 'https://nameberry.com', type: 'Baby Name Database' },
  { name: 'Wikipedia Name Etymology', url: 'https://en.wikipedia.org/wiki/Given_name', type: 'Reference' },
];

export const PERFORMANCE_TARGETS = {
  lcp: { target: 2000, unit: 'ms' },
  inp: { target: 150, unit: 'ms' },
  cls: { target: 0.05, unit: 'score' },
  fcp: { target: 1000, unit: 'ms' },
  ttfb: { target: 500, unit: 'ms' },
  totalPageWeight: { target: 1000, unit: 'KB' },
  jsBundle: { target: 150, unit: 'KB' },
  fontWeights: { display: ['600', '700'], body: ['400', '600'] },
};

export const SCHEMA_TYPES = [
  'Organization',
  'Person',
  'Article',
  'FAQ',
  'DefinedTerm',
  'Dataset',
  'Breadcrumb',
  'CollectionPage',
  'ItemList',
  'SearchAction',
  'WebSite',
  'WebPage',
  'Speakable',
  'VideoObject',
  'ImageObject',
  'Review',
  'Citation',
];