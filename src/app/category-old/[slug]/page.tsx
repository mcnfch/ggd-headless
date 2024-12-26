import type { Metadata } from 'next';
import { getProducts } from '@/lib/woocommerce';
import CategoryContent from '@/components/category/CategoryContent';
import { generateCategorySchema } from '@/lib/schema/category';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Generate metadata for the category page
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return {
    title: `${categoryName} - Your Store Name`,
    description: `Shop our collection of ${categoryName}. Find the best products in our ${categoryName} category.`,
    openGraph: {
      title: `${categoryName} - Your Store Name`,
      description: `Shop our collection of ${categoryName}. Find the best products in our ${categoryName} category.`,
      type: 'website',
    },
  };
}

// Generate static params for all categories
export async function generateStaticParams() {
  return [{ slug: 'test' }];
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  if (!slug) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Category</h1>
        <p className="text-gray-600">Category not found.</p>
      </div>
    );
  }

  try {
    console.log(`[CategoryPage] Loading category page for slug: ${slug}`);
    
    // Fetch products for this category
    const { products } = await getProducts(slug);
    
    console.log(`[CategoryPage] Found ${products.length} products for category ${slug}`);
    
    // If no products found, show a message
    if (!products || products.length === 0) {
      console.log(`[CategoryPage] No products found for category ${slug}`);
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No Products Found</h1>
          <p className="text-gray-600">Sorry, no products were found in this category.</p>
        </div>
      );
    }

    // Format category name for display
    const categoryName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Generate schema without toLowerCase()
    const schema = generateCategorySchema(categoryName, products);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
        <CategoryContent products={products} categoryName={categoryName} />
      </>
    );
  } catch (error) {
    console.error('[CategoryPage] Error loading category:', error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Category</h1>
        <p className="text-gray-600">Sorry, there was an error loading this category. Please try again later.</p>
      </div>
    );
  }
}

// Enable ISR with a 1 hour revalidation period
export const revalidate = 3600;