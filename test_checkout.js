require('dotenv').config({ path: '.env.local' });
const { Client, Account } = require('node-appwrite');

async function test() {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

    // Let's create an anonymous session or use API key to generate a JWT?
    // Wait, we can't create a JWT without a session.
    // Instead, let's just make a POST request to localhost:3000/api/stripe/checkout to see what the server responds with, if the user is running it locally?
    // But the user is on https://www.getvela.email (Vercel)!
    console.log("To test Vercel, we can't easily get a valid JWT without logging in.");
  } catch (err) {
    console.error(err);
  }
}
test();
