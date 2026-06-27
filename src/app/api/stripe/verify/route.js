import { NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import Stripe from 'stripe';

export async function POST(req) {
  try {
    const { session_id } = await req.json();
    
    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-03-31.basil' });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      const userId = session.client_reference_id;
      if (!userId) {
        return NextResponse.json({ error: 'No user ID attached to session' }, { status: 400 });
      }

      const adminClient = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

      const databases = new Databases(adminClient);
      
      // Update database manually to instantly unlock Pro features without waiting for Webhooks
      await databases.updateDocument('default', 'users', userId, {
        subscriptionPlan: 'pro',
        subscriptionStatus: 'active',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription || null,
        cancelAtPeriodEnd: false
      });
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, status: session.payment_status });
  } catch (error) {
    console.error('Stripe verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
