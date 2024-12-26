'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { AddressForm, AddressData } from '@/components/profile/AddressForm';
import { wooCommerceApi } from '@/lib/api/woocommerceApi';

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingAddress, setBillingAddress] = useState<AddressData | null>(null);
  const [shippingAddress, setShippingAddress] = useState<AddressData | null>(null);
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const customerData = await wooCommerceApi.getCurrentCustomer();
      setBillingAddress(customerData.billing);
      setShippingAddress(customerData.shipping);
    } catch (err: any) {
      console.error('Error fetching addresses:', err);
      setError(err.message || 'Failed to load address information');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUpdateSuccess(false);

    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
      });
      setUpdateSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleBillingSubmit = async (data: AddressData) => {
    setIsAddressLoading(true);
    setError(null);
    setUpdateSuccess(false);
    
    try {
      if (!user?.id) {
        throw new Error('Please log in to update your billing address');
      }
      await wooCommerceApi.updateAddress(user.id, data, copyBillingToShipping);
      setBillingAddress(data);
      if (copyBillingToShipping) {
        setShippingAddress(data);
      }
      setUpdateSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update billing address');
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleShippingSubmit = async (data: AddressData) => {
    setIsAddressLoading(true);
    setError(null);
    setUpdateSuccess(false);
    
    try {
      if (!user?.id) {
        throw new Error('Please log in to update your shipping address');
      }
      await wooCommerceApi.updateAddress(user.id, data, false);
      setShippingAddress(data);
      setUpdateSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update shipping address');
    } finally {
      setIsAddressLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <p>Please log in to view your profile.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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

      {updateSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Profile updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="bg-white shadow sm:rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

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
              isLoading={isAddressLoading}
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
                isLoading={isAddressLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
