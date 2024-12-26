'use client';

import ProductCard from '@/components/product/ProductCard';
import type { WooProduct } from '@/lib/types';

interface RelatedProductsProps {
  categoryId: number;
  currentProductId: number;
  initialProducts: WooProduct[];
}

export function RelatedProducts({ 
  categoryId, 
  currentProductId, 
  initialProducts 
}: RelatedProductsProps) {
  const relatedProducts = initialProducts
    .filter(product => 
      product.id !== currentProductId && 
      product.categories.some(cat => cat.id === categoryId)
    )
    .slice(0, 4);

  if (!relatedProducts.length) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-8">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.images[0]?.src || '/placeholder.jpg'}
          />
        ))}
      </div>
    </div>
  );
} 