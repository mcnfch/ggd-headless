import NodeCache from 'node-cache';
import type { WooMenuItem } from '../types/menu';
import { logger } from '../logger';

const CACHE_TTL = 3600; // 1 hour cache

class MenuCache {
  private static instance: MenuCache;
  private cache: NodeCache;

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: CACHE_TTL,
      checkperiod: 120
    });
  }

  public static getInstance(): MenuCache {
    if (!MenuCache.instance) {
      MenuCache.instance = new MenuCache();
    }
    return MenuCache.instance;
  }

  async getMenuItems(menuId: number): Promise<WooMenuItem[]> {
    const cacheKey = `menu_items_${menuId}`;
    
    // Try to get from cache first
    const cachedMenuItems = this.cache.get<WooMenuItem[]>(cacheKey);
    if (cachedMenuItems) {
      return cachedMenuItems;
    }

    try {
      logger.info('MenuCache', `Fetching menu items for menu ${menuId}...`);
      
      // Use WordPress REST API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wp/v2/nav_menu_items?menu=${menuId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET}`).toString('base64')}`
          },
          next: { revalidate: CACHE_TTL }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch menu items: ${response.statusText}`);
      }

      const menuItems = await response.json();

      // Cache the results
      this.cache.set(cacheKey, menuItems);
      logger.info('MenuCache', `Successfully cached ${menuItems.length} menu items for menu ${menuId}`);
      return menuItems;
    } catch (error) {
      logger.error('MenuCache', 'Error fetching menu items:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.flushAll();
  }
}

// Export a singleton instance
export const menuCache = MenuCache.getInstance();
