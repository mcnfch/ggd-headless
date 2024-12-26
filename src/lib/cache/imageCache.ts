import NodeCache from 'node-cache';
import { readFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

// TTL of 24 hours for images
const CACHE_TTL = 24 * 60 * 60;

export class ImageCache {
  private static cache = new NodeCache({ stdTTL: CACHE_TTL });

  private static getImageCacheKey(path: string, width?: number): string {
    return `image:${path}:${width || 'original'}`;
  }

  static async getOptimizedImage(imagePath: string, width?: number): Promise<Buffer | null> {
    const cacheKey = this.getImageCacheKey(imagePath, width);
    const cachedImage = this.cache.get<Buffer>(cacheKey);
    
    if (cachedImage) {
      return cachedImage;
    }

    try {
      const fullPath = join(process.cwd(), 'public', imagePath);
      const imageBuffer = readFileSync(fullPath);
      
      let optimizedImage: Buffer;
      
      if (width) {
        optimizedImage = await sharp(imageBuffer)
          .resize(width)
          .webp({ quality: 80 })
          .toBuffer();
      } else {
        optimizedImage = await sharp(imageBuffer)
          .webp({ quality: 80 })
          .toBuffer();
      }
      
      this.cache.set(cacheKey, optimizedImage);
      return optimizedImage;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return null;
    }
  }

  static invalidateImage(imagePath: string): void {
    // Invalidate all width variations of the image
    const keys = this.cache.keys().filter(key => key.startsWith(`image:${imagePath}:`));
    keys.forEach(key => this.cache.del(key));
  }

  static invalidateCache(): void {
    this.cache.flushAll();
  }
}
