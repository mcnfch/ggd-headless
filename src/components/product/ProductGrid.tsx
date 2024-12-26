import type { WooProduct } from '@/lib/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: WooProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">No products found</h2>
        <p className="mt-2 text-gray-600">Check back later for new items!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {products.map((product) => (
          <ProductCard 
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.images[0]?.src}
            stockStatus={product.stock_status}
            shortDescription={product.short_description}
            sku={product.sku}
            slug={product.slug}
            attributes={product.attributes}
          />
        ))}
      </div>
    </div>
  );
}
