import { NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
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
      return NextResponse.json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-03-31.basil' });

    // Check for existing subscription to prevent duplicates
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);
    let userDoc;
    try {
      userDoc = await databases.getDocument('default', 'users', userId);
    } catch (err) {
      // User document may not exist yet, that's fine
    }

    // Prevent duplicate subscriptions
    if (userDoc?.subscriptionPlan === 'pro' && userDoc?.subscriptionStatus === 'active') {
      return NextResponse.json({ error: 'You already have an active Pro subscription.' }, { status: 400 });
    }

    const priceId = billingCycle === 'annual' 
      ? process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID 
      : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe price IDs not configured' }, { status: 500 });
    }

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'www.getvela.email';
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    // Reuse existing Stripe customer if available to prevent duplicates
    const sessionParams = {
      ui_mode: 'embedded',
      mode: 'subscription',
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      return_url: `${baseUrl}/inbox/settings/billing?success=true`,
    };

    if (userDoc?.stripeCustomerId) {
      sessionParams.customer = userDoc.stripeCustomerId;
    } else if (currentUser.email) {
      sessionParams.customer_email = currentUser.email;
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ client_secret: checkoutSession.client_secret });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    // Return the actual error message so we can see what's failing in the UI
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
