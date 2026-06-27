require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

async function testAttribute() {
  const adminClient = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(adminClient);
  
  try {
    const users = await databases.listDocuments('default', 'users');
    const user = users.documents[0];
    
    await databases.updateDocument('default', 'users', user.$id, {
      stripeCustomerId: 'test_123'
    });
    console.log("Success! Attribute exists.");
  } catch (err) {
    console.log("Error updating document:", err.message);
  }
}

testAttribute();
