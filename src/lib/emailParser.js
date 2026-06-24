// Decodes Gmail's base64url-encoded part data. Hardened so a single malformed
// part never throws and breaks rendering of the whole message.
function decodeBase64Url(data) {
  if (!data || typeof data !== "string") return "";
  try {
    const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(normalized);
    try {
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      // Legacy fallback for environments without TextDecoder
      try {
        return decodeURIComponent(escape(binary));
      } catch {
        return binary;
      }
    }
  } catch (error) {
    console.error("Failed to decode email part:", error);
    return "";
  }
}

export function parseEmailContent(message) {
  if (!message || !message.payload) return { subject: "No Subject", from: "Unknown", body: "", htmlBody: "", date: "" };

  const headers = message.payload.headers || [];
  const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value || "No Subject";
  const from = headers.find((h) => h.name.toLowerCase() === "from")?.value || "Unknown";
  const date = headers.find((h) => h.name.toLowerCase() === "date")?.value || "";
  const messageId = headers.find((h) => h.name.toLowerCase() === "message-id")?.value || "";
  const references = headers.find((h) => h.name.toLowerCase() === "references")?.value || "";

  let body = "";
  let htmlBody = "";

  function extractParts(parts) {
    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body && part.body.data) {
        body = decodeBase64Url(part.body.data);
      } else if (part.mimeType === "text/html" && part.body && part.body.data) {
        htmlBody = decodeBase64Url(part.body.data);
      } else if (part.parts) {
        extractParts(part.parts);
      }
    }
  }

  if (message.payload.parts) {
    extractParts(message.payload.parts);
  } else if (message.payload.body && message.payload.body.data) {
    if (message.payload.mimeType === "text/html") {
      htmlBody = decodeBase64Url(message.payload.body.data);
    } else {
      body = decodeBase64Url(message.payload.body.data);
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

  return { subject, from, body, htmlBody, date, snippet: message.snippet, messageId, references, threadId: message.threadId };
}
