require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function checkSessions() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });
  const sessions = await stripe.checkout.sessions.list({ limit: 5 });
  console.log("Recent sessions:");
  sessions.data.forEach(s => {
    console.log(`- Session ID: ${s.id}, Email: ${s.customer_details?.email}, Status: ${s.payment_status}, Customer: ${s.customer}`);
  });
}

checkSessions();
