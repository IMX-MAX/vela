"use server";

import { Composio } from "composio-core";

function getComposioClient() {
  if (!process.env.COMPOSIO_API_KEY) {
    throw new Error("COMPOSIO_API_KEY is missing in .env.local");
  }
  return new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
}

export async function initiateComposioConnection(userId) {
  try {
    const composio = getComposioClient();
    const entity = await composio.getEntity(userId);
    
    // Check if connection already exists
    const connections = await entity.getConnections();
    const gmailConnection = connections.find(c => c.appName === "GMAIL");
    
    if (gmailConnection) {
      return { connected: true };
    }

    const connection = await entity.initiateConnection({
      appName: "GMAIL",
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/inbox`
    });

    return { connected: false, url: connection.redirectUrl };
  } catch (error) {
    console.error("Composio Initiation Error:", error);
    return { error: error.message };
  }
}

export async function checkComposioStatus(userId) {
  try {
    const composio = getComposioClient();
    const entity = await composio.getEntity(userId);
    const connections = await entity.getConnections();
    const gmailConnection = connections.find(c => c.appName === "GMAIL");
    
    return { connected: !!gmailConnection };
  } catch (error) {
    return { connected: false };
  }
}

export async function executeComposioAction(userId, actionName, params = {}) {
  try {
    const composio = getComposioClient();
    const entity = await composio.getEntity(userId);
    
    const result = await entity.executeAction(actionName, params);
    return result;
  } catch (error) {
    console.error(`Composio Action Error (${actionName}):`, error);
    throw error;
  }
}

export async function getComposioAccessToken(userId) {
  try {
    const composio = getComposioClient();
    const entity = await composio.getEntity(userId);
    const connection = await entity.getConnection("GMAIL");
    
    // Composio might expose the raw tokens or client directly depending on SDK version.
    // Usually, you can extract the token or make authenticated requests. 
    // If not, we will fallback to using the Composio Action Execution.
    // For now, we will return the connection details.
    return { accessToken: connection.access_token || null, connectionId: connection.id };
  } catch (error) {
    console.error("Error fetching Composio connection:", error);
    return { accessToken: null, error: error.message };
  }
}
