require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function testSub() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });
  const sub = await stripe.subscriptions.retrieve('sub_1Tn1kyCg6pVfsKARkd57WNMh');
  console.log("Subscription:", JSON.stringify(sub, null, 2));
}

testSub();
