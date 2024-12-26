'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface Order {
  id: number;
  status: string;
  total: string;
  date_created: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
  };
  line_items: Array<{
    name: string;
    quantity: number;
    total: string;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/v1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: 'orders.list',
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/shop"
            className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Orders Found
          </h1>
          <p className="text-gray-600 mb-8">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/shop"
            className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.date_created).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    order.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'processing'
                      ? 'bg-blue-100 text-blue-800'
                      : order.status === 'on-hold'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                <ul className="divide-y divide-gray-200">
                  {order.line_items.map((item, index) => (
                    <li key={index} className="py-3">
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="text-gray-900">${item.total}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                <div className="flex justify-between text-sm">
                  <p className="font-medium text-gray-900">Total</p>
                  <p className="text-gray-900">${order.total}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
