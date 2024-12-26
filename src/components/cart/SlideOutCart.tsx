'use client';

import { useCart } from '@/context/CartContext';
import type { CartItem, WooProduct, WooVariation, WooVariantAttribute } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { woocommerce } from '@/lib/woocommerce';

export interface SlideOutCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SlideOutCart({ isOpen, onClose }: SlideOutCartProps) {
  const { cart, loading, removeItem, updateQuantity, updateItemOptions, canProceedToCheckout } = useCart();
  const [productDetails, setProductDetails] = useState<Record<number, WooProduct>>({});
  const [productVariations, setProductVariations] = useState<Record<number, WooVariation[]>>({});

  // Fetch product details and variations for all cart items
  useEffect(() => {
    if (!cart?.items.length) return;

    cart.items.forEach(async (item) => {
      if (!productDetails[item.product_id]) {
        try {
          const productResponse = await woocommerce.get(`products/${item.product_id}`);
          setProductDetails(prev => ({
            ...prev,
            [item.product_id]: productResponse.data
          }));

          if (productResponse.data.type === 'variable') {
            const variationsResponse = await woocommerce.get(`products/${item.product_id}/variations`);
            setProductVariations(prev => ({
              ...prev,
              [item.product_id]: variationsResponse.data
            }));
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      }
    });
  }, [cart?.items]);

  const handleOptionChange = async (productId: number, attributeName: string, value: string) => {
    const item = cart?.items.find(i => i.product_id === productId);
    if (!item) return;

    const product = productDetails[productId];
    if (!product) return;

    const attribute = product.attributes.find(attr => attr.name === attributeName);
    if (!attribute) return;

    const currentAttributes = item.attributes || [];
    const newAttributes: WooVariantAttribute[] = [
      ...currentAttributes.filter(attr => attr.name !== attributeName),
      { id: attribute.id, name: attributeName, option: value }
    ];

    // Find matching variation
    const variations = productVariations[productId] || [];
    const matchingVariation = variations.find(variation => {
      return variation.attributes.every(varAttr => {
        const selectedAttr = newAttributes.find(attr => attr.name === varAttr.name);
        return selectedAttr && selectedAttr.option === varAttr.option;
      });
    });

    // Update item options
    if (value && value !== '') {
      updateItemOptions(productId, {
        attributes: newAttributes,
        variation_id: matchingVariation?.id,
        price: matchingVariation?.price,
        sku: matchingVariation?.sku
      });
    } else {
      updateItemOptions(productId, {
        attributes: currentAttributes.filter(attr => attr.name !== attributeName),
        variation_id: undefined,
        price: item.price?.toString(),
        sku: item.sku
      });
    }
  };

  const shouldShowAttribute = (attribute: any) => {
    return attribute.options?.length > 1;
  };

  if (!isOpen) return null;

  const cartItems = cart?.items || [];

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close panel</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {loading ? (
                  <div className="mt-8">Loading...</div>
                ) : cartItems.length === 0 ? (
                  <div className="mt-8">Your cart is empty</div>
                ) : (
                  <div className="mt-8">
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {cartItems.map((item, index) => {
                          const product = productDetails[item.product_id];
                          const visibleAttributes = product?.attributes?.filter(shouldShowAttribute) || [];
                          
                          return (
                            <li key={`${item.product_id}-${item.variation_id || index}`} className="py-6 flex">
                              {item.image && (
                                <div className="flex-shrink-0 w-24 h-24 relative">
                                  <Image
                                    src={item.image || '/placeholder.jpg'}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="object-cover rounded"
                                  />
                                </div>
                              )}
                              <div className="ml-4 flex-1 flex flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>{item.name}</h3>
                                    <p className="ml-4">{formatPrice((item.price || 0) * item.quantity)}</p>
                                  </div>

                                  {/* Only show attributes with multiple options */}
                                  {visibleAttributes.map((attribute, attrIndex) => {
                                    const currentValue = item.attributes?.find(attr => attr.name === attribute.name)?.option || '';
                                    const isRequired = !currentValue && attribute.options?.length > 1;
                                    
                                    return (
                                      <div key={`${item.product_id}-${item.variation_id || index}-attr-${attrIndex}`} className="mt-4">
                                        <label 
                                          htmlFor={`${item.product_id}-${attribute.name}`}
                                          className="block text-sm font-medium text-gray-700"
                                        >
                                          {attribute.name}
                                          {isRequired && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        <select
                                          id={`${item.product_id}-${attribute.name}`}
                                          value={currentValue}
                                          onChange={(e) => handleOptionChange(item.product_id, attribute.name, e.target.value)}
                                          className={`mt-1 block w-full rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500 sm:text-sm
                                            ${isRequired ? 'border-red-300' : ''}`}
                                        >
                                          <option value="">Select {attribute.name}</option>
                                          {attribute.options?.map((option, optIndex) => (
                                            <option key={`${item.product_id}-${item.variation_id || index}-attr-${attrIndex}-opt-${optIndex}`} value={option}>
                                              {option}
                                            </option>
                                          ))}
                                        </select>
                                        {isRequired && (
                                          <p className="mt-1 text-sm text-red-500">
                                            Please select a {attribute.name.toLowerCase()}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex-1 flex items-end justify-between text-sm mt-4">
                                  <div className="flex items-center">
                                    <button
                                      onClick={() => updateQuantity(item.product_id, Math.max(0, item.quantity - 1))}
                                      className="px-2 py-1 border rounded-l"
                                    >
                                      -
                                    </button>
                                    <span className="px-4 py-1 border-t border-b">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                      className="px-2 py-1 border rounded-r"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <div className="flex">
                                    <button
                                      type="button"
                                      onClick={() => removeItem(
                                        item.product_id,
                                        item.variation_id,
                                        item.attributes
                                      )}
                                      className="font-medium text-red-600 hover:text-red-500"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>{formatPrice(cart?.subtotal || 0)}</p>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 mt-2">
                    <p>Total</p>
                    <p>{formatPrice(cart?.total || 0)}</p>
                  </div>
                  <div className="mt-6 space-y-2">
                    <Link
                      href="/checkout"
                      className={`w-full flex items-center justify-center rounded-lg border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm transition-colors
                        ${canProceedToCheckout 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'}`}
                      onClick={onClose}
                    >
                      Proceed to Checkout
                    </Link>
                    {!canProceedToCheckout && (
                      <p className="text-red-500 text-sm text-center">
                        Please select all required options for items in your cart before proceeding
                      </p>
                    )}
                    <Link
                      href="/cart"
                      className="w-full flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                      onClick={onClose}
                    >
                      View Cart
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add auto-open functionality when items are added
export function useSlideOutCart() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();

  useEffect(() => {
    // Open slide out when items are added to cart
    setIsOpen(true);
  }, [cart?.items.length]);

  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false)
  };
}
