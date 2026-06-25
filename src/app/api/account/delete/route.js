import { NextResponse } from 'next/server';
import { Client, Databases, Users } from 'node-appwrite';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];

    // Initialize Appwrite Server Client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const usersClient = new Users(client);

    const userClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setJWT(jwt);
    
    const userAccount = new (await import('node-appwrite')).Account(userClient);
    let currentUser;
    try {
      currentUser = await userAccount.get();
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = currentUser.$id;
    const email = currentUser.email;

    // Check if the user has an active subscription in the DB
    try {
      const userDoc = await databases.getDocument('default', 'users', userId);
      if (userDoc.subscriptionPlan === 'pro' || userDoc.subscriptionStatus === 'active') {
         return NextResponse.json({ error: 'Please cancel your active subscription before deleting your account.' }, { status: 400 });
      }
    } catch (err) {
      // User document might not exist, which is fine to proceed with deletion
    }

    // Log the retained usage
    try {
      await databases.createDocument('default', 'retained_usage', 'unique()', {
        email: email,
        deletedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to log retained usage:", err);
    }

    // Delete user document
    try {
      await databases.deleteDocument('default', 'users', userId);
    } catch (err) {
      console.error("Failed to delete user document:", err);
    }

    // Delete user from Appwrite Auth
    try {
      await usersClient.delete(userId);
    } catch (err) {
      console.error("Failed to delete Auth account:", err);
      return NextResponse.json({ error: 'Failed to completely delete account' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
