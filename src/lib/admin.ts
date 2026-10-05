/**
 * Admin whitelist check, shared by API guards, the session callback and the proxy.
 * ADMIN_EMAILS is a comma-separated list. Without it, any signed-in user is admin in
 * development only; production denies everyone.
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length > 0) {
    return adminEmails.includes(email.toLowerCase().trim());
  }

  return process.env.NODE_ENV !== 'production';
}
