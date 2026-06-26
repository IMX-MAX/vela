import { NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import Stripe from 'stripe';

export async function POST(req) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || !webhookSecret) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-03-31.basil' });
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const customerId = session.customer;

        if (userId) {
          await databases.updateDocument('default', 'users', userId, {
            subscriptionPlan: 'pro',
            subscriptionStatus: 'active',
            stripeCustomerId: customerId
          });
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status; // 'active', 'past_due', 'canceled', etc.

        // Find user by stripeCustomerId
        const { Query } = await import('node-appwrite');
        const users = await databases.listDocuments('default', 'users', [
          Query.equal('stripeCustomerId', customerId)
        ]);

        if (users.documents.length > 0) {
          const userDoc = users.documents[0];
          await databases.updateDocument('default', 'users', userDoc.$id, {
            subscriptionPlan: status === 'active' ? 'pro' : 'free',
            subscriptionStatus: status
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { Query } = await import('node-appwrite');
        const users = await databases.listDocuments('default', 'users', [
          Query.equal('stripeCustomerId', customerId)
        ]);

        if (users.documents.length > 0) {
          const userDoc = users.documents[0];
          await databases.updateDocument('default', 'users', userDoc.$id, {
            subscriptionPlan: 'free',
            subscriptionStatus: 'canceled'
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
