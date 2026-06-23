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
