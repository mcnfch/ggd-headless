'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

interface ShopHeaderProps {
  totalProducts: number;
  onSort: (sortBy: string) => void;
  currentSort: string;
  categoryName?: string;
}

export function ShopHeader({ totalProducts, categoryName, onSort, currentSort }: ShopHeaderProps) {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    ...(categoryName ? [{ label: categoryName }] : [])
  ];

  return (
    <div className="max-w-[1920px] mx-auto px-4">
      <nav className="text-sm py-4" aria-label="Breadcrumb">
        <Breadcrumbs items={breadcrumbItems} />
      </nav>

      <h1 className="text-3xl font-bold mb-8">
        {categoryName || 'Shop'}
      </h1>

      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-600">
          Showing all {totalProducts} results
        </p>
        <select 
          className="border rounded-md px-3 py-1.5 text-sm"
          value={currentSort}
          onChange={(e) => onSort(e.target.value)}
        >
          <option value="default">Default sorting</option>
          <option value="price-asc">Sort by price: low to high</option>
          <option value="price-desc">Sort by price: high to low</option>
          <option value="name-asc">Sort by name: A-Z</option>
          <option value="name-desc">Sort by name: Z-A</option>
          <option value="newest">Sort by newest</option>
        </select>
      </div>
    </div>
  );
}