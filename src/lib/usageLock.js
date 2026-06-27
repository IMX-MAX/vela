const locks = new Map();

export async function withUsageLock(userId, fn) {
  const existingLock = locks.get(userId);
  if (existingLock) {
    await existingLock;
    return withUsageLock(userId, fn); // Retry after previous lock releases
  }

  const lock = new Promise(async (resolve, reject) => {
    try {
      const result = await fn();
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      locks.delete(userId);
    }
  });

  locks.set(userId, lock);
  return lock;
}
