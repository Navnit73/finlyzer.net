import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.OCR_API_BASE_URL || 'http://localhost:8000/api/v1';
const ADMIN_API_KEY = process.env.OCR_ADMIN_KEY || 'ocr_admin_secret_2026';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/events
 * Global Server-Sent Events (SSE) stream for real-time Admin monitoring
 */
export async function GET(req: NextRequest) {
  const backendEventsUrl = `${API_BASE_URL}/admin/events`;

  try {
    const backendResponse = await fetch(backendEventsUrl, {
      headers: {
        'X-API-Key': ADMIN_API_KEY,
        Accept: 'text/event-stream',
      },
      cache: 'no-store',
    });

    if (!backendResponse.ok || !backendResponse.body) {
      return NextResponse.json(
        { error: `Failed to connect to admin event stream (${backendResponse.status})` },
        { status: backendResponse.status }
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
    const error = err as { message?: string };
    return NextResponse.json(
      { error: error.message || 'Error proxying admin event stream' },
      { status: 500 }
    );
  }
}
