'use client';

import React from 'react';
import { BookHeart, Globe2, PenTool, History } from 'lucide-react';
import '../styles/animations-seo.css';
 

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nameverse.site';

const CulturalImportance = () => {
  const prefersReducedMotion = useReducedMotion();

  const features = [
    {
      icon: History,
      title: 'Ancestral Heritage',
      description: 'Connect to family lineage and cultural roots.',
      keywords: 'heritage, family history, baby names with meaning'
    },
    {
      icon: Globe2,
      title: 'Global Traditions',
      description: 'Islamic, Hindu, Christian, and international names.',
      keywords: 'Islamic names, Hindu names, Christian names'
    },
    {
      icon: PenTool,
      title: 'Personal Identity',
      description: 'Shape character and cultural pride from birth.',
      keywords: 'baby identity, character, name significance'
    },
    {
      icon: BookHeart,
      title: 'Spiritual Meaning',
      description: 'Positive attributes and lasting significance.',
      keywords: 'spiritual meaning, positive values, life purpose'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.01 : 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Why are verified baby names important for families?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Verified baby names carry cultural heritage and spiritual significance, connecting children to ancestral traditions and strengthening cultural identity.'
        }
      },
      {
        '@type': 'Question',
        name: 'What are the most popular Islamic baby names with meanings?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Islamic baby names are rooted in Quranic wisdom and Arabic traditions, reflecting virtues, blessings, and spiritual significance for both boys and girls.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do baby names influence personal identity and character?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Research shows meaningful baby names contribute to cultural pride, personal identity formation, and confidence development throughout life.'
        }
      },
      {
        '@type': 'Question',
        name: 'Where can I find verified baby name meanings?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'NameVerse provides verified baby name meanings across Islamic, Hindu, Christian, and global traditions with authentic origins and cultural context.'
        }
      }
    ]
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'The Deep Cultural Meaning Behind Every Baby Name',
    description: 'Discover verified baby names with meanings across Islamic, Hindu, Christian, and global traditions.',
    image: `${SITE_URL}/logo.png`,
    datePublished: '2024-01-15',
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'NameVerse Baby Names',
      url: SITE_URL
    },
    publisher: {
      '@type': 'Organization',
      name: 'NameVerse Baby Names',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
        width: 200,
        height: 60
      }
    }
  };

  return (
    <>
      
      <section
        className="py-10 sm:py-14 lg:py-16 bg-gradient-to-b from-white via-indigo-50/30 to-white"
        aria-labelledby="cultural-heading"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="The Deep Cultural Meaning Behind Every Baby Name" />
        <meta itemProp="description" content="Discover verified baby names across Islamic, Hindu, Christian, and global traditions with cultural significance." />
        <meta itemProp="author" content="NameVerse Baby Names" />
        <meta itemProp="datePublished" content="2024-01-15" />
        <meta itemProp="image" content={`${SITE_URL}/logo.png`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: CONCISE CONTENT */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div variants={itemVariants}>
                <h2
                  id="cultural-heading"
                  className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4"
                >
                  Understanding the Deep Cultural Significance of Baby Names
                </h2>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  <span className="font-semibold text-indigo-600">Verified baby names</span> connect your child to heritage, cultural identity, and spiritual significance across Islamic, Hindu, Christian, and global traditions.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mt-6 space-y-4 text-gray-700 leading-relaxed text-base">
                <p>
                  Every <span className="font-semibold text-indigo-600">baby name you choose for your child</span> carries profound meaning rooted in centuries of history, cultural tradition, and spiritual significance. From <span className="font-semibold text-indigo-600">Islamic baby names</span> inspired by Quranic verses and Arabic heritage to <span className="font-semibold text-indigo-600">Hindu baby names</span> grounded in Sanskrit philosophy and Vedic wisdom, parents worldwide select <span className="font-semibold text-indigo-600">meaningful baby names</span> to give their children a strong identity foundation.
                </p>
                <p>
                  Developmental psychology research demonstrates that <span className="font-semibold text-indigo-600">baby boy names</span> and <span className="font-semibold text-indigo-600">baby girl names</span> with deep cultural meaning significantly influence children's confidence development, personal identity formation, and sense of belonging throughout life. <span className="font-semibold text-indigo-600">Unique baby names 2025</span> with authentic origins help children connect with their heritage while building cultural pride and stronger family connections.
                </p>
                <p>
                  Exploring <span className="font-semibold text-indigo-600">baby names with meanings</span> allows families to celebrate ancestral roots and honor traditions. Whether you're searching for <span className="font-semibold text-indigo-600">Quranic baby names for Muslim boys</span>, <span className="font-semibold text-indigo-600">Sanskrit girl names from Hindu tradition</span>, or <span className="font-semibold text-indigo-600">Biblical baby names for Christian families</span>, understanding each name's authentic origin, pronunciation in multiple languages, and spiritual significance strengthens generational bonds and creates lasting family legacy.
                </p>
              </motion.div>

              {/* FEATURE GRID - MINIMAL & CLEAN */}
              <motion.div variants={itemVariants} className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={feature.title} 
                      className="flex flex-col items-start gap-2 p-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 hover:border-indigo-300 hover:shadow-md transition-all"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">{feature.title}</h3>
                      <p className="text-xs text-gray-600 leading-snug">{feature.description}</p>
                    </div>
                  );
                })}
              </motion.div>

              {/* CTA BUTTONS */}
               <motion.div variants={itemVariants} className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href="/names/religion/islamic/1"
                    className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all text-center text-sm sm:text-base"
                    title="Explore verified Islamic baby names"
                  >
                   Islamic Names
                 </a>
                <a 
                  href="/blog" 
                  className="flex-1 px-4 sm:px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-all text-center text-sm sm:text-base"
                  title="Find the perfect baby name"
                >
                  Stories
                </a>
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN: CLEAN VISUAL */}
            <motion.div 
              className="relative h-96 sm:h-[450px] lg:h-[550px] w-full flex items-center justify-center"
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.8, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/60 via-purple-100/50 to-blue-100/60 rounded-3xl blur-2xl" />
              
              <div className="relative w-full h-full p-6 grid grid-cols-6 grid-rows-6 gap-2 overflow-hidden rounded-3xl">
                {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890").map((char, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-center font-bold text-lg sm:text-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: prefersReducedMotion ? 0.4 : 0.5 }}
                    transition={{
                      delay: prefersReducedMotion ? 0 : (i % 10) * 0.08,
                      duration: prefersReducedMotion ? 0.01 : 0.8,
                      repeat: prefersReducedMotion ? 0 : Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut'
                    }}
                    style={{
                      color: `hsl(${i * 12}, 70%, 55%)`
                    }}
                  >
                    {char}
                  </motion.div>
                ))}
              </div>

              <div className="absolute inset-0 bg-white/92 backdrop-blur-lg rounded-3xl" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <BookHeart className="w-16 h-16 text-indigo-600 mb-4" aria-hidden="true" />
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
                  A Legacy in Every Name
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xs">
                  Verified meanings connecting your family to cultural wisdom and heritage.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Hidden content removed - now visible in FAQ section for better user experience and Google compliance */}
        </div>
      </section>
    </>
  );
};

export default React.memo(CulturalImportance);
