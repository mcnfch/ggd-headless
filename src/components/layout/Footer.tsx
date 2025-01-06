'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { WooCategory } from '@/lib/types';
import { filterAndSortCategories } from '@/lib/utils/categoryUtils';

interface FooterProps {
  categories: WooCategory[];
}

const quickLinks = [
  { href: '/about-us', label: 'About Us' },
  { href: '/sustainability', label: 'Sustainability' },
  { href: '/shipping-returns', label: 'Shipping & Returns' },
  { href: '/my-account', label: 'My Account' },
  { href: '/contact-us', label: 'Contact Us' },
  { href: '/blog', label: 'Blog' },
];

export function Footer({ categories }: FooterProps) {
  const [email, setEmail] = useState('');

  // Get filtered and sorted categories for footer
  const footerCategories = filterAndSortCategories(categories, {
    parentOnly: true,
    maxItems: 5,
    forFooter: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribe:', email);
  };

  return (
    <footer className="bg-gray-800/90 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h5 className="text-lg font-semibold mb-4 text-white">Quick Links</h5>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-300 hover:text-purple-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-lg font-semibold mb-4 text-white">Categories</h5>
            <ul className="space-y-2">
              {footerCategories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/product-category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-gray-300 hover:text-purple-300"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="text-purple-300 hover:text-purple-400">
                  View All
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h5 className="text-lg font-semibold mb-4 text-white">Stay Updated</h5>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for the latest festival fashion trends and exclusive offers.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-grow px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Groovy Gallery Designs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}