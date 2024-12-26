import { Product } from '@/lib/types';

// IDs of products that should never be displayed in the frontend
const HIDDEN_PRODUCT_IDS = [8386, 8387, 8388];

export function filterProducts(products: Product[]): Product[] {
  return products.filter(product => {
    // Filter out products with hidden IDs
    if (HIDDEN_PRODUCT_IDS.includes(product.id)) {
      return false;
    }

    // Add any other product filtering logic here
    return true;
  });
}

export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numericPrice);
}

export function calculateDiscountPercentage(regularPrice: number, salePrice: number): number {
  if (!regularPrice || !salePrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}
