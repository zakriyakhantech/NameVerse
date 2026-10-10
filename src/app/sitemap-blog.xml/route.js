import { readFile } from 'fs/promises';
import { join } from 'path';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://nameverse.site'
)
  .trim()
  .replace(/\/+$/, '');

// ISR: 1 day — blog posts may be added/updated frequently
export const revalidate = 86400;

const defaultHeaders = {
  'Content-Type': 'application/xml',
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
};

// XML entity map — built at runtime to avoid formatter mangling entity strings
const XML_ENTITIES = {
  '&': String.fromCharCode(38) + 'amp;',
  '<': String.fromCharCode(38) + 'lt;',
  '>': String.fromCharCode(38) + 'gt;',
  '"': String.fromCharCode(38) + 'quot;',
  "'": String.fromCharCode(38) + 'apos;',
};

function escapeXml(str) {
  return str.replace(/[&<>"']/g, (char) => XML_ENTITIES[char] || char);
}

export async function GET() {
  try {
    const dataPath = join(process.cwd(), 'public', 'data', 'blog-posts.json');
    const raw = await readFile(dataPath, 'utf8');
    const posts = JSON.parse(raw);

    const urls = posts
      .filter((post) => post && post.id)
      .map((post) => {
        const loc = `${SITE_URL}/blog/${post.id}`;
        const lastmod =
          post.lastUpdated ||
          post.publishDate ||
          new Date().toISOString().split('T')[0];
        return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new Response(sitemap, {
      headers: defaultHeaders,
    });
  } catch (error) {
    console.error('Blog sitemap generation failed:', error);
    return new Response('Blog sitemap not found', { status: 404 });
  }
}

export async function HEAD() {
  try {
    const dataPath = join(process.cwd(), 'public', 'data', 'blog-posts.json');
    await readFile(dataPath, 'utf8');
    return new Response(null, {
      headers: defaultHeaders,
    });
  } catch (error) {
    return new Response(null, { status: 404 });
  }
}