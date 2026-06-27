import { NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import { cookies } from 'next/headers';

/**
 * Returns the current NYC date as an object with year, month, and day.
 */
function getNYCDateObj(date = new Date()) {
  const nyString = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(date);
  const [month, day, year] = nyString.split('/');
  return { year: parseInt(year), month: parseInt(month), day: parseInt(day) };
}

/**
 * Determines if the usage should be reset based on the plan and last reset date.
 */
function shouldResetUsage(plan, lastResetIso) {
  if (!lastResetIso) return true;
  
  const lastResetDate = new Date(lastResetIso);
  const currentNYC = getNYCDateObj();
  const lastNYC = getNYCDateObj(lastResetDate);

  if (plan === "pro") {
    // Pro: resets daily at 12am NYC time
    return currentNYC.year !== lastNYC.year || currentNYC.month !== lastNYC.month || currentNYC.day !== lastNYC.day;
  } else {
    // Free: resets on the 1st of each month NYC time
    return currentNYC.year !== lastNYC.year || currentNYC.month !== lastNYC.month;
  }
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];

    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

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
    let userDoc = await databases.getDocument('default', 'users', userId);

    const plan = userDoc.subscriptionPlan === 'pro' ? 'pro' : 'free';
    const limit = plan === 'pro' ? 100 : 27;
    let current = userDoc.aiUsageCount || 0;
    let lastReset = userDoc.lastUsageReset;

    if (shouldResetUsage(plan, lastReset)) {
      current = 0;
      lastReset = new Date().toISOString();
    }

    if (current >= limit) {
      return NextResponse.json({ error: 'limit_reached' }, { status: 403 });
    }

    // Standard read-modify-write since { increment: 1 } caused 500 error on Appwrite
    userDoc = await databases.updateDocument('default', 'users', userId, {
      aiUsageCount: current + 1, 
      lastUsageReset: lastReset
    });

    return NextResponse.json({ success: true, db: userDoc });

  } catch (error) {
    console.error('Increment usage error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
