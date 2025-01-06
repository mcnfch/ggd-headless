'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/woocommerce';
import { filterProducts } from '@/lib/utils/productUtils';
import ProductGrid from '@/components/product/ProductGrid';
import { ShopHeader } from '@/components/shop/ShopHeader';
import { NoProductsFound } from '@/components/product/NoProductsFound';
import { generateProductListSchema } from '@/components/schema/ProductSchema';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import type { WooProduct } from '@/lib/types';

export default function ShopPage() {
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState('default');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { products: fetchedProducts } = await getProducts();
        const filteredProducts = filterProducts(fetchedProducts || []);
        setProducts(filteredProducts);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSort = (sortBy: string) => {
    setCurrentSort(sortBy);
    const sortedProducts = [...products];

    switch (sortBy) {
      case 'price-asc':
        sortedProducts.sort((a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'));
        break;
      case 'price-desc':
        sortedProducts.sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'));
        break;
      case 'name-asc':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        sortedProducts.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());
        break;
      default:
        // Keep original order
        break;
    }

    setProducts(sortedProducts);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </main>
    );
  }

  if (error || !products.length) {
    return <NoProductsFound categoryName="Shop" />;
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop' }
  ];

  return (
    <main>
      <div className="max-w-[1920px] mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} />
        <ShopHeader 
          title="Shop"
          description="Browse our collection of unique and beautiful products."
          totalProducts={products.length}
          onSort={handleSort}
          currentSort={currentSort}
        />
        <div className="container mx-auto py-6 md:py-8">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateProductListSchema(products))
            }}
          />
          <ProductGrid products={products} />
        </div>
      </div>
    </main>
  );
}