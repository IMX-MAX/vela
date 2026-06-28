require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://api.nafen.sbs/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setup() {
    try {
        console.log("Creating daily_digests collection...");
        // Use a fixed ID or unique. Let's try to create it.
        const collection = await databases.createCollection(
            'default', 
            'daily_digests', 
            'Daily Digests'
        );
        console.log("Collection created:", collection.$id);

        await databases.createStringAttribute('default', 'daily_digests', 'userId', 50, true);
        await databases.createStringAttribute('default', 'daily_digests', 'date', 20, true);
        await databases.createStringAttribute('default', 'daily_digests', 'chatData', 1000000, true);

        // Wait a bit for attributes to be created
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await databases.createIndex('default', 'daily_digests', 'idx_userId', 'unique', ['userId']);
        console.log("Done setting up daily_digests");
    } catch (error) {
        console.error("Error setting up DB:", error);
    }
}

setup();
