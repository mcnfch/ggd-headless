import type { WooProduct } from '@/lib/types';

interface CategorySchemaOptions {
  categoryName: string;
  products: WooProduct[];
}

export function generateCategorySchema(categoryName: string, products: WooProduct[]) {
  if (!categoryName || !products) {
    throw new Error('Category name and products are required');
  }

  // Get site URL from environment variable or use default
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://festivalravegear.com';
  
  // Format category slug from name
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');

  return {
    "@context": "https://schema.org/",
    "@type": "CollectionPage",
    name: categoryName,
    description: `Shop our collection of ${categoryName} at Festival Rave Gear. Find the perfect styles for your next event.`,
    url: `${siteUrl}/category/${categorySlug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          description: product.short_description?.replace(/<[^>]*>?/gm, '') || '',
          sku: product.sku,
          image: product.images.map(img => img.src),
          url: `${siteUrl}/product/${product.slug}`,
          brand: {
            "@type": "Brand",
            name: "Festival Rave Gear"
          },
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: product.price,
            availability: product.stock_status === 'instock' 
              ? "https://schema.org/InStock" 
              : "https://schema.org/OutOfStock",
            url: `${siteUrl}/product/${product.slug}`
          }
        }
      }))
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "Thing",
            name: "Home",
            "@id": siteUrl
          }
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "Thing",
            name: categoryName,
            "@id": `${siteUrl}/category/${categorySlug}`
          }
        }
      ]
    }
  };
}

export function generateCategoryJsonLD(schema: ReturnType<typeof generateCategorySchema>) {
  return JSON.stringify(schema);
}
