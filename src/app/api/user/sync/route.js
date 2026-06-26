import { NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];

    // Admin Client to read/write DB securely
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    // User Client to identify who is making the request
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
    let userDoc;

    try {
      userDoc = await databases.getDocument('default', 'users', userId);
    } catch (err) {
      // Document doesn't exist yet, create it
      userDoc = await databases.createDocument('default', 'users', userId, {
        userId: userId,
        email: currentUser.email,
        name: currentUser.name,
        createdAt: new Date().toISOString()
      });

      if (process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'Vela <onboarding@resend.dev>',
            to: currentUser.email,
            subject: 'Welcome to Vela! 🚀',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #194060;">Welcome to Vela, ${currentUser.name || 'there'}!</h1>
                <p style="color: #1e2a3b; font-size: 16px; line-height: 1.5;">We're thrilled to have you on board. Vela is the email client built for the modern age, specifically designed to make you faster and more organized.</p>
                
                <h3 style="color: #305a7d; margin-top: 30px;">Here are a few things to try:</h3>
                <ul style="color: #1e2a3b; font-size: 15px; line-height: 1.6;">
                  <li><strong>Command Palette:</strong> Hit <code>Cmd/Ctrl + K</code> anywhere to search your inbox and ask Vela Intelligence questions.</li>
                  <li><strong>AI Summaries:</strong> Get instant bullet-point summaries of long email threads to catch up quickly.</li>
                  <li><strong>Smart Drafting:</strong> Type <code>/</code> in the composer to have our specialized AI draft or modify your emails, preserving your natural tone.</li>
                  <li><strong>Split Inboxes:</strong> (Pro) Organize your inbox by custom rules to keep the noise out and focus on what matters.</li>
                </ul>
                
                <p style="color: #1e2a3b; font-size: 16px; margin-top: 30px;">Happy emailing!</p>
                <p style="color: #7f99b0; font-size: 14px;">- The Vela Team</p>
              </div>
            `
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
        }
      }
    }

    return NextResponse.json({ db: userDoc });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
