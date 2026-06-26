import { NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { billingCycle } = await req.json();
    
    if (billingCycle !== 'monthly' && billingCycle !== 'annual') {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];

    // Authenticate user to get userId
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

    const annualLink = "https://buy.stripe.com/8x25kC59r7LKbQW10Xebu00";
    const monthlyLink = "https://buy.stripe.com/14A9ASeK12rqf388tpebu01";
    
    const baseUrl = billingCycle === 'annual' ? annualLink : monthlyLink;
    const checkoutUrl = `${baseUrl}?client_reference_id=${userId}&prefilled_email=${encodeURIComponent(currentUser.email)}`;

    return NextResponse.json({ url: checkoutUrl });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
