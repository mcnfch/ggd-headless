import { productCache } from '@/lib/cache/productCache';
import type { WooProduct } from '@/lib/types';

export async function getMoreProducts(categorySlug: string, page: number): Promise<{
  products: WooProduct[];
  totalPages: number;
}> {
  try {
    const result = await productCache.getProductsByCategory(categorySlug);
    return result;
  } catch (error) {
    console.error('Error loading more products:', error);
    return { products: [], totalPages: 0 };
  }
}
