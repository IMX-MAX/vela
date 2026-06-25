import { account } from "./appwrite";
import { useAuthStore } from "./store";

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
  const db = user?.db || {};
  const plan = db.subscriptionPlan === "pro" ? "pro" : "free";
  const limit = plan === "pro" ? 100 : 27;
  let current = db.aiUsageCount || 0;
  
  if (shouldResetUsage(plan, db.lastUsageReset)) {
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
 * Increments AI usage securely via API route. Throws an error if limit exceeded.
 */
export async function incrementAiUsage(user, checkAuth) {
  if (!user) throw new Error("User not authenticated");
  
  const status = getUsageStatus(user);
  if (!status.allowed) {
    useAuthStore.getState().setShowUpgradeModal(true);
    throw new Error(`AI action limit reached for your ${status.plan} plan.`);
  }

  // Increment securely via API
  const { account } = await import("./appwrite");
  const jwtResponse = await account.createJWT();
  const res = await fetch('/api/user/increment-usage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtResponse.jwt}`
    }
  });

  if (!res.ok) {
    if (res.status === 403) {
      useAuthStore.getState().setShowUpgradeModal(true);
      throw new Error("AI action limit reached.");
    }
    throw new Error("Failed to increment usage");
  }

  if (checkAuth) {
    await checkAuth(); // Refresh the user store to get updated db document
  }

  return status.current + 1;
}
