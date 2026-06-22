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

export async function fetchEmails(tokenOrConnectionId, maxResults = 20, label = "inbox") {
  const query = label === "starred" ? "is:starred" 
              : label === "sent" ? "in:sent"
              : label === "drafts" ? "in:drafts"
              : label === "trash" ? "in:trash"
              : label === "spam" ? "in:spam"
              : "is:inbox";

  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`;
  const data = await makeGmailRequest(tokenOrConnectionId, url);
  if (!data || !data.messages) return [];

  // Fetch details for each message
  const detailedMessages = await Promise.all(
    data.messages.map((msg) => fetchEmailDetails(tokenOrConnectionId, msg.id))
  );

  return detailedMessages;
}

export async function fetchEmailDetails(tokenOrConnectionId, messageId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`);
}

export async function sendEmail(tokenOrConnectionId, to, subject, body) {
  const rawMessage = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=UTF-8`,
    "",
    body,
  ].join("\n");

  const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return await makeGmailRequest(tokenOrConnectionId, "https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });
}

export function parseEmailContent(message) {
  if (!message || !message.payload) return { subject: "No Subject", from: "Unknown", body: "", date: "" };

  const headers = message.payload.headers || [];
  const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value || "No Subject";
  const from = headers.find((h) => h.name.toLowerCase() === "from")?.value || "Unknown";
  const date = headers.find((h) => h.name.toLowerCase() === "date")?.value || "";

  let body = "";
  if (message.payload.parts) {
    const textPart = message.payload.parts.find((p) => p.mimeType === "text/plain");
    if (textPart && textPart.body && textPart.body.data) {
      body = decodeURIComponent(escape(atob(textPart.body.data.replace(/-/g, "+").replace(/_/g, "/"))));
    } else {
      // Fallback for HTML or other multipart
      const htmlPart = message.payload.parts.find((p) => p.mimeType === "text/html");
      if (htmlPart && htmlPart.body && htmlPart.body.data) {
         body = decodeURIComponent(escape(atob(htmlPart.body.data.replace(/-/g, "+").replace(/_/g, "/"))));
         // Very basic strip HTML
         body = body.replace(/<[^>]+>/g, ' ');
      }
    }
  } else if (message.payload.body && message.payload.body.data) {
    body = decodeURIComponent(escape(atob(message.payload.body.data.replace(/-/g, "+").replace(/_/g, "/"))));
  } else if (message.snippet) {
    body = message.snippet;
  }

  return { subject, from, body, date, snippet: message.snippet };
}
