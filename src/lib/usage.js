import { account } from "./appwrite";

/**
 * Returns the current NYC date as an object with year, month, and day.
 */
function getNYCDateObj(date = new Date()) {
  const nyString = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(date);
  const [month, day, year] = nyString.split('/');
  return { year: parseInt(year), month: parseInt(month), day: parseInt(day) };
}

/**
 * Determines if the usage should be reset based on the plan and last reset date.
 */
function shouldResetUsage(plan, lastResetIso) {
  if (!lastResetIso) return true;
  
  const lastResetDate = new Date(lastResetIso);
  const currentNYC = getNYCDateObj();
  const lastNYC = getNYCDateObj(lastResetDate);

  if (plan === "pro") {
    // Pro: resets daily at 12am NYC time
    return currentNYC.year !== lastNYC.year || currentNYC.month !== lastNYC.month || currentNYC.day !== lastNYC.day;
  } else {
    // Free: resets on the 1st of each month NYC time
    return currentNYC.year !== lastNYC.year || currentNYC.month !== lastNYC.month;
  }
}

/**
 * Checks if the user is allowed to perform an AI action.
 * Returns { allowed, limit, current, plan, nextReset }
 */
export function getUsageStatus(user) {
  const prefs = user?.prefs || {};
  const plan = prefs.plan === "pro" ? "pro" : "free";
  const limit = plan === "pro" ? 50 : 50; // Both are 50, but frequency differs
  let current = prefs.aiUsageCount || 0;
  
  if (shouldResetUsage(plan, prefs.lastUsageReset)) {
    current = 0;
  }

  return {
    allowed: current < limit,
    limit,
    current,
    plan,
  };
}

/**
 * Increments AI usage. Throws an error if limit exceeded.
 */
export async function incrementAiUsage(user, checkAuth) {
  if (!user) throw new Error("User not authenticated");
  
  const prefs = user.prefs || {};
  const plan = prefs.plan === "pro" ? "pro" : "free";
  let current = prefs.aiUsageCount || 0;
  let lastReset = prefs.lastUsageReset;

  if (shouldResetUsage(plan, lastReset)) {
    current = 0;
    lastReset = new Date().toISOString();
  }

  if (current >= 50) {
    throw new Error(`AI action limit reached for your ${plan} plan.`);
  }

  current += 1;

  // Update Appwrite prefs
  await account.updatePrefs({
    ...prefs,
    plan,
    aiUsageCount: current,
    lastUsageReset: lastReset
  });

  if (checkAuth) {
    await checkAuth(); // Refresh the user store
  }

  return current;
}
