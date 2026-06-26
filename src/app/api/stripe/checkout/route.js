import { NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
export async function POST(req) {
  try {
    const { billingCycle } = await req.json();
    
    if (billingCycle !== 'monthly' && billingCycle !== 'annual') {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];

    // Authenticate user to get userId
    const userClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setJWT(jwt);
    
    const userAccount = new (await import('node-appwrite')).Account(userClient);
    let currentUser;
    try {
      currentUser = await userAccount.get();
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = currentUser.$id;

    // Initialize Stripe
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      // Return a mock URL if Stripe is not configured yet
      return NextResponse.json({ url: '/inbox/settings?stripe=mock_success' });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-03-31.basil' });

    const priceId = billingCycle === 'annual' 
      ? process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID 
      : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe price IDs not configured' }, { status: 500 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'subscription',
      managed_payments: { enabled: true },
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      customer_email: currentUser.email,
      return_url: `${req.headers.get('origin')}/inbox/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
    });

    return NextResponse.json({ client_secret: checkoutSession.client_secret });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
