import { NextResponse } from 'next/server';
import { woocommerce } from '@/lib/woocommerce';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const response = await woocommerce.get(`products/${id}`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
