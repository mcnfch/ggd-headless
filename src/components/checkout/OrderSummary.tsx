'use client';

import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

// Removed local CartItem interface to avoid conflict

export function OrderSummary() {
  const { cart } = useCart();

  const calculateSubtotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  if (!cart?.items) return null;

  const cartItems = cart.items;
  const subtotal = calculateSubtotal(cartItems);
  const shipping = 0; // Will be calculated during checkout
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
      <div className="mt-6 flow-root">
        <ul className="-my-4 divide-y divide-gray-200">
          {cartItems.map((item, index) => (
            <li key={`${item.product_id}-${item.variation_id || index}`} className="flex py-4">
              {item.image && (
                <div className="flex-shrink-0 w-16 h-16 relative">
                  <Image
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="object-cover rounded-md"
                  />
                </div>
              )}
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <h3 className="text-sm text-gray-700">{item.name}</h3>
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice((item.price || 0) * item.quantity)}
                  </p>
                </div>
                <div className="mt-1 flex text-sm text-gray-500">
                  <p>Qty {item.quantity}</p>
                  {item.attributes && item.attributes.length > 0 && (
                    <p className="ml-4 pl-4 border-l border-gray-200">
                      {item.attributes.map((attr: { option: string }) => attr.option).join(' / ')}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <dl className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-600">Subtotal</dt>
          <dd className="text-sm font-medium text-gray-900">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <dt className="text-base font-medium text-gray-900">Order total</dt>
          <dd className="text-base font-medium text-gray-900">{formatPrice(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
