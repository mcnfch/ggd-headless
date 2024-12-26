'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import type { WooCategory } from '@/lib/types';
import { filterAndSortCategories } from '@/lib/utils/categoryUtils';

const CartIcon = dynamic(() => import('./CartIcon'), {
  ssr: false,
  loading: () => <div className="w-10 h-10 animate-pulse bg-gray-200 rounded-full" />
});

const MobileMenu = dynamic(() => import('./MobileMenu').then(mod => mod.MobileMenu), {
  loading: () => <div className="w-10 h-10 animate-pulse bg-gray-200 rounded-full" />
});

interface HeaderProps {
  categories: WooCategory[];
}

function CategoryDropdown({ category, children }: { category: WooCategory; children: WooCategory[] }) {
  return (
    <div className="group relative inline-block">
      <button className="text-white hover:text-[#997997] transition-colors text-sm font-medium py-2 inline-flex items-center">
        {category.name}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute left-0 mt-0 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="relative top-2 p-2 bg-white rounded-md shadow-lg">
          {children.map((child) => (
            <Link
              key={child.slug}
              href={`/product-category/${child.slug}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-100 hover:text-[#997997] rounded-md"
            >
              {child.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header({ categories }: HeaderProps) {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = useMemo(() => cart?.items?.length || 0, [cart?.items?.length]);

  const handleProfileClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProfileMenuOpen(!isProfileMenuOpen);
  }, [isProfileMenuOpen]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const categoryMap = useMemo(() => {
    const parentCategories = categories.filter(cat => cat.parent === 0);
    const childrenMap = new Map<number, WooCategory[]>();
    
    categories.forEach(cat => {
      if (cat.parent !== 0) {
        const children = childrenMap.get(cat.parent) || [];
        children.push(cat);
        childrenMap.set(cat.parent, children);
      }
    });

    return { parentCategories, childrenMap };
  }, [categories]);

  return (
    <>
      <header className="bg-[#000000]">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex items-stretch justify-between h-14 md:h-16">
            <Link href="/" className="flex items-center">
              <div className="relative h-full flex items-center">
                <Image
                  src="/images/gg_banner3.0.png"
                  alt="Groovy Gallery Designs"
                  width={150}
                  height={50}
                  className="h-full w-auto object-contain"
                  priority
                  loading="eager"
                  sizes="(max-width: 768px) 150px, 200px"
                  quality={90}
                />
              </div>
            </Link>

            <div className="flex items-center">
              <nav className="hidden md:flex space-x-8 items-center mr-8">
                {filterAndSortCategories(categoryMap.parentCategories).map((category) => {
                  const children = categoryMap.childrenMap.get(category.id) || [];
                  return children.length > 0 ? (
                    <CategoryDropdown key={category.slug} category={category} children={children} />
                  ) : (
                    <Link
                      key={category.slug}
                      href={`/product-category/${category.slug.toLowerCase()}`}
                      className="text-white hover:text-[#997997] transition-colors text-sm font-medium"
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-1">
                {/* User Icon */}
                <div className="relative profile-menu-container">
                  <button
                    onClick={handleProfileClick}
                    className="text-white hover:text-[#997997] transition-colors"
                    aria-label="User menu"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      {user ? (
                        <>
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Profile
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileMenuOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Login
                          </Link>
                          <Link
                            href="/register"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Register
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Cart Icon */}
                <div className="relative text-white hover:text-[#997997] transition-colors">
                  <Suspense fallback={<div className="w-10 h-10 animate-pulse bg-gray-200 rounded-full" />}>
                    <CartIcon 
                      count={cartCount} 
                      isCartOpen={isCartOpen}
                      onCartClick={() => setIsCartOpen(!isCartOpen)}
                    />
                  </Suspense>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden text-white hover:text-[#997997] transition-colors"
                  aria-label="Menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <MobileMenu categories={categories} onClose={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}

export function Hero() {
  return (
    <div className="relative w-full min-h-[500px] flex bg-black pt-28">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/gg_banner.png?v=1"
          alt="Festival background"
          fill
          className="object-cover opacity-60"
          sizes="100vw"
          priority
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-start items-start gap-4 pt-4">
          {/* Text Content */}
          <div className="max-w-[600px] md:max-w-[500px] lg:max-w-[600px]">
            {/* Social Proof */}
            <p className="text-[12px] md:text-[15px] text-white/80 mb-[8px] font-bold">
              Over 1,000 festival-goers rave about our custom designs
            </p>

            {/* Main Heading */}
            <h2 className="text-[32px] md:text-[45px] font-bold text-white mb-[12px] mt-0 leading-[1.1] md:leading-[1.2]">
              Never blend in at{" "}
              <br /> 
              a festival again
            </h2>

            {/* Supporting Text */}
            <p className="text-[1rem] md:text-[1.5rem] text-white/90 leading-[1.3] md:leading-[1.4] mr-[10%] md:mr-[20%] mb-[16px]">
              Our unique, artfully crafted{" "}
              <br /> 
              designs ensure you shine.
            </p>

            {/* CTA Buttons */}
            <div className="mt-[16px]">
              <div className="flex gap-3 md:gap-4">
                <Link
                  href="/shop"
                  className="inline-block px-4 md:px-6 py-2 md:py-3 bg-[#997997] text-white text-[1rem] md:text-[1.2rem] font-bold 
                    rounded-[5px] no-underline transition-all duration-300 hover:bg-[#886886]"
                >
                  Learn More
                </Link>
                <Link
                  href="/shop"
                  className="inline-block px-4 md:px-6 py-2 md:py-3 bg-[#997997] text-white text-[1rem] md:text-[1.2rem] font-bold 
                    rounded-[5px] no-underline transition-all duration-300 hover:bg-[#886886]"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Hero Model Image */}
          <div className="relative w-[240px] md:w-[320px] h-[280px] md:h-[384px] -mr-4 md:-mr-8 mt-auto md:mt-0">
            <Image
              src="/images/hero-model.png?v=1"
              alt="Festival model"
              fill
              className="object-contain object-left"
              sizes="(max-width: 768px) 240px, 320px"
              priority
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
}