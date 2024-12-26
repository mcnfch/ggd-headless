'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { WooProduct } from '@/lib/types';

interface CyclingCategoryTileProps {
  categoryName: string;
  categorySlug: string;
  products: WooProduct[];
  cycleInterval?: number;
}

export function CyclingCategoryTile({ 
  categoryName, 
  categorySlug, 
  products,
  cycleInterval = 4000
}: CyclingCategoryTileProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % products.length);
    }, cycleInterval);

    return () => clearInterval(interval);
  }, [products.length, cycleInterval]);

  if (!products.length) {
    return null;
  }

  return (
    <Link href={`/product-category/${categorySlug}`} className="block group">
      <div className="relative aspect-[0.6762] overflow-hidden rounded-lg">
        {products.map((product, index) => (
          <div
            key={product.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={product.images[0]?.src || '/images/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(min-width: 1520px) 506px, (min-width: 768px) 33vw, 50vw"
              priority={index === 0}
            />
          </div>
        ))}
        
        {/* Dark overlay with text and button */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <h3 className="category-heading text-2xl md:text-3xl lg:text-4xl font-orbitron text-center text-white px-4 tracking-wider font-bold drop-shadow-lg">
              {categoryName}
            </h3>
            <button className="shop-now-button bg-white/80 hover:bg-white/90 text-gray-900 rounded-full font-orbitron text-lg font-semibold tracking-wide transition-all duration-300 transform translate-y-0 group-hover:translate-y-0 shadow-lg">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
