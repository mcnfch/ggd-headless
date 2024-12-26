import { NextResponse } from 'next/server';
import { getMoreProducts } from '@/components/product/ProductListServer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('categorySlug');
  const page = parseInt(searchParams.get('page') || '1', 10);

  if (!categorySlug) {
    return NextResponse.json(
      { error: 'Category slug is required' },
      { status: 400 }
    );
  }

  try {
    const result = await getMoreProducts(categorySlug, page);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in products API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
