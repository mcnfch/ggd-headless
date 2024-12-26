import type { CartResponse, AddToCartInput } from '@/lib/types';

export class CartService {
  private static instance: CartService;
  private initialized = false;

  private constructor() {
    this.initialized = true;
  }

  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  async add(item: AddToCartInput): Promise<CartResponse> {
    if (!this.initialized) {
      throw new Error('Cart service not initialized');
    }

    try {
      // Return success immediately since we're managing cart state in CartContext
      return {
        success: true,
        message: 'Product added to cart',
        product_id: item.product_id,
        quantity: item.quantity
      };
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async update(productId: number, quantity: number): Promise<CartResponse> {
    if (!this.initialized) {
      throw new Error('Cart service not initialized');
    }

    try {
      // Return success immediately since we're managing cart state in CartContext
      return {
        success: true,
        message: 'Cart updated successfully',
        product_id: productId,
        quantity
      };
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  }

  async remove(productId: number): Promise<CartResponse> {
    if (!this.initialized) {
      throw new Error('Cart service not initialized');
    }

    try {
      // Return success immediately since we're managing cart state in CartContext
      return {
        success: true,
        message: 'Item removed from cart',
        product_id: productId
      };
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }
}

export const cartService = CartService.getInstance();
