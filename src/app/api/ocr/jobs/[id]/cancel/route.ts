import { NextRequest, NextResponse } from 'next/server';
import { cancelJob } from '@/lib/ocr-api';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const success = await cancelJob(jobId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to cancel job on backend' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Job ${jobId} cancelled successfully` });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Cancel request failed' }, { status: 500 });
  }
}
