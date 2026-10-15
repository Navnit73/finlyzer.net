import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PDFDocument } from 'pdf-lib';
import { authOptions } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';
import { FREE_PAGE_LIMIT } from '@/types/pricing';
import { getReconciliationRecord, hashAccessToken, ReconciliationRecord } from '@/lib/models/Reconciliation';
import { ReconAuth, ReconciliationApiError } from '@/lib/reconciliation-api';
import { fileExtension } from '@/lib/reconciliation-limits';

/** Rows per category a locked (unpaid 11-30 page) guest run can see. */
export const RECON_PREVIEW_ROWS = 5;

/**
 * Billable pages for one uploaded file, counted on the server so the page limits can't be
 * bypassed by the browser. Images and spreadsheets count as one page each. Encrypted PDFs are
 * counted too: many bank PDFs are encrypted only to restrict printing and open without a password,
 * so whether a file is readable is left to the reconciliation service.
 */
export async function countBillablePages(file: File): Promise<number> {
  if (fileExtension(file.name) !== '.pdf') return 1;
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    return Math.max(1, pdf.getPageCount());
  } catch {
    // Damaged or unusual PDFs: count page objects; the service rejects files it can't read.
    const text = new TextDecoder('latin1').decode(bytes);
    return Math.max(1, (text.match(/\/Type\s*\/Page\b/g) || []).length);
  }
}

/** A guest run over the free limit stays in preview until its Document Pass is paid. */
export function isReconciliationLocked(record: ReconciliationRecord): boolean {
  return record.is_guest && record.pages > FREE_PAGE_LIMIT && !record.is_paid;
}

/**
 * Resolves who may read a reconciliation: a guest presenting the access token issued at upload,
 * or the signed-in owner. Anything else gets the same 404, so ids can't be probed.
 */
export async function authorizeReconciliation(
  req: NextRequest,
  id: string
): Promise<{ record: ReconciliationRecord; auth: ReconAuth; email?: string } | NextResponse> {
  const notFound = errorResponse('Reconciliation not found.', 404, 'NOT_FOUND');
  if (!/^rec_[A-Za-z0-9]{6,64}$/.test(id)) return notFound;

  const record = await getReconciliationRecord(id);
  if (!record) return notFound;

  const token = req.headers.get('x-reconciliation-token');
  if (record.is_guest) {
    if (!token || !record.access_token_hash || hashAccessToken(token) !== record.access_token_hash) return notFound;
    return { record, auth: { kind: 'guest', token } };
  }

  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email || email !== record.user_email) return notFound;
  return { record, auth: { kind: 'user' }, email };
}

/** Maps a reconciliation service failure to our error envelope. */
export function reconServiceError(err: unknown, fallback: string): NextResponse {
  if (err instanceof ReconciliationApiError) {
    const status = [400, 404, 409, 410, 413, 422, 429].includes(err.status) ? err.status : 502;
    const message = err.status === 410 ? 'This guest reconciliation has expired and its data was deleted.' : err.message;
    return errorResponse(message, status, err.status === 410 ? 'EXPIRED' : 'RECONCILIATION_ERROR');
  }
  // fetch() itself failed: the service is down or unreachable.
  console.error('[Reconciliation]', fallback, (err as Error)?.message);
  return errorResponse('The reconciliation service is unavailable right now. Please try again in a few minutes.', 503, 'SERVICE_UNAVAILABLE');
}
