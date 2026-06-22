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
