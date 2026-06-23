"use server";

async function makePeopleRequest(tokenOrConnectionId, url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${tokenOrConnectionId}`,
    },
    cache: "no-store",
  });
  const data = await res.json();
  if (data?.error) {
    console.error("API Error Response:", JSON.stringify(data.error));
    throw new Error(data.error.message || "Unknown API error");
  }
  return data;
}

export async function fetchContacts(tokenOrConnectionId) {
  try {
    const data = await makePeopleRequest(
      tokenOrConnectionId,
      "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations,biographies,photos"
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
  const body = {};
  if (contactData.firstName || contactData.lastName) body.names = [{ givenName: contactData.firstName || "", familyName: contactData.lastName || "" }];
  if (contactData.email) body.emailAddresses = [{ value: contactData.email }];
  if (contactData.phone) body.phoneNumbers = [{ value: contactData.phone }];
  if (contactData.company || contactData.jobTitle) body.organizations = [{ name: contactData.company || "", title: contactData.jobTitle || "" }];
  if (contactData.notes) body.biographies = [{ value: contactData.notes }];

  try {
    const data = await makePeopleRequest(
      tokenOrConnectionId,
      "https://people.googleapis.com/v1/people:createContact?personFields=names,emailAddresses,phoneNumbers,organizations,biographies",
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
  const body = { etag: contactData.etag };
  const updateFields = [];

  if (contactData.firstName || contactData.lastName) {
    body.names = [{ givenName: contactData.firstName || "", familyName: contactData.lastName || "" }];
    updateFields.push("names");
  } else {
    body.names = [];
    updateFields.push("names");
  }

  if (contactData.email) {
    body.emailAddresses = [{ value: contactData.email }];
    updateFields.push("emailAddresses");
  } else {
    body.emailAddresses = [];
    updateFields.push("emailAddresses");
  }

  if (contactData.phone) {
    body.phoneNumbers = [{ value: contactData.phone }];
    updateFields.push("phoneNumbers");
  } else {
    body.phoneNumbers = [];
    updateFields.push("phoneNumbers");
  }

  if (contactData.company || contactData.jobTitle) {
    body.organizations = [{ name: contactData.company || "", title: contactData.jobTitle || "" }];
    updateFields.push("organizations");
  } else {
    body.organizations = [];
    updateFields.push("organizations");
  }

  if (contactData.notes) {
    body.biographies = [{ value: contactData.notes }];
    updateFields.push("biographies");
  } else {
    body.biographies = [];
    updateFields.push("biographies");
  }

  try {
    const data = await makePeopleRequest(
      tokenOrConnectionId,
      `https://people.googleapis.com/v1/${resourceName}:updateContact?updatePersonFields=${updateFields.join(",")}`,
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
