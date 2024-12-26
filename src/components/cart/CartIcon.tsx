'use client';

import { useCart } from '@/context/CartContext';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import SlideOutCart from './SlideOutCart';

export default function CartIcon() {
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <>
      <button onClick={() => setIsCartOpen(true)} className="relative inline-flex items-center p-2">
        <ShoppingBag className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>
      
      <SlideOutCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
