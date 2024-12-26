'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import BillingForm from './BillingForm';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';

type Section = 'customer' | 'shipping' | 'billing' | 'payment';

export default function CheckoutAccordion() {
  const [activeSection, setActiveSection] = useState<Section>('customer');
  const [completedSections, setCompletedSections] = useState<Set<Section>>(new Set());
  const { cart } = useCart();
  const [customerEmail, setCustomerEmail] = useState('');
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

  const sections: { id: Section; title: string }[] = [
    { id: 'customer', title: 'Customer' },
    { id: 'shipping', title: 'Shipping' },
    { id: 'billing', title: 'Billing' },
    { id: 'payment', title: 'Payment' },
  ];

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerEmail) {
      setCompletedSections(prev => new Set([...prev, 'customer']));
      setActiveSection('shipping');
    }
  };

  const isCompleted = (section: Section) => completedSections.has(section);
  const isActive = (section: Section) => activeSection === section;
  const canAccess = (section: Section) => {
    const sectionIndex = sections.findIndex(s => s.id === section);
    const previousSections = sections.slice(0, sectionIndex).map(s => s.id);
    return previousSections.every(s => completedSections.has(s));
  };

  const _handlePaymentMethodChange = (_data: _PaymentMethodChangeEvent) => {
    // Handle payment method change
  };

  const _handleShippingMethodChange = (_data: _ShippingMethodChangeEvent) => {
    // Handle shipping method change
  };

  return (
    <div className="max-w-3xl mx-auto">
      {sections.map(({ id, title }) => (
        <div key={id} className="mb-4">
          <button
            onClick={() => canAccess(id) && setActiveSection(id)}
            className={`w-full text-left p-4 rounded-lg flex items-center justify-between ${
              isActive(id)
                ? 'bg-white shadow-lg'
                : isCompleted(id)
                ? 'bg-gray-50'
                : 'bg-gray-100'
            } ${!canAccess(id) && 'opacity-50 cursor-not-allowed'}`}
          >
            <div className="flex items-center space-x-3">
              {isCompleted(id) ? (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div
                  className={`w-6 h-6 rounded-full ${
                    isActive(id) ? 'bg-blue-500' : 'bg-gray-300'
                  } text-white flex items-center justify-center text-sm`}
                >
                  {sections.findIndex(s => s.id === id) + 1}
                </div>
              )}
              <span className="font-medium text-lg">{title}</span>
            </div>
            {isActive(id) ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {isActive(id) && (
            <div className="mt-4 p-6 bg-white rounded-lg shadow-lg">
              {id === 'customer' && (
                <form onSubmit={handleCustomerSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={subscribeNewsletter}
                      onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                      Subscribe to our newsletter
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link href="/login" className="text-blue-600 hover:text-blue-500">
                        Sign in now
                      </Link>
                    </p>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}

              {id === 'shipping' && (
                <BillingForm
                  onSubmit={(_data) => {
                    setCompletedSections(prev => new Set([...prev, 'shipping']));
                    setActiveSection('billing');
                  }}
                  isProcessing={false}
                  _type="shipping"
                />
              )}

              {id === 'billing' && (
                <BillingForm
                  onSubmit={(_data) => {
                    setCompletedSections(prev => new Set([...prev, 'billing']));
                    setActiveSection('payment');
                  }}
                  isProcessing={false}
                  _type="billing"
                />
              )}

              {id === 'payment' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">${cart?.subtotal?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-4">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">${cart?.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment-method"
                          value="credit-card"
                          defaultChecked
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium">Credit Card</span>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="relative w-24 h-12">
                              <Image
                                src="/visa.svg"
                                alt="Visa"
                                layout="fill"
                                objectFit="contain"
                                priority
                              />
                            </div>
                            <div className="relative w-24 h-12">
                              <Image
                                src="/mastercard.svg"
                                alt="Mastercard"
                                layout="fill"
                                objectFit="contain"
                                priority
                              />
                            </div>
                            <div className="relative w-24 h-12">
                              <Image
                                src="/amex.svg"
                                alt="American Express"
                                layout="fill"
                                objectFit="contain"
                                priority
                              />
                            </div>
                            <div className="relative w-24 h-12">
                              <Image
                                src="/discover.svg"
                                alt="Discover"
                                layout="fill"
                                objectFit="contain"
                                priority
                              />
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="border rounded-lg p-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment-method"
                          value="paypal"
                          disabled
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium">PayPal</span>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="relative w-24 h-12">
                              <Image
                                src="/paypal.svg"
                                alt="PayPal"
                                layout="fill"
                                objectFit="contain"
                                priority
                              />
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Coming soon</p>
                        </div>
                      </label>
                    </div>

                    <div className="border rounded-lg p-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment-method"
                          value="pay-later"
                          disabled
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium">Pay Later</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Pay in 4 interest-free payments on purchases of $30-$1,500
                          </p>
                          <p className="text-sm text-gray-500 mt-1">Coming soon</p>
                        </div>
                      </label>
                    </div>

                    <div className="border rounded-lg p-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment-method"
                          value="google-pay"
                          disabled
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium">Google Pay</span>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="relative w-24 h-12">
                              <Image
                                src="/google-pay.svg"
                                alt="Google Pay"
                                layout="fill"
                                objectFit="contain"
                                priority
                              />
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Coming soon</p>
                        </div>
                      </label>
                    </div>

                    <div className="border rounded-lg p-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment-method"
                          value="amazon-pay"
                          disabled
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium">Amazon Pay</span>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="relative w-24 h-12">
                              <Image
                                src="/amazon-pay.svg"
                                alt="Amazon Pay"
                                layout="fill"
                                objectFit="contain"
                                priority
                              />
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Coming soon</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="w-full bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400"
                    >
                      PLACE ORDER
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface _PaymentMethodChangeEvent {
  type: string;
  target: {
    value: string;
  };
}

interface _ShippingMethodChangeEvent {
  type: string;
  target: {
    value: string;
  };
}
