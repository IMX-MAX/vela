"use server";



async function makeGmailRequest(tokenOrConnectionId, url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${tokenOrConnectionId}`,
    },
  });
  return res.json();
}

export async function fetchGoogleProfile(tokenOrConnectionId) {
  try {
    const data = await makeGmailRequest(tokenOrConnectionId, `https://www.googleapis.com/oauth2/v3/userinfo?_=${Date.now()}`);
    return data;
  } catch (error) {
    console.error("Failed to fetch google profile", error);
    return null;
  }
}

export async function fetchEmails(tokens, maxResults = 20, label = "inbox", searchQuery = null, pageTokens = null) {
  const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
  const pageTokenArray = Array.isArray(pageTokens) ? pageTokens : [pageTokens];

  let query = label === "starred" ? "is:starred" 
              : label === "sent" ? "in:sent"
              : label === "drafts" ? "in:drafts"
              : label === "trash" ? "in:trash"
              : label === "spam" ? "in:spam"
              : label === "done" ? "-in:inbox -in:trash -in:spam -in:drafts -in:sent"
              : "is:inbox";

  if (searchQuery) {
    query = searchQuery;
  }

  const fetchPromises = tokenArray.map(async (token, idx) => {
    if (!token) return { messages: [], nextPageToken: null };
    
    // Distribute maxResults evenly among tokens
    const fetchCount = Math.max(1, Math.ceil(maxResults / tokenArray.length));
    let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${fetchCount}&q=${encodeURIComponent(query)}`;
    
    const pt = pageTokenArray[idx];
    if (pt) {
      url += `&pageToken=${pt}`;
    }
    
    try {
      const data = await makeGmailRequest(token, url);
      if (data?.error) {
        console.error("fetchEmails error for token idx", idx, data.error);
        if (idx === 0) throw new Error(data.error.message || JSON.stringify(data.error));
        return { messages: [], nextPageToken: null };
      }
      if (!data || !data.messages) return { messages: [], nextPageToken: null };

      // Group by threadId
      const seenThreads = new Set();
      const uniqueMessages = [];
      for (const msg of data.messages) {
        if (!seenThreads.has(msg.threadId)) {
          seenThreads.add(msg.threadId);
          uniqueMessages.push(msg);
        }
      }

      const detailedMessages = await Promise.all(
        uniqueMessages.map(async (msg) => {
          const detail = await makeGmailRequest(token, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`);
          detail._accountIndex = idx;
          return detail;
        })
      );

      return { messages: detailedMessages, nextPageToken: data.nextPageToken };
    } catch (err) {
      console.error("fetchEmails fetch error for token idx", idx, err);
      return { messages: [], nextPageToken: null };
    }
  });

  const results = await Promise.all(fetchPromises);
  
  let combinedMessages = [];
  let nextTokens = [];
  
  for (let i = 0; i < results.length; i++) {
    combinedMessages = combinedMessages.concat(results[i].messages);
    nextTokens.push(results[i].nextPageToken || null);
  }

  combinedMessages.sort((a, b) => parseInt(b.internalDate || 0) - parseInt(a.internalDate || 0));

  const seenThreadsGlobally = new Set();
  const finalMessages = [];
  for (const msg of combinedMessages) {
    if (!seenThreadsGlobally.has(msg.threadId)) {
      seenThreadsGlobally.add(msg.threadId);
      finalMessages.push(msg);
    }
  }

  return { 
    messages: finalMessages.slice(0, maxResults), 
    nextPageToken: nextTokens.some(t => t) ? nextTokens : null 
  };
}

