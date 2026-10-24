import { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api-utils';
import { EinvoiceUnavailableError, callEinvoice, passThrough } from '@/lib/einvoice-api';

export const dynamic = 'force-dynamic';

const ARCHIVE_ID = /^ea_[A-Za-z0-9_]{1,100}$/;

/** GET /api/einvoice/archive/[id] — integrity check of an archived record (hashes + ledger chain). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ARCHIVE_ID.test(id)) return errorResponse('Invalid archive ID', 400, 'BAD_REQUEST');
  try {
    return passThrough(await callEinvoice(`/archive/${encodeURIComponent(id)}`));
  } catch (err) {
    if (err instanceof EinvoiceUnavailableError) {
      return errorResponse('E-invoice service unreachable', 502, 'SERVICE_UNAVAILABLE');
    }
    return errorResponse('Archive check failed', 500, 'INTERNAL_ERROR');
  }
}
