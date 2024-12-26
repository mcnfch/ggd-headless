'use client';

export default function ProductError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-8">
        We encountered an error while loading the product.
      </p>
      <button
        onClick={() => reset()}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        Try again
      </button>
    </div>
  );
} 