'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { WooCategory } from '@/lib/types';
import menuItems from '@/config/menu.json';

interface MenuItem {
  title: string;
  type: string;
  visible: boolean;
  order: number;
  slug?: string;
}

const menuConfig = menuItems.menuItems.reduce((acc, item) => {
  acc[item.title.toLowerCase()] = item.order;
  return acc;
}, {} as Record<string, number>);

export interface MobileMenuProps {
  categories: WooCategory[];
  onClose: () => void;
}

export function MobileMenu({ categories, onClose }: MobileMenuProps) {
  const categoryMap = new Map<number, WooCategory[]>();
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Get the visible product categories from menu configuration
  const visibleMenuCategories = menuItems.menuItems
    .filter(item => item.type === 'product' && item.visible)
    .reduce((acc, item) => {
      acc[item.title.toLowerCase()] = item;
      return acc;
    }, {} as Record<string, MenuItem>);

  // Filter and organize categories based on menu configuration
  const rootCategories: WooCategory[] = [];
  categories.forEach(category => {
    if (category.name.toLowerCase() === 'uncategorized') return;
    
    const menuItem = visibleMenuCategories[category.name.toLowerCase()];
    if (category.parent === 0) {
      // Only include root categories that are in the menu config and visible
      if (menuItem) {
        rootCategories.push(category);
      }
    } else {
      // Always include child categories as they'll only show if parent is visible
      const children = categoryMap.get(category.parent) || [];
      children.push(category);
      categoryMap.set(category.parent, children);
    }
  });

  // Sort root categories based on menu configuration order
  rootCategories.sort((a, b) => {
    const aMenuItem = visibleMenuCategories[a.name.toLowerCase()];
    const bMenuItem = visibleMenuCategories[b.name.toLowerCase()];
    return (aMenuItem?.order ?? 999) - (bMenuItem?.order ?? 999);
  });

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 flex">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
              <div className="flex justify-end px-4 pt-5">
                <button
                  type="button"
                  className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                  onClick={onClose}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Categories */}
              <div className="mt-2 px-4">
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  Categories
                </Dialog.Title>
                <ul className="mt-3 space-y-3">
                  {rootCategories.map((category) => {
                    const children = categoryMap.get(category.id) || [];
                    return (
                      <li key={category.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/product-category/${category.slug}`}
                            className="text-base text-gray-900 hover:text-purple-600"
                            onClick={onClose}
                          >
                            {category.name}
                          </Link>
                          {children.length > 0 && (
                            <button
                              className="p-1 text-gray-400"
                              onClick={() => toggleCategory(category.id)}
                            >
                              <span className="text-xl">{expandedCategories.has(category.id) ? '-' : '+'}</span>
                            </button>
                          )}
                        </div>
                        {children.length > 0 && expandedCategories.has(category.id) && (
                          <ul className="pl-4 space-y-2">
                            {children.map((child) => (
                              <li key={child.id}>
                                <Link
                                  href={`/product-category/${child.slug}`}
                                  className="text-sm text-gray-600 hover:text-purple-600"
                                  onClick={onClose}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Quick Links */}
              <div className="mt-8 px-4">
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  Quick Links
                </Dialog.Title>
                <ul className="mt-3 space-y-3">
                  {menuItems.menuItems
                    .filter(item => item.type === 'non-product' && item.visible)
                    .sort((a, b) => a.order - b.order)
                    .map(item => (
                      <li key={item.title}>
                        <Link 
                          href={`/${item.slug}`} 
                          className="text-base text-gray-900 hover:text-purple-600"
                          onClick={onClose}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}