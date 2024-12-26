'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Loader2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { woocommerce } from '@/lib/woocommerce';
import type { WooVariantAttribute, WooProduct, WooVariation } from '@/lib/types';

export default function CartPage() {
  const { cart, loading, error, updateQuantity, removeItem, updateItemOptions, canProceedToCheckout } = useCart();
  const [productDetails, setProductDetails] = useState<Record<number, WooProduct>>({});
  const [productVariations, setProductVariations] = useState<Record<number, WooVariation[]>>({});
  const [loadingProducts, setLoadingProducts] = useState<Record<number, boolean>>({});
  const [loadingVariations, setLoadingVariations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!cart?.items.length) return;

    const fetchProductData = async (productId: number) => {
      if (loadingProducts[productId] || productDetails[productId]) return;

      setLoadingProducts(prev => ({ ...prev, [productId]: true }));
      try {
        const productResponse = await woocommerce.get(`products/${productId}`);
        setProductDetails(prev => ({ ...prev, [productId]: productResponse.data }));

        // Auto-select single options
        const item = cart.items.find(i => i.product_id === productId);
        if (item) {
          const currentAttributes = item.attributes || [];
          const newAttributes = [...currentAttributes];
          let hasChanges = false;

          productResponse.data.attributes?.forEach(attr => {
            if (attr.options?.length === 1 && !currentAttributes.find(a => a.name === attr.name)) {
              newAttributes.push({
                id: attr.id,
                name: attr.name,
                option: attr.options[0]
              });
              hasChanges = true;
            }
          });

          if (hasChanges) {
            updateItemOptions(productId, {
              attributes: newAttributes,
              variation_id: item.variation_id,
              price: item.price?.toString(),
              sku: item.sku
            });
          }
        }

        if (productResponse.data.type === 'variable') {
          setLoadingVariations(prev => ({ ...prev, [productId]: true }));
          const variationsResponse = await woocommerce.get(`products/${productId}/variations`);
          setProductVariations(prev => ({ ...prev, [productId]: variationsResponse.data }));
          setLoadingVariations(prev => ({ ...prev, [productId]: false }));
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoadingProducts(prev => ({ ...prev, [productId]: false }));
      }
    };

    cart.items.forEach(item => {
      if (!productDetails[item.product_id]) {
        fetchProductData(item.product_id);
      }
    });
  }, [cart?.items]);

  const findMatchingVariation = (productId: number, selectedAttributes: WooVariantAttribute[]) => {
    const variations = productVariations[productId] || [];
    return variations.find(variation => {
      return variation.attributes.every(varAttr => {
        const selectedAttr = selectedAttributes.find(attr => attr.name === varAttr.name);
        return selectedAttr && selectedAttr.option === varAttr.option;
      });
    });
  };

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

    const matchingVariation = findMatchingVariation(productId, newAttributes);
    
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

  const shouldShowAttribute = (attribute: WooVariantAttribute) => {
    if (!attribute.variation || !attribute.options) return false;
    if (attribute.options.length <= 1) return false;

    const attrNameLower = attribute.name.toLowerCase();
    if (attrNameLower.includes('shipping') || 
        attrNameLower.includes('country') || 
        attrNameLower.includes('location')) {
      const hasUSOption = attribute.options.some(opt => 
        opt.toLowerCase().includes('united states') || 
        opt.toLowerCase().includes('us') || 
        opt.toLowerCase() === 'usa' ||
        opt.toLowerCase() === 'u.s.' ||
        opt.toLowerCase() === 'u.s.a.'
      );
      if (hasUSOption) return false;
    }

    return true;
  };

  const CartItems = () => (
    <div>
      {loading ? (
        <div>Loading cart...</div>
      ) : !cart?.items?.length ? (
        <div>Your cart is empty</div>
      ) : (
        <div className="space-y-6">
          {cart.items.map((item) => {
            const product = productDetails[item.product_id];
            const visibleAttributes = product?.attributes?.filter(shouldShowAttribute) || [];
            
            return (
              <div key={item.product_id} className="flex gap-6 pb-6 border-b">
                <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md relative">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">SKU: {product?.sku}</p>
                    </div>
                    <p className="text-lg font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  {/* Only show attributes with multiple options */}
                  {visibleAttributes.map((attribute) => (
                    <div key={attribute.id} className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {attribute.name}
                      </label>
                      <select
                        value={item.attributes?.find(attr => attr.name === attribute.name)?.option || ''}
                        onChange={(e) => handleOptionChange(item.product_id, attribute.name, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                      >
                        <option value="">Select {attribute.name}</option>
                        {attribute.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, Math.max(0, item.quantity - 1))}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="p-1 rounded-md hover:bg-gray-100"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const OrderSummary = () => (
    <div>
      <h2 className="text-lg font-bold">Order Summary</h2>
      
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>${cart.subtotal.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span>${cart.total.toFixed(2)}</span>
      </div>

      <div className="pt-4">
        <Link
          href="/checkout"
          className={`w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg
            ${canProceedToCheckout ? '' : 'pointer-events-none opacity-50'}`}
          aria-disabled={!canProceedToCheckout}
          tabIndex={canProceedToCheckout ? 0 : -1}
        >
          Proceed to Checkout
        </Link>
        <Link
          href="/"
          className="w-full block text-center mt-2 border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 bg-transparent">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Cart Items */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
            <CartItems />
          </div>

          {/* Right Panel - Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
