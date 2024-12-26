'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Thank you for your order!
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Your payment has been processed successfully. We&apos;ll send you a confirmation email shortly.
        </p>
        <div className="mt-8 space-y-4">
          <Link
            href="/shop"
            className="inline-block w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account/orders"
            className="inline-block w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
