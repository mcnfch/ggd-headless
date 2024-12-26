'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AddToCartButton } from './AddToCartButton';
import type { WooProduct } from '@/lib/types';

export interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  image?: string;
  stockStatus?: string;
  shortDescription?: string;
  sku?: string;
  slug: string;
  attributes?: WooProduct['attributes'];
}

function ProductCardComponent({ 
  id, 
  name, 
  price, 
  image,
  stockStatus = 'instock',
  shortDescription = '',
  sku: _sku = '',
  slug,
  attributes = [],
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  // Create a product object that matches WooProduct interface
  const product: WooProduct = {
    id,
    name,
    price,
    images: image ? [{ src: image }] : [],
    stock_status: stockStatus,
    short_description: shortDescription,
    description: shortDescription,
    attributes: attributes,
    slug,
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link href={`/product/${slug}`} className="group flex-grow">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100">
          {!imageError && image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
            {name}
          </h3>
          <p className="mt-1 text-sm font-medium text-purple-600">
            ${parseFloat(price).toFixed(2)}
          </p>
        </div>
      </Link>

      <div className="p-4 pt-0 mt-auto">
        <AddToCartButton
          product={product}
          className="w-full py-2 text-sm font-medium text-white rounded-md transition-colors"
        />
      </div>
    </div>
  );
}

export default memo(ProductCardComponent);