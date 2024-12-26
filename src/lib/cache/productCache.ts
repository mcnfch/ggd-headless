import NodeCache from 'node-cache';
import { woocommerce } from '../woocommerce';
import type { WooProduct } from '@/types/woocommerce';

const ITEMS_PER_PAGE = 100;

export class ProductCache {
  private cache: NodeCache;
  private static instance: ProductCache;

  private constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache
  }

  public static getInstance(): ProductCache {
    if (!ProductCache.instance) {
      ProductCache.instance = new ProductCache();
    }
    return ProductCache.instance;
  }

  private normalizeSlug(slug: string): string {
    // Remove 'product/' prefix if present
    slug = slug.replace(/^product\//, '');
    
    // URL decode
    slug = decodeURIComponent(slug);
    
    // Convert to lowercase
    slug = slug.toLowerCase();
    
    // Replace apostrophes and special quotes
    slug = slug.replace(/[''"]/g, '');
    
    // Replace spaces with hyphens
    slug = slug.replace(/\s+/g, '-');
    
    // Remove multiple consecutive hyphens
    slug = slug.replace(/-+/g, '-');
    
    // Remove leading/trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');
    
    // Remove trailing slashes
    slug = slug.replace(/\/+$/, '');

    console.log(`[ProductCache] Normalized slug: "${slug}"`);
    return slug;
  }

  private getProductKey(slug: string): string {
    return `product:${slug}`;
  }

  private getCategoryKey(slug: string): string {
    return `category:${slug}`;
  }

  async getProductBySlug(slug: string): Promise<WooProduct | null> {
    console.log(`[ProductCache] Looking up product with original slug: "${slug}"`);
    const normalizedSlug = this.normalizeSlug(slug);
    
    const cacheKey = this.getProductKey(normalizedSlug);
    const cachedProduct = this.cache.get<WooProduct>(cacheKey);

    if (cachedProduct) {
      console.log(`[ProductCache] Found product in cache: ${cachedProduct.name}`);
      return cachedProduct;
    }

    try {
      // Try direct slug lookup first
      console.log(`[ProductCache] Trying direct slug lookup: "${normalizedSlug}"`);
      const { data: products } = await woocommerce.get<WooProduct[]>('products', {
        slug: normalizedSlug,
        status: 'publish',
        per_page: ITEMS_PER_PAGE
      });

      console.log(`[ProductCache] Direct lookup returned ${products.length} products`);
      products.forEach(p => console.log(`[ProductCache] Found product: ${p.name} (${p.slug})`));

      if (products && products.length > 0) {
        const product = products[0];
        
        // Load variations if product is variable
        if (product.type === 'variable') {
          try {
            const { data: variations } = await woocommerce.get(`products/${product.id}/variations`, {
              per_page: 100, // Get all variations
              status: 'publish'
            });
            product.variations = variations;
            console.log(`[ProductCache] Loaded ${variations.length} variations for product ${product.name}`);
          } catch (error) {
            console.error(`[ProductCache] Error loading variations:`, error);
          }
        }
        
        console.log(`[ProductCache] Found product by direct lookup: ${product.name}`);
        this.cache.set(cacheKey, product);
        return product;
      }

      // If not found by slug, try searching
      console.log(`[ProductCache] Product not found by slug, trying search...`);
      const searchTerm = normalizedSlug.replace(/-/g, ' ');
      console.log(`[ProductCache] Search term: "${searchTerm}"`);
      
      const { data: searchProducts } = await woocommerce.get<WooProduct[]>('products', {
        search: searchTerm,
        status: 'publish',
        per_page: ITEMS_PER_PAGE
      });

      console.log(`[ProductCache] Search returned ${searchProducts.length} products`);
      searchProducts.forEach(p => console.log(`[ProductCache] Search result: ${p.name} (${p.slug})`));

      // Look for best match
      const bestMatch = searchProducts.find(p => {
        const productSlug = this.normalizeSlug(p.slug || '');
        const isMatch = productSlug.includes(normalizedSlug) || normalizedSlug.includes(productSlug);
        console.log(`[ProductCache] Comparing "${productSlug}" with "${normalizedSlug}": ${isMatch}`);
        return isMatch;
      });

      if (bestMatch) {
        console.log(`[ProductCache] Found best match: ${bestMatch.name}`);
        this.cache.set(cacheKey, bestMatch);
        return bestMatch;
      }

      console.log(`[ProductCache] No matching product found for slug: ${normalizedSlug}`);
      return null;
    } catch (error) {
      console.error('[ProductCache] Error fetching product by slug:', error);
      return null;
    }
  }

  async getProductsByCategory(categorySlug: string): Promise<{ products: WooProduct[], totalPages: number }> {
    console.log(`[ProductCache] Getting products for category: ${categorySlug}`);
    const cacheKey = this.getCategoryKey(categorySlug);
    const cachedProducts = this.cache.get<{ products: WooProduct[], totalPages: number }>(cacheKey);

    if (cachedProducts) {
      console.log(`[ProductCache] Found ${cachedProducts.products.length} products in cache for category: ${categorySlug}`);
      return cachedProducts;
    }

    try {
      // First, get the category ID from the slug
      const { data: categories } = await woocommerce.get('products/categories', {
        slug: categorySlug,
        status: 'publish'
      });

      if (!categories || categories.length === 0) {
        console.log(`[ProductCache] No category found for slug: ${categorySlug}`);
        return { products: [], totalPages: 0 };
      }

      const categoryId = categories[0].id;
      console.log(`[ProductCache] Found category ID: ${categoryId} for slug: ${categorySlug}`);

      // Then get products for this category
      const { data: products, headers } = await woocommerce.get('products', {
        category: categoryId,
        status: 'publish',
        per_page: ITEMS_PER_PAGE
      });

      const totalPages = parseInt(headers['x-wp-totalpages'] || '1', 10);
      const result = { products, totalPages };

      console.log(`[ProductCache] Found ${products.length} products for category: ${categorySlug}`);
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error(`[ProductCache] Error fetching products for category ${categorySlug}:`, error);
      return { products: [], totalPages: 0 };
    }
  }

  clearCache() {
    this.cache.flushAll();
  }
}

export const productCache = ProductCache.getInstance();
