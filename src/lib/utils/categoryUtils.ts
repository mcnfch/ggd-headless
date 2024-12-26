import type { WooCategory } from '@/lib/types';
import menuConfig from '@/config/menu.json';

// Categories that should never be displayed
const EXCLUDED_SLUGS = ['uncategorized'];

interface MenuItem {
  title: string;
  type: 'product' | 'non-product';
  visible: boolean;
  order: number;
}

interface MenuConfig {
  menuItems: MenuItem[];
}

export function filterAndSortCategories(categories: WooCategory[], options: {
  parentOnly?: boolean;
  maxItems?: number;
  forFooter?: boolean;
} = {}): WooCategory[] {
  const { parentOnly = true, maxItems, forFooter = false } = options;
  const config = menuConfig as MenuConfig;
  
  // Create a map of menu items for quick lookup
  const menuItemsMap = new Map(
    config.menuItems.map(item => [item.title.toLowerCase(), item])
  );

  return categories
    .filter(category => {
      // Basic exclusions
      if (EXCLUDED_SLUGS.includes(category.slug)) return false;
      if (category.count === 0) return false;
      if (parentOnly && category.parent !== 0) return false;

      // For footer, show all valid categories
      if (forFooter) return true;

      // For main menu, only show categories that are in the menu config and visible
      const menuItem = menuItemsMap.get(category.name.toLowerCase());
      return menuItem?.visible ?? false;
    })
    .sort((a, b) => {
      // Get menu items for both categories
      const aMenuItem = menuItemsMap.get(a.name.toLowerCase());
      const bMenuItem = menuItemsMap.get(b.name.toLowerCase());

      // If both have menu items, sort by order
      if (aMenuItem && bMenuItem) {
        return aMenuItem.order - bMenuItem.order;
      }

      // For footer items not in menu, sort alphabetically
      if (forFooter) {
        return a.name.localeCompare(b.name);
      }

      // This shouldn't happen for main menu as we filtered non-menu items
      return 0;
    })
    .slice(0, maxItems);
}

export function getCategoryBySlug(categories: WooCategory[], slug: string): WooCategory | undefined {
  return categories.find(category => category.slug === slug);
}

export function isValidCategory(category: WooCategory): boolean {
  if (!category) return false;
  if (EXCLUDED_SLUGS.includes(category.slug)) return false;
  if (category.count === 0) return false;
  return true;
}
