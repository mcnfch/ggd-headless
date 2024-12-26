import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg max-w-2xl mx-4 text-center">
        <h1 className="text-4xl font-orbitron mb-4 tracking-wider">Page Not Found</h1>
        <p className="text-gray-700 text-lg mb-6">
          We couldn't find what you're looking for. The page might have been moved or doesn't exist.
        </p>
        <Link 
          href="/" 
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-orbitron tracking-wide"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
