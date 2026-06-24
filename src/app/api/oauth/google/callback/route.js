import { NextResponse } from 'next/server';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    return new NextResponse(`
      <html><body><script>
        window.opener.postMessage({ type: 'OAUTH_ERROR', payload: 'No authorization code provided' }, window.location.origin);
        window.close();
      </script></body></html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return new NextResponse('Google OAuth credentials not configured', { status: 500 });
  }

  const redirectUri = `${request.nextUrl.origin}/api/oauth/google/callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + tokenData.expires_in);

    const payload = {
      tokens: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expiry_date: expiryDate.toISOString()
      },
      profile: {
        email: userData.email,
        name: userData.name,
        picture: userData.picture
      }
    };

    return new NextResponse(`
      <html><body>
        <div style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh;">
          <p>Authentication successful! Closing window...</p>
        </div>
        <script>
          window.opener.postMessage({ type: 'OAUTH_SUCCESS', payload: ${JSON.stringify(payload)} }, window.location.origin);
          window.close();
        </script>
      </body></html>
    `, { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new NextResponse(`
      <html><body><script>
        window.opener.postMessage({ type: 'OAUTH_ERROR', payload: '${error.message}' }, window.location.origin);
        window.close();
      </script></body></html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }
}
