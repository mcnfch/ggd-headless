'use client';

import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  billingDetails: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

export default function CheckoutForm({ billingDetails }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const cardElement = elements?.getElement(CardElement);
    if (cardElement) {
      cardElement.on('change', (event) => {
        setError(event.error ? event.error.message : '');
      });
    }
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !cart) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        '',
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${billingDetails.first_name} ${billingDetails.last_name}`,
              email: billingDetails.email,
              phone: billingDetails.phone,
              address: {
                line1: billingDetails.address_1,
                line2: billingDetails.address_2,
                city: billingDetails.city,
                state: billingDetails.state,
                postal_code: billingDetails.postcode,
                country: billingDetails.country,
              },
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'An error occurred');
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          // Create WooCommerce order
          const orderResponse = await fetch('/api/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customer: {
                billing: billingDetails,
                shipping: billingDetails, // Using billing as shipping for now
              },
              lineItems: cart.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
              })),
              paymentMetadata: {
                transactionId: paymentIntent.id,
                status: paymentIntent.status,
              },
            }),
          });

          if (!orderResponse.ok) {
            throw new Error('Failed to create order');
          }

          setSucceeded(true);
          clearCart();
          
          // Redirect to success page
          router.push('/checkout/success');
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || succeeded}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
      >
        {processing ? (
          <span className="flex items-center">
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            Processing...
          </span>
        ) : (
          `Pay ${cart?.total ? `$${cart.total.toFixed(2)}` : ''}`
        )}
      </button>
    </form>
  );
}
