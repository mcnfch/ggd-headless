'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  children?: Category[];
}

interface MobileMenuProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ categories, isOpen, onClose }: MobileMenuProps) {
  const [openCategories, setOpenCategories] = useState<number[]>([]);

  const toggleCategory = (categoryId: number) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryClick = () => {
    onClose(); // Close menu when category is selected
  };

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isOpen = openCategories.includes(category.id);

    return (
      <div key={category.id} className="border-b border-gray-200 last:border-b-0">
        <div
          className={`flex items-center justify-between py-3 px-4 ${
            level > 0 ? 'pl-' + (level * 4 + 4) : ''
          }`}
        >
          <Link
            href={`/category/${category.slug}`}
            onClick={handleCategoryClick}
            className="flex-grow text-gray-700 hover:text-purple-600"
          >
            {category.name}
            {category.count > 0 && (
              <span className="ml-2 text-sm text-gray-500">({category.count})</span>
            )}
          </Link>
          {hasChildren && (
            <button
              onClick={() => toggleCategory(category.id)}
              className="ml-2 p-1 text-gray-500 hover:text-purple-600"
              aria-label={isOpen ? 'Collapse category' : 'Expand category'}
            >
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {hasChildren && isOpen && (
          <div className="border-t border-gray-100">
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ... backdrop remains the same ... */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white transform transition-transform duration-300 z-[70]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <button onClick={onClose} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-70px)]">
          <div className="bg-white rounded-lg shadow-lg p-4">
            {categories.map(category => renderCategory(category))}
          </div>
        </div>
      </div>
    </>
  );
}