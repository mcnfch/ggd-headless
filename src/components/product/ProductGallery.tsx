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
  const [thumbViewportRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    skipSnaps: false,
  });

  useEffect(() => {
    if (typeof forcedIndex === 'number' && emblaMainApi && forcedIndex !== selectedIndex) {
      emblaMainApi.scrollTo(forcedIndex);
    }
  }, [forcedIndex, emblaMainApi, selectedIndex]);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
      onThumbnailClick?.(index);
    },
    [emblaMainApi, emblaThumbsApi, onThumbnailClick]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    const newIndex = emblaMainApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    emblaThumbsApi.scrollTo(newIndex);
  }, [emblaMainApi, emblaThumbsApi]);

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
    <div className="space-y-4">
      {/* Main Gallery */}
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
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="overflow-hidden px-1" ref={thumbViewportRef}>
          <div className="flex gap-2 md:gap-4 touch-pan-x">
            {images.map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => onThumbClick(index)}
                className={`relative min-w-[100px] md:min-w-[100px] aspect-square rounded-md overflow-hidden 
                  flex-[0_0_100px] md:flex-[0_0_100px] bg-gray-100 transition-all
                  ${selectedIndex === index ? 'ring-2 ring-purple-600 ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt || 'Product thumbnail'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100px, 100px"
                  quality={60}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}