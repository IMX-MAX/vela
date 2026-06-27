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
        let userId = session.client_reference_id;
        const customerId = session.customer;
        const customerEmail = session.customer_details?.email || session.customer_email;

        if (!userId && customerEmail) {
          const { Query } = await import('node-appwrite');
          const users = await databases.listDocuments('default', 'users', [
            Query.equal('email', customerEmail)
          ]);
          if (users.documents.length > 0) {
            userId = users.documents[0].$id;
          }
        }

        if (userId) {
          await databases.updateDocument('default', 'users', userId, {
            subscriptionPlan: 'pro',
            subscriptionStatus: 'active',
            stripeCustomerId: customerId,
            stripeSubscriptionId: session.subscription || null,
            cancelAtPeriodEnd: false
          });
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status; // 'active', 'past_due', 'canceled', etc.
        const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;
        const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null;

        // Find user by stripeCustomerId
        const { Query } = await import('node-appwrite');
        const users = await databases.listDocuments('default', 'users', [
          Query.equal('stripeCustomerId', customerId)
        ]);

        if (users.documents.length > 0) {
          const userDoc = users.documents[0];
          await databases.updateDocument('default', 'users', userDoc.$id, {
            subscriptionPlan: (status === 'active' || status === 'past_due' || status === 'trialing') ? 'pro' : 'free',
            subscriptionStatus: status,
            cancelAtPeriodEnd: cancelAtPeriodEnd,
            currentPeriodEnd: currentPeriodEnd,
            stripeSubscriptionId: subscription.id
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
            subscriptionStatus: 'canceled',
            cancelAtPeriodEnd: false
          });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const { Query } = await import('node-appwrite');
        const users = await databases.listDocuments('default', 'users', [
          Query.equal('stripeCustomerId', customerId)
        ]);

        if (users.documents.length > 0) {
          const userDoc = users.documents[0];
          console.warn(`Payment failed for user ${userDoc.$id}, customer ${customerId}, invoice ${invoice.id}`);
          // Subscription status will be updated via customer.subscription.updated event
        }
        break;
      }
      case 'customer.subscription.paused': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        const { Query } = await import('node-appwrite');
        const users = await databases.listDocuments('default', 'users', [
          Query.equal('stripeCustomerId', customerId)
        ]);
        
        if (users.documents.length > 0) {
          const userDoc = users.documents[0];
          await databases.updateDocument('default', 'users', userDoc.$id, {
            subscriptionStatus: 'paused',
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false
          });
        }
        break;
      }
      case 'customer.subscription.resumed': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        const { Query } = await import('node-appwrite');
        const users = await databases.listDocuments('default', 'users', [
          Query.equal('stripeCustomerId', customerId)
        ]);
        
        if (users.documents.length > 0) {
          const userDoc = users.documents[0];
          await databases.updateDocument('default', 'users', userDoc.$id, {
            subscriptionPlan: 'pro',
            subscriptionStatus: 'active',
            cancelAtPeriodEnd: false
          });
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        
        const { Query } = await import('node-appwrite');
        const users = await databases.listDocuments('default', 'users', [
          Query.equal('stripeCustomerId', customerId)
        ]);
        
        if (users.documents.length > 0) {
          const userDoc = users.documents[0];
          await databases.updateDocument('default', 'users', userDoc.$id, {
            aiUsageCount: 0,
            lastUsageReset: new Date().toISOString()
          });
        }
        break;
      }
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        const { Query } = await import('node-appwrite');
        const users = await databases.listDocuments('default', 'users', [
          Query.equal('stripeCustomerId', customerId)
        ]);
        
        if (users.documents.length > 0) {
          const userDoc = users.documents[0];
          if (process.env.RESEND_API_KEY) {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: 'Vela <noreply@getvela.email>',
              to: userDoc.email,
              subject: 'Your Vela trial is ending soon',
              html: `<p>Your trial ends in 3 days. <a href="${process.env.NEXT_PUBLIC_URL}/pricing">Upgrade now</a> to keep using Pro features.</p>`
            });
          }
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        
        if (userId) {
          await databases.updateDocument('default', 'users', userId, {
            stripeCheckoutSessionId: null
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
