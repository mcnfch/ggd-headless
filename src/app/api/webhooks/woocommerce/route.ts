import { NextRequest, NextResponse } from 'next/server';
import { ProductCache } from '@/lib/cache/productCache';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.WOOCOMMERCE_WEBHOOK_SECRET;

function verifyWooCommerceWebhook(
  signature: string | null,
  payload: string
): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;

  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('base64');

  return hash === signature;
}

export async function POST(
  request: NextRequest
) {
  try {
    const signature = request.headers.get('x-wc-webhook-signature');
    const body = await request.text();

    // Verify webhook signature
    if (!verifyWooCommerceWebhook(signature, body)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);
    const topic = request.headers.get('x-wc-webhook-topic');

    switch (topic) {
      case 'product.created':
      case 'product.updated':
      case 'product.deleted':
        await ProductCache.invalidateProduct(data.id.toString());
        break;

      case 'product.restored':
        await ProductCache.invalidateCache();
        break;

      case 'product_cat.created':
      case 'product_cat.updated':
      case 'product_cat.deleted':
        await ProductCache.invalidateCache();
        break;

      default:
        console.warn('Unhandled webhook topic:', topic);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export function generateStaticParams() {
  return [];
}
