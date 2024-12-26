import Image from 'next/image';
import Link from 'next/link';
import { WooProduct } from '@/types/woocommerce';

interface CategoryProps {
  id: string;
  name: string;
  href: string;
  description?: string;
  product?: WooProduct;
}

interface CategoryGridProps {
  categories: CategoryProps[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="mt-12">
      <div className="mx-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => {
            if (!category.product) return null;

            return (
              <div key={category.id} className="relative group">
                <Link href={`/product-category/${category.id}`} className="block">
                  <div className="relative aspect-[0.6762] overflow-hidden rounded-lg">
                    <Image
                      src={category.product.images[0]?.src || '/images/placeholder.jpg'}
                      alt={category.product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    {/* Semi-transparent overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-black/40 transition-all duration-300" />
                    
                    {/* Content container - Mobile optimized */}
                    <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                      {/* Category name */}
                      <h3 className="text-base md:text-xl font-orbitron text-center text-white drop-shadow-lg mb-2">
                        {category.name}
                      </h3>
                      {/* Category description */}
                      {category.description && (
                        <p className="text-sm md:text-base text-white/90 text-center mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      {/* Shop Now button - Smaller on mobile */}
                      <div className="text-center">
                        <span className="shop-now-button inline-block text-white text-sm md:text-base 
                          border border-white/50 rounded-full px-3 py-1 md:px-4 md:py-2
                          group-hover:border-white/70 transition-all duration-300
                          backdrop-blur-sm bg-black/10 group-hover:bg-black/20">
                          Shop Now
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
