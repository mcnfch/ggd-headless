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
  const [forcedGalleryIndex, setForcedGalleryIndex] = useState<number | undefined>(undefined);
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
    setForcedGalleryIndex(index);
    
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
        setForcedGalleryIndex(0);
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
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8">
        {/* Product Gallery */}
        <div className="relative w-full">
          <ClientGallery 
            images={product.images} 
            forcedIndex={forcedGalleryIndex} 
          />
        </div>

        {/* Product Details */}
        <div className="space-y-4 md:space-y-6 bg-white rounded-lg shadow-sm p-4 md:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          {/* Reviews Section */}
          {product.rating_count > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
                      star <= product.rating_count
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating_count} reviews
              </span>
            </div>
          )}

          {/* Product Description */}
          {product.description && (
            <div className="mt-6 prose prose-sm md:prose-base max-w-none">
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {/* Desktop Price and Stock Status */}
          <div className="hidden md:flex items-center justify-between">
            <div className="text-xl md:text-2xl font-semibold text-purple-600">
              ${parseFloat(selectedVariation?.price || product.price).toFixed(2)}
            </div>
            {product.stock_status === 'instock' && (
              <div className="text-sm text-green-600 font-medium">
                In Stock
              </div>
            )}
          </div>

          {/* Desktop Options */}
          <div className="hidden md:block space-y-4">
            {product.attributes?.filter(shouldShowAttribute).map((attribute) => (
              <div key={attribute.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {attribute.name}
                </label>
                <select
                  value={selectedAttributes[attribute.name] || ''}
                  onChange={(e) => handleAttributeChange(attribute.name, e.target.value)}
                  className="block w-full px-3 py-2 text-base border border-gray-300 
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                    rounded-lg bg-white shadow-sm 
                    hover:border-purple-300 transition-colors
                    appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.25rem',
                    paddingRight: '2.5rem'
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

            {/* Desktop Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!isAddToCartEnabled}
              className={`w-full py-4 px-6 text-lg font-semibold rounded-lg shadow-sm
                ${isAddToCartEnabled 
                  ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {isAddToCartEnabled ? 'Add to Cart' : 'Select Options'}
            </button>
            {!isAddToCartEnabled && (
              <p className="text-xs text-red-500 mt-1 text-center">
                Please select all options before adding to cart
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-10">
        <div className="container mx-auto p-4">
          {/* Mobile Options */}
          <div className="space-y-3 mb-4">
            {product.attributes?.filter(shouldShowAttribute).map((attribute) => (
              <div key={attribute.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {attribute.name}
                </label>
                <select
                  value={selectedAttributes[attribute.name] || ''}
                  onChange={(e) => handleAttributeChange(attribute.name, e.target.value)}
                  className="block w-full px-3 py-2 text-base border border-gray-300 
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                    rounded-lg bg-white shadow-sm 
                    hover:border-purple-300 transition-colors
                    appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.25rem',
                    paddingRight: '2.5rem'
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
          </div>

          {/* Mobile Price and Stock Status */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-xl font-semibold text-purple-600">
              ${parseFloat(selectedVariation?.price || product.price).toFixed(2)}
            </div>
            {product.stock_status === 'instock' && (
              <div className="text-sm text-green-600 font-medium">
                In Stock
              </div>
            )}
          </div>

          {/* Mobile Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!isAddToCartEnabled}
            className={`w-full py-3 px-6 text-base font-semibold rounded-lg shadow-sm
              ${isAddToCartEnabled 
                ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {isAddToCartEnabled ? 'Add to Cart' : 'Select Options'}
          </button>
          {!isAddToCartEnabled && (
            <p className="text-xs text-red-500 mt-1 text-center">
              Please select all options before adding to cart
            </p>
          )}
        </div>
      </div>

      {/* Cart Slide Over */}
      <SlideOutCart 
        isOpen={cartSlideOverOpen}
        onClose={() => setCartSlideOverOpen(false)}
      />
    </div>
  );
}
