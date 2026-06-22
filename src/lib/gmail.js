export async function fetchEmails(accessToken, maxResults = 20) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=is:inbox`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!data.messages) return [];

  // Fetch details for each message
  const detailedMessages = await Promise.all(
    data.messages.map((msg) => fetchEmailDetails(accessToken, msg.id))
  );

  return detailedMessages;
}

export async function fetchEmailDetails(accessToken, messageId) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export async function sendEmail(accessToken, to, subject, body) {
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

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });
  return res.json();
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
