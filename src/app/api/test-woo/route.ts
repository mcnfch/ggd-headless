import { NextResponse } from 'next/server';
import { getCategories, getProducts } from '@/lib/woocommerce';

export async function GET() {
  const startTime = Date.now();
  console.log('[WooCommerce Test] Starting API test...');

  try {
    // Test categories endpoint
    console.log('[WooCommerce Test] Fetching categories...');
    const categoriesStartTime = Date.now();
    const categories = await getCategories();
    const categoriesTime = Date.now() - categoriesStartTime;
    console.log(`[WooCommerce Test] Categories fetch completed in ${categoriesTime}ms`);

    if (!categories || categories.length === 0) {
      console.warn('[WooCommerce Test] No categories found - this might indicate an issue');
    }

    // Test products endpoint
    console.log('[WooCommerce Test] Fetching products...');
    const productsStartTime = Date.now();
    const { products } = await getProducts();
    const productsTime = Date.now() - productsStartTime;
    console.log(`[WooCommerce Test] Products fetch completed in ${productsTime}ms`);

    if (!products || products.length === 0) {
      console.warn('[WooCommerce Test] No products found - this might indicate an issue');
    }

    // Prepare detailed response
    const response = {
      success: true,
      timing: {
        total: Date.now() - startTime,
        categories: categoriesTime,
        products: productsTime,
      },
      stats: {
        categoriesCount: categories.length,
        productsCount: products.length,
      },
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: c.count,
      })),
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        status: p.status,
        date_modified: p.date_modified,
      })),
      environment: {
        wooUrl: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || 'Not configured',
        hasKey: !!process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
        hasSecret: !!process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET,
      }
    };

    console.log(`[WooCommerce Test] Test completed successfully in ${response.timing.total}ms`);
    return NextResponse.json(response);

  } catch (error) {
    console.error('[WooCommerce Test] Test failed:', error);
    
    // Prepare detailed error response
    const errorResponse = {
      success: false,
      timing: {
        total: Date.now() - startTime,
      },
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined,
      },
      environment: {
        wooUrl: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || 'Not configured',
        hasKey: !!process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
        hasSecret: !!process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET,
      }
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
