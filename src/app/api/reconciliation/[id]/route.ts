import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-utils';
import { incrementUserPageCount } from '@/lib/models/User';
import { claimPageCharge, saveReconciliationOutcome } from '@/lib/models/Reconciliation';
import { getReconciliation } from '@/lib/reconciliation-api';
import {
  authorizeReconciliation,
  isReconciliationLocked,
  reconServiceError,
  RECON_PREVIEW_ROWS,
} from '@/lib/reconciliation-access';

export const dynamic = 'force-dynamic';

// Category arrays are left out of the status payload; the results page pages through them via
// /transactions, which is also where the guest preview limit is enforced.
const CATEGORY_KEYS = [
  'matched_transactions',
  'unmatched_bank_transactions',
  'unmatched_ledger_transactions',
  'possible_duplicates',
  'amount_mismatches',
];

/** GET /api/reconciliation/[id] — status, progress and the report summary. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await authorizeReconciliation(req, id);
    if (access instanceof Response) return access;
    const { record, auth, email } = access;

    let body: Record<string, unknown>;
    try {
      body = await getReconciliation(id, auth);
    } catch (err) {
      return reconServiceError(err, 'Failed to load the reconciliation.');
    }

    // Signed-in runs use page credits once the report is ready, so failed runs cost nothing.
    if (body.status === 'completed' && email && !record.pages_charged && (await claimPageCharge(id))) {
      await incrementUserPageCount(email, record.pages);
    }

    const result = body.result as Record<string, unknown> | null;
    if ((body.status === 'completed' || body.status === 'failed') && record.status !== body.status) {
      const summary = result?.summary as Record<string, unknown> | undefined;
      const balance = result?.balance_check as Record<string, unknown> | undefined;
      await saveReconciliationOutcome(id, {
        status: body.status,
        error: (body.error as string | null) ?? null,
        ...(summary
          ? {
              summary: {
                currency: (summary.currency as string | null) ?? null,
                matched: Number(summary.matched) || 0,
                unmatched_bank: Number(summary.unmatched_bank) || 0,
                unmatched_ledger: Number(summary.unmatched_ledger) || 0,
                amount_mismatches: Number(summary.amount_mismatches) || 0,
                possible_duplicates: Number(summary.possible_duplicates) || 0,
                balance_status: (balance?.status as string | undefined) ?? null,
              },
            }
          : {}),
      });
    }

    if (result) {
      for (const key of CATEGORY_KEYS) delete result[key];
    }

    return successResponse(
      {
        ...body,
        access: {
          is_guest: record.is_guest,
          pages: record.pages,
          locked: isReconciliationLocked(record),
          preview_rows: RECON_PREVIEW_ROWS,
          bank_filename: record.bank_filename,
          ledger_filename: record.ledger_filename,
          expires_at: record.expires_at ? new Date(record.expires_at).toISOString() : null,
        },
      },
      200,
      { 'Cache-Control': 'no-store' }
    );
  } catch (err) {
    return errorResponse((err as Error)?.message || 'Failed to load the reconciliation.', 500);
  }
}
