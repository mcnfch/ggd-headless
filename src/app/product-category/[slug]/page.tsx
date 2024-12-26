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

    // If this is the custom designs category, render the service options
    if (params.slug === 'custom-designs') {
      return (
        <main>
          <div className="max-w-[1920px] mx-auto px-4">
            <Breadcrumbs items={[
              { label: 'Home', href: '/' },
              { label: 'Shop', href: '/shop' },
              { label: category.name }
            ]} />

            <div className="bg-[#997997] text-white">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center py-8">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
                    Custom Design Services
                  </h1>
                  <p className="text-lg">
                    Choose from our custom design services below
                  </p>
                </div>
              </div>
            </div>

            <div className="container mx-auto py-12">
              <CustomDesignsSection />
            </div>
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

    return (
      <main>
        <div className="max-w-[1920px] mx-auto px-4">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
            { label: category.name }
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
    console.error('Error in CategoryPage:', error);
    return notFound();
  }
}
