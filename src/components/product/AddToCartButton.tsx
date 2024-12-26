'use client';

import { useCart } from '@/context/CartContext';
import type { WooProduct } from '@/lib/types';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const SlideOutCart = dynamic(() => import('../cart/SlideOutCart'), {
  ssr: false,
});

interface AddToCartButtonProps {
  product: WooProduct;
  className?: string;
  isEnabled?: boolean;
  isProductPage?: boolean;
  onClick?: () => Promise<void>;
}

export function AddToCartButton({ 
  product, 
  className = '', 
  isEnabled = true,
  isProductPage = false,
  onClick 
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleClick = async () => {
    if (onClick) {
      await onClick();
      return;
    }

    try {
      await addToCart({
        product_id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        image: product.images[0]?.src,
        product: product // Pass the full product for options detection
      });
      setIsCartOpen(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const buttonClasses = `
    ${className}
    ${isProductPage ? 'w-full py-4 px-8 text-lg font-bold rounded-lg shadow-lg transform transition-all duration-200' : 'py-2 px-4 text-base font-medium rounded-md'}
    ${isEnabled && product.stock_status === 'instock'
      ? 'bg-purple-600 hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98]'
      : 'bg-gray-400 cursor-not-allowed'}
    flex items-center justify-center space-x-2 text-white
  `;

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!isEnabled || product.stock_status !== 'instock'}
        className={buttonClasses}
      >
        <span>
          {!isEnabled 
            ? 'Select Options' 
            : product.stock_status === 'instock' 
              ? 'Add to Cart' 
              : 'Out of Stock'
          }
        </span>
        {isEnabled && product.stock_status === 'instock' && (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
        )}
      </button>

      {isCartOpen && (
        <SlideOutCart onClose={() => setIsCartOpen(false)} />
      )}
    </>
  );
}
