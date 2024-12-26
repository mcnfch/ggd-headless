import React, { useState } from 'react';

export interface AddressData {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

interface AddressFormProps {
  type: 'billing' | 'shipping';
  initialData?: AddressData;
  onSubmit: (data: AddressData) => void;
  isLoading?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  type,
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<AddressData>(
    initialData || {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: '',
      email: '',
      phone: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${type}_first_name`} className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            name="first_name"
            id={`${type}_first_name`}
            value={formData.first_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor={`${type}_last_name`} className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            name="last_name"
            id={`${type}_last_name`}
            value={formData.last_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="col-span-2">
          <label htmlFor={`${type}_company`} className="block text-sm font-medium text-gray-700">
            Company (Optional)
          </label>
          <input
            type="text"
            name="company"
            id={`${type}_company`}
            value={formData.company}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="col-span-2">
          <label htmlFor={`${type}_address_1`} className="block text-sm font-medium text-gray-700">
            Street Address
          </label>
          <input
            type="text"
            name="address_1"
            id={`${type}_address_1`}
            value={formData.address_1}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="col-span-2">
          <label htmlFor={`${type}_address_2`} className="block text-sm font-medium text-gray-700">
            Apartment, suite, etc. (Optional)
          </label>
          <input
            type="text"
            name="address_2"
            id={`${type}_address_2`}
            value={formData.address_2}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor={`${type}_city`} className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            name="city"
            id={`${type}_city`}
            value={formData.city}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor={`${type}_state`} className="block text-sm font-medium text-gray-700">
            State / Province
          </label>
          <input
            type="text"
            name="state"
            id={`${type}_state`}
            value={formData.state}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor={`${type}_postcode`} className="block text-sm font-medium text-gray-700">
            ZIP / Postal Code
          </label>
          <input
            type="text"
            name="postcode"
            id={`${type}_postcode`}
            value={formData.postcode}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor={`${type}_country`} className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            type="text"
            name="country"
            id={`${type}_country`}
            value={formData.country}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor={`${type}_email`} className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            id={`${type}_email`}
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor={`${type}_phone`} className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            id={`${type}_phone`}
            value={formData.phone}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Address'}
        </button>
      </div>
    </form>
  );
};
