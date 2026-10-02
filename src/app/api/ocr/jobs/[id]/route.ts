import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchJobStatus } from '@/lib/ocr-api';
import { saveDocumentExtraction } from '@/lib/models/Document';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const job = await fetchJobStatus(jobId);

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

    return NextResponse.json(job);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { error: error.message || 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
