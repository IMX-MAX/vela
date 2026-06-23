export function parseEmailContent(message) {
  if (!message || !message.payload) return { subject: "No Subject", from: "Unknown", body: "", htmlBody: "", date: "" };

  const headers = message.payload.headers || [];
  const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value || "No Subject";
  const from = headers.find((h) => h.name.toLowerCase() === "from")?.value || "Unknown";
  const date = headers.find((h) => h.name.toLowerCase() === "date")?.value || "";

  let body = "";
  let htmlBody = "";

  function extractParts(parts) {
    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body && part.body.data) {
        body = decodeURIComponent(escape(atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"))));
      } else if (part.mimeType === "text/html" && part.body && part.body.data) {
        htmlBody = decodeURIComponent(escape(atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"))));
      } else if (part.parts) {
        extractParts(part.parts);
      }
    }
  }

  if (message.payload.parts) {
    extractParts(message.payload.parts);
  } else if (message.payload.body && message.payload.body.data) {
    if (message.payload.mimeType === "text/html") {
      htmlBody = decodeURIComponent(escape(atob(message.payload.body.data.replace(/-/g, "+").replace(/_/g, "/"))));
    } else {
      body = decodeURIComponent(escape(atob(message.payload.body.data.replace(/-/g, "+").replace(/_/g, "/"))));
    }
  }

  if (!body && htmlBody) {
    // Basic fallback if only HTML exists
    body = htmlBody.replace(/<[^>]+>/g, " ");
  }
  if (!htmlBody && body) {
    // If only text exists, wrap it in pre to keep formatting in HTML views
    htmlBody = `<div style="white-space: pre-wrap; font-family: sans-serif;">${body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;
  }
  if (!body && !htmlBody && message.snippet) {
    body = message.snippet;
    htmlBody = message.snippet;
  }

  return { subject, from, body, htmlBody, date, snippet: message.snippet };
}
