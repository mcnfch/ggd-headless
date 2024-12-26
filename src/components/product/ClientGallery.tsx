'use client';

import dynamic from 'next/dynamic';
import type { WooImage } from '@/lib/types';

const ProductGallery = dynamic(() => import('./ProductGallery').then(mod => mod.ProductGallery), {
  ssr: false,
});

interface ClientGalleryProps {
  images: WooImage[];
  forcedIndex?: number;
  onThumbnailClick?: (index: number) => void;
}

export function ClientGallery({ images, forcedIndex, onThumbnailClick }: ClientGalleryProps) {
  return <ProductGallery images={images} forcedIndex={forcedIndex} onThumbnailClick={onThumbnailClick} />;
}
