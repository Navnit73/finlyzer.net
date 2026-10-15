import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-utils';
import { getReconciliationTransactions } from '@/lib/reconciliation-api';
import { RECONCILIATION_CATEGORIES, ReconciliationCategory } from '@/types/reconciliation';
import {
  authorizeReconciliation,
  isReconciliationLocked,
  reconServiceError,
  RECON_PREVIEW_ROWS,
} from '@/lib/reconciliation-access';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reconciliation/[id]/transactions?status=&page=&page_size=
 * Paginated report details. Locked guest runs get the first rows of page 1 only, with the real total.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await authorizeReconciliation(req, id);
    if (access instanceof Response) return access;
    const { record, auth } = access;

    const search = req.nextUrl.searchParams;
    const status = search.get('status') || undefined;
    if (status && !RECONCILIATION_CATEGORIES.includes(status as ReconciliationCategory)) {
      return errorResponse('Invalid status filter.', 422, 'INVALID_STATUS');
    }
    const locked = isReconciliationLocked(record);
    const page = locked ? 1 : Math.max(1, parseInt(search.get('page') || '1', 10) || 1);
    const pageSize = locked ? RECON_PREVIEW_ROWS : Math.min(500, Math.max(1, parseInt(search.get('page_size') || '50', 10) || 50));

    let body: Record<string, unknown>;
    try {
      body = await getReconciliationTransactions(id, auth, {
        status: status as ReconciliationCategory | undefined,
        page,
        pageSize,
      });
    } catch (err) {
      return reconServiceError(err, 'Failed to load transactions.');
    }

    return successResponse({ ...body, locked }, 200, { 'Cache-Control': 'no-store' });
  } catch (err) {
    return errorResponse((err as Error)?.message || 'Failed to load transactions.', 500);
  }
}
