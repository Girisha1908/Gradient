// ─── SINGLE SOURCE OF TRUTH FOR USER SESSION ───
// Only localStorage defines the logged-in user.
// Database must NEVER override user identity.

export function getCurrentUser() {
  const saved = localStorage.getItem("user");
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}
