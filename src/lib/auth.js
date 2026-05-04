// ─── SINGLE SOURCE OF TRUTH FOR USER SESSION ───
// Only sessionStorage defines the logged-in user (tab-isolated).
// Database must NEVER override user identity.

export function getCurrentUser() {
  const saved = sessionStorage.getItem("user");
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}
