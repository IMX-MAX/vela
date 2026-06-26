"use server";

import { Mistral } from "@mistralai/mistralai";

// We instantiate it lazily so it doesn't crash if the key is missing at build time
function getMistralClient() {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY is not set in environment variables");
  }
  return new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
}

// Defensive caps so a malicious/oversized payload can't run up unbounded LLM costs.
const MAX_CONTENT_CHARS = 24000;
const MAX_CONTEXT_CHARS = 2000;
const MAX_PROMPT_CHARS = 4000;

function clamp(value, max) {
  if (typeof value !== "string") return "";
  return value.length > max ? value.slice(0, max) : value;
}

export async function summarizeEmailAction(emailContent, userContext = "") {
  try {
    const mistral = getMistralClient();
    emailContent = clamp(emailContent, MAX_CONTENT_CHARS);
    userContext = clamp(userContext, MAX_CONTEXT_CHARS);
    const systemPrompt = `You are Vela Intelligence, an advanced AI built directly into the Vela email client. You have been specifically trained to be exceptionally good at handling and understanding emails. Your purpose is to help the user manage their inbox efficiently by SUMMARIZING emails. Write the summary from the user's perspective (the person receiving the email). Do NOT refer to the recipient as 'Vela' or assume the email is addressed to Vela. Your goal is to extract the most important information, action items, and key takeaways. Accurately capture the specific ask or purpose of the email, not just the topic. Handle threads with multiple people correctly by tracking who said what and providing context of the entire thread. Do NOT hallucinate any details (ensure dates, names, and numbers are strictly accurate). Pay VERY CLOSE ATTENTION to dates: clearly distinguish between the date the email was sent and the dates of actual events mentioned in the email (e.g., do not say an event is happening on the email's sent date unless explicitly stated). Present the output as 3-5 concise bullet points. Be completely objective and output ONLY the summary.${userContext ? ` User Context: ${userContext}` : ""}`;
    
    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({
      role: "user",
      content: `Summarize the following email thread in 3-5 concise bullet points. Make sure to capture the specific ask, clarify who said what, and do not hallucinate any details (wrong dates, names, numbers). Output ONLY the summary.\n\n${emailContent}`,
    });

    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Mistral Summarize Error:", error);
    return "Error generating summary. Please check your API key.";
  }
}

export async function draftReplyAction(emailContent, userPrompt, userContext = "") {
  try {
    const mistral = getMistralClient();
    emailContent = clamp(emailContent, MAX_CONTENT_CHARS);
    userPrompt = clamp(userPrompt, MAX_PROMPT_CHARS);
    userContext = clamp(userContext, MAX_CONTEXT_CHARS);
    const systemPrompt = `You are Vela Intelligence, an advanced AI built directly into the Vela email client. You have been specifically trained to be exceptionally good at handling and writing emails. Your purpose is to help the user communicate effectively by DRAFTING EMAIL REPLIES.${userContext ? `\n\nCRITICAL: Pay close attention to the following User Context, including any styling instructions or professional details, and apply them strictly to your writing style:\nUser Context: ${userContext}\n` : ""} Your goal is to write a highly professional, extremely well-structured, and articulate response based on the user's instructions. Structure the reply logically based on the specific context and nuances of the email and the entire email thread. Address the points raised in the thread clearly and methodically. Match the user's intended tone naturally so it doesn't sound like a press release or generic AI. Get the context right from the ENTIRE email thread, not just the last message. IMPORTANT: Do NOT use any external tools (like a "draft email tool"). Simply output the exact text of the email reply directly in your response, with no conversational filler. CRITICAL: Do NOT include email headers like "Subject:", "To:", or "From:" in your response. Output ONLY the body of the email. You can and should use Markdown formatting (like bullet points, bold text, etc.) to structure your replies nicely.`;
    
    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({
      role: "user",
      content: `Draft a reply to the following email. Structure your reply carefully based on the context of the email and thread. Match the tone naturally and explicitly follow this user prompt: "${userPrompt}".\n\nEmail:\n${emailContent}`,
    });

    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Mistral Draft Error:", error);
    return "Error drafting reply. Please check your API key.";
  }
}

