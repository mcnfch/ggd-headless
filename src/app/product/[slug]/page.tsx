import { productCache } from '@/lib/cache/productCache';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductSchema } from '@/components/schema/ProductSchema';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type GenerateMetadataProps = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(
  { params }: GenerateMetadataProps
): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  if (!slug) {
    return {
      title: 'Product Not Found',
    };
  }

  console.log(`[ProductPage] Generating metadata for slug: ${slug}`);
  const product = await productCache.getProductBySlug(slug);
  
  if (!product) {
    console.log(`[ProductPage] Product not found for metadata: ${slug}`);
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | Festival Rave Gear`,
    description: product.short_description || product.description,
  };
}

type PageProps = {
  params: { slug: string };
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await Promise.resolve(params);
  if (!slug) {
    console.log(`[ProductPage] No slug provided`);
    notFound();
  }

  const product = await productCache.getProductBySlug(slug);
  if (!product) {
    console.log(`[ProductPage] Product not found: ${slug}`);
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    ...(product.categories?.[0] 
      ? [{ 
          label: product.categories[0].name, 
          href: `/product-category/${product.categories[0].slug}` 
        }]
      : []
    ),
    { label: product.name }
  ];

  return (
    <main>
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs items={breadcrumbItems} />
        <ProductSchema product={product} />
        <ProductDetails product={product} />
      </div>
    </main>
  );
}