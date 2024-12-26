'use client';

import { useState } from 'react';

interface BillingData {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

interface BillingFormProps {
  onSubmit: (billingData: BillingData) => void;
  isProcessing: boolean;
  _type?: 'shipping' | 'billing';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function BillingForm({ onSubmit, isProcessing, _type = 'billing' }: BillingFormProps) {
  const [formData, setFormData] = useState<BillingData>({
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'US',
    email: '',
    phone: '',
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            required
            value={formData.first_name}
            onChange={(e) => handleChange(e)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            required
            value={formData.last_name}
            onChange={(e) => handleChange(e)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={(e) => handleChange(e)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={(e) => handleChange(e)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address_1" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            id="address_1"
            name="address_1"
            required
            value={formData.address_1}
            onChange={(e) => handleChange(e)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address_2" className="block text-sm font-medium text-gray-700">
            Apartment, suite, etc.
          </label>
          <input
            type="text"
            id="address_2"
            name="address_2"
            value={formData.address_2}
            onChange={(e) => handleChange(e)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={(e) => handleChange(e)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            required
            value={formData.state}
            onChange={(e) => handleChange(e)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">
            ZIP / Postal code
          </label>
          <input
            type="text"
            id="postcode"
            name="postcode"
            required
            value={formData.postcode}
            onChange={(e) => handleChange(e)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end">
        <button
          type="submit"
          disabled={isProcessing}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isProcessing ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </form>
  );
}
