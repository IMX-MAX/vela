"use server";

import { Mistral } from "@mistralai/mistralai";

// We instantiate it lazily so it doesn't crash if the key is missing at build time
function getMistralClient() {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY is not set in environment variables");
  }
  return new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
}

export async function summarizeEmailAction(emailContent) {
  try {
    const mistral = getMistralClient();
    const response = await mistral.agents.complete({
      agentId: "ag_019ef18378507796bf7f3ed43d822ecf",
      messages: [
        {
          role: "user",
          content: `Summarize the following email in 3-5 concise bullet points:\n\n${emailContent}`,
        },
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Mistral Summarize Error:", error);
    return "Error generating summary. Please check your API key.";
  }
}

export async function draftReplyAction(emailContent, userPrompt) {
  try {
    const mistral = getMistralClient();
    const response = await mistral.agents.complete({
      agentId: "ag_019ef18378507796bf7f3ed43d822ecf",
      messages: [
        {
          role: "user",
          content: `Draft a reply to the following email. Use a professional tone. User prompt: "${userPrompt}".\n\nEmail:\n${emailContent}`,
        },
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Mistral Draft Error:", error);
    return "Error drafting reply. Please check your API key.";
  }
}

export async function chatWithAiAction(messages, tokenOrConnectionId) {
  try {
    const mistral = getMistralClient();
    
    // We provide Mistral the search tool
    const response = await mistral.agents.complete({
      agentId: "ag_019ef18378507796bf7f3ed43d822ecf",
      messages,
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
        }
      ],
      toolChoice: "auto"
    });

    const choice = response.choices[0].message;

    // Check if the agent wants to call a tool
    if (choice.toolCalls && choice.toolCalls.length > 0) {
      const toolCall = choice.toolCalls[0];
      if (toolCall.function.name === "search_inbox") {
        const args = typeof toolCall.function.arguments === 'string' ? JSON.parse(toolCall.function.arguments) : toolCall.function.arguments;
        
        // Dynamically import fetchEmails to avoid circular deps
        const { fetchEmails } = await import("@/lib/gmail");
        // Fetch up to 10 emails matching query
        const emails = await fetchEmails(tokenOrConnectionId, 10, "inbox", args.query);
        
        const { parseEmailContent } = await import("@/lib/emailParser");
        const parsedEmails = emails.map(m => {
          const p = parseEmailContent(m);
          return `ID: ${m.id}\nDate: ${p.date}\nFrom: ${p.from}\nSubject: ${p.subject}\nSnippet: ${p.snippet}`;
        }).join("\n\n---\n\n");

        const toolResult = parsedEmails || "No emails found.";

        // Recurse to get the final answer
        return await chatWithAiAction([
          ...messages,
          choice,
          {
            role: "tool",
            name: "search_inbox",
            content: toolResult,
            toolCallId: toolCall.id
          }
        ], tokenOrConnectionId);
      }
    }

    return choice.content;
  } catch (error) {
    console.error("Mistral Chat Error:", error);
    return "Error communicating with AI. Please try again.";
  }
}
