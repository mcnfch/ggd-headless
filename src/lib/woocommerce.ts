import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import type { WooProduct, WooCategory, WooCommerceError } from './types';
import { productCache } from './cache/productCache';
import { categoryCache } from './cache/categoryCache';
import https from 'https';
import { logger } from './logger';

function isWooCommerceError(error: unknown): error is WooCommerceError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  );
}

if (!process.env.NEXT_PUBLIC_WOOCOMMERCE_URL) {
  logger.critical('WooCommerce', 'NEXT_PUBLIC_WOOCOMMERCE_URL is missing');
  throw new Error('NEXT_PUBLIC_WOOCOMMERCE_URL is not defined');
}

if (!process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY) {
  logger.critical('WooCommerce', 'NEXT_PUBLIC_WOOCOMMERCE_KEY is missing');
  throw new Error('NEXT_PUBLIC_WOOCOMMERCE_KEY is not defined');
}

if (!process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET) {
  logger.critical('WooCommerce', 'NEXT_PUBLIC_WOOCOMMERCE_SECRET is missing');
  throw new Error('NEXT_PUBLIC_WOOCOMMERCE_SECRET is not defined');
}

logger.info('WooCommerce', 'API Configuration:', {
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
  hasSecret: !!process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET
});

logger.info('WooCommerce', `Initializing API with URL: ${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}`);

export const woocommerce = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL,
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET,
  version: 'wc/v3',
  queryStringAuth: true,
  axiosConfig: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Custom fetch function with error handling
async function customFetch<T>(endpoint: string, options = {}): Promise<T | null> {
  try {
    logger.info('WooCommerce', `Fetching ${endpoint} with options:`, options);
    const response = await woocommerce.get<T>(endpoint, options);
    logger.info('WooCommerce', `Successfully fetched ${endpoint}`);
    return response.data;
  } catch (error) {
    if (isWooCommerceError(error)) {
      logger.error('WooCommerce', `API Error for ${endpoint}:`, error.message);
      if (error.data?.status === 404) {
        return null;
      }
    } else {
      logger.error('WooCommerce', `Unknown error for ${endpoint}:`, error);
    }
    throw error;
  }
}

// Helper function to clean HTML entities
function cleanHtmlEntities(str: string): string {
  return str.replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");
}

export async function getCategories(): Promise<WooCategory[]> {
  try {
    logger.info('WooCommerce', 'Fetching categories...');
    const response = await woocommerce.get<WooCategory[]>('products/categories', {
      per_page: 100,
      hide_empty: false
    });

    // Clean HTML entities from names and descriptions
    const cleanedCategories = response.data.map(category => ({
      ...category,
      name: cleanHtmlEntities(category.name),
      description: category.description ? cleanHtmlEntities(category.description) : ''
    }));

    logger.info('WooCommerce', `Successfully fetched ${cleanedCategories.length} categories`);
    return cleanedCategories;
  } catch (error) {
    logger.error('WooCommerce', 'Error fetching categories:', error);
    return [];
  }
}

export async function getProduct(slug: string): Promise<WooProduct | null> {
  try {
    logger.info('WooCommerce', `Looking up product with slug: ${slug}`);
    
    // Try direct slug lookup first
    const response = await woocommerce.get<WooProduct[]>('products', {
      slug: decodeURIComponent(slug),
      status: 'publish'
    });

    let product = null;
    if (response.data && response.data.length > 0) {
      logger.info('WooCommerce', `Found product by slug: ${response.data[0].name}`);
      product = response.data[0];
    } else {
      // If not found, try searching
      logger.info('WooCommerce', `Product not found by slug, trying search...`);
      const searchResponse = await woocommerce.get<WooProduct[]>('products', {
        search: slug.replace(/-/g, ' '),
        status: 'publish',
        per_page: 100
      });

      product = searchResponse.data.find(p => p.slug === slug);
      if (product) {
        logger.info('WooCommerce', `Found product by search: ${product.name}`);
      }
    }

    if (!product) {
      logger.info('WooCommerce', `No product found for slug: ${slug}`);
      return null;
    }

    // If it's a variable product, fetch variations with images
    if (product.type === 'variable') {
      try {
        logger.info('WooCommerce', `Fetching variations for product: ${product.id}`);
        const variationsResponse = await woocommerce.get(`products/${product.id}/variations`, {
          per_page: 100,
          status: 'publish'
        });

        if (variationsResponse.data) {
          // Process variations to ensure they have proper image data
          product.variations = variationsResponse.data.map(variation => {
            // If variation has an image, add it to the product's image array if not already present
            if (variation.image && variation.image.id) {
              const imageExists = product.images.some(img => img.id === variation.image.id);
              if (!imageExists) {
                product.images.push(variation.image);
              }
            }
            return variation;
          });

          logger.info('WooCommerce', `Processed ${product.variations.length} variations with images`);
          logger.info('WooCommerce', `Total product images: ${product.images.length}`);
        }
      } catch (error) {
        logger.error('WooCommerce', 'Error fetching variations:', error);
      }
    }

    return product;
  } catch (error) {
    logger.error('WooCommerce', 'Error fetching product:', error);
    return null;
  }
}

