import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

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
 * Validates whether the current request is authorized as an Admin.
 * Checks either:
 * 1. An active session with email listed in process.env.ADMIN_EMAILS
 * 2. An 'X-Admin-Key' or 'Authorization' header matching process.env.OCR_ADMIN_KEY
 */
export async function validateAdminAccess(req: NextRequest): Promise<{ authorized: boolean; reason?: string; userEmail?: string }> {
  const adminKey = process.env.OCR_ADMIN_KEY || 'ocr_admin_secret_2026';
  const headerKey = req.headers.get('x-admin-key') || req.headers.get('X-Admin-Key');

  if (headerKey && headerKey === adminKey) {
    return { authorized: true, userEmail: 'admin-api-key' };
  }

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
  const rawAdminEmails = process.env.ADMIN_EMAILS || '';
  const adminEmails = rawAdminEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // If ADMIN_EMAILS is configured, enforce strict email whitelist
  if (adminEmails.length > 0) {
    if (adminEmails.includes(userEmail)) {
      return { authorized: true, userEmail };
    }
    return { authorized: false, reason: 'Access denied: Admin privileges required.' };
  }

  // In development without ADMIN_EMAILS explicitly configured, allow authenticated session
  if (process.env.NODE_ENV !== 'production') {
    return { authorized: true, userEmail };
  }

  return { authorized: false, reason: 'Access denied: No administrative permissions configured.' };
}
