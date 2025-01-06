'use client';

import { FC } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import SlideOutCart from './SlideOutCart';

interface CartIconProps {
  count: number;
}

const CartIcon: FC<CartIconProps> = ({ count }) => {
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <>
      <button 
        onClick={() => setIsCartOpen(true)}
        className="relative"
        aria-label={`Shopping cart with ${itemCount} items`}
      >
        <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>
      <SlideOutCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default CartIcon;
