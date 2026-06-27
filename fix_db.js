require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

async function fixUser() {
  const adminClient = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(adminClient);
  
  try {
    const users = await databases.listDocuments('default', 'users');
    const user = users.documents.find(u => u.email === 'timeinfinityapparel@gmail.com');
    
    // Set to 1814123950 which is what Stripe returned for cancel_at / current_period_end
    await databases.updateDocument('default', 'users', user.$id, {
      currentPeriodEnd: new Date(1814123950 * 1000).toISOString()
    });
    
    console.log(`Successfully fixed user!`);
  } catch (err) {
    console.log("Error fixing user:", err.message);
  }
}

fixUser();
