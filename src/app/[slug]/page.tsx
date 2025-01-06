import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';

import { categoryCache } from '@/lib/cache/categoryCache';
import { productCache } from '@/lib/cache/productCache';
import ProductGrid from '@/components/product/ProductGrid';
import { CategoryHero } from '@/components/category/CategoryHero';
import { NoProductsFound } from '@/components/product/NoProductsFound';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = params;
  
  try {
    const categories = await categoryCache.getAllCategories();
    const category = categories.find(cat => cat.slug === slug);
    
    if (category) {
      return {
        title: `${category.name} | Festival Rave Gear`,
        description: category.description || `Shop our collection of ${category.name}`,
      };
    }
  } catch (error) {
    console.error(`[CategoryPage] Error generating metadata for slug: ${slug}`, error);
  }

  return {
    title: 'Category Not Found | Festival Rave Gear',
    description: 'The requested category could not be found.',
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = params;
  
  try {
    const categories = await categoryCache.getAllCategories();
    // Debug: Log all categories and the current slug
    console.log('\nAttempting to match slug:', slug);
    console.log('\nAvailable categories:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (slug: ${cat.slug})`);
    });
    
    const category = categories.find(cat => cat.slug === slug);
    
    if (!category) {
      console.log(`[CategoryPage] Category not found: ${slug}`);
      return <NoProductsFound categoryName={slug} />;
    }

    console.log(`[CategoryPage] Rendering category: ${category.name}`);
    const { products } = await productCache.getProductsByCategory(category.slug);

    return (
      <div className="container mx-auto px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/${category.slug}`,
              name: category.name,
              description: category.description || `Shop ${category.name} at Groovy Gallery Designs`,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/${category.slug}`,
              numberOfItems: products.length,
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
                      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`
                    }
                  }
                }))
              }
            })
          }}
        />
        <CategoryHero category={category} />
        {products && products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <NoProductsFound categoryName={category.name} />
        )}
      </div>
    );
  } catch (error) {
    console.error(`[CategoryPage] Error rendering category page for slug: ${slug}`, error);
    return <NoProductsFound categoryName={slug} />;
  }
}
