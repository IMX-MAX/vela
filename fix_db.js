require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');
const Stripe = require('stripe');

async function fixUser() {
  const adminClient = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(adminClient);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });
  
  try {
    const users = await databases.listDocuments('default', 'users');
    const user = users.documents.find(u => u.email === 'innometrixbusiness@gmail.com');
    
    const subscriptions = await stripe.subscriptions.list({
      customer: 'cus_UmaS0Gtpr4rczO',
      status: 'active'
    });
    
    await databases.updateDocument('default', 'users', user.$id, {
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active',
      stripeCustomerId: 'cus_UmaS0Gtpr4rczO',
      stripeSubscriptionId: subscriptions.data[0]?.id || null
    });
    
    console.log(`Successfully fixed user!`);
  } catch (err) {
    console.log("Error fixing user:", err.message);
  }
}

fixUser();
