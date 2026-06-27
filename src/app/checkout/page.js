'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const features = [
  { label: 'Up to 60x more AI usage', description: '100 AI actions per day' },
  { label: 'AI-powered composer', description: 'Draft, rewrite & summarize' },
  { label: 'Connect multiple accounts', description: 'Up to 2 additional inboxes' },
  { label: 'Split Inboxes', description: 'Smart inbox categorization' },
  { label: 'Advanced shortcuts', description: 'Full keyboard workflow' },
];

function CheckoutContent() {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const billingCycle = searchParams.get('billingCycle') || 'monthly';

  const price = billingCycle === 'annual' ? 6 : 8;
  const totalAnnual = billingCycle === 'annual' ? 72 : null;
  const savings = billingCycle === 'annual' ? 24 : 0;

  useEffect(() => {
    async function initializeCheckout() {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeCheckout();
  }, [billingCycle]);

  return (
    <div className="checkout-layout">
      {/* Left Column — Order Summary */}
      <div className="checkout-summary">
        <div className="checkout-summary-inner">
          {/* Logo / Back */}
          <Link href="/inbox/settings/billing" className="checkout-back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to settings</span>
          </Link>

          {/* Plan Badge */}
          <div className="checkout-plan-header">
            <div className="checkout-plan-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span>PRO</span>
            </div>
            <h1 className="checkout-plan-title">Upgrade to Vela Pro</h1>
            <p className="checkout-plan-subtitle">Unlock the full power of AI email</p>
          </div>

          {/* Pricing */}
          <div className="checkout-price-card">
            <div className="checkout-price-row">
              <div className="checkout-price-main">
                <span className="checkout-price-dollar">$</span>
                <span className="checkout-price-amount">{price}</span>
                <span className="checkout-price-period">/mo</span>
              </div>
              <div className="checkout-price-cycle">
                {billingCycle === 'annual' ? (
                  <>
                    <span className="checkout-price-cycle-label">Billed annually</span>
                    <span className="checkout-price-cycle-total">${totalAnnual}/year</span>
                  </>
                ) : (
                  <span className="checkout-price-cycle-label">Billed monthly</span>
                )}
              </div>
            </div>
            {savings > 0 && (
              <div className="checkout-savings">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
                You're saving ${savings}/year with annual billing
              </div>
            )}
          </div>

          {/* Features */}
          <div className="checkout-features">
            <h3 className="checkout-features-title">Everything included</h3>
            <ul className="checkout-features-list">
              {features.map((feature, i) => (
                <li key={i} className="checkout-feature-item" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="checkout-feature-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="checkout-feature-label">{feature.label}</div>
                    <div className="checkout-feature-desc">{feature.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Guarantee */}
          <div className="checkout-guarantee">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span>Cancel anytime · Secure checkout via Stripe</span>
          </div>
        </div>
      </div>

      {/* Right Column — Stripe Checkout */}
      <div className="checkout-form-column">
        <div className="checkout-form-container">
          {error ? (
            <div className="checkout-error">
              <div className="checkout-error-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3 className="checkout-error-title">Something went wrong</h3>
              <p className="checkout-error-message">{error}</p>
              <div className="checkout-error-actions">
                <button 
                  onClick={() => window.location.reload()}
                  className="checkout-error-retry"
                >
                  Try again
                </button>
                <button 
                  onClick={() => router.push('/inbox/settings/billing')}
                  className="checkout-error-back"
                >
                  Return to settings
                </button>
              </div>
            </div>
          ) : clientSecret ? (
            <div className="checkout-stripe-embed">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          ) : (
            <div className="checkout-loading">
              <div className="checkout-loading-spinner">
                <div className="checkout-spinner-ring" />
              </div>
              <p className="checkout-loading-text">Preparing secure checkout…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <style>{checkoutStyles}</style>
      <Suspense fallback={
        <div className="checkout-page-loading">
          <div className="checkout-spinner-ring" />
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </>
  );
}

const checkoutStyles = `
  .checkout-layout {
    display: flex;
    min-height: 100vh;
    background: #f7f5f2;
  }

  /* Left Column */
  .checkout-summary {
    flex: 0 0 480px;
    background: linear-gradient(165deg, #2b323b 0%, #1a1f24 100%);
    color: white;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .checkout-summary::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
    pointer-events: none;
  }

  .checkout-summary::after {
    content: '';
    position: absolute;
    bottom: -80px;
    left: -80px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
    pointer-events: none;
  }

  .checkout-summary-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 40px;
    position: relative;
    z-index: 1;
  }

  /* Back Link */
  .checkout-back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,0.5);
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;
    margin-bottom: 48px;
  }

  .checkout-back-link:hover {
    color: rgba(255,255,255,0.85);
  }

  /* Plan Header */
  .checkout-plan-header {
    margin-bottom: 32px;
  }

  .checkout-plan-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.15) 100%);
    color: #fbbf24;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
    margin-bottom: 20px;
    border: 1px solid rgba(251,191,36,0.15);
  }

  .checkout-plan-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px 0;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }

  .checkout-plan-subtitle {
    font-size: 15px;
    color: rgba(255,255,255,0.55);
    margin: 0;
    font-weight: 400;
  }

  /* Pricing Card */
  .checkout-price-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
    backdrop-filter: blur(12px);
  }

  .checkout-price-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .checkout-price-main {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  .checkout-price-dollar {
    font-size: 22px;
    font-weight: 600;
    opacity: 0.7;
    align-self: flex-start;
    margin-top: 8px;
  }

  .checkout-price-amount {
    font-size: 52px;
    font-weight: 800;
    letter-spacing: -2px;
    line-height: 1;
  }

  .checkout-price-period {
    font-size: 16px;
    color: rgba(255,255,255,0.5);
    font-weight: 500;
    margin-left: 2px;
  }

  .checkout-price-cycle {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    padding-bottom: 4px;
  }

  .checkout-price-cycle-label {
    font-size: 13px;
    color: rgba(255,255,255,0.5);
  }

  .checkout-price-cycle-total {
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    font-weight: 600;
  }

  .checkout-savings {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.08);
    font-size: 13px;
    color: #34d399;
    font-weight: 500;
  }

  /* Features */
  .checkout-features {
    flex: 1;
    margin-bottom: 32px;
  }

  .checkout-features-title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: rgba(255,255,255,0.35);
    margin: 0 0 20px 0;
    font-weight: 600;
  }

  .checkout-features-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .checkout-feature-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    animation: fadeInUp 0.4s ease-out both;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .checkout-feature-check {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(52,211,153,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
    color: #34d399;
  }

  .checkout-feature-label {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    line-height: 1.3;
  }

  .checkout-feature-desc {
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    margin-top: 1px;
  }

  /* Guarantee */
  .checkout-guarantee {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    padding-top: 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .checkout-guarantee svg {
    flex-shrink: 0;
    opacity: 0.5;
  }

  /* Right Column */
  .checkout-form-column {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    min-height: 100vh;
  }

  .checkout-form-container {
    width: 100%;
    max-width: 560px;
  }

  /* Stripe Embed */
  .checkout-stripe-embed {
    background: white;
    border-radius: 20px;
    border: 1px solid #e5e2de;
    box-shadow: 
      0 1px 3px rgba(0,0,0,0.04),
      0 8px 24px rgba(0,0,0,0.06);
    overflow: hidden;
    padding: 8px;
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Loading */
  .checkout-loading, .checkout-page-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 500px;
    gap: 20px;
  }

  .checkout-page-loading {
    min-height: 100vh;
    background: #f7f5f2;
  }

  .checkout-loading-spinner {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .checkout-spinner-ring {
    width: 36px;
    height: 36px;
    border: 3px solid #e5e2de;
    border-top-color: #2b323b;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .checkout-loading-text {
    font-size: 14px;
    color: #8b8680;
    font-weight: 500;
    margin: 0;
  }

  /* Error */
  .checkout-error {
    background: white;
    border-radius: 20px;
    border: 1px solid #e5e2de;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06);
    padding: 48px 40px;
    text-align: center;
    animation: fadeIn 0.3s ease-out;
  }

  .checkout-error-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #fef2f2;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: #ef4444;
  }

  .checkout-error-title {
    font-size: 18px;
    font-weight: 700;
    color: #2b323b;
    margin: 0 0 8px 0;
  }

  .checkout-error-message {
    font-size: 14px;
    color: #8b8680;
    margin: 0 0 28px 0;
    line-height: 1.5;
  }

  .checkout-error-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .checkout-error-retry {
    padding: 10px 24px;
    background: #2b323b;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .checkout-error-retry:hover {
    background: #3d4654;
  }

  .checkout-error-back {
    padding: 10px 24px;
    background: transparent;
    color: #8b8680;
    border: 1px solid #e5e2de;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .checkout-error-back:hover {
    background: #f7f5f2;
    color: #2b323b;
  }

  /* Responsive */
  @media (max-width: 960px) {
    .checkout-layout {
      flex-direction: column;
    }

    .checkout-summary {
      flex: none;
      width: 100%;
    }

    .checkout-summary-inner {
      padding: 32px 24px;
    }

    .checkout-back-link {
      margin-bottom: 32px;
    }

    .checkout-form-column {
      min-height: auto;
      padding: 32px 24px 48px;
    }

    .checkout-form-container {
      max-width: 100%;
    }
  }

  @media (max-width: 480px) {
    .checkout-price-amount {
      font-size: 40px;
    }

    .checkout-plan-title {
      font-size: 24px;
    }

    .checkout-error {
      padding: 32px 24px;
    }
  }
`;
