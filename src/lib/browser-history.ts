export interface BrowserHistoryItem {
  id: string;
  filename: string;
  document_type: string;
  pages: number;
  created_at: string;
  status: string;
  closing_balance?: number | null;
  currency?: string | null;
}

const STORAGE_KEY = 'finlyzer_browser_history';

export function getBrowserHistory(): BrowserHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to read browser history:', e);
    return [];
  }
}

export function saveToBrowserHistory(item: BrowserHistoryItem): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getBrowserHistory();
    // Remove if already exists with same id to push to top
    const filtered = history.filter((h) => h.id !== item.id);
    filtered.unshift(item);
    // Keep up to 50 recent documents in browser storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to save to browser history:', e);
  }
}

export function removeFromBrowserHistory(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getBrowserHistory();
    const filtered = history.filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Failed to remove from browser history:', e);
  }
}

export function clearBrowserHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear browser history:', e);
  }
}
