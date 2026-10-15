/**
 * Upload rules for bank reconciliation, shared by the browser uploader and the upload API so
 * the two can't drift apart. Safe to import from client components.
 */

export const RECON_STATEMENT_EXTS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff'];
export const RECON_SPREADSHEET_EXTS = ['.csv', '.xlsx'];
export const RECON_ALLOWED_EXTS = [...RECON_STATEMENT_EXTS, ...RECON_SPREADSHEET_EXTS];

/**
 * Both files travel in one request, and nginx allows 50 MB per request (client_max_body_size in
 * DEPLOYMENT_GUIDE.md), so the limit is on the two files together, with room for form overhead.
 */
export const RECON_MAX_TOTAL_MB = 48;

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

/** Returns a user-facing error for an unsupported file, or null when the type is accepted. */
export function unsupportedFileMessage(name: string, label: string): string | null {
  const ext = fileExtension(name);
  if (ext === '.xls') return `${label}: legacy .xls files are not supported. Save it as .xlsx or .csv and upload it again.`;
  if (!RECON_ALLOWED_EXTS.includes(ext)) {
    return `${label}: unsupported file type. Upload a PDF, image (PNG, JPG, WEBP, TIFF), CSV or XLSX file.`;
  }
  return null;
}
