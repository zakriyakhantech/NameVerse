import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import AppInstallPopup from "./install";
import { Fraunces, Instrument_Sans } from 'next/font/google';
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ResourceHints from "@/components/Performance/ResourceHints";
import PerformanceInit from "./performance";
import StructuredData from "@/components/SEO/StructuredData";
import GoogleBotMeta from "@/components/SEO/GoogleBotMeta";
import { validateMetaTitle, validateMetaDescription } from '@/lib/seo/meta-helpers';
import { AppProvider } from "@/contexts/AppContext";
import LoadingWrapper from "@/components/LoadingAnimation/LoadingWrapper";
import { Suspense } from 'react';
import RouteChrome from "@/components/Layout/RouteChrome";
import NativeAdScript from "@/components/Ads/NativeAdScript";

import { getSiteUrl } from '@/lib/seo/site';

const siteUrl = getSiteUrl();

const displayFont = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700'],
  display: 'swap',
  preload: true,
});

const bodyFont = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '600'],
  display: 'swap',
  preload: true,
});

export const metadata = {
  title: {
    default: validateMetaTitle("Baby Names, Meanings, Origins & Lucky Numbers | NameVerse"),
    template: "%s | NameVerse"
  },
  description: validateMetaDescription(
    "Discover baby names with verified meanings, origins, lucky numbers, pronunciation guides, and cultural context across Islamic, Hindu, Christian and global traditions. Trusted by parents worldwide."
  ),
  keywords:
    "baby names, baby names 2026, islamic baby names, hindu baby names, christian baby names, quranic names, biblical names, sanskrit names, muslim baby names, baby name meanings, lucky numbers, baby name generator, name suggestions, trending baby names 2026, baby names with meanings, unique baby names, popular baby names, arabic names, urdu names",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  authors: [{ name: "NameVerse Editorial Team", url: `${siteUrl}/about` }],
  creator: "NameVerse",
  publisher: "NameVerse",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: siteUrl },
  openGraph: {
    title: validateMetaTitle("Baby Names, Meanings, Origins & Lucky Numbers | NameVerse"),
    description: validateMetaDescription(
      "Discover baby names with verified meanings, origins, lucky numbers, pronunciation guides, and cultural context across Islamic, Hindu, Christian and global traditions."
    ),
    url: siteUrl,
    siteName: "NameVerse",
    images: [
      { 
        url: `/og-home.png`, 
        width: 1200, 
        height: 630, 
        type: "image/png", 
        alt: "NameVerse — Baby Names with Meanings, Origins & Lucky Numbers" 
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: validateMetaTitle("Baby Names, Meanings, Origins & Lucky Numbers | NameVerse"),
    description: validateMetaDescription(
      "Discover baby names with verified meanings, origins, lucky numbers, pronunciation guides, and cultural context across Islamic, Hindu, Christian and global traditions."
    ),
    images: [`/og-home.png`],
    creator: "@NameVerseOfficial",
    site: "@NameVerseOfficial",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: `/manifest.json`,
  category: "Baby Names, Culture, Religion",
  classification: "Baby Name Dictionary & Cultural Knowledge Base",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1E40AF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="application-name" content="NameVerse" />
        <meta property="og:site_name" content="NameVerse" />
        <meta name="content-language" content="en" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="google-site-verification" content="iPU1wdP26kg58gDN3U4H39YuS20alsLvjfXRM-QtKLw" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="NameVerse" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="msapplication-TileColor" content="#4F46E5" />
        <meta name="msapplication-TileImage" content="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="ahrefs-site-verification" content="650afaf6635223ff618a281883a22b69b937a121e933b19907debeca67754cd4" />
        <meta name="415fb3e376dd03499e3ea3cfd086272b2330a942" content="415fb3e376dd03499e3ea3cfd086272b2330a942" />
        <meta name="p:domain_verify" content="2182ce49319a6b4ede3da073a469ce4a" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1510675468129183" crossorigin="anonymous"></script>

        <link rel="preconnect" href="https://revolthem.com" />
        <link rel="dns-prefetch" href="https://revolthem.com" />

        <ResourceHints />

        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" type="image/png" href="/logo.png" />

        <GoogleBotMeta siteUrl={siteUrl} />

        <StructuredData
          organization={true}
          website={true}
          breadcrumbs={[
            { name: "Home", url: siteUrl },
            { name: "Baby Names", url: `/names` },
          ]}
          collectionPage={{
            name: "Popular Baby Names by Religion",
            description: "Browse top baby names from different faiths — Muslim, Hindu, and Christian — with meanings and translations.",
            url: `/names`,
            items: [],
          }}
        />
      </head>

      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased nv-body nv-page`}>
        <div id="temp-wrapper">
          <AppProvider>
            <PerformanceInit />
            <Suspense fallback={<div>Loading Navbar...</div>}>
              <Navbar />
            </Suspense>

            <NativeAdScript />

            {/* TOP NATIVE AD */}
            <div id="container-1606e7870f004d67136f85f2b1698cd3"></div>

            <RouteChrome>{children}</RouteChrome>

            <Footer />
            <AppInstallPopup />


          </AppProvider>
        </div>
      </body>
    </html>
  );
}
