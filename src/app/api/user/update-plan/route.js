import { NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { plan } = await req.json();
    
    if (plan !== 'free' && plan !== 'pro') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const sessionCookie = (await cookies()).get('a_session_' + process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    const userClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setSession(sessionCookie.value);
    
    const userAccount = new (await import('node-appwrite')).Account(userClient);
    let currentUser;
    try {
      currentUser = await userAccount.get();
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = currentUser.$id;
    
    // TEMPORARY: This allows users to artificially upgrade to Pro for testing. 
    // This route should be deleted once the Stripe webhook is implemented.
    const userDoc = await databases.updateDocument('default', 'users', userId, {
      subscriptionPlan: plan,
      subscriptionStatus: plan === 'pro' ? 'active' : 'canceled'
    });

    return NextResponse.json({ success: true, db: userDoc });

  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