export async function modifyTextAction(selectedText, instruction, userContext = "") {
  try {
    const mistral = getMistralClient();
    selectedText = clamp(selectedText, MAX_CONTENT_CHARS);
    instruction = clamp(instruction, MAX_PROMPT_CHARS);
    userContext = clamp(userContext, MAX_CONTENT_CHARS);
    const systemPrompt = `You are Vela Intelligence, an advanced writing AI built directly into the Vela email client. You have been specifically trained to be exceptionally good at handling and writing emails.${userContext ? ` User Context: ${userContext}` : ""} Your task is to modify the given text according to the user's instructions to help them write exceptionally well-structured, clear, and professional emails. Ensure perfect grammar and logical flow. Return ONLY the modified text, without any conversational filler, markdown formatting blocks (like \`\`\`), or explanations.`;
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Instruction: ${instruction}\n\nText to modify:\n${selectedText}` }
    ];

    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Mistral Modify Error:", error);
    return selectedText; // Fallback to original text if error
  }
}

export async function chatStepAction(messages, tokenOrConnectionId, userContext = "") {
  try {
    const mistral = getMistralClient();
    userContext = clamp(userContext, MAX_CONTEXT_CHARS);

    if (Array.isArray(messages)) {
      messages = messages.map((m) =>
        typeof m?.content === "string" ? { ...m, content: clamp(m.content, MAX_CONTENT_CHARS) } : m
      );
    }

    let updatedMessages = [...messages];
    const systemContent = `You are Vela AI, an advanced email assistant powering the Command Palette. Your goal is to help the user manage their inbox efficiently. You have access to tools to search the user's inbox, search their contacts, and draft new emails. When referencing emails from search results, always use markdown links like [Subject](/inbox/email/MESSAGE_ID). Be concise, helpful, and proactive.${userContext ? ` User Context: ${userContext}` : ""}`;
    if (!updatedMessages.some(m => m.role === "system")) {
      updatedMessages = [{ role: "system", content: systemContent }, ...updatedMessages];
    }
    
    const response = await mistral.chat.complete({
      model: "mistral-medium-latest",
      messages: updatedMessages,
      tools: [
        {
          type: "function",
          function: {
            name: "search_inbox",
            description: "Search the user's inbox for emails matching a query string.",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "The search query." }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "search_contacts",
            description: "Search the user's Google Contacts for names, emails, or phone numbers.",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "The name or email to search for." }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "draft_email",
            description: "Draft an email for the user to review. Call this when the user asks you to send an email or draft a reply.",
            parameters: {
              type: "object",
              properties: {
                to: { type: "string", description: "The recipient's email address." },
                subject: { type: "string", description: "The subject of the email." },
                body: { type: "string", description: "The body of the email in plain text." }
              },
              required: ["to", "subject", "body"]
            }
          }
        }
      ],
      toolChoice: "auto"
    });

    const choice = response.choices[0].message;

    if (choice.toolCalls && choice.toolCalls.length > 0) {
      const toolCall = choice.toolCalls[0];
      const args = typeof toolCall.function.arguments === 'string' ? JSON.parse(toolCall.function.arguments) : toolCall.function.arguments;

      if (toolCall.function.name === "search_inbox") {
        const { searchEmailsQuick } = await import("@/lib/gmail");
        const emails = await searchEmailsQuick(tokenOrConnectionId, args.query, 8);
        const parsedEmails = emails.map(m => {
          const headers = m.payload?.headers || [];
          const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";
          return `Message ID: ${m.id}\nDate: ${getHeader("Date")}\nFrom: ${getHeader("From")}\nSubject: ${getHeader("Subject")}\nSnippet: ${m.snippet || ""}`;
        }).join("\n\n---\n\n");
        const toolResult = parsedEmails || "No emails found.";
        return { type: 'tool', name: toolCall.function.name, args, result: toolResult, message: choice, toolCallId: toolCall.id, thought: choice.content };
      } else if (toolCall.function.name === "search_contacts") {
        const { fetchContacts } = await import("@/lib/contacts");
        const { contacts } = await fetchContacts(tokenOrConnectionId);
        const q = (args.query || "").toLowerCase();
        const matched = contacts.filter(c => {
          const name = c.names?.[0]?.givenName?.toLowerCase() || "";
          const email = c.emailAddresses?.[0]?.value?.toLowerCase() || "";
          return name.includes(q) || email.includes(q);
        });
        const parsedContacts = matched.map(c => `Name: ${c.names?.[0]?.givenName || "Unknown"}\nEmail: ${c.emailAddresses?.[0]?.value || "None"}\nPhone: ${c.phoneNumbers?.[0]?.value || "None"}`).join("\n\n---\n\n");
        const toolResult = parsedContacts || "No contacts found matching the query.";
        return { type: 'tool', name: toolCall.function.name, args, result: toolResult, message: choice, toolCallId: toolCall.id, thought: choice.content };
      } else if (toolCall.function.name === "draft_email") {
        const result = `I've prepared a draft for you to review:\n\n\`\`\`draft-email\n${JSON.stringify({ to: args.to, subject: args.subject, body: args.body }, null, 2)}\n\`\`\``;
        return { type: 'text', content: result, message: choice };
      }
    }

    return { type: 'text', content: choice.content, message: choice };
  } catch (error) {
    console.error("Mistral Chat Step Error:", error);
    return { type: 'error', content: "Error communicating with AI. Please try again." };
  }
}


