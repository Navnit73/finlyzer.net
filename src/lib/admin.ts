/**
 * The only account with SuperAdmin access. Hardcoded on purpose: no env var or API key
 * can widen it. Shared by the API guards, the session callback and the proxy.
 */
export const SUPERADMIN_EMAIL = 'navnitrai5389@gmail.com';

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPERADMIN_EMAIL;
}
