import { get, set } from 'idb-keyval';

export async function getSummary(emailId) {
  try {
    return await get(`summary_${emailId}`);
  } catch (error) {
    console.error("IndexedDB get error:", error);
    return null;
  }
}

export async function saveSummary(emailId, summaryText) {
  try {
    await set(`summary_${emailId}`, summaryText);
  } catch (error) {
    console.error("IndexedDB set error:", error);
  }
}

export async function getCachedEmailBody(emailId) {
  try {
    return await get(`email_body_${emailId}`);
  } catch (error) {
    console.error("IndexedDB get error:", error);
    return null;
  }
}

export async function saveCachedEmailBody(emailId, data) {
  try {
    await set(`email_body_${emailId}`, data);
  } catch (error) {
    console.error("IndexedDB set error:", error);
  }
}

export async function getCachedInbox() {
  try {
    return await get(`inbox_emails_cache`);
  } catch (error) {
    console.error("IndexedDB get error:", error);
    return null;
  }
}

export async function saveCachedInbox(emails) {
  try {
    await set(`inbox_emails_cache`, emails);
  } catch (error) {
    console.error("IndexedDB set error:", error);
  }
}
