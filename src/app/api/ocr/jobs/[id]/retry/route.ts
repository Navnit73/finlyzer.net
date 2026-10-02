import { NextRequest, NextResponse } from 'next/server';
import { retryJob } from '@/lib/ocr-api';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const success = await retryJob(jobId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to retry job on backend' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Job ${jobId} re-enqueued for processing` });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Retry request failed' }, { status: 500 });
  }
}
