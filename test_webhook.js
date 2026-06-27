require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

async function testWebhookLogic() {
  const adminClient = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(adminClient);
  
  try {
    const users = await databases.listDocuments('default', 'users');
    const userDoc = users.documents[0];
    
    const currentPeriodEnd = new Date(1718912345 * 1000).toISOString();
    
    await databases.updateDocument('default', 'users', userDoc.$id, {
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active',
      cancelAtPeriodEnd: true,
      currentPeriodEnd: currentPeriodEnd,
      stripeSubscriptionId: 'sub_test_123'
    });
    console.log("Success! Document updated.");
    
    const updated = await databases.getDocument('default', 'users', userDoc.$id);
    console.log("Updated currentPeriodEnd:", updated.currentPeriodEnd);
  } catch (err) {
    console.log("Error:", err.message);
  }
}

testWebhookLogic();
