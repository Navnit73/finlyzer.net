/**
 * Browser helpers for /api/reconciliation. A guest's access token is kept in localStorage (so the
 * results link also works in a new tab) and sent as X-Reconciliation-Token; signed-in users are
 * identified by their session cookie instead.
 */

const tokenKey = (id: string) => `rec-token:${id}`;

export function saveReconciliationToken(id: string, token: string) {
  try {
    localStorage.setItem(tokenKey(id), token);
  } catch {}
}

export function reconciliationHeaders(id: string): HeadersInit {
  try {
    const token = localStorage.getItem(tokenKey(id));
    return token ? { 'X-Reconciliation-Token': token } : {};
  } catch {
    return {};
  }
}

/** Downloads the report with fetch (the token must travel in a header, not the URL). */
export async function downloadReconciliationReport(id: string, format: 'xlsx' | 'csv') {
  const res = await fetch(`/api/reconciliation/${id}/export?format=${format}`, { headers: reconciliationHeaders(id) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Download failed. Please try again.');
  }
  const url = URL.createObjectURL(await res.blob());
  const link = Object.assign(document.createElement('a'), { href: url, download: `${id}-reconciliation.${format}` });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
