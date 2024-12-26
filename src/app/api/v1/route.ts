import { NextRequest, NextResponse } from 'next/server';
import { cartService } from '@/lib/woocommerce/cart';
import { woocommerce } from '@/lib/woocommerce';
import { getCategories } from '@/lib/woocommerce';

// Define all possible API endpoints
type Endpoint = 
  | 'cart.add'
  | 'cart.update'
  | 'cart.remove'
  | 'cart.clear'
  | 'cart.get'
  | 'products.list'
  | 'products.get'
  | 'products.variations'
  | 'products.variation'
  | 'categories.list'
  | 'categories.get'
  | 'navigation.get'
  | 'orders.create'
  | 'orders.update'
  | 'orders.list'
  | 'orders'
  | 'payment.create';

interface ApiRequest {
  endpoint: Endpoint;
  payload?: Record<string, unknown>;
  params?: Record<string, string>;
}

async function handleCartRequests(endpoint: string, payload: Record<string, unknown>) {
  switch (endpoint) {
    case 'cart.add':
      return await cartService.add(payload as any);
    case 'cart.update':
      const { product_id, quantity } = payload;
      return await cartService.update(product_id as number, quantity as number);
    case 'cart.remove':
      return await cartService.remove(payload.product_id as number);
    case 'cart.clear':
      return { success: true, message: 'Cart cleared' };
    case 'cart.get':
      return { success: true, message: 'Cart retrieved' };
    default:
      throw new Error('Invalid cart endpoint');
  }
}

async function handleProductRequests(
  endpoint: string,
  params: Record<string, string>,
  _payload: Record<string, unknown>
) {
  switch (endpoint) {
    case 'products.list':
      const response = await woocommerce.get('products', { params });
      return response.data;
    case 'products.get':
      const { id } = params;
      if (!id) throw new Error('Product ID is required');
      const productResponse = await woocommerce.get(`products/${id}`);
      return productResponse.data;
    case 'products.variations':
      const { productId } = params;
      return await woocommerce.get(`products/${productId}/variations`).then(response => response.data);
    case 'products.variation':
      const { productId: pid, variationId } = params;
      return await woocommerce.get(`products/${pid}/variations/${variationId}`).then(response => response.data);
    default:
      throw new Error('Invalid product endpoint');
  }
}

async function handleCategoryRequests(endpoint: string) {
  switch (endpoint) {
    case 'categories.list':
      return await getCategories();
    case 'categories.get':
      return await getCategories();
    default:
      throw new Error('Invalid category endpoint');
  }
}

async function handleNavigationRequests(endpoint: string) {
  switch (endpoint) {
    case 'navigation.get':
      const categories = await getCategories();
      return { categories };
    default:
      throw new Error('Invalid navigation endpoint');
  }
}

async function handleOrderRequests(
  endpoint: string,
  params: Record<string, string>,
  payload: any
) {
  try {
    switch (endpoint) {
      case 'orders.create':
        return await woocommerce.post('orders', payload);
      case 'orders.update':
        const { orderId } = params;
        return await woocommerce.put(`orders/${orderId}`, payload);
      case 'orders.list':
      case 'orders':
        const response = await woocommerce.get('orders');
        return response.data;
      default:
        throw new Error('Invalid order endpoint');
    }
  } catch (error) {
    console.error('Error in handleOrderRequests:', error);
    throw error;
  }
}

async function handlePaymentRequests(endpoint: string, _payload: Record<string, unknown>) {
  switch (endpoint) {
    default:
      throw new Error('Invalid payment endpoint');
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const { endpoint, payload = {}, params: requestParams = {} } = await request.json() as ApiRequest;

    // Validate WooCommerce configuration
    if (
      !process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY ||
      !process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET ||
      !process.env.NEXT_PUBLIC_WOOCOMMERCE_URL
    ) {
      return NextResponse.json(
        { error: 'WooCommerce configuration missing' },
        { status: 500 }
      );
    }

    let result;
    const [domain] = endpoint.split('.');

    switch (domain) {
      case 'cart':
        result = await handleCartRequests(endpoint, payload);
        break;
      case 'products':
        result = await handleProductRequests(endpoint, requestParams, payload);
        break;
      case 'categories':
        result = await handleCategoryRequests(endpoint);
        break;
      case 'orders':
        result = await handleOrderRequests(endpoint, requestParams, payload);
        break;
      case 'payment':
        result = await handlePaymentRequests(endpoint, payload);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const params = Object.fromEntries(searchParams.entries());

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    let result;
    const [domain] = endpoint.split('.');

    switch (domain) {
      case 'products':
        result = await handleProductRequests(endpoint, params, {});
        break;
      case 'categories':
        result = await handleCategoryRequests(endpoint);
        break;
      case 'navigation':
        result = await handleNavigationRequests(endpoint);
        break;
      case 'orders':
        result = await handleOrderRequests(endpoint, params, {});
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
