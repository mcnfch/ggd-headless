'use client';

import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';
import { useState, useEffect } from 'react';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [clientSecret, setClientSecret] = useState<string>();

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1000, // Will be replaced with actual amount
        currency: 'usd',
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  const appearance = {
    theme: 'stripe' as const,
  };

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{
        clientSecret,
        appearance,
      }}
    >
      {children}
    </Elements>
  );
}
