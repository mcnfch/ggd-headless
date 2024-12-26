'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { CartItem, AddToCartInput, WooVariantAttribute, WooProduct } from '@/lib/types';
import { woocommerce } from '@/lib/woocommerce';

interface CartState {
  items: CartItem[];
  subtotal: number;
  total: number;
}

interface UpdateItemOptionsInput {
  attributes: WooVariantAttribute[];
  variation_id?: number;
  price?: string;
  sku?: string;
}

interface CartContextType {
  cart: CartState | null;
  loading: boolean;
  error: string | null;
  addToCart: (input: AddToCartInput) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => void;
  updateItemOptions: (productId: number, input: UpdateItemOptionsInput) => void;
  removeItem: (productId: number, variationId?: number, attributes?: WooVariantAttribute[]) => void;
  clearCart: () => void;
  canProceedToCheckout: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to compare attributes
function attributesMatch(
  itemAttrs: WooVariantAttribute[] = [], 
  targetAttrs: WooVariantAttribute[] = []
): boolean {
  if (targetAttrs.length === 0) return true;
  if (itemAttrs.length !== targetAttrs.length) return false;

  return targetAttrs.every(targetAttr => 
    itemAttrs.some(itemAttr => 
      itemAttr.name === targetAttr.name && 
      itemAttr.option === targetAttr.option
    )
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState | null>({
    items: [],
    subtotal: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canProceedToCheckout, setCanProceedToCheckout] = useState(true);
  const [productDetails, setProductDetails] = useState<Record<number, WooProduct>>({});

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error loading cart from localStorage:', err);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Fetch product details for cart items
  useEffect(() => {
    if (!cart?.items.length) return;

    cart.items.forEach(async (item) => {
      if (!productDetails[item.product_id]) {
        try {
          const response = await woocommerce.get(`products/${item.product_id}`);
          setProductDetails(prev => ({
            ...prev,
            [item.product_id]: response.data
          }));
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      }
    });
  }, [cart?.items]);

  // Check if cart can proceed to checkout
  useEffect(() => {
    if (!cart?.items.length) {
      setCanProceedToCheckout(false);
      return;
    }

    // Check if any product in the cart has unselected required attributes
    const hasUnselectedAttributes = cart.items.some(item => {
      const product = productDetails[item.product_id];
      if (!product?.attributes?.length) return false;

      const selectedAttributes = item.attributes || [];
      return product.attributes.some(attr => {
        const currentValue = selectedAttributes.find(selected => selected.name === attr.name)?.option || '';
        return !currentValue;
      });
    });

    setCanProceedToCheckout(!hasUnselectedAttributes);
  }, [cart?.items, productDetails]);

  const addToCart = useCallback(async (input: AddToCartInput) => {
    try {
      setLoading(true);
      setError(null);

      const cartItem: CartItem = {
        product_id: input.product_id,
        quantity: input.quantity,
        name: input.name || '',
        price: input.price,
        image: input.image,
        variation_id: input.variation_id,
        attributes: input.attributes || [],
        optionsRequired: Boolean(input.product?.attributes?.length > 0),
        optionsSelected: Boolean(input.attributes?.length > 0)
      };

      setCart(prevCart => {
        if (!prevCart) {
          return {
            items: [cartItem],
            subtotal: input.price * input.quantity,
            total: input.price * input.quantity
          };
        }

        // Check if an identical item already exists
        const existingItemIndex = prevCart.items.findIndex(item => {
          // First check product and variation IDs
          const basicMatch = item.product_id === input.product_id &&
                           item.variation_id === input.variation_id;
          
          if (!basicMatch) return false;

          // Then check if all attributes match exactly
          return attributesMatch(item.attributes, input.attributes);
        });

        if (existingItemIndex > -1) {
          const updatedItems = [...prevCart.items];
          updatedItems[existingItemIndex].quantity += input.quantity;

          const newSubtotal = prevCart.subtotal + (input.price * input.quantity);
          return {
            ...prevCart,
            items: updatedItems,
            subtotal: newSubtotal,
            total: newSubtotal
          };
        }

        const newSubtotal = prevCart.subtotal + (input.price * input.quantity);
        return {
          ...prevCart,
          items: [...prevCart.items, cartItem],
          subtotal: newSubtotal,
          total: newSubtotal
        };
      });
    } catch (error) {
      setError('Failed to add item to cart');
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 1) return;

    setCart(prevCart => {
      if (!prevCart) return null;

      const updatedItems = prevCart.items.map(item => {
        if (item.product_id === productId) {
          return { ...item, quantity };
        }
        return item;
      });

      const newSubtotal = updatedItems.reduce(
        (total, item) => total + (item.price || 0) * item.quantity,
        0
      );

      return {
        ...prevCart,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newSubtotal
      };
    });
  }, []);

  const updateItemOptions = useCallback((productId: number, input: UpdateItemOptionsInput) => {
    setCart(prevCart => {
      if (!prevCart) return null;

      const updatedItems = prevCart.items.map(item => {
        if (item.product_id === productId) {
          return {
            ...item,
            attributes: input.attributes,
            variation_id: input.variation_id,
            price: input.price ? parseFloat(input.price) : item.price,
            sku: input.sku
          };
        }
        return item;
      });

      const newSubtotal = updatedItems.reduce(
        (total, item) => total + (item.price || 0) * item.quantity,
        0
      );

      return {
        ...prevCart,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newSubtotal
      };
    });
  }, []);

  const removeItem = useCallback((
    productId: number, 
    variationId?: number, 
    attributes?: WooVariantAttribute[]
  ) => {
    setCart(prevCart => {
      if (!prevCart) return null;

      const updatedItems = prevCart.items.filter(item => {
        // If it's not the same product, keep it
        if (item.product_id !== productId) {
          return true;
        }

        // If variation ID is provided and doesn't match, keep it
        if (variationId !== undefined && item.variation_id !== variationId) {
          return true;
        }

        // If attributes are provided and don't match exactly, keep it
        if (attributes && !attributesMatch(item.attributes, attributes)) {
          return true;
        }

        // If we get here, this item should be removed
        return false;
      });

      const newSubtotal = updatedItems.reduce(
        (total, item) => total + (item.price || 0) * item.quantity,
        0
      );

      return {
        ...prevCart,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newSubtotal
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      subtotal: 0,
      total: 0
    });
  }, []);

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    updateItemOptions,
    removeItem,
    clearCart,
    canProceedToCheckout
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}