export async function chatWithAiAction(messages, tokenOrConnectionId, userContext = "") {
  try {
    const mistral = getMistralClient();
    userContext = clamp(userContext, MAX_CONTEXT_CHARS);

    // Cap individual user/assistant message lengths to bound LLM cost.
    if (Array.isArray(messages)) {
      messages = messages.map((m) =>
        typeof m?.content === "string" ? { ...m, content: clamp(m.content, MAX_CONTENT_CHARS) } : m
      );
    }

    // Inject system prompt if there is user context, but only if we haven't already
    let updatedMessages = [...messages];
    const systemContent = `You are Vela AI, an advanced email assistant powering the Command Palette. Your goal is to help the user manage their inbox efficiently. You have access to tools to search the user's inbox, search their contacts, and draft new emails. When referencing emails from search results, always use markdown links like [Subject](/inbox/email/MESSAGE_ID). Be concise, helpful, and proactive.${userContext ? ` User Context: ${userContext}` : ""}`;
    if (!updatedMessages.some(m => m.role === "system")) {
      updatedMessages = [{ role: "system", content: systemContent }, ...updatedMessages];
    }
    
    const response = await mistral.chat.complete({
      model: "mistral-medium-latest",
      messages: updatedMessages,
      tools: [
        {
          type: "function",
          function: {
            name: "search_inbox",
            description: "Search the user's inbox for emails matching a query string.",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query (e.g., 'John project', 'is:unread', 'from:alice@example.com', or just keywords)."
                }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "search_contacts",
            description: "Search the user's Google Contacts for names, emails, or phone numbers.",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The name or email to search for."
                }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "draft_email",
            description: "Draft an email for the user to review. Call this when the user asks you to send an email or draft a reply.",
            parameters: {
              type: "object",
              properties: {
                to: { type: "string", description: "The recipient's email address." },
                subject: { type: "string", description: "The subject of the email." },
                body: { type: "string", description: "The body of the email in plain text." }
              },
              required: ["to", "subject", "body"]
            }
          }
        }
      ],
      toolChoice: "auto"
    });

    const choice = response.choices[0].message;

    if (choice.toolCalls && choice.toolCalls.length > 0) {
      const toolCall = choice.toolCalls[0];
      const args = typeof toolCall.function.arguments === 'string' ? JSON.parse(toolCall.function.arguments) : toolCall.function.arguments;

      if (toolCall.function.name === "search_inbox") {
        const { searchEmailsQuick } = await import("@/lib/gmail");
        const emails = await searchEmailsQuick(tokenOrConnectionId, args.query, 8);
        
        const parsedEmails = emails.map(m => {
          const headers = m.payload?.headers || [];
          const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";
          return `Message ID: ${m.id}\nDate: ${getHeader("Date")}\nFrom: ${getHeader("From")}\nSubject: ${getHeader("Subject")}\nSnippet: ${m.snippet || ""}`;
        }).join("\n\n---\n\n");

        const toolResult = parsedEmails || "No emails found.";

        return await chatWithAiAction([
          ...updatedMessages,
          choice,
          {
            role: "tool",
            name: "search_inbox",
            content: toolResult,
            toolCallId: toolCall.id
          }
        ], tokenOrConnectionId, userContext);
      } else if (toolCall.function.name === "search_contacts") {
        const { fetchContacts } = await import("@/lib/contacts");
        const { contacts } = await fetchContacts(tokenOrConnectionId);
        
        const q = (args.query || "").toLowerCase();
        const matched = contacts.filter(c => {
          const name = c.names?.[0]?.givenName?.toLowerCase() || "";
          const email = c.emailAddresses?.[0]?.value?.toLowerCase() || "";
          return name.includes(q) || email.includes(q);
        });

        const parsedContacts = matched.map(c => {
          return `Name: ${c.names?.[0]?.givenName || "Unknown"}\nEmail: ${c.emailAddresses?.[0]?.value || "None"}\nPhone: ${c.phoneNumbers?.[0]?.value || "None"}`;
        }).join("\n\n---\n\n");

        const toolResult = parsedContacts || "No contacts found matching the query.";

        return await chatWithAiAction([
          ...updatedMessages,
          choice,
          {
            role: "tool",
            name: "search_contacts",
            content: toolResult,
            toolCallId: toolCall.id
          }
        ], tokenOrConnectionId, userContext);
      } else if (toolCall.function.name === "draft_email") {
        return `I've prepared a draft for you to review:\n\n\`\`\`draft-email\n${JSON.stringify({ to: args.to, subject: args.subject, body: args.body }, null, 2)}\n\`\`\``;
      }
    }

    return choice.content;
  } catch (error) {
    console.error("Mistral Chat Error:", error);
    return "Error communicating with AI. Please try again.";
  }
}

export async function analyzeWritingStyleAction(emailBody, currentStyle = "") {
  try {
    const mistral = getMistralClient();
    emailBody = clamp(emailBody, MAX_CONTENT_CHARS);
    currentStyle = clamp(currentStyle, MAX_CONTEXT_CHARS);
    const systemPrompt = `You are Vela Intelligence, an advanced profiling AI built into the Vela email client. You have been specifically trained to be exceptionally good at understanding and analyzing emails. Your job is to analyze the user's email writing style.
You will be given the user's newly sent email, and their current writing style profile (if any).
Update the writing style profile to reflect any new insights (tone, formatting, signature, capitalization, greetings/sign-offs, length, directness).
Keep the final output concise (max 2-3 sentences), factual, and directly usable as a system prompt instruction for another AI to mimic the user.
Return ONLY the updated writing style description, without any conversational filler or markdown blocks.`;
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Current Style Profile: ${currentStyle || "None"}\n\nNewly Sent Email:\n${emailBody}` }
    ];

    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Mistral Style Analysis Error:", error);
    return currentStyle;
  }
}
