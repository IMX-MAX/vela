let refreshLock = null;

export async function refreshTokenSafely(refreshToken, email) {
  // If a refresh is already in progress for this token, return its promise
  if (refreshLock) {
    return refreshLock;
  }

  refreshLock = new Promise(async (resolve, reject) => {
    try {
      const res = await fetch('/api/oauth/google/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!res.ok) throw new Error('Refresh failed');

      const data = await res.json();
      resolve(data);
    } catch (err) {
      reject(err);
    } finally {
      refreshLock = null; // Release lock
    }
  });

  return refreshLock;
}
