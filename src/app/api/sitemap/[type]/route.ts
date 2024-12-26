import { NextResponse } from 'next/server';
import { getProducts, getCategories } from '@/lib/woocommerce';

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  const baseUrl = 'https://dev.groovygallerydesigns.com';
  const { type } = params;

  try {
    let xml = '';

    switch (type) {
      case 'static':
        xml = await generateStaticSitemap(baseUrl);
        break;
      case 'products':
        xml = await generateProductsSitemap(baseUrl);
        break;
      case 'categories':
        xml = await generateCategoriesSitemap(baseUrl);
        break;
      default:
        return new NextResponse('Not found', { status: 404 });
    }

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch (error) {
    console.error(`[Sitemap ${type}] Error:`, error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

async function generateStaticSitemap(baseUrl: string) {
  const pages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/shop', priority: 0.8, changefreq: 'daily' },
    { url: '/blog', priority: 0.7, changefreq: 'weekly' },
    { url: '/about', priority: 0.5, changefreq: 'monthly' },
    { url: '/contact', priority: 0.5, changefreq: 'monthly' }
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

async function generateProductsSitemap(baseUrl: string) {
  console.log('[Products Sitemap] Fetching products...');
  const { products } = await getProducts();
  console.log(`[Products Sitemap] Found ${products.length} products`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${products.map(product => `  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${new Date(product.date_modified || product.date_created).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
}

async function generateCategoriesSitemap(baseUrl: string) {
  console.log('[Categories Sitemap] Fetching categories...');
  const categories = await getCategories();
  const activeCategories = categories.filter(category => category.count > 0);
  console.log(`[Categories Sitemap] Found ${activeCategories.length} active categories`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${activeCategories.map(category => `  <url>
    <loc>${baseUrl}/product-category/${category.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
</urlset>`;
}
