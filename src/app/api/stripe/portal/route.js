import { NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import Stripe from 'stripe';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];

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

    const databases = new Databases(userClient);
    const userDoc = await databases.getDocument('default', 'users', currentUser.$id);

    if (!userDoc.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userDoc.stripeCustomerId,
      return_url: `${req.headers.get('origin')}/inbox/settings`,
    });

    return NextResponse.json({ url: portalSession.url });

  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
