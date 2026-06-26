'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useSearchParams, useRouter } from 'next/navigation';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function CheckoutContent() {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const billingCycle = searchParams.get('billingCycle') || 'monthly';

  useEffect(() => {
    async function initializeCheckout() {
      try {
        const { account } = await import('@/lib/appwrite');
        const jwtResponse = await account.createJWT();
        
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtResponse.jwt}`
          },
          body: JSON.stringify({ billingCycle })
        });
        
        const data = await res.json();
        
        if (data.client_secret) {
          setClientSecret(data.client_secret);
        } else {
          setError(data.error || 'Failed to initialize checkout');
        }
      } catch (err) {
        console.error('Failed to create checkout session', err);
        setError('An unexpected error occurred. Please try again.');
      }
    }
    
    initializeCheckout();
  }, [billingCycle]);

  return (
    <div className="max-w-3xl w-full space-y-8">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Complete your upgrade
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          You're upgrading to Vela Pro ({billingCycle} billing)
        </p>
      </div>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
          {error}
          <div className="mt-4">
            <button 
              onClick={() => router.push('/inbox/settings')}
              className="text-red-700 underline text-sm"
            >
              Return to Settings
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-200 min-h-[500px]">
          {clientSecret ? (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : (
            <div className="flex justify-center items-center h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2b323b]"></div>
            </div>
          )}
        </div>
      )}
      
      <div className="text-center mt-4">
        <button 
          onClick={() => router.push('/inbox/settings')}
          className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          Cancel and return to settings
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f2] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2b323b]"></div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
