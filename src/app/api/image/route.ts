import { NextRequest, NextResponse } from 'next/server';
import { ImageCache } from '@/lib/cache/imageCache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    const width = searchParams.get('width') ? parseInt(searchParams.get('width')!, 10) : undefined;
    
    if (!path) {
      return new NextResponse('Image path is required', { status: 400 });
    }
    
    const image = await ImageCache.getOptimizedImage(path, width);
    if (!image) {
      return new NextResponse('Image not found', { status: 404 });
    }
    
    return new NextResponse(image, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    console.error('Error serving image:', e);
    return new NextResponse('Error loading image', { status: 500 });
  }
}
