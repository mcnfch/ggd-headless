import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.next/cache/sitemaps');
const CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds

interface CacheData {
  timestamp: number;
  data: string;
}

export async function getSitemapFromCache(key: string): Promise<string | null> {
  try {
    const cacheFile = path.join(CACHE_DIR, `${key}.json`);
    
    if (!fs.existsSync(cacheFile)) {
      return null;
    }

    const cacheContent = fs.readFileSync(cacheFile, 'utf-8');
    const cache: CacheData = JSON.parse(cacheContent);

    // Check if cache is still valid
    if (Date.now() - cache.timestamp < CACHE_DURATION) {
      console.log(`[Sitemap Cache] Serving ${key} from cache`);
      return cache.data;
    }

    return null;
  } catch (error) {
    console.error(`[Sitemap Cache] Error reading cache for ${key}:`, error);
    return null;
  }
}

export async function cacheSitemap(key: string, data: string): Promise<void> {
  try {
    // Ensure cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    const cacheFile = path.join(CACHE_DIR, `${key}.json`);
    const cacheData: CacheData = {
      timestamp: Date.now(),
      data,
    };

    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
    console.log(`[Sitemap Cache] Successfully cached ${key} sitemap`);
  } catch (error) {
    console.error(`[Sitemap Cache] Error caching ${key} sitemap:`, error);
  }
}