export async function getProducts(categorySlug?: string): Promise<{ products: WooProduct[], totalPages: number }> {
  try {
    logger.info('WooCommerce', `Fetching products for category: ${categorySlug || 'all'}`);
    const params: any = {
      per_page: 100,
      status: 'publish'
    };

    if (categorySlug) {
      const categories = await getCategories();
      const category = categories.find(cat => cat.slug === categorySlug);
      if (category) {
        params.category = category.id;
      }
    }

    const response = await woocommerce.get<WooProduct[]>('products', params);
    logger.info('WooCommerce', 'API Response:', {
      params,
      totalProducts: response.data.length,
      headers: response.headers
    });
    const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);

    logger.info('WooCommerce', `Successfully fetched ${response.data.length} products`);
    return { 
      products: response.data,
      totalPages 
    };
  } catch (error) {
    logger.error('WooCommerce', 'Error fetching products:', error);
    return { products: [], totalPages: 0 };
  }
}

export async function getAllCategories(): Promise<WooCategory[]> {
  try {
    logger.info('WooCommerce', 'Fetching all categories');
    const response = await woocommerce.get<WooCategory[]>('products/categories', {
      per_page: 100,
      hide_empty: false
    });

    const categories = response.data;

    // Function to build category tree
    function buildCategoryTree(categories: WooCategory[], parentId = 0): WooCategory[] {
      return categories
        .filter(category => category.parent === parentId)
        .map(category => ({
          ...category,
          children: buildCategoryTree(categories, category.id)
        }));
    }

    // Build and return the category tree
    const tree = buildCategoryTree(categories);
    logger.info('WooCommerce', `Successfully built category tree with ${categories.length} categories`);
    return tree;
  } catch (error) {
    logger.error('WooCommerce', 'Error fetching all categories:', error);
    return [];
  }
}

interface WooPage {
  id: number;
  title: { rendered: string };
  slug: string;
  content: { rendered: string };
  status: string;
}

interface WooPost {
  id: number;
  title: { rendered: string };
  slug: string;
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  featured_media: number;
  status: string;
}

// Function to get WordPress pages
export async function getPages(): Promise<WooPage[]> {
  try {
    logger.info('WooCommerce', 'Fetching WordPress pages');
    const response = await fetch(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wp/v2/pages`);
    if (!response.ok) {
      throw new Error('Failed to fetch pages');
    }
    const pages = await response.json();
    logger.info('WooCommerce', `Successfully fetched ${pages.length} pages`);
    return pages;
  } catch (error) {
    logger.error('WooCommerce', 'Error fetching pages:', error);
    return [];
  }
}

// Function to get a single WordPress page by ID
export async function getPage(id: number): Promise<WooPage | null> {
  try {
    logger.info('WooCommerce', `Fetching WordPress page with ID: ${id}`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wp/v2/pages/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    logger.error('WooCommerce', 'Error fetching page:', error);
    return null;
  }
}

// Function to get a single WordPress page by slug
export async function getPageBySlug(slug: string): Promise<WooPage | null> {
  try {
    logger.info('WooCommerce', `Fetching WordPress page with slug: ${slug}`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wp/v2/pages?slug=${slug}`);
    if (!response.ok) {
      return null;
    }
    const pages = await response.json();
    return pages.length > 0 ? pages[0] : null;
  } catch (error) {
    logger.error('WooCommerce', 'Error fetching page:', error);
    return null;
  }
}

// Function to get blog posts
export async function getPosts(): Promise<WooPost[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wp/v2/posts?_embed`);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    logger.error('WooCommerce', 'Error fetching posts:', error);
    return [];
  }
}

// Function to get a single blog post by ID
export async function getBlogPost(id: number): Promise<WooPost | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wp/v2/posts/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    logger.error('WooCommerce', 'Error fetching blog post:', error);
    return null;
  }
}

// Alias for getPosts to maintain compatibility
export const getBlogPosts = getPosts;

export async function testConnection() {
  try {
    logger.info('WooCommerce', 'Testing connection...');
    const response = await woocommerce.get('');
    logger.info('WooCommerce', 'Successfully connected to WooCommerce API');
    return {
      success: true,
      message: 'Successfully connected to WooCommerce API'
    };
  } catch (error) {
    logger.error('WooCommerce', 'Error testing connection:', error);
    return {
      success: false,
      message: isWooCommerceError(error) ? error.message : 'Unknown error occurred'
    };
  }
}

export async function getCategory(slug: string) {
  try {
    logger.info('WooCommerce', `Fetching category with slug: ${slug}`);
    const response = await woocommerce.get<WooCategory[]>('products/categories', {
      slug: decodeURIComponent(slug),
      per_page: 1
    });
    
    if (!response.data || response.data.length === 0) {
      logger.info('WooCommerce', `No category found with slug: ${slug}`);
      return null;
    }

    const category = response.data[0];
    
    // Clean up the name and description using the helper function
    return {
      ...category,
      name: cleanHtmlEntities(category.name),
      description: category.description ? cleanHtmlEntities(category.description) : ''
    };
  } catch (error) {
    logger.error('WooCommerce', 'Error fetching category:', error);
    throw error;
  }
}

export async function getCategoryProducts(categoryId: number) {
  try {
    const response = await customFetch<WooProduct[]>('products', {
      category: categoryId,
      per_page: 100,
      status: 'publish'
    });
    
    return response;
  } catch (error) {
    logger.error('WooCommerce', 'Error fetching category products:', error);
    throw error;
  }
}