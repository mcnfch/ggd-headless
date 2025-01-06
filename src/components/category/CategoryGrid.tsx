import Image from 'next/image';
import Link from 'next/link';
import { WooProduct } from '@/types/woocommerce';

interface CategoryProps {
  id: string;
  name: string;
  href: string;
  description?: string;
  product?: WooProduct;
  isCustom?: boolean;
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

            const isCustom = category.isCustom;
            const buttonText = isCustom ? "Start Creating" : "Shop Now";
            const buttonClasses = isCustom 
              ? "inline-block text-white text-sm md:text-base font-semibold px-5 py-2 md:px-6 md:py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 rounded-full transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-white/20"
              : "inline-block text-white text-sm md:text-base font-semibold px-5 py-2 md:px-6 md:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-white/20";

            return (
              <div key={category.id} className="relative group">
                <Link href={category.href} className="block">
                  <div className="relative aspect-[0.6762] overflow-hidden rounded-lg">
                    <Image
                      src={category.product.images[0]?.src || '/images/placeholder.jpg'}
                      alt={category.product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    {/* Enhanced overlay with stronger gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${
                      isCustom 
                        ? 'from-violet-900/80 via-fuchsia-900/40' 
                        : 'from-black/80 via-black/40'
                    } to-transparent group-hover:opacity-90 transition-all duration-300`} />
                    
                    {/* Content container - Enhanced for better visibility */}
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                      {/* Category name - Enhanced with text shadow and backdrop */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-black/30 blur-sm rounded-lg" />
                        <h3 className={`relative text-lg md:text-2xl font-orbitron text-center font-bold tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-3 ${
                          isCustom ? 'text-fuchsia-100' : 'text-white'
                        }`}>
                          {category.name}
                        </h3>
                      </div>
                      {/* Category description - Enhanced contrast */}
                      {category.description && (
                        <p className={`text-sm md:text-base text-center mb-4 line-clamp-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] ${
                          isCustom ? 'text-fuchsia-50' : 'text-white'
                        }`}>
                          {category.description}
                        </p>
                      )}
                      {/* Action button - Enhanced with gradient and animation */}
                      <div className="text-center">
                        <span className={buttonClasses}>
                          {buttonText}
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