export async function fetchEmailDetails(tokenOrConnectionId, messageId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`);
}

// Fast metadata-only search for AI — uses format=metadata to skip body parsing
export async function searchEmailsQuick(tokens, query, maxResults = 5) {
  const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
  
  const fetchPromises = tokenArray.map(async (token, idx) => {
    if (!token) return [];
    
    const fetchCount = Math.max(1, Math.ceil(maxResults / tokenArray.length));
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${fetchCount}&q=${encodeURIComponent(query)}`;
    try {
      const data = await makeGmailRequest(token, url);
      if (!data || !data.messages) return [];

      const details = await Promise.all(
        data.messages.map(async (msg) => {
          const detail = await makeGmailRequest(token, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`);
          detail._accountIndex = idx;
          return detail;
        })
      );
      return details;
    } catch (e) {
      console.error("searchEmailsQuick error for token idx", idx, e);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);
  
  let combinedDetails = [];
  for (const res of results) {
    combinedDetails = combinedDetails.concat(res);
  }

  combinedDetails.sort((a, b) => parseInt(b.internalDate || 0) - parseInt(a.internalDate || 0));

  return combinedDetails.slice(0, maxResults);
}

function buildMimeMessage(to, subject, body, htmlBody, attachments, replyToMessageId, references) {
  const boundaryMixed = "mixed_" + Math.random().toString(36).substring(2);
  const boundaryAlt = "alt_" + Math.random().toString(36).substring(2);

  const htmlContent = htmlBody 
    ? `<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 14px; color: #222;">${htmlBody}</div>`
    : `<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 14px; color: #222;">${body.replace(/\n/g, '<br>')}</div>`;

  let parts = [];
  if (to) parts.push(`To: ${to}`);
  if (subject) parts.push(`Subject: ${subject}`);
  if (replyToMessageId) {
    parts.push(`In-Reply-To: ${replyToMessageId}`);
    parts.push(`References: ${references ? references + ' ' + replyToMessageId : replyToMessageId}`);
  }
  parts.push(`MIME-Version: 1.0`);
  
  if (attachments && attachments.length > 0) {
    parts.push(`Content-Type: multipart/mixed; boundary="${boundaryMixed}"`);
    parts.push(``);
    parts.push(`--${boundaryMixed}`);
  }
  
  parts.push(`Content-Type: multipart/alternative; boundary="${boundaryAlt}"`);
  parts.push(``);
  parts.push(`--${boundaryAlt}`);
  parts.push(`Content-Type: text/plain; charset="UTF-8"`);
  parts.push(``);
  parts.push(body);
  parts.push(`--${boundaryAlt}`);
  parts.push(`Content-Type: text/html; charset="UTF-8"`);
  parts.push(``);
  parts.push(htmlContent);
  parts.push(`--${boundaryAlt}--`);

  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      parts.push(`--${boundaryMixed}`);
      parts.push(`Content-Type: ${att.mimeType}; name="${att.filename}"`);
      parts.push(`Content-Disposition: attachment; filename="${att.filename}"`);
      parts.push(`Content-Transfer-Encoding: base64`);
      parts.push(``);
      // Chunk base64 string
      const b64 = att.content.split(',').pop(); // remove data URL prefix if present
      const chunked = b64.match(/.{1,76}/g).join('\r\n');
      parts.push(chunked);
    }
    parts.push(`--${boundaryMixed}--`);
  }

  const rawMessage = parts.join('\r\n');
  return Buffer.from(rawMessage, 'utf-8').toString('base64url');
}

export async function sendEmail(tokenOrConnectionId, to, subject, body, htmlBody = null, attachments = [], threadId = null, replyToMessageId = null, references = null) {
  const encodedMessage = buildMimeMessage(to, subject, body, htmlBody, attachments, replyToMessageId, references);
  const payload = { raw: encodedMessage };
  if (threadId) {
    payload.threadId = threadId;
  }

  return await makeGmailRequest(tokenOrConnectionId, "https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function saveDraft(tokenOrConnectionId, draftId, to, subject, body, htmlBody = null, attachments = [], threadId = null, replyToMessageId = null, references = null) {
  const encodedMessage = buildMimeMessage(to, subject, body, htmlBody, attachments, replyToMessageId, references);
  const payload = { message: { raw: encodedMessage } };
  if (threadId) {
    payload.message.threadId = threadId;
  }

  const url = draftId 
    ? `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${draftId}`
    : `https://gmail.googleapis.com/gmail/v1/users/me/drafts`;
    
  return await makeGmailRequest(tokenOrConnectionId, url, {
    method: draftId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteDraft(tokenOrConnectionId, draftId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${draftId}`, {
    method: "DELETE"
  });
}

export async function getDraftIdByMessageId(tokenOrConnectionId, messageId) {
  const data = await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/drafts`);
  if (!data || !data.drafts) return null;
  const draft = data.drafts.find(d => d.message && d.message.id === messageId);
  return draft ? draft.id : null;
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

export async function unsnoozeEmail(tokenOrConnectionId, messageId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ addLabelIds: ["INBOX", "UNREAD"] })
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

export async function markEmailAsUnread(tokenOrConnectionId, messageId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ addLabelIds: ["UNREAD"] })
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

export async function unstarEmail(tokenOrConnectionId, messageId) {
  return await makeGmailRequest(tokenOrConnectionId, `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ removeLabelIds: ["STARRED"] })
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
