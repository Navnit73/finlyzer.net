import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserQuota } from '@/lib/models/User';
import { errorResponse, successResponse } from '@/lib/api-utils';
import { GUEST_MAX_PAGES } from '@/types/pricing';
import { RECONCILIATION_GUEST_RETENTION_DAYS } from '@/lib/retention';
import { getDatabase } from '@/lib/mongodb';
import { createReconciliationRecord, hashAccessToken } from '@/lib/models/Reconciliation';
import { ReconciliationApiError, uploadReconciliation } from '@/lib/reconciliation-api';
import { countBillablePages, isReconciliationLocked, reconServiceError } from '@/lib/reconciliation-access';
import { RECON_MAX_TOTAL_MB, unsupportedFileMessage } from '@/lib/reconciliation-limits';

/** Reads an optional PDF password field; never logged or stored. */
function readPassword(form: FormData, name: string): string | undefined {
  const value = form.get(name);
  return typeof value === 'string' && value !== '' ? value.slice(0, 256) : undefined;
}

/**
 * Turns the service's password errors ("Bank statement: This PDF is password-protected…" /
 * "…: Incorrect PDF password.") into codes the uploader uses to ask for the right file's password.
 */
function passwordError(err: unknown) {
  if (!(err instanceof ReconciliationApiError) || err.status !== 400) return null;
  const document = err.message.startsWith('Bank statement:')
    ? 'bank_statement'
    : err.message.startsWith('Business ledger:')
      ? 'business_ledger'
      : null;
  if (!document) return null;
  if (/incorrect pdf password/i.test(err.message)) {
    return errorResponse('That password is incorrect. Please try again.', 400, 'PASSWORD_INCORRECT', { document });
  }
  if (/password-protected/i.test(err.message)) {
    return errorResponse('This PDF is password-protected. Enter its password to continue.', 400, 'PASSWORD_REQUIRED', { document });
  }
  return null;
}

function validateFile(file: FormDataEntryValue | null, label: string): string | null {
  if (!(file instanceof File) || file.size === 0) return `${label}: please choose a file.`;
  return unsupportedFileMessage(file.name, label);
}

/**
 * POST /api/reconciliation/upload
 * Counts pages on the server, applies the page limits (guests: free up to 10 pages, Document Pass
 * up to 30, sign-in above that; accounts: page credits), then starts the reconciliation.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email?.toLowerCase().trim();

    const form = await req.formData();
    const bank = form.get('bank_statement');
    const ledger = form.get('business_ledger');

    const fileError = validateFile(bank, 'Bank statement') || validateFile(ledger, 'Business ledger');
    if (fileError) return errorResponse(fileError, 400, 'INVALID_FILE');
    const bankFile = bank as File;
    const ledgerFile = ledger as File;
    if (bankFile.size + ledgerFile.size > RECON_MAX_TOTAL_MB * 1024 * 1024) {
      return errorResponse(`The two files together must be under ${RECON_MAX_TOTAL_MB} MB.`, 413, 'FILE_TOO_LARGE');
    }

    const rawTolerance = form.get('date_tolerance_days');
    const tolerance = typeof rawTolerance === 'string' && rawTolerance.trim() !== '' ? Number(rawTolerance) : 2;
    if (!Number.isInteger(tolerance) || tolerance < 0 || tolerance > 31) {
      return errorResponse('Date tolerance must be a whole number of days from 0 to 31.', 422, 'INVALID_TOLERANCE');
    }
    const descriptionMatching = form.get('description_matching') !== 'false';

    const [bankPages, ledgerPages] = await Promise.all([countBillablePages(bankFile), countBillablePages(ledgerFile)]);
    const pages = bankPages + ledgerPages;

    if (!userEmail && pages > GUEST_MAX_PAGES) {
      return errorResponse(
        `These files have ${pages} pages in total. Guests can reconcile up to ${GUEST_MAX_PAGES} pages; sign in free to reconcile longer documents.`,
        403,
        'LOGIN_REQUIRED',
        { pages, maxGuestPages: GUEST_MAX_PAGES }
      );
    }

    if (userEmail) {
      const quota = await getUserQuota(userEmail);
      if (pages > quota.freePagesRemaining) {
        return errorResponse(
          `This reconciliation needs ${pages} page credits, but your account has ${quota.freePagesRemaining} left.`,
          403,
          'QUOTA_EXCEEDED',
          { pages, freePagesRemaining: quota.freePagesRemaining }
        );
      }
    }

    // Our record decides access and payment, so don't start a run we couldn't record.
    if (!(await getDatabase())) {
      return errorResponse('Reconciliation is temporarily unavailable. Please try again in a few minutes.', 503, 'SERVICE_UNAVAILABLE');
    }

    let upload;
    try {
      upload = await uploadReconciliation(bankFile, ledgerFile, {
        dateToleranceDays: tolerance,
        descriptionMatching,
        userEmail,
        bankPassword: readPassword(form, 'bank_statement_password'),
        ledgerPassword: readPassword(form, 'business_ledger_password'),
      });
    } catch (err) {
      return passwordError(err) ?? reconServiceError(err, 'Failed to start the reconciliation.');
    }

    if (!userEmail && !upload.access_token) {
      return errorResponse('The reconciliation service did not return a guest access token.', 502);
    }

    const expiresAt = upload.access_expires_at
      ? new Date(upload.access_expires_at)
      : new Date(Date.now() + RECONCILIATION_GUEST_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const record = {
      reconciliation_id: upload.reconciliation_id,
      user_email: userEmail || 'guest',
      is_guest: !userEmail,
      ...(upload.access_token ? { access_token_hash: hashAccessToken(upload.access_token) } : {}),
      bank_filename: bankFile.name,
      ledger_filename: ledgerFile.name,
      bank_pages: bankPages,
      ledger_pages: ledgerPages,
      pages,
      is_paid: false,
      status: 'queued' as const,
      created_at: new Date(),
      ...(!userEmail ? { expires_at: expiresAt } : {}),
    };
    await createReconciliationRecord(record);

    return successResponse(
      {
        success: true,
        reconciliation_id: upload.reconciliation_id,
        status: upload.status,
        pages,
        locked: isReconciliationLocked(record),
        // Guests only: the browser keeps this and sends it as X-Reconciliation-Token.
        ...(upload.access_token ? { access_token: upload.access_token, access_expires_at: expiresAt.toISOString() } : {}),
      },
      202
    );
  } catch (err) {
    return errorResponse((err as Error)?.message || 'Failed to start the reconciliation.', 500);
  }
}
