/**
 * Centralized Financial & Currency Formatting Utilities (USD-First)
 */

/**
 * Format a number as USD Currency ($XX.XX or $XX)
 */
export function formatUSD(
  amount: number | string | null | undefined,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showCents?: boolean;
    compact?: boolean;
  } = {}
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '$0.00';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (options.compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  }

  const minDecimals = options.minimumFractionDigits ?? (options.showCents === false ? 0 : 2);
  const maxDecimals = options.maximumFractionDigits ?? (options.showCents === false ? 0 : 2);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(num);
}

/**
 * Format numeric quantity with commas (e.g. 1,600)
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format date nicely (e.g. "Feb 15, 2026")
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateString);
  }
}
