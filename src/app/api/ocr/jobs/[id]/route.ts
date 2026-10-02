import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchJobStatus } from '@/lib/ocr-api';
import { saveDocumentExtraction } from '@/lib/models/Document';
import { errorResponse, successResponse } from '@/lib/api-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    if (!jobId || typeof jobId !== 'string' || !jobId.trim()) {
      return errorResponse('Valid Job ID is required', 400, 'BAD_REQUEST');
    }

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const job = await fetchJobStatus(jobId.trim());

    // If job finished with extraction, ensure it is persisted in local MongoDB
    if (job.status === 'completed' && job.result) {
      try {
        const effectiveUserEmail = (
          userEmail ||
          (job.metadata?.user_email as string) ||
          'guest'
        ).toLowerCase().trim();

        await saveDocumentExtraction(
          effectiveUserEmail,
          job.result,
          job.metadata?.filename || job.result.filename || 'statement.pdf'
        );
      } catch (dbErr) {
        console.warn('⚠️ Could not save completed job result to database:', (dbErr as Error).message);
      }
    }

    return successResponse(job);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to fetch job status', 500);
  }
}
