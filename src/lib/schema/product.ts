import type { WooProduct, WooVariation } from '@/lib/types';

interface ProductSchemaOptions {
  product: WooProduct;
  variants?: WooVariation[];
  siteUrl: string;
}

interface _ProductSchemaData {
  id: number;
  name: string;
  description: string;
  price: string;
  sku: string;
  images: Array<{
    src: string;
    alt: string;
  }>;
  attributes: Array<{
    name: string;
    options: string[];
  }>;
}

export interface ProductSchema {
  "@type": string;
  priceCurrency: string;
  price: string;
  priceValidUntil: string;
  availability: string;
  seller: {
    "@type": string;
    name: string;
    url: string;
  };
  shippingDetails: {
    "@type": string;
    shippingRate: {
      "@type": string;
      currency: string;
      value: string;
    };
    shippingDestination: {
      "@type": string;
      addressCountry: string;
    };
    deliveryTime: {
      "@type": string;
      businessDays: {
        "@type": string;
        minValue: number;
        maxValue: number;
      };
    };
  };
  hasMerchantReturnPolicy: {
    "@type": string;
    applicableCountry: string;
    returnPolicyCategory: string;
    merchantReturnDays: string;
    returnMethod: string;
    returnFees: string;
  };
  offers?: {
    "@type": string;
    priceCurrency: string;
    lowPrice: string;
    highPrice: string;
  };
  aggregateRating?: {
    "@type": string;
    ratingValue: string;
    reviewCount: string;
  };
}

export function generateProductSchema({ product, variants, siteUrl }: ProductSchemaOptions): ProductSchema {
  const schema: ProductSchema = {
    "@type": "Product",
    priceCurrency: "USD",
    price: product.price,
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    availability: product.stock_status === 'instock' 
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock",
    seller: {
      "@type": "Organization",
      name: "Festival Rave Gear",
      url: siteUrl
    },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: "0",
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "US",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        businessDays: {
          "@type": "OpeningHoursSpecification",
          minValue: 1,
          maxValue: 3,
        },
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "US",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: "30",
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
  };

  if (variants && variants.length > 0) {
    schema.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: Math.min(...variants.map(v => parseFloat(v.price || '0'))).toString(),
      highPrice: Math.max(...variants.map(v => parseFloat(v.price || '0'))).toString(),
    };
  }

  if (product.average_rating && product.rating_count) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.average_rating,
      reviewCount: product.rating_count.toString(),
    };
  }

  return schema;
}

export function generateProductJsonLD(schema: ProductSchema) {
  return {
    __html: JSON.stringify(schema)
  };
}
