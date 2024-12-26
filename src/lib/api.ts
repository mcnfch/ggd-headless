/**
 * Centralized API client for making requests to our Next.js API routes
 */

import type { WooProduct, WooCategory, WooVariation, WooOrder } from './types';

interface ApiOptions {
  endpoint: string;
  payload?: any;
  params?: Record<string, string>;
}

export async function apiClient<T = any>({ endpoint, payload, params }: ApiOptions): Promise<T> {
  // Get the base URL from the window location in the browser, or use a default in Node.js
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
  const response = await fetch(`${baseUrl}/api/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      payload,
      params,
    }),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    } catch (parseError) {
      throw new Error(response.statusText || 'API request failed');
    }
  }

  try {
    return await response.json();
  } catch (parseError) {
    throw new Error('Failed to parse response');
  }
}

// Typed API methods for better developer experience
export const api = {
  products: {
    list: (params: Record<string, any> = {}) => 
      apiClient<WooProduct[]>({ endpoint: 'products.list', params }),
    get: (id: number) => 
      apiClient<WooProduct>({ endpoint: 'products.get', params: { id: id.toString() } }),
    variations: (productId: string) => 
      apiClient<WooVariation[]>({ endpoint: 'products.variations', params: { id: productId } }),
    variation: (productId: string, variationId: string) => 
      apiClient<WooVariation>({ endpoint: 'products.variation', params: { id: productId, variation_id: variationId } }),
  },
  categories: {
    list: () => 
      apiClient<WooCategory[]>({ endpoint: 'categories.list' }),
  },
  orders: {
    create: (payload: Partial<WooOrder>) => 
      apiClient<WooOrder>({ endpoint: 'orders.create', payload }),
    update: (orderId: string, payload: any) => 
      apiClient<WooOrder>({ endpoint: 'orders.update', payload: { id: orderId, ...payload } }),
  },
  payment: {
    createIntent: (amount: number, currency: string = 'USD') => 
      apiClient<{ clientSecret: string }>({ endpoint: 'payment.createIntent', payload: { amount, currency } }),
  },
};
