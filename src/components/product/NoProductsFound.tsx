import Link from 'next/link';

interface NoProductsFoundProps {
  categoryName: string;
}

export function NoProductsFound({ categoryName }: NoProductsFoundProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-orbitron mb-4 tracking-wider">
          No Products Found
        </h2>
        <p className="text-gray-700 text-lg mb-6">
          We couldn't find any products in the category "{categoryName}". 
          This category might not exist or there may be no products available at the moment.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/shop" 
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-orbitron tracking-wide"
          >
            Browse Shop
          </Link>
          <Link 
            href="/" 
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-orbitron tracking-wide"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
