'use client';

import { FC } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const SlideOutCart = dynamic(() => import('../cart/SlideOutCart'), {
  loading: () => null
});

interface CartIconProps {
  count: number;
  isCartOpen: boolean;
  onCartClick: () => void;
}

const CartIcon: FC<CartIconProps> = ({ count, isCartOpen, onCartClick }) => {
  const handleClick = () => {
    onCartClick();
  };

  return (
    <>
      <button onClick={handleClick} className="relative p-2 ml-2">
        <div className="relative">
          <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </div>
      </button>
      <SlideOutCart isOpen={isCartOpen} onClose={onCartClick} />
    </>
  );
};

export default CartIcon;
