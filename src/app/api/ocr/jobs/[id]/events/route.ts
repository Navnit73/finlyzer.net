import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.OCR_API_BASE_URL || 'http://localhost:8000/api/v1';
const API_KEY = process.env.OCR_API_KEY || 'ocr_dev_key_secret_2026';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  const backendEventsUrl = `${API_BASE_URL}/jobs/${jobId}/events`;

  try {
    const backendResponse = await fetch(backendEventsUrl, {
      headers: {
        'X-API-Key': API_KEY,
        Accept: 'text/event-stream',
      },
      cache: 'no-store',
    });

    if (!backendResponse.ok || !backendResponse.body) {
      return NextResponse.json(
        { error: `Failed to connect to backend event stream (${backendResponse.status})` },
        { status: backendResponse.status }
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
    const error = err as { message?: string };
    return NextResponse.json(
      { error: error.message || 'Error proxying event stream' },
      { status: 500 }
    );
  }
}
