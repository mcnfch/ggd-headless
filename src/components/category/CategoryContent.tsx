'use client';

import { Suspense } from 'react';
import type { WooProduct } from '@/lib/types';
import ProductList from '@/components/product/ProductList';
import ProductListSkeleton from '@/components/product/ProductListSkeleton';

interface CategoryContentProps {
  products: WooProduct[];
  categoryName: string;
}

export default function CategoryContent({ products, categoryName }: CategoryContentProps) {
  if (!Array.isArray(products)) {
    console.error('Products is not an array:', products);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{categoryName}</h1>
        <div className="text-center text-gray-600">
          No products found
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{categoryName}</h1>
        <div className="text-center text-gray-600">
          No products found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{categoryName}</h1>
      <Suspense fallback={<ProductListSkeleton id={categoryName.toLowerCase()} />}>
        <ProductList initialProducts={products} />
      </Suspense>
    </div>
  );
}