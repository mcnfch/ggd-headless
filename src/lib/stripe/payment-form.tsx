'use client';

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  clientSecret: string;
  onPaymentSuccess: (paymentIntent: { id: string; client_secret: string }) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentForm({ clientSecret, onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
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
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'An error occurred');
        onPaymentError(stripeError.message || 'An error occurred');
      } else if (paymentIntent) {
        onPaymentSuccess({
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret || ''
        });
      }
    } catch (err) {
      setError((err as Error).message);
      onPaymentError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-md">
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
        disabled={!stripe || processing}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
