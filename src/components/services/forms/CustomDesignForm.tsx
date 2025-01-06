"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface CustomDesignFormProps {
  onBack: () => void;
}

interface FormData {
  productUrl: string;
  designDescription: string;
}

const CustomDesignForm: React.FC<CustomDesignFormProps> = ({ onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement form submission
      console.log('Form data:', data);
      alert('Thank you for your submission! We will review your request and get back to you soon.');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/80 p-[18px]">
      <button
        onClick={onBack}
        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
      >
        ← Back to options
      </button>

      <h2 className="text-2xl font-bold mb-6">Request Custom Design</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product URL
          </label>
          <input
            type="url"
            {...register('productUrl', { required: 'Product URL is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="https://example.com/product"
          />
          {errors.productUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.productUrl.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Design Description
          </label>
          <textarea
            {...register('designDescription', {
              required: 'Design description is required',
              minLength: {
                value: 20,
                message: 'Please provide at least 20 characters'
              }
            })}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Please describe your design idea in detail..."
          />
          {errors.designDescription && (
            <p className="mt-1 text-sm text-red-600">{errors.designDescription.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white font-semibold py-3 px-6 rounded-md
            bg-gradient-to-r from-purple-600 to-pink-600
            hover:from-purple-700 hover:to-pink-700
            transform transition-all duration-300
            hover:scale-[1.02] shadow-lg hover:shadow-xl
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:scale-100"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default CustomDesignForm;
