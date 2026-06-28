import { NextResponse } from 'next/server';
import { Client, Databases, Query, ID } from 'node-appwrite';
import { Mistral } from '@mistralai/mistralai';

// Copied from usage.js
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

function shouldResetUsage(plan, lastResetIso) {
  if (!lastResetIso) return true;
  
  const lastResetDate = new Date(lastResetIso);
  const currentNYC = getNYCDateObj();
  const lastNYC = getNYCDateObj(lastResetDate);

  if (plan === "pro") {
    return currentNYC.year !== lastNYC.year || currentNYC.month !== lastNYC.month || currentNYC.day !== lastNYC.day;
  } else {
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
    const { emailsContent } = await req.json();

    if (!emailsContent) {
      return NextResponse.json({ error: 'Missing emailsContent' }, { status: 400 });
    }

    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://api.nafen.sbs/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    const userClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://api.nafen.sbs/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setJWT(jwt);
    
    const userAccount = new (await import('node-appwrite')).Account(userClient);
    let currentUser;
    try {
      currentUser = await userAccount.get();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JWT' }, { status: 401 });
    }

    const userId = currentUser.$id;
    let userDb;
    try {
      userDb = await databases.getDocument('default', 'users', userId);
    } catch (e) {
      return NextResponse.json({ error: 'User DB not found' }, { status: 404 });
    }

    const plan = userDb.subscriptionPlan === "pro" ? "pro" : "free";
    if (plan !== "pro") {
      return NextResponse.json({ error: 'Daily digest is a Pro feature.' }, { status: 403 });
    }

    const currentNYC = getNYCDateObj();
    const dateStr = `${currentNYC.year}-${String(currentNYC.month).padStart(2, '0')}-${String(currentNYC.day).padStart(2, '0')}`;

    let existingDocs = [];
    try {
      const existing = await databases.listDocuments('default', 'daily_digests', [
        Query.equal('userId', userId)
      ]);
      existingDocs = existing.documents;
      
      if (existingDocs.length > 0 && existingDocs[0].date === dateStr) {
        // Already generated today (e.g. from another device). Return it!
        return NextResponse.json({ success: true, digestDoc: existingDocs[0] });
      }
    } catch(e) {}

    const limit = 100;
    let current = userDb.aiUsageCount || 0;
    let lastReset = userDb.lastUsageReset;

    if (shouldResetUsage(plan, lastReset)) {
      current = 0;
      lastReset = new Date().toISOString();
    }

    if (current >= limit) {
      return NextResponse.json({ error: 'AI limit reached' }, { status: 402 });
    }

    // Increment Usage Immediately
    await databases.updateDocument('default', 'users', userId, {
      aiUsageCount: current + 1,
      lastUsageReset: lastReset
    });

    // Generate Digest via Mistral
    const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    const systemPrompt = `You are Vela Intelligence. Your job is to create a beautifully formatted Daily Digest for the user's inbox based on the emails provided. 
Categorize the emails into clear sections (e.g., "Urgent & High Priority", "Updates & Newsletters", "General").
Extract the most important points and action items. 
Use markdown extensively for a premium UI feel (bolding, bullet points, horizontal rules). 
If an email is mentioned, format it as a markdown link using its message ID like this: [Subject](/inbox/email/MESSAGE_ID). 
Keep it concise and highly readable.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Please create my daily digest for the following emails:\n\n${emailsContent.slice(0, 24000)}` }
    ];

    const response = await mistral.chat.complete({
      model: "mistral-medium-latest",
      messages,
    });

    const digestMarkdown = response.choices[0].message.content;
    const initialChatData = JSON.stringify([{ role: 'assistant', content: digestMarkdown }]);
    
    // Update or Create the single row in daily_digests
    let digestDoc;
    try {
      const existing = await databases.listDocuments('default', 'daily_digests', [
        Query.equal('userId', userId)
      ]);
      if (existing.total > 0) {
        digestDoc = await databases.updateDocument('default', 'daily_digests', existing.documents[0].$id, {
          date: dateStr,
          chatData: initialChatData
        });
      } else {
        digestDoc = await databases.createDocument('default', 'daily_digests', ID.unique(), {
          userId,
          date: dateStr,
          chatData: initialChatData
        });
      }
    } catch(e) {
      console.error("DB Error saving digest", e);
      return NextResponse.json({ error: 'Failed to save digest to db' }, { status: 500 });
    }

    return NextResponse.json({ success: true, digestDoc });
  } catch (error) {
    console.error('Digest Gen Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
