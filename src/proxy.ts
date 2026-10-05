import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AUTH_SECRET } from '@/lib/auth-secret';
import { isAdminEmail } from '@/lib/admin';
import { APP_HOME, isAdminRoute, isAppRoute, isPublicOnlyRoute } from '@/lib/routes';

/**
 * Keeps the signed-in app and the public marketing site isolated:
 * - signed-in users hitting a marketing page (/, /convert/*) are sent to the dashboard
 * - guests hitting an app page are sent to the homepage with the sign-in modal open
 * - non-admins hitting admin pages are sent to the dashboard
 * Shared pages (/pricing, /document/[id]) are not matched and work for both.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({ req: request, secret: AUTH_SECRET });

  if (token) {
    if (isPublicOnlyRoute(pathname)) {
      return NextResponse.redirect(new URL(APP_HOME, request.url));
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
    '/dashboard/:path*',
    '/workspace/:path*',
    '/documents/:path*',
    '/invoices/:path*',
    '/superadmin/:path*',
    '/admin/:path*',
  ],
};
