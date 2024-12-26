'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const SlideOutCart = dynamic(() => import('../cart/SlideOutCart'), {
  loading: () => null
});

interface CartIconProps {
  count?: number;
  isCartOpen: boolean;
  onCartClick: () => void;
}

export default function CartIcon({ count = 0, isCartOpen, onCartClick }: CartIconProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onCartClick();
  }, [onCartClick]);

  return (
    <>
      <button onClick={handleClick} className="relative p-2 ml-2">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-white hover:text-gray-200 transition-colors" 
          fill="currentColor"
          viewBox="0 0 24 24" 
          stroke="none"
        >
          <path 
            d="M20 6.5h-3v-2c0-2.2-1.8-4-4-4s-4 1.8-4 4v2H6c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2zm-9-2c0-1.1.9-2 2-2s2 .9 2 2v2h-4v-2z"
          />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      <SlideOutCart isOpen={isCartOpen} onClose={onCartClick} />
    </>
  );
}
