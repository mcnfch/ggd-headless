'use client';

import { memo } from 'react';
import Link from 'next/link';
import type { WooCategory } from '@/lib/types';
import { filterAndSortCategories } from '@/lib/utils/categoryUtils';

interface NavigationProps {
  categories: WooCategory[];
}

interface DropdownProps {
  title: string;
  items: WooCategory[];
}

const Dropdown = memo(function Dropdown({ title, items }: DropdownProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="group relative inline-block">
      <button className="text-white hover:text-purple-200 transition-colors px-3 py-2 text-sm font-medium inline-flex items-center">
        {title}
        <svg
          className="ml-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute left-0 mt-0 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="relative top-2 p-2 bg-white rounded-md shadow-lg">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/product-category/${item.slug}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-900 rounded-md"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
});

interface StaticLinkProps {
  title: string;
  href: string;
}

const StaticLink = memo(function StaticLink({ title, href }: StaticLinkProps) {
  return (
    <Link href={href} className="text-white hover:text-purple-200 transition-colors px-3 py-2 text-sm font-medium">
      {title}
    </Link>
  );
});

const Navigation = memo(function Navigation({ categories }: NavigationProps) {
  const menuCategories = filterAndSortCategories(categories, {
    parentOnly: true,
    forFooter: false
  });

  const getSubcategories = (parentId: number) => {
    return categories.filter(cat => cat.parent === parentId);
  };

  return (
    <nav className="bg-[#32143e] w-full">
      <div className="container mx-auto">
        <div className="flex justify-center items-center h-12">
          <div className="flex space-x-8">
            <StaticLink title="Newly Dropped" href="/product-category/newly-dropped" />
            {menuCategories.map((category) => {
              const subcategories = getSubcategories(category.id);
              return subcategories.length > 0 ? (
                <Dropdown
                  key={category.slug}
                  title={category.name}
                  items={subcategories}
                />
              ) : (
                <Link
                  key={category.slug}
                  href={`/product-category/${category.slug}`}
                  className="text-white hover:text-purple-200 transition-colors px-3 py-2 text-sm font-medium"
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
});

export default Navigation;