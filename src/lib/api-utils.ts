import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { isAdminEmail } from './admin';

/**
 * Standardized API Error Response
 */
export function errorResponse(
  message: string,
  status = 500,
  code?: string,
  extra: Record<string, unknown> = {}
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(code ? { code } : {}),
      ...extra,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Standardized API Success Response
 */
export function successResponse<T>(data: T, status = 200, headers: Record<string, string> = {}): NextResponse {
  return NextResponse.json(data, { status, headers });
}

/**
 * Safely parse JSON request body, handling syntax errors and empty bodies gracefully.
 */
export async function safeParseJson<T = Record<string, unknown>>(req: NextRequest): Promise<{ data: T | null; error?: string }> {
  try {
    const text = await req.text();
    if (!text || !text.trim()) {
      return { data: null, error: 'Request body cannot be empty' };
    }
    const parsed = JSON.parse(text) as T;
    return { data: parsed };
  } catch (err) {
    return { data: null, error: `Invalid JSON payload: ${(err as Error).message}` };
  }
}

/**
 * Validates whether the current request is authorized as an Admin: the signed-in session
 * must belong to SUPERADMIN_EMAIL (see lib/admin.ts). There is no header/API-key bypass.
 */
export async function validateAdminAccess(_req?: NextRequest): Promise<{ authorized: boolean; reason?: string; userEmail?: string }> {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // Gracefully handle missing request context or uninitialized auth
  }

  if (!session?.user?.email) {
    return { authorized: false, reason: 'Authentication required. Please sign in.' };
  }

  const userEmail = session.user.email.toLowerCase().trim();
  if (isAdminEmail(userEmail)) {
    return { authorized: true, userEmail };
  }
  return { authorized: false, reason: 'Access denied: Admin privileges required.' };
}
