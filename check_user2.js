require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

async function checkUser2() {
  const adminClient = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(adminClient);
  
  try {
    const users = await databases.listDocuments('default', 'users');
    const user = users.documents.find(u => u.email === 'timeinfinityapparel@gmail.com');
    console.log("User data:", JSON.stringify(user, null, 2));
  } catch (err) {
    console.log("Error:", err.message);
  }
}

checkUser2();
