"use server";

import { Composio } from "@composio/core";

// We reuse the proxy approach from gmail.js for contacts to be consistent
async function makePeopleRequest(tokenOrConnectionId, url, options = {}) {
  if (tokenOrConnectionId.startsWith("ca_")) {
    const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
    
    let parsedBody = undefined;
    if (options.body) {
      try {
        parsedBody = JSON.parse(options.body);
      } catch (e) {
        parsedBody = options.body;
      }
    }
    
    const response = await composio.client.tools.proxy({
      endpoint: url,
      method: options.method || "GET",
      connected_account_id: tokenOrConnectionId,
      body: parsedBody,
    });
    return response.data;
  } else {
    const res = await fetch(url, {
      ...options,
      cache: "no-store",
      headers: {
        ...options.headers,
        Authorization: `Bearer ${tokenOrConnectionId}`,
      },
    });
    return res.json();
  }
}

export async function fetchContacts(tokenOrConnectionId) {
  try {
    const data = await makePeopleRequest(
      tokenOrConnectionId,
      "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers"
    );
    if (data?.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }
    return data.connections || [];
  } catch (error) {
    console.error("Failed to fetch contacts", error);
    return [];
  }
}

export async function createContact(tokenOrConnectionId, contactData) {
  const body = {
    names: contactData.name ? [{ givenName: contactData.name }] : [],
    emailAddresses: contactData.email ? [{ value: contactData.email }] : [],
    phoneNumbers: contactData.phone ? [{ value: contactData.phone }] : []
  };

  try {
    const data = await makePeopleRequest(
      tokenOrConnectionId,
      "https://people.googleapis.com/v1/people:createContact?personFields=names,emailAddresses,phoneNumbers",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );
    return data;
  } catch (error) {
    console.error("Failed to create contact", error);
    return null;
  }
}

export async function updateContact(tokenOrConnectionId, resourceName, contactData) {
  const body = {
    etag: contactData.etag,
    names: contactData.name ? [{ givenName: contactData.name }] : [],
    emailAddresses: contactData.email ? [{ value: contactData.email }] : [],
    phoneNumbers: contactData.phone ? [{ value: contactData.phone }] : []
  };

  try {
    const data = await makePeopleRequest(
      tokenOrConnectionId,
      `https://people.googleapis.com/v1/${resourceName}:updateContact?updatePersonFields=names,emailAddresses,phoneNumbers`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );
    return data;
  } catch (error) {
    console.error("Failed to update contact", error);
    return null;
  }
}

export async function deleteContact(tokenOrConnectionId, resourceName) {
  try {
    await makePeopleRequest(
      tokenOrConnectionId,
      `https://people.googleapis.com/v1/${resourceName}:deleteContact`,
      {
        method: "DELETE"
      }
    );
    return true;
  } catch (error) {
    console.error("Failed to delete contact", error);
    return false;
  }
}
