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

    const sessionCookie = (await cookies()).get('a_session_' + process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Authenticate user to get userId
    const userClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setSession(sessionCookie.value);
    
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

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const priceId = billingCycle === 'annual' 
      ? process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID 
      : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe price IDs not configured' }, { status: 500 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      customer_email: currentUser.email,
      success_url: `${req.headers.get('origin')}/inbox/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${req.headers.get('origin')}/inbox/settings?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
