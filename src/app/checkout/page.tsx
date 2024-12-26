'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';

export default function CheckoutPage() {
  const { cart, loading: cartLoading } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      router.push('/cart');
    }
  }, [cart, cartLoading, router]);

  if (cartLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Festival Rave Gear
        </h1>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <CheckoutForm />
          </div>
          <div className="lg:col-span-5">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
