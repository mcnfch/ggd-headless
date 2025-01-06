import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';
import { getProducts, getCategory } from '@/lib/woocommerce';
import { filterProducts } from '@/lib/utils/productUtils';
import CategoryHeader from '@/components/category/CategoryHeader';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { NoProductsFound } from '@/components/product/NoProductsFound';
import CustomDesignsSection from '@/components/services/CustomDesignsSection';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategory(params.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} | Groovy Gallery Designs`,
    description: category.description || `Shop ${category.name} at Groovy Gallery Designs`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const category = await getCategory(params.slug);

    if (!category) {
      return notFound();
    }

    // Special handling for custom designs category
    if (category.slug === 'custom-designs') {
      return (
        <main className="flex-grow mb-16 main-content">
          <div className="max-w-[1920px] mx-auto px-4">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Shop', href: '/shop/' },
                { label: category.name, href: '#' },
              ]}
            />
            <CustomDesignsSection />
          </div>
        </main>
      );
    }

    // For all other categories, show the normal product grid
    const { products } = await getProducts(params.slug);
    const filteredProducts = filterProducts(products);

    if (!filteredProducts || filteredProducts.length === 0) {
      return <NoProductsFound categoryName={category.name} />;
    }

    // Generate schema for the category page
    const categorySchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/product-category/${category.slug}`,
      name: category.name,
      description: category.description || `Shop ${category.name} at Groovy Gallery Designs`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product-category/${category.slug}`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: filteredProducts.length,
        itemListElement: filteredProducts.map((product, index) => ({
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
    };

    return (
      <main className="flex-grow mb-16 main-content">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
        />
        <div className="max-w-[1920px] mx-auto px-4">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop/' },
            { label: category.name, href: '#' },
          ]} />
          <CategoryHeader
            title={category.name}
            description={category.description}
          />
          <div className="container mx-auto py-6 md:py-8">
            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error(`[CategoryPage] Error:`, error);
    return <NoProductsFound categoryName={params.slug} />;
  }
}
