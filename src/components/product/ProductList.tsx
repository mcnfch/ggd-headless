'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { WooProduct } from '@/lib/types';

const ProductCard = dynamic(() => import('./ProductCard'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>,
  ssr: false
});

const ProductListSkeleton = dynamic(() => import('./ProductListSkeleton'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>,
  ssr: false
});

interface ProductListProps {
  initialProducts: WooProduct[];
  categorySlug?: string;
  sortBy?: string;
}

export default function ProductList({ initialProducts, categorySlug, sortBy = 'default' }: ProductListProps) {
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMoreProducts = () => {
    if (loading || !hasMore || !categorySlug) return;
    
    setLoading(true);
    
    // Use fetch to call an API route that will handle the server-side data fetching
    fetch(`/api/products?categorySlug=${categorySlug}&page=${currentPage + 1}`)
      .then(response => response.json())
      .then(data => {
        if (data.products?.length > 0) {
          setProducts(prev => [...prev, ...data.products]);
          setCurrentPage(prev => prev + 1);
          setHasMore(currentPage + 1 < data.totalPages);
        } else {
          setHasMore(false);
        }
      })
      .catch(error => {
        console.error('Error loading more products:', error);
        setError('Failed to load more products');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (initialProducts) {
      setIsLoading(true);
      setProducts(initialProducts);
      setIsLoading(false);
    }
  }, [initialProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observer.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef) {
        observer.unobserve(currentLoadMoreRef);
      }
    };
  }, [loadMoreProducts, hasMore, loading]);

  const sortedProducts = [...products].filter(product => 
    product && typeof product.price === 'string' && typeof product.name === 'string'
  ).sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-desc':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Show loading state
  if (isLoading) {
    return <ProductListSkeleton id="product-list" />;
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Show empty state
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No products found in this category.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {sortedProducts.map((product) => (
          <div key={product.id} className="transform transition-transform duration-200 hover:scale-[1.02]">
            <ProductCard
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.images[0]?.src || '/placeholder.jpg'}
              stockStatus={product.stock_status}
              shortDescription={product.short_description}
              sku={product.sku}
            />
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div 
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center mt-8"
        >
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          ) : (
            <button 
              onClick={loadMoreProducts}
              className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700"
            >
              Load More Products
            </button>
          )}
        </div>
      )}
    </div>
  );
}