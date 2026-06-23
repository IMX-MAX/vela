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
  return res.json();
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
  const body = {
    names: contactData.firstName || contactData.lastName ? [{ givenName: contactData.firstName || "", familyName: contactData.lastName || "" }] : [],
    emailAddresses: contactData.email ? [{ value: contactData.email }] : [],
    phoneNumbers: contactData.phone ? [{ value: contactData.phone }] : [],
    organizations: contactData.company || contactData.jobTitle ? [{ name: contactData.company || "", title: contactData.jobTitle || "" }] : [],
    biographies: contactData.notes ? [{ value: contactData.notes }] : []
  };

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
  const body = {
    etag: contactData.etag,
    names: contactData.firstName || contactData.lastName ? [{ givenName: contactData.firstName || "", familyName: contactData.lastName || "" }] : [],
    emailAddresses: contactData.email ? [{ value: contactData.email }] : [],
    phoneNumbers: contactData.phone ? [{ value: contactData.phone }] : [],
    organizations: contactData.company || contactData.jobTitle ? [{ name: contactData.company || "", title: contactData.jobTitle || "" }] : [],
    biographies: contactData.notes ? [{ value: contactData.notes }] : []
  };

  try {
    const data = await makePeopleRequest(
      tokenOrConnectionId,
      `https://people.googleapis.com/v1/${resourceName}:updateContact?updatePersonFields=names,emailAddresses,phoneNumbers,organizations,biographies`,
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
