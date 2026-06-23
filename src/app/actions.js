"use server";

import { Mistral } from "@mistralai/mistralai";

// We instantiate it lazily so it doesn't crash if the key is missing at build time
function getMistralClient() {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY is not set in environment variables");
  }
  return new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
}

export async function summarizeEmailAction(emailContent, userContext = "") {
  try {
    const mistral = getMistralClient();
    const systemPrompt = userContext ? `You are a helpful AI assistant. User Context: ${userContext}` : "";
    
    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({
      role: "user",
      content: `Summarize the following email in 3-5 concise bullet points:\n\n${emailContent}`,
    });

    const response = await mistral.agents.complete({
      agentId: "ag_019ef18378507796bf7f3ed43d822ecf",
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
    const systemPrompt = userContext ? `You are a helpful AI assistant. User Context: ${userContext}` : "";
    
    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({
      role: "user",
      content: `Draft a reply to the following email. Use a professional tone. User prompt: "${userPrompt}".\n\nEmail:\n${emailContent}`,
    });

    const response = await mistral.agents.complete({
      agentId: "ag_019ef18378507796bf7f3ed43d822ecf",
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
    const systemPrompt = `You are a helpful AI writing assistant.${userContext ? ` User Context: ${userContext}` : ""} Your task is to modify the given text according to the user's instructions. Return ONLY the modified text, without any conversational filler, markdown formatting blocks (like \`\`\`), or explanations.`;
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Instruction: ${instruction}\n\nText to modify:\n${selectedText}` }
    ];

    const response = await mistral.agents.complete({
      agentId: "ag_019ef18378507796bf7f3ed43d822ecf",
      messages,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Mistral Modify Error:", error);
    return selectedText; // Fallback to original text if error
  }
}

export async function chatWithAiAction(messages, tokenOrConnectionId, userContext = "") {
  try {
    const mistral = getMistralClient();
    
    // Inject system prompt if there is user context, but only if we haven't already
    let updatedMessages = [...messages];
    const systemContent = `You are Vela AI, a helpful email assistant. Be concise. When referencing specific emails from search results, always format them as markdown links like [Subject or description](/inbox/email/MESSAGE_ID) so the user can click to view them.${userContext ? ` User Context: ${userContext}` : ""}`;
    if (!updatedMessages.some(m => m.role === "system")) {
      updatedMessages = [{ role: "system", content: systemContent }, ...updatedMessages];
    }
    
    const response = await mistral.agents.complete({
      agentId: "ag_019ef18378507796bf7f3ed43d822ecf",
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
        const contacts = await fetchContacts(tokenOrConnectionId);
        
        const q = args.query.toLowerCase();
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
    const systemPrompt = `You are an AI profiling assistant. Your job is to analyze the user's email writing style.
You will be given the user's newly sent email, and their current writing style profile (if any).
Update the writing style profile to reflect any new insights (tone, formatting, signature, capitalization, greetings/sign-offs, length, directness).
Keep the final output concise (max 2-3 sentences), factual, and directly usable as a system prompt instruction for another AI to mimic the user.
Return ONLY the updated writing style description, without any conversational filler or markdown blocks.`;
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Current Style Profile: ${currentStyle || "None"}\n\nNewly Sent Email:\n${emailBody}` }
    ];

    const response = await mistral.agents.complete({
      agentId: "ag_019ef18378507796bf7f3ed43d822ecf",
      messages,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Mistral Style Analysis Error:", error);
    return currentStyle;
  }
}
