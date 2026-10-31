import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AUTH_SECRET } from '@/lib/auth-secret';
import { isAdminEmail } from '@/lib/admin';
import { APP_HOME, appRedirectFor, isAdminRoute, isAppRoute, isPublicOnlyRoute } from '@/lib/routes';
import { GERMAN_ROOT, LOCALE_HEADER } from '@/lib/i18n';

/**
 * Keeps the signed-in app and the public marketing site isolated:
 * - signed-in users hitting a marketing page (/, /convert/*, /reconcile/*) are sent into the app
 * - guests hitting an app page are sent to the homepage with the sign-in modal open
 * - non-admins hitting admin pages are sent to the dashboard
 * Shared pages (/pricing, /document/[id]) are not matched and work for both.
 */
/** Routes whose slugs come from lowercase markdown filenames or registries. */
const LOWERCASE_PREFIXES = ['/convert/', '/reconcile/', '/analyzer/', '/calculators/', '/guides/', '/de/ratgeber/', '/de/konverter/'];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Content slugs are lowercase; /convert/Bank-Statement-To-Excel → one canonical URL. Without this
  // mixed-case URLs answered 200, either as a duplicate page or as a soft 404.
  if (LOWERCASE_PREFIXES.some((p) => pathname.startsWith(p)) && pathname !== pathname.toLowerCase()) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }

  // /de has no auth rules; just tag the request so unmatched /de URLs get the German 404.
  if (pathname === GERMAN_ROOT || pathname.startsWith(`${GERMAN_ROOT}/`)) {
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, 'de');
    return NextResponse.next({ request: { headers } });
  }

  const token = await getToken({ req: request, secret: AUTH_SECRET });

  if (token) {
    if (isPublicOnlyRoute(pathname)) {
      return NextResponse.redirect(new URL(appRedirectFor(pathname), request.url));
    }
    if (isAdminRoute(pathname) && !isAdminEmail(token.email)) {
      return NextResponse.redirect(new URL(APP_HOME, request.url));
    }
    return NextResponse.next();
  }

  if (isAppRoute(pathname)) {
    const url = new URL('/', request.url);
    url.searchParams.set('login', '1');
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/convert/:path*',
    '/reconcile/:path*',
    '/analyzer/:path*',
    '/calculators/:path*',
    '/guides/:path*',
    '/reconciliations/:path*',
    '/dashboard/:path*',
    '/workspace/:path*',
    '/documents/:path*',
    '/invoices/:path*',
    '/superadmin/:path*',
    '/admin/:path*',
    '/de/:path*',
  ],
};
