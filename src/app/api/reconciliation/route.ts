import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api-utils';
import { listUserReconciliations } from '@/lib/models/Reconciliation';

export const dynamic = 'force-dynamic';

/** GET /api/reconciliation?page=&page_size= — the signed-in user's reconciliations, newest first. */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase().trim();
    if (!email) return errorResponse('Sign in to see your reconciliations.', 401, 'UNAUTHORIZED');

    const search = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(search.get('page') || '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(search.get('page_size') || '20', 10) || 20));

    const { items, total } = await listUserReconciliations(email, page, pageSize);
    return successResponse(
      {
        success: true,
        page,
        page_size: pageSize,
        total,
        reconciliations: items.map((r) => ({
          reconciliation_id: r.reconciliation_id,
          bank_filename: r.bank_filename,
          ledger_filename: r.ledger_filename,
          pages: r.pages,
          // Records created before status tracking have none; treat them as still running.
          status: r.status ?? 'processing',
          summary: r.summary ?? null,
          error: r.error ?? null,
          created_at: r.created_at,
          completed_at: r.completed_at ?? null,
        })),
      },
      200,
      { 'Cache-Control': 'no-store' }
    );
  } catch (err) {
    return errorResponse((err as Error)?.message || 'Failed to load reconciliations.', 500);
  }
}
