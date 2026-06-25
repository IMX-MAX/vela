import 'dotenv/config';
import { Client, Databases } from 'node-appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!projectId || !apiKey) {
    console.error(
        'Missing Appwrite credentials. Set NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY ' +
        '(and optionally NEXT_PUBLIC_APPWRITE_ENDPOINT) in your .env.local before running this script.'
    );
    process.exit(1);
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

const databases = new Databases(client);

async function setup() {
    try {
        console.log("Checking database...");
        let dbExists = false;
        try {
            await databases.get('default');
            dbExists = true;
            console.log("Database 'default' already exists.");
        } catch (e) {
            console.log("Creating database 'default'...");
            await databases.create('default', 'Default Database');
        }

        console.log("Checking collection 'users'...");
        let colExists = false;
        try {
            await databases.getCollection('default', 'users');
            colExists = true;
            console.log("Collection 'users' already exists.");
        } catch (e) {
            console.log("Creating collection 'users'...");
            await databases.createCollection('default', 'users', 'Users');
        }

        console.log("Checking collection 'retained_usage'...");
        let retainedUsageExists = false;
        try {
            await databases.getCollection('default', 'retained_usage');
            retainedUsageExists = true;
            console.log("Collection 'retained_usage' already exists.");
        } catch (e) {
            console.log("Creating collection 'retained_usage'...");
            await databases.createCollection('default', 'retained_usage', 'Retained Usage');
        }

        console.log("Creating attributes...");
        // Define attributes
        const attributes = [
            () => databases.createStringAttribute('default', 'users', 'userId', 255, true),
            () => databases.createStringAttribute('default', 'users', 'email', 255, true),
            () => databases.createStringAttribute('default', 'users', 'name', 255, false),
            () => databases.createStringAttribute('default', 'users', 'googleAccessToken', 2048, false),
            () => databases.createStringAttribute('default', 'users', 'googleRefreshToken', 2048, false),
            () => databases.createStringAttribute('default', 'users', 'googleTokenExpiry', 255, false),
            () => databases.createStringAttribute('default', 'users', 'createdAt', 255, false),
            () => databases.createStringAttribute('default', 'users', 'subscriptionPlan', 255, false, 'free'),
            () => databases.createStringAttribute('default', 'users', 'stripeCustomerId', 255, false),
            () => databases.createStringAttribute('default', 'users', 'subscriptionStatus', 255, false),
            
            () => databases.createStringAttribute('default', 'retained_usage', 'email', 255, true),
            () => databases.createStringAttribute('default', 'retained_usage', 'deletedAt', 255, true)
        ];

        for (const createAttr of attributes) {
            try {
                await createAttr();
                console.log("Created attribute successfully.");
            } catch (err) {
                if (err.message.includes("already exists") || err.message.includes("processing")) {
                    console.log("Attribute exists or is processing...");
                } else {
                    console.error("Error creating attribute:", err.message);
                }
            }
        }
        console.log("Setup complete!");
    } catch (error) {
        console.error("Setup failed:", error);
    }
}

setup();
