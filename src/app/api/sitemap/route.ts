import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://dev.groovygallerydesigns.com';
  
  const sitemaps = [
    'static',
    'categories',
    'products'
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(type => `  <sitemap>
    <loc>${baseUrl}/sitemap-${type}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
}
