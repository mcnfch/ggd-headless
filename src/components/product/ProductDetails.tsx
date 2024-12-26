'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { WooProduct, ProductVariation, ProductAttribute, WooVariantAttribute } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { AddToCartButton } from './AddToCartButton';
import { QuickAddModal } from '../cart/QuickAddModal';
import { woocommerce } from '@/lib/woocommerce';
import dynamic from 'next/dynamic';
import { ClientGallery } from './ClientGallery';
import SlideOutCart from '../cart/SlideOutCart';

const SlideOutCartDynamic = dynamic(() => import('../cart/SlideOutCart'), {
  ssr: false,
});

interface ProductDetailsProps {
  product: WooProduct;
}

interface SelectedAttributes {
  [key: string]: string;
}

interface AttributeMetadata {
  name: string;
  hasImages: boolean;
  required: boolean;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addToCart } = useCart();
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [isAddToCartEnabled, setIsAddToCartEnabled] = useState(false);
  const [currentImages, setCurrentImages] = useState(product.images);
  const [cartSlideOverOpen, setCartSlideOverOpen] = useState(false);
  const [forcedImageIndex, setForcedImageIndex] = useState<number | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<WooProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<WooProduct | null>(null);
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [attributeMetadata, setAttributeMetadata] = useState<AttributeMetadata[]>([]);
  const [manualImageSelection, setManualImageSelection] = useState(false);

  // Initialize attribute metadata
  useEffect(() => {
    if (!product.attributes) return;

    const metadata = product.attributes.map(attr => ({
      name: attr.name,
      hasImages: Boolean(attr.variation && product.variations?.some(v => 
        v.attributes.some(a => a.name === attr.name && v.image)
      )),
      required: attr.variation && attr.options && attr.options.length > 1
    }));

    setAttributeMetadata(metadata);
  }, [product]);

  // Function to check if an attribute should be shown (not single option)
  const shouldShowAttribute = (attribute: ProductAttribute) => {
    if (!attribute.variation || !attribute.options) return false;
    if (attribute.options.length <= 1) return false;

    // Hide shipping/country attributes if US is an option
    const attrNameLower = attribute.name.toLowerCase();
    const isShippingOrCountry = attrNameLower.includes('shipping') || 
                               attrNameLower.includes('country') ||
                               attrNameLower.includes('location');
    
    if (isShippingOrCountry) {
      const hasUSOption = attribute.options.some(opt => {
        const optLower = opt.toLowerCase();
        return optLower.includes('us') || optLower.includes('united states');
      });
      if (hasUSOption) return false;
    }

    return true;
  };

  // Handle manual thumbnail selection
  const handleThumbnailClick = (index: number) => {
    setManualImageSelection(true);
    setForcedImageIndex(index);
    
    // Reset image-associated variant selections
    const newSelectedAttributes = { ...selectedAttributes };
    attributeMetadata
      .filter(attr => attr.hasImages)
      .forEach(attr => {
        delete newSelectedAttributes[attr.name];
      });
    setSelectedAttributes(newSelectedAttributes);
  };

  // Handle attribute selection
  const handleAttributeChange = (attributeName: string, value: string) => {
    const metadata = attributeMetadata.find(m => m.name === attributeName);
    const newSelectedAttributes = {
      ...selectedAttributes,
      [attributeName]: value
    };
    
    setSelectedAttributes(newSelectedAttributes);

    // If this attribute has associated images and wasn't manually selected
    if (metadata?.hasImages && !manualImageSelection) {
      // Find variation that matches all selected attributes
      const variation = product.variations?.find(v =>
        v.attributes.every(a => {
          const selectedValue = newSelectedAttributes[a.name];
          return !selectedValue || a.option === selectedValue;
        })
      );
      
      if (variation?.image) {
        setCurrentImages([variation.image, ...product.images.filter(img => img.id !== variation.image.id)]);
        setForcedImageIndex(0);
      }
    }

    setManualImageSelection(false);
  };

  // Check if all required attributes are selected
  useEffect(() => {
    const requiredAttributes = attributeMetadata.filter(attr => attr.required);
    const allRequiredSelected = requiredAttributes.every(attr => 
      selectedAttributes[attr.name]
    );
    
    setIsAddToCartEnabled(allRequiredSelected);
  }, [selectedAttributes, attributeMetadata]);

  // Initialize single-option attributes and handle shipping/country selection
  useEffect(() => {
    if (!product.attributes) return;

    const initialAttributes: SelectedAttributes = {};
    
    product.attributes.forEach(attr => {
      // Auto-select single-option attributes
      if (attr.variation && attr.options && attr.options.length === 1) {
        initialAttributes[attr.name] = attr.options[0];
      }
      
      // Auto-select US shipping/country if available
      if (attr.variation && attr.options && attr.options.length > 0) {
        const attrNameLower = attr.name.toLowerCase();
        const isShippingOrCountry = attrNameLower.includes('shipping') || 
                                  attrNameLower.includes('country') ||
                                  attrNameLower.includes('location');
        
        if (isShippingOrCountry) {
          const usOption = attr.options.find(opt => {
            const optLower = opt.toLowerCase();
            return optLower.includes('us') || optLower.includes('united states');
          });

          if (usOption) {
            initialAttributes[attr.name] = usOption;
          }
        }
      }
    });

    if (Object.keys(initialAttributes).length > 0) {
      setSelectedAttributes(prev => ({
        ...prev,
        ...initialAttributes
      }));
    }
  }, [product.attributes]);

  // Effect to update selected variation and add to cart state
  useEffect(() => {
    const hasAllRequired = product.attributes?.every(attr => 
      !attr.variation || selectedAttributes[attr.name]
    ) ?? false;

    // Enable add to cart if all required attributes are selected
    setIsAddToCartEnabled(hasAllRequired);

    // If all attributes are selected, find the matching variation
    if (hasAllRequired && Array.isArray(product.variations) && product.variations.length > 0) {
      try {
        // Find matching variation
        const matchingVariation = product.variations.find(variation => {
          if (!variation.attributes) return false;
          return variation.attributes.every(attr => 
            selectedAttributes[attr.name] === attr.option
          );
        });

        if (matchingVariation) {
          setSelectedVariation(matchingVariation);
          setIsAddToCartEnabled(true);
        } else {
          setSelectedVariation(null);
          setIsAddToCartEnabled(false);
        }
      } catch (error) {
        console.error('Error finding variation:', error);
        setSelectedVariation(null);
        setIsAddToCartEnabled(false);
      }
    } else {
      setSelectedVariation(null);
      setIsAddToCartEnabled(false);
    }
  }, [product.attributes, selectedAttributes, product.variations]);

  const handleAddToCart = async () => {
    if (!isAddToCartEnabled) {
      console.log('Add to cart not enabled');
      return;
    }
    
    try {
      console.log('Adding to cart:', {
        product_id: product.id,
        name: product.name,
        price: selectedVariation?.price || product.price,
        attributes: selectedAttributes
      });

      await addToCart({
        product_id: product.id,
        name: product.name,
        price: parseFloat(selectedVariation?.price || product.price),
        quantity: 1,
        image: currentImages[0]?.src,
        variation_id: selectedVariation?.id,
        attributes: Object.entries(selectedAttributes).map(([name, option]) => ({
          id: product.attributes?.find(attr => attr.name === name)?.id || 0,
          name,
          option
        }))
      });

      console.log('Successfully added to cart');
      setCartSlideOverOpen(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Gallery */}
        <div className="relative">
          <ClientGallery 
            images={currentImages} 
            forcedIndex={forcedImageIndex} 
            onThumbnailClick={handleThumbnailClick} 
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6 bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          
          <div className="text-2xl font-semibold text-purple-600">
            ${parseFloat(selectedVariation?.price || product.price).toFixed(2)}
          </div>

          {/* Only show attributes that have multiple options */}
          {product.attributes?.filter(shouldShowAttribute).map((attribute) => (
            <div key={attribute.id}>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                {attribute.name}
              </label>
              <select
                value={selectedAttributes[attribute.name] || ''}
                onChange={(e) => handleAttributeChange(attribute.name, e.target.value)}
                className="block w-full px-4 py-3 text-lg border-2 border-gray-300 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                  rounded-lg bg-white shadow-sm 
                  hover:border-purple-300 transition-colors
                  appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.5rem',
                  paddingRight: '3rem'
                }}
              >
                <option value="">Select {attribute.name}</option>
                {attribute.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Add to Cart Button */}
          <div className="mt-8">
            <button
              onClick={handleAddToCart}
              disabled={!isAddToCartEnabled}
              className={`w-full py-4 px-8 text-lg font-semibold rounded-lg shadow-sm
                ${isAddToCartEnabled 
                  ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              Add to Cart
            </button>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="mt-8 prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}
        </div>
      </div>

      {/* Cart Slide Over */}
      <SlideOutCart 
        isOpen={cartSlideOverOpen}
        onClose={() => setCartSlideOverOpen(false)}
      />

      {/* Quick Add Modal */}
      {quickAddModalOpen && selectedProduct && (
        <QuickAddModal
          open={quickAddModalOpen}
          setOpen={setQuickAddModalOpen}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
