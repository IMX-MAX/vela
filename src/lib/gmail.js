"use server";

import { Composio } from "@composio/core";

async function makeGmailRequest(tokenOrConnectionId, url, options = {}) {
  if (tokenOrConnectionId.startsWith("ca_")) {
    const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
    
    // proxy expects parsed JSON object for body
    let parsedBody = undefined;
    if (options.body) {
      try {
        parsedBody = JSON.parse(options.body);
      } catch (e) {
        parsedBody = options.body;
      }
    }
    
    const response = await composio.client.tools.proxy({
      endpoint: url,
      method: options.method || "GET",
      connected_account_id: tokenOrConnectionId,
      body: parsedBody,
    });
    return response.data;
  } else {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${tokenOrConnectionId}`,
      },
    });
    return res.json();
  }
}

export async function fetchGoogleProfile(tokenOrConnectionId) {
  try {
    const data = await makeGmailRequest(tokenOrConnectionId, "https://www.googleapis.com/oauth2/v1/userinfo?alt=json");
    return data;
  } catch (error) {
    console.error("Failed to fetch google profile", error);
    return null;
  }
}

export async function fetchEmails(tokenOrConnectionId, maxResults = 20, label = "inbox", searchQuery = null, pageToken = null) {
  let query = label === "starred" ? "is:starred" 
              : label === "sent" ? "in:sent"
              : label === "drafts" ? "in:drafts"
              : label === "trash" ? "in:trash"
              : label === "spam" ? "in:spam"
              : "is:inbox";

  if (searchQuery) {
    query = searchQuery;
  }

  let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`;
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }
  
  const data = await makeGmailRequest(tokenOrConnectionId, url);
  if (data?.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }
  if (!data || !data.messages) return { messages: [], nextPageToken: null };

  // Fetch metadata-only details for each message to make inbox load lightning fast
  const detailedMessages = await Promise.all(
    data.messages.map((msg) =>
      makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`)
    )
  );

  return { messages: detailedMessages, nextPageToken: data.nextPageToken };
}

export async function fetchEmailDetails(tokenOrConnectionId, messageId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`);
}

// Fast metadata-only search for AI — uses format=metadata to skip body parsing
export async function searchEmailsQuick(tokenOrConnectionId, query, maxResults = 5) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`;
  const data = await makeGmailRequest(tokenOrConnectionId, url);
  if (!data || !data.messages) return [];

  const details = await Promise.all(
    data.messages.map((msg) =>
      makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`)
    )
  );
  return details;
}

export async function sendEmail(tokenOrConnectionId, to, subject, body, htmlBody = null) {
  let rawMessage = "";

  if (htmlBody) {
    const boundary = "boundary_" + Math.random().toString(36).substring(2);
    rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      "",
      body,
      "",
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      "",
      htmlBody,
      "",
      `--${boundary}--`
    ].join("\n");
  } else {
    rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/plain; charset=UTF-8`,
      "",
      body,
    ].join("\n");
  }

  const encodedMessage = Buffer.from(rawMessage, 'utf-8').toString('base64url');

  return await makeGmailRequest(tokenOrConnectionId, "https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });
}

export async function fetchThreadDetails(tokenOrConnectionId, threadId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`);
}

export async function trashEmail(tokenOrConnectionId, messageId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`, {
    method: "POST"
  });
}

export async function doneEmail(tokenOrConnectionId, messageId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ removeLabelIds: ["INBOX"] })
  });
}

export async function markEmailAsRead(tokenOrConnectionId, messageId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ removeLabelIds: ["UNREAD"] })
  });
}

export async function starEmail(tokenOrConnectionId, messageId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ addLabelIds: ["STARRED"] })
  });
}

export async function spamEmail(tokenOrConnectionId, messageId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ addLabelIds: ["SPAM"], removeLabelIds: ["INBOX"] })
  });
}
