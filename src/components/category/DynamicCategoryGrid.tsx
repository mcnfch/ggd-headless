'use client';

import { CyclingCategoryTile } from './CyclingCategoryTile';
import type { WooCategory, WooProduct } from '@/lib/types';

interface DynamicCategoryGridProps {
  categories: WooCategory[];
  categoryProducts: Record<string, WooProduct[]>;
}

export function DynamicCategoryGrid({ categories, categoryProducts }: DynamicCategoryGridProps) {
  return (
    <div className="mt-12 mx-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CyclingCategoryTile
            key={category.id}
            categoryName={category.name}
            categorySlug={category.slug}
            products={categoryProducts[category.id] || []}
            cycleInterval={4000 + (categories.indexOf(category) * 500)} // Stagger the transitions
          />
        ))}
      </div>
    </div>
  );
}
