import { WooProduct, WooCategory } from '@/lib/types';

interface CategorySchemaProps {
  category: WooCategory;
  products: WooProduct[];
}

export function CategorySchema({ category, products }: CategorySchemaProps) {
  const schemas = [
    // Category as CollectionPage schema
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/${category.slug}`,
      name: category.name,
      description: category.description || `Shop ${category.name} at Groovy Gallery Designs`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${category.slug}`,
      numberOfItems: products.length,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@id': process.env.NEXT_PUBLIC_SITE_URL,
              name: 'Home'
            }
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/shop`,
              name: 'Shop'
            }
          },
          {
            '@type': 'ListItem',
            position: 3,
            item: {
              '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/${category.slug}`,
              name: category.name
            }
          }
        ]
      },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
            name: product.name,
            description: product.description?.replace(/<[^>]*>/g, '') || '',
            image: product.images?.map(img => img.src) || [],
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
            sku: product.sku,
            brand: {
              '@type': 'Brand',
              name: 'Groovy Gallery Designs'
            },
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'USD',
              itemCondition: 'https://schema.org/NewCondition',
              availability: product.stock_status === 'instock' 
                ? 'https://schema.org/InStock' 
                : 'https://schema.org/OutOfStock',
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
              priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
            },
            ...(product.average_rating && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.average_rating,
                reviewCount: product.rating_count,
                bestRating: '5',
                worstRating: '1'
              }
            })
          }
        }))
      }
    }
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
    </>
  );
}
