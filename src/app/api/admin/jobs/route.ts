import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess, errorResponse } from '@/lib/api-utils';
import { fetchAdminJobs } from '@/lib/ocr-api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/jobs
 * List and inspect all system background jobs (Admin Protected)
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await validateAdminAccess(req);
    if (!auth.authorized) {
      return errorResponse(auth.reason || 'Unauthorized access to admin jobs', 403, 'FORBIDDEN');
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('page_size') || '20', 10) || 20));
    const status = (searchParams.get('status') || 'all').trim();
    const search = (searchParams.get('search') || '').trim().slice(0, 100);

    const jobs = await fetchAdminJobs(page, pageSize, status, search);
    return NextResponse.json(jobs);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to fetch admin jobs list', 500);
  }
}
