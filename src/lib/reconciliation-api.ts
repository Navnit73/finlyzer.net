import type { ReconciliationCategory } from '@/types/reconciliation';

/**
 * Server-side client for the bank reconciliation service (see api.md). Signed-in users are sent
 * with our API key; guests are sent without one and carry the service's own access token, so the
 * service applies its guest rules (token check, guest retention) to them.
 */

const API_BASE_URL = process.env.OCR_API_BASE_URL || 'http://localhost:8000/api/v1';
const API_KEY = process.env.OCR_API_KEY || 'ocr_dev_key_secret_2026';
const RECON_URL = `${API_BASE_URL}/reconciliation`;

export type ReconAuth = { kind: 'user' } | { kind: 'guest'; token: string };

/** Error carrying the service's HTTP status and message, so routes can pass both through. */
export class ReconciliationApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

function authHeaders(auth: ReconAuth): Record<string, string> {
  return auth.kind === 'user' ? { 'X-API-Key': API_KEY } : { 'X-Reconciliation-Token': auth.token };
}

async function throwIfFailed(res: Response): Promise<void> {
  if (res.ok) return;
  let message = `Reconciliation service error (${res.status})`;
  try {
    const body = await res.json();
    if (typeof body?.error === 'string') message = body.error;
  } catch {}
  throw new ReconciliationApiError(message, res.status);
}

export interface ReconUploadResponse {
  success: boolean;
  reconciliation_id: string;
  status: string;
  message: string;
  access_token?: string;
  access_expires_at?: string;
}

export async function uploadReconciliation(
  bank: File,
  ledger: File,
  options: {
    dateToleranceDays: number;
    descriptionMatching: boolean;
    userEmail?: string;
    /** Passwords for password-protected PDFs; the service unlocks them and never stores them. */
    bankPassword?: string;
    ledgerPassword?: string;
  }
): Promise<ReconUploadResponse> {
  const form = new FormData();
  form.append('bank_statement', bank, bank.name);
  form.append('business_ledger', ledger, ledger.name);
  form.append('date_tolerance_days', String(options.dateToleranceDays));
  form.append('description_matching', options.descriptionMatching ? 'true' : 'false');
  if (options.userEmail) form.append('user_email', options.userEmail);
  if (options.bankPassword) form.append('bank_statement_password', options.bankPassword);
  if (options.ledgerPassword) form.append('business_ledger_password', options.ledgerPassword);

  const res = await fetch(`${RECON_URL}/upload`, {
    method: 'POST',
    headers: options.userEmail ? { 'X-API-Key': API_KEY } : {},
    body: form,
  });
  await throwIfFailed(res);
  return res.json();
}

export async function getReconciliation(id: string, auth: ReconAuth): Promise<Record<string, unknown>> {
  const res = await fetch(`${RECON_URL}/${encodeURIComponent(id)}`, { headers: authHeaders(auth), cache: 'no-store' });
  await throwIfFailed(res);
  return res.json();
}

export async function getReconciliationTransactions(
  id: string,
  auth: ReconAuth,
  query: { status?: ReconciliationCategory; page: number; pageSize: number }
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({ page: String(query.page), page_size: String(query.pageSize) });
  if (query.status) params.set('status', query.status);
  const res = await fetch(`${RECON_URL}/${encodeURIComponent(id)}/transactions?${params}`, {
    headers: authHeaders(auth),
    cache: 'no-store',
  });
  await throwIfFailed(res);
  return res.json();
}

/** Returns the service's file response untouched so it can be streamed to the browser. */
export async function exportReconciliation(id: string, auth: ReconAuth, format: 'xlsx' | 'csv'): Promise<Response> {
  const res = await fetch(`${RECON_URL}/${encodeURIComponent(id)}/export?format=${format}`, {
    headers: authHeaders(auth),
    cache: 'no-store',
  });
  await throwIfFailed(res);
  return res;
}
