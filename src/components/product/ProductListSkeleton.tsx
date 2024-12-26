'use client';

interface ProductListSkeletonProps {
  id?: string;
}

export default function ProductListSkeleton({ id = 'main' }: ProductListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={`skeleton-${id}-${i}`} className="flex flex-col h-full animate-pulse">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-200"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="p-4 pt-0 mt-auto">
            <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
