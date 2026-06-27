import { get, set, keys, del } from 'idb-keyval';

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 500; // Max cached items

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
    const cached = await get(`email_body_${emailId}`);
    if (!cached) return null;
    
    // Check TTL
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      await del(`email_body_${emailId}`);
      return null;
    }
    
    return cached.data;
  } catch (error) {
    console.error("IndexedDB get error:", error);
    return null;
  }
}

export async function saveCachedEmailBody(emailId, data) {
  try {
    if (Math.random() < 0.01) { // 1% chance on each save
      await cleanupCache();
    }
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    await set(`email_body_${emailId}`, cacheData);
  } catch (error) {
    console.error("IndexedDB set error:", error);
  }
}

async function cleanupCache() {
  try {
    const allKeys = await keys();
    const emailBodyKeys = allKeys.filter(k => k.toString().startsWith('email_body_'));
    
    // Delete expired
    for (const key of emailBodyKeys) {
      const item = await get(key);
      if (item && Date.now() - item.timestamp > CACHE_TTL) {
        await del(key);
      }
    }
    
    // Enforce size limit
    if (emailBodyKeys.length > MAX_CACHE_SIZE) {
      const sortedKeys = emailBodyKeys.sort();
      const toDelete = sortedKeys.slice(0, emailBodyKeys.length - MAX_CACHE_SIZE);
      for (const key of toDelete) {
        await del(key);
      }
    }
  } catch (error) {
    console.error("Cache cleanup error:", error);
  }
}

export async function getCachedInbox(filter = 'inbox') {
  try {
    return await get(`inbox_emails_cache_${filter}`);
  } catch (error) {
    console.error("IndexedDB get error:", error);
    return null;
  }
}

export async function saveCachedInbox(emails, filter = 'inbox') {
  try {
    await set(`inbox_emails_cache_${filter}`, emails);
  } catch (error) {
    console.error("IndexedDB set error:", error);
  }
}
