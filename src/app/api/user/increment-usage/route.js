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
    let lastReset = userDoc.lastUsageReset;

    if (shouldResetUsage(plan, lastReset)) {
      // If we need to reset, we just reset it to 1 since this is the first use in the new period
      userDoc = await databases.updateDocument('default', 'users', userId, {
        aiUsageCount: 1,
        lastUsageReset: new Date().toISOString()
      });
      return NextResponse.json({ success: true, db: userDoc });
    }

    // Use Appwrite's atomic increment
    userDoc = await databases.updateDocument('default', 'users', userId, {
      aiUsageCount: { increment: 1 }, 
      lastUsageReset: lastReset
    });

    const updatedUser = await databases.getDocument('default', 'users', userId);

    if (updatedUser.aiUsageCount > limit) {
      // Rollback (rare edge case)
      await databases.updateDocument('default', 'users', userId, {
        aiUsageCount: { decrement: 1 }
      });
      return NextResponse.json({ error: 'limit_reached' }, { status: 403 });
    }

    return NextResponse.json({ success: true, db: updatedUser });

  } catch (error) {
    console.error('Increment usage error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
