require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

async function fixSchema() {
  const adminClient = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(adminClient);
  
  try {
    await databases.createStringAttribute('default', 'users', 'stripeSubscriptionId', 255, false);
    console.log("Successfully created stripeSubscriptionId attribute!");
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log("Attribute already exists.");
    } else {
      console.log("Error creating attribute:", err.message);
    }
  }
}

fixSchema();
