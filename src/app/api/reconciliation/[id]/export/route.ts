import { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api-utils';
import { exportReconciliation } from '@/lib/reconciliation-api';
import { authorizeReconciliation, isReconciliationLocked, reconServiceError } from '@/lib/reconciliation-access';

export const dynamic = 'force-dynamic';

/** GET /api/reconciliation/[id]/export?format=xlsx|csv — the full report as a download. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await authorizeReconciliation(req, id);
    if (access instanceof Response) return access;

    if (isReconciliationLocked(access.record)) {
      return errorResponse('Unlock this reconciliation to download the full report.', 402, 'PAYMENT_REQUIRED');
    }

    const format = req.nextUrl.searchParams.get('format') || 'xlsx';
    if (format !== 'xlsx' && format !== 'csv') {
      return errorResponse('Format must be xlsx or csv.', 422, 'INVALID_FORMAT');
    }

    let upstream: Response;
    try {
      upstream = await exportReconciliation(id, access.auth, format);
    } catch (err) {
      return reconServiceError(err, 'Failed to export the reconciliation.');
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type':
          upstream.headers.get('content-type') ||
          (format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv; charset=utf-8'),
        'Content-Disposition': `attachment; filename="${id}-reconciliation.${format}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return errorResponse((err as Error)?.message || 'Failed to export the reconciliation.', 500);
  }
}
