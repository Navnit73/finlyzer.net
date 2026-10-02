import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess, errorResponse } from '@/lib/api-utils';

const API_BASE_URL = process.env.OCR_API_BASE_URL || 'http://localhost:8000/api/v1';
const ADMIN_API_KEY = process.env.OCR_ADMIN_KEY || 'ocr_admin_secret_2026';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/events
 * Global Server-Sent Events (SSE) stream for real-time Admin monitoring (Admin Protected)
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await validateAdminAccess(req);
    if (!auth.authorized) {
      return errorResponse(auth.reason || 'Unauthorized access to admin event stream', 403, 'FORBIDDEN');
    }

    const backendEventsUrl = `${API_BASE_URL}/admin/events`;

    const backendResponse = await fetch(backendEventsUrl, {
      headers: {
        'X-API-Key': ADMIN_API_KEY,
        Accept: 'text/event-stream',
      },
      signal: req.signal,
      cache: 'no-store',
    });

    if (!backendResponse.ok || !backendResponse.body) {
      return errorResponse(
        `Failed to connect to admin event stream (${backendResponse.status})`,
        backendResponse.status
      );
    }

    return new NextResponse(backendResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    if (error.name === 'AbortError') {
      return new NextResponse(null, { status: 204 });
    }
    return errorResponse(error.message || 'Error proxying admin event stream', 500);
  }
}
