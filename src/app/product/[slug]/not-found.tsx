import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
      <p className="text-gray-600 mb-8">
        The product you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700"
      >
        Return to Home
      </Link>
    </div>
  );
} 