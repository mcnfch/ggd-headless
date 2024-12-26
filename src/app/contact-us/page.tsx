'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  name: string;
  inquiryType: string;
  orderNumber?: string;
  subject: string;
  priority: string;
  email: string;
  message: string;
}

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    inquiryType: '',
    orderNumber: '',
    subject: '',
    priority: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const inquiryTypes = [
    'Order Status',
    'Return Request',
    'Product Question',
    'Website Issue',
    'Shipping Question',
    'Other'
  ];

  const subjects = {
    'Order Status': [
      'Where is my order?',
      'Order delayed',
      'Missing items',
      'Wrong items received'
    ],
    'Return Request': [
      'Initiate return',
      'Return status',
      'Return label issue',
      'Refund status'
    ],
    'Product Question': [
      'Size question',
      'Color options',
      'Material information',
      'Product availability'
    ],
    'Website Issue': [
      'Payment problem',
      'Checkout error',
      'Account access',
      'Technical error'
    ],
    'Shipping Question': [
      'Shipping methods',
      'Shipping costs',
      'Delivery timeframe',
      'International shipping'
    ],
    'Other': [
      'General inquiry',
      'Feedback',
      'Partnership request',
      'Other question'
    ]
  };

  const priorities = [
    'Normal',
    'High',
    'Urgent'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('Submitting form data:', formData);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: `
Priority: ${formData.priority}
Type: ${formData.inquiryType}
${formData.orderNumber ? `Order Number: ${formData.orderNumber}` : ''}
Subject: ${formData.subject}

Message:
${formData.message}
          `.trim()
        }),
      });

      const data = await response.json();
      console.log('Response from server:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Wait for a moment to ensure the email is sent
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then redirect
      router.push('/contact-us/success');
    } catch (error) {
      console.error('Form submission error:', error);
      setError('Failed to send message. Please try again later.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 backdrop-blur-sm bg-white/70 p-8 rounded-lg shadow-xl">
        {error && (
          <div className="p-4 rounded-md bg-red-50 text-red-800">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your@email.com"
          />
        </div>

        {/* Inquiry Type */}
        <div>
          <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700">
            Type of Inquiry*
          </label>
          <select
            id="inquiryType"
            name="inquiryType"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={formData.inquiryType}
            onChange={handleInputChange}
          >
            <option value="">Select inquiry type</option>
            {inquiryTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Order Number (conditional) */}
        {formData.inquiryType === 'Order Status' && (
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700">
              Order Number
            </label>
            <input
              type="text"
              id="orderNumber"
              name="orderNumber"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              value={formData.orderNumber}
              onChange={handleInputChange}
              placeholder="Enter your order number"
            />
          </div>
        )}

        {/* Subject (dependent on inquiry type) */}
        {formData.inquiryType && (
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject*
            </label>
            <select
              id="subject"
              name="subject"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              value={formData.subject}
              onChange={handleInputChange}
            >
              <option value="">Select subject</option>
              {subjects[formData.inquiryType as keyof typeof subjects].map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        )}

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority*
          </label>
          <select
            id="priority"
            name="priority"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={formData.priority}
            onChange={handleInputChange}
          >
            <option value="">Select priority</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message*
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Please provide details about your inquiry..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
        </button>
      </form>
    </div>
  );
}