import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-utils';

const API_BASE_URL = process.env.OCR_API_BASE_URL || 'http://localhost:8000/api/v1';
const API_KEY = process.env.OCR_API_KEY || 'ocr_dev_key_secret_2026';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    if (!jobId || typeof jobId !== 'string') {
      return errorResponse('Valid Job ID is required', 400, 'BAD_REQUEST');
    }

    const sanitizedJobId = encodeURIComponent(jobId.trim());
    const backendEventsUrl = `${API_BASE_URL}/jobs/${sanitizedJobId}/events`;

    const backendResponse = await fetch(backendEventsUrl, {
      headers: {
        'X-API-Key': API_KEY,
        Accept: 'text/event-stream',
      },
      signal: req.signal,
      cache: 'no-store',
    });

    if (!backendResponse.ok || !backendResponse.body) {
      return errorResponse(
        `Failed to connect to backend event stream (${backendResponse.status})`,
        backendResponse.status
      );
    }

    // Stream SSE directly to the client
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
    return errorResponse(error.message || 'Error proxying event stream', 500);
  }
}
