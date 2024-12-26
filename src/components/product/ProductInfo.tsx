'use client';

import { useState } from 'react';
import type { WooProduct, WooVariation, WooVariantAttribute } from '@/lib/types';
import { AddToCartButton } from './AddToCartButton';

interface ProductInfoProps {
  product: WooProduct;
  variants: WooVariation[];
}

export function ProductInfo({ product, variants }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<number | undefined>();
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const handleAttributeChange = (name: string, value: string) => {
    const newAttributes = {
      ...selectedAttributes,
      [name]: value,
    };
    
    setSelectedAttributes(newAttributes);

    const matchingVariant = variants.find((variant: WooVariation) =>
      variant.attributes?.every((attr: WooVariantAttribute) =>
        newAttributes[attr.name] === attr.option
      )
    );

    setSelectedVariant(matchingVariant?.id);
  };

  const allOptionsSelected = product.attributes?.every(
    attr => selectedAttributes[attr.name]
  ) ?? true;

  return (
    <div className="mt-10">
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-900">Variants</h2>

        {product.attributes?.map((attribute) => (
          <div key={attribute.id} className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              {attribute.name}
            </label>
            <select
              value={selectedAttributes[attribute.name] || ''}
              onChange={(e) => handleAttributeChange(attribute.name, e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value="">Select {attribute.name}</option>
              {attribute.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <AddToCartButton
        productId={product.id}
        variationId={selectedVariant}
        disabled={!allOptionsSelected}
        className={!allOptionsSelected ? 'opacity-50 cursor-not-allowed' : ''}
      />
    </div>
  );
}