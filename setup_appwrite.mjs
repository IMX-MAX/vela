import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://tor.cloud.appwrite.io/v1')
    .setProject('69bdb28e003c4db80f0a')
    .setKey('standard_8c341adee1b04da707b3b849591270f0a14b492618a0e169517e00a35a9fd73a89e7b1ec907138d34d93adaa2d7794c16860cdc39ca35995f199c6b3f917f96ba5a699f7b663c2bc94e7d4019d3361c568353394db026e209fac026d38c2ead87322181beead655e9b68d56664661f4d02142a63d685099df828cff2d6905aa7');

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

        console.log("Creating attributes...");
        // Define attributes
        const attributes = [
            () => databases.createStringAttribute('default', 'users', 'userId', 255, true),
            () => databases.createStringAttribute('default', 'users', 'email', 255, true),
            () => databases.createStringAttribute('default', 'users', 'name', 255, false),
            () => databases.createStringAttribute('default', 'users', 'googleAccessToken', 2048, false),
            () => databases.createStringAttribute('default', 'users', 'googleRefreshToken', 2048, false),
            () => databases.createStringAttribute('default', 'users', 'googleTokenExpiry', 255, false),
            () => databases.createStringAttribute('default', 'users', 'createdAt', 255, false)
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
