import { EINVOICE_MAX_UPLOAD_BYTES, PDF_TEMPLATES } from '@/lib/einvoice';

/**
 * Server-side client for the backend's German e-invoicing API (ZUGFeRD / XRechnung). It lives at
 * /api/einvoice on the same host as the OCR API, outside its /api/v1 prefix. The API key stays on the
 * server; the browser only talks to our /api/einvoice/* proxy routes.
 */

const API_BASE_URL = process.env.OCR_API_BASE_URL || 'http://localhost:8000/api/v1';
const API_KEY = process.env.OCR_API_KEY || 'ocr_dev_key_secret_2026';
const EINVOICE_URL = `${API_BASE_URL.replace(/\/api\/v1\/?$/, '')}/api/einvoice`;

/** POST endpoints the proxy forwards, with the `output` values each accepts. */
export const EINVOICE_ACTIONS: Record<string, readonly string[]> = {
  'create-zugferd': ['pdf', 'json'],
  'create-xrechnung': ['xml', 'json'],
  extract: [],
  validate: [],
  convert: [],
};

/** Endpoints that render a visual PDF, with the `template` values each accepts. */
export const EINVOICE_TEMPLATES: Record<string, readonly string[]> = {
  'create-zugferd': PDF_TEMPLATES,
  convert: PDF_TEMPLATES,
};

/** Same cap as the backend's pre-parse check: a PDF plus a JSON file part plus multipart overhead. */
export const EINVOICE_MAX_REQUEST_BYTES = 2 * EINVOICE_MAX_UPLOAD_BYTES + 1024 * 1024;

/** Response headers worth passing to the browser (file name and the validation summary). */
const FORWARDED_HEADERS = [
  'content-type',
  'content-disposition',
  'x-validation-valid',
  'x-validation-warnings',
  'x-einvoice-profile',
  'x-content-sha256',
  'x-archive-id',
];

export class EinvoiceUnavailableError extends Error {}

export async function callEinvoice(path: string, init: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(`${EINVOICE_URL}${path}`, {
      ...init,
      headers: { ...(init.headers as Record<string, string>), 'X-API-Key': API_KEY },
      cache: 'no-store',
    });
  } catch (err) {
    throw new EinvoiceUnavailableError((err as Error)?.message || 'E-invoice service unreachable');
  }
}

/** Streams the backend response through, keeping its status and only the whitelisted headers. */
export function passThrough(res: Response): Response {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  for (const name of FORWARDED_HEADERS) {
    const value = res.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(res.body, { status: res.status, headers });
}
