import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

// Pre-defined icon sizes
const VALID_SIZES = new Set([16, 32, 48, 64, 96, 128, 180]);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requestedSize = parseInt(searchParams.get('size') || '32', 10);
    const size = VALID_SIZES.has(requestedSize) ? requestedSize : 32;
    
    const iconPath = join(process.cwd(), 'public', 'favicon.ico');
    const iconBuffer = readFileSync(iconPath);
    
    // Convert ico to png and resize
    const resizedIcon = await sharp(iconBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
    
    return new NextResponse(resizedIcon, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    console.error('Error serving icon:', e);
    return new NextResponse('Error loading icon', { status: 500 });
  }
}

// Generate static params for build time
export function generateStaticParams() {
  return Array.from(VALID_SIZES).map(size => ({
    size: size.toString()
  }));
}
