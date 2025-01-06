'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { WooImage } from '@/lib/types';

interface ProductGalleryProps {
  images: WooImage[];
  forcedIndex?: number;
  onThumbnailClick?: (index: number) => void;
}

export function ProductGallery({ images = [], forcedIndex, onThumbnailClick }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainViewportRef, emblaMainApi] = useEmblaCarousel({ 
    skipSnaps: false,
    loop: true
  });

  useEffect(() => {
    if (typeof forcedIndex === 'number' && emblaMainApi && forcedIndex !== selectedIndex) {
      emblaMainApi.scrollTo(forcedIndex);
    }
  }, [forcedIndex, emblaMainApi, selectedIndex]);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi) return;
      emblaMainApi.scrollTo(index);
      onThumbnailClick?.(index);
    },
    [emblaMainApi, onThumbnailClick]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi) return;
    const newIndex = emblaMainApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
  }, [emblaMainApi]);

  useEffect(() => {
    if (!emblaMainApi) return;
    emblaMainApi.on('select', onSelect);
    return () => {
      emblaMainApi.off('select', onSelect);
    };
  }, [emblaMainApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollPrev();
  }, [emblaMainApi]);

  const scrollNext = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollNext();
  }, [emblaMainApi]);

  if (!images.length) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg bg-gray-100" ref={mainViewportRef}>
        <div className="flex touch-pan-y">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className="relative min-w-full aspect-square flex-[0_0_100%]"
            >
              <Image
                src={image.src}
                alt={image.alt || 'Product image'}
                fill
                className="object-contain"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={90}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Progression Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => onThumbClick(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                selectedIndex === index 
                  ? 'bg-white' 
                  : 'bg-white/50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}