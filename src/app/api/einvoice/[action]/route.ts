import { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api-utils';
import {
  EINVOICE_ACTIONS,
  EINVOICE_MAX_REQUEST_BYTES,
  EINVOICE_TEMPLATES,
  EinvoiceUnavailableError,
  callEinvoice,
  passThrough,
} from '@/lib/einvoice-api';

export const dynamic = 'force-dynamic';

/**
 * POST /api/einvoice/{create-zugferd|create-xrechnung|extract|validate|convert}
 * Forwards the body (and the allowed `output` / `template` query values) unchanged to the backend with our API key; the backend does all file-type, size
 * and invoice validation, so its status codes and error bodies are passed straight back.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const outputs = EINVOICE_ACTIONS[action];
  if (!outputs) return errorResponse('Unknown e-invoice action', 404, 'NOT_FOUND');

  const length = Number(req.headers.get('content-length') || 0);
  if (length > EINVOICE_MAX_REQUEST_BYTES) {
    return errorResponse('Request body too large', 413, 'FILE_TOO_LARGE');
  }
  const contentType = req.headers.get('content-type');
  if (!contentType) return errorResponse('Missing Content-Type', 400, 'BAD_REQUEST');

  const search = req.nextUrl.searchParams;
  const forward = new URLSearchParams();
  const output = search.get('output');
  if (output && outputs.includes(output)) forward.set('output', output);
  const template = search.get('template');
  if (template && EINVOICE_TEMPLATES[action]?.includes(template)) forward.set('template', template);
  const query = forward.toString() ? `?${forward}` : '';

  try {
    const body = await req.arrayBuffer();
    if (body.byteLength > EINVOICE_MAX_REQUEST_BYTES) {
      return errorResponse('Request body too large', 413, 'FILE_TOO_LARGE');
    }
    const res = await callEinvoice(`/${action}${query}`, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body,
    });
    return passThrough(res);
  } catch (err) {
    if (err instanceof EinvoiceUnavailableError) {
      return errorResponse('E-invoice service unreachable', 502, 'SERVICE_UNAVAILABLE');
    }
    console.error('E-invoice proxy error:', (err as Error)?.message);
    return errorResponse('E-invoice request failed', 500, 'INTERNAL_ERROR');
  }
}
