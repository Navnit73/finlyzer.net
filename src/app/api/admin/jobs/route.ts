import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchAdminJobs } from '@/lib/ocr-api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/jobs
 * List and inspect all system background jobs (Admin View)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('page_size') || '20', 10);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    const jobs = await fetchAdminJobs(page, pageSize, status, search);
    return NextResponse.json(jobs);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin jobs list' },
      { status: 500 }
    );
  }
}
