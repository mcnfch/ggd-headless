import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';

import { categoryCache } from '@/lib/cache/categoryCache';
import { productCache } from '@/lib/cache/productCache';
import ProductGrid from '@/components/product/ProductGrid';
import { CategoryHero } from '@/components/category/CategoryHero';
import { NoProductsFound } from '@/components/product/NoProductsFound';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
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
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
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
      <div>
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
