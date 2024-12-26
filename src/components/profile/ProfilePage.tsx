import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AddressForm, AddressData } from './AddressForm';
import axios from 'axios';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingAddress, setBillingAddress] = useState<AddressData | null>(null);
  const [shippingAddress, setShippingAddress] = useState<AddressData | null>(null);
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wc/v3/customers/${user?.id}`, {
        auth: {
          username: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || '',
          password: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || ''
        }
      });

      setBillingAddress(response.data.billing);
      setShippingAddress(response.data.shipping);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Failed to load address information');
    }
  };

  const handleBillingSubmit = async (data: AddressData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updateData: any = {
        billing: data
      };
      
      // If copyBillingToShipping is checked, also update shipping address
      if (copyBillingToShipping) {
        updateData.shipping = data;
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wc/v3/customers/${user?.id}`,
        updateData,
        {
          auth: {
            username: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || '',
            password: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || ''
          }
        }
      );

      setBillingAddress(data);
      if (copyBillingToShipping) {
        setShippingAddress(data);
      }
    } catch (err) {
      console.error('Error updating billing address:', err);
      setError('Failed to update billing address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShippingSubmit = async (data: AddressData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wc/v3/customers/${user?.id}`,
        {
          shipping: data
        },
        {
          auth: {
            username: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || '',
            password: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || ''
          }
        }
      );

      setShippingAddress(data);
    } catch (err) {
      console.error('Error updating shipping address:', err);
      setError('Failed to update shipping address');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
          <div className="bg-white shadow sm:rounded-lg p-6">
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={copyBillingToShipping}
                  onChange={(e) => setCopyBillingToShipping(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Use billing address for shipping
                </span>
              </label>
            </div>
            <AddressForm
              type="billing"
              initialData={billingAddress || undefined}
              onSubmit={handleBillingSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>

        {!copyBillingToShipping && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="bg-white shadow sm:rounded-lg p-6">
              <AddressForm
                type="shipping"
                initialData={shippingAddress || undefined}
                onSubmit={handleShippingSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
