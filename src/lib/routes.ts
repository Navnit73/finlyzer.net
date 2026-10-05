/**
 * Single source of truth for route access rules.
 * Shared by `src/proxy.ts` (server redirects), AppShell (layout choice) and AuthModal (post-login destination).
 */

/** Where signed-in users land by default. */
export const APP_HOME = '/dashboard';

/** Signed-in conversion workspace (replaces the public homepage uploader for logged-in users). */
export const APP_WORKSPACE = '/workspace';

/** Marketing / SEO pages. Guests only — signed-in users are redirected into the app. */
const PUBLIC_ONLY_PREFIXES = ['/convert'];
const PUBLIC_ONLY_EXACT = ['/'];

/** Private app pages. Signed-in users only — guests are sent to sign in. */
const APP_PREFIXES = ['/dashboard', '/workspace', '/documents', '/invoices', '/superadmin', '/admin'];

/** Admin-only app pages. */
const ADMIN_PREFIXES = ['/superadmin', '/admin'];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isPublicOnlyRoute(pathname: string): boolean {
  return PUBLIC_ONLY_EXACT.includes(pathname) || matchesPrefix(pathname, PUBLIC_ONLY_PREFIXES);
}

export function isAppRoute(pathname: string): boolean {
  return matchesPrefix(pathname, APP_PREFIXES);
}

export function isAdminRoute(pathname: string): boolean {
  return matchesPrefix(pathname, ADMIN_PREFIXES);
}

/** Only allow same-origin relative paths as redirect targets (prevents open redirects). */
export function sanitizeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}
