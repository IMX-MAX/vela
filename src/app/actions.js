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
    const response = await mistral.chat.complete({
      model: "mistral-medium",
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
    const response = await mistral.chat.complete({
      model: "mistral-medium",
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
