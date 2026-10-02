import { NextRequest, NextResponse } from 'next/server';
import { cancelJob } from '@/lib/ocr-api';
import { errorResponse, successResponse } from '@/lib/api-utils';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    if (!jobId || typeof jobId !== 'string' || !jobId.trim()) {
      return errorResponse('Valid Job ID is required', 400, 'BAD_REQUEST');
    }

    const sanitizedJobId = jobId.trim();
    const success = await cancelJob(sanitizedJobId);
    if (!success) {
      return errorResponse('Failed to cancel job on background worker', 502, 'WORKER_ERROR');
    }

    return successResponse({ success: true, message: `Job ${sanitizedJobId} cancelled successfully` });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Cancel request failed', 500);
  }
}
