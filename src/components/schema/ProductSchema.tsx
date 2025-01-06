import { Product } from '@/types/woocommerce';

interface ProductSchemaProps {
  product: Product;
}

export function ProductSchema({ product }: ProductSchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateProductSchema(product))
      }}
    />
  );
}

export function generateProductSchema(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
    name: product.name,
    description: product.description?.replace(/<[^>]*>/g, '') || '',
    image: product.images?.map(img => img.src) || [],
    sku: product.sku,
    mpn: product.id.toString(),
    productID: product.id.toString(),
    category: product.categories?.map(cat => cat.name).join(', '),
    brand: {
      '@type': 'Brand',
      name: 'Groovy Gallery Designs'
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock_status === 'instock' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Groovy Gallery Designs'
      }
    },
    review: product.rating_count > 0 ? {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: product.average_rating,
        bestRating: '5'
      },
      author: {
        '@type': 'Organization',
        name: 'Groovy Gallery Designs'
      }
    } : undefined,
    aggregateRating: product.rating_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.average_rating,
      reviewCount: product.rating_count,
      bestRating: '5',
      worstRating: '1'
    } : undefined
  };
}

export function generateProductListSchema(products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        description: product.description?.replace(/<[^>]*>/g, '') || '',
        image: product.images?.[0]?.src || '',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
          availability: product.stock_status === 'instock' 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
        }
      }
    }))
  };
}
