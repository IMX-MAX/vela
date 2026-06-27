require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function test() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });
  
  // 1. Create a dummy session
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    mode: 'subscription',
    line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID, quantity: 1 }],
    client_reference_id: 'dummy_user_id',
    return_url: `https://www.getvela.email/inbox/settings/billing?success=true`,
  });
  
  console.log("Created session:", session.id);
  
  // 2. Fetch the verify route on Vercel
  const res = await fetch('https://www.getvela.email/api/stripe/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: session.id })
  });
  
  const data = await res.json();
  console.log("Verify response:", res.status, data);
}

test();
