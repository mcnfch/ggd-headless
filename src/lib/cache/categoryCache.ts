import NodeCache from 'node-cache';
import type { WooCategory } from '../types';
import { woocommerce } from '../woocommerce';

const CACHE_TTL = 3600; // 1 hour cache

class CategoryCache {
  private static instance: CategoryCache;
  private cache: NodeCache;

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: CACHE_TTL,
      checkperiod: 120
    });
  }

  public static getInstance(): CategoryCache {
    if (!CategoryCache.instance) {
      CategoryCache.instance = new CategoryCache();
    }
    return CategoryCache.instance;
  }

  async getAllCategories(): Promise<WooCategory[]> {
    const cacheKey = 'all_categories';
    
    // Try to get from cache first
    const cachedCategories = this.cache.get<WooCategory[]>(cacheKey);
    if (cachedCategories) {
      return cachedCategories;
    }

    try {
      console.log('\n=== FETCHING WOOCOMMERCE CATEGORIES ===');
      const { data } = await woocommerce.get<WooCategory[]>('products/categories', {
        per_page: 100,
        hide_empty: false
      });

      // Log categories for debugging
      console.log('\nAll WooCommerce categories:');
      data.forEach(cat => {
        console.log(`\nCategory: ${cat.name}`);
        console.log(`  slug: "${cat.slug}"`);
        console.log(`  id: ${cat.id}`);
        console.log(`  parent: ${cat.parent}`);
      });

      // Cache the results
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.flushAll();
  }
}

// Export a singleton instance
export const categoryCache = CategoryCache.getInstance();
