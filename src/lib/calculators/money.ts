/**
 * Shared money, number and input helpers for the calculators.
 *
 * Kept free of imports (and of `@/` aliases) so the modules under src/lib/calculators run
 * unchanged under `node --test` as well as in the Next bundle.
 */

export type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'EUR';

export interface CurrencyMeta {
  code: CurrencyCode;
  label: string;
  symbol: string;
  /** Locale used for digit grouping: en-IN gives 10,00,000; the others give 1,000,000. */
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  INR: { code: 'INR', label: 'Indian rupee (₹)', symbol: '₹', locale: 'en-IN' },
  USD: { code: 'USD', label: 'US dollar ($)', symbol: '$', locale: 'en-US' },
  GBP: { code: 'GBP', label: 'Pound sterling (£)', symbol: '£', locale: 'en-GB' },
  EUR: { code: 'EUR', label: 'Euro (€)', symbol: '€', locale: 'en-IE' },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export function isCurrencyCode(value: string): value is CurrencyCode {
  return value in CURRENCIES;
}

/**
 * Rounds half away from zero to `decimals` places. `toPrecision(15)` strips binary noise first,
 * so 1.005 rounds to 1.01 (plain Math.round(1.005 * 100) gives 1.00).
 */
export function roundTo(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** decimals;
  const scaled = Number((Math.abs(value) * factor).toPrecision(15));
  const rounded = (Math.sign(value) * Math.round(scaled)) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

export const round2 = (value: number) => roundTo(value, 2);

/** Converts an amount to integer minor units (cents, paise) for exact running totals. */
export function toMinor(value: number): number {
  return Math.round(Number((value * 100).toPrecision(15)));
}

export function fromMinor(minor: number): number {
  return minor / 100;
}

export interface FormatMoneyOptions {
  /** Fraction digits; defaults to 2. Use 0 for large headline figures. */
  decimals?: number;
  /** Prefix positive values with "+". */
  signed?: boolean;
  /** 1.2M / 12.5L style short form. */
  compact?: boolean;
}

export function formatMoney(value: number, currency: CurrencyCode, options: FormatMoneyOptions = {}): string {
  if (!Number.isFinite(value)) return '—';
  const meta = CURRENCIES[currency];
  const decimals = options.decimals ?? 2;
  const formatted = new Intl.NumberFormat(meta.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: options.compact ? 0 : decimals,
    maximumFractionDigits: options.compact ? 1 : decimals,
    notation: options.compact ? 'compact' : 'standard',
  }).format(Math.abs(value) < 0.005 && decimals === 2 ? 0 : value);
  // Typographic minus, matching the rest of the site's tables.
  const withMinus = formatted.replace('-', '−');
  return options.signed && value > 0 ? `+${withMinus}` : withMinus;
}

export function formatNumber(value: number, decimals = 2, locale = 'en-US'): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    .format(value)
    .replace('-', '−');
}

export function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '—';
  return `${formatNumber(value, decimals)}%`;
}

/** "1 year 4 months", "7 months", "3 years". */
export function formatMonths(totalMonths: number): string {
  const months = Math.max(0, Math.round(totalMonths));
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (rest || !years) parts.push(`${rest} ${rest === 1 ? 'month' : 'months'}`);
  return parts.join(' ');
}

/**
 * Parses what a person typed into a number field. Accepts grouping commas, spaces, currency
 * symbols and a leading minus; returns null for empty or unparseable input.
 */
export function parseNumberInput(raw: string | null | undefined): number | null {
  const cleaned = String(raw ?? '')
    .replace(/[\s,₹$£€%]/g, '')
    .replace(/[−–]/g, '-');
  if (cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.') return null;
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export interface NumberRules {
  label: string;
  min?: number;
  max?: number;
  /** min is exclusive: the value must be greater than `min` (e.g. a loan amount above 0). */
  minExclusive?: boolean;
  integer?: boolean;
  /** Empty input counts as this value instead of an error (optional fields). */
  emptyAs?: number;
}

export type Parsed = { value: number; error: null } | { value: null; error: string };

/** Validates one input; the message is shown under the field and read by screen readers. */
export function validateNumber(raw: string, rules: NumberRules): Parsed {
  const n = parseNumberInput(raw);
  if (n === null) {
    if (String(raw ?? '').trim() === '' && rules.emptyAs !== undefined) return { value: rules.emptyAs, error: null };
    return { value: null, error: String(raw ?? '').trim() === '' ? `Enter ${rules.label.toLowerCase()}.` : `${rules.label} must be a number.` };
  }
  if (rules.integer && !Number.isInteger(n)) return { value: null, error: `${rules.label} must be a whole number.` };
  if (rules.min !== undefined) {
    if (rules.minExclusive ? n <= rules.min : n < rules.min) {
      return { value: null, error: `${rules.label} must be ${rules.minExclusive ? 'more than' : 'at least'} ${formatNumber(rules.min, Number.isInteger(rules.min) ? 0 : 2)}.` };
    }
  }
  if (rules.max !== undefined && n > rules.max) {
    return { value: null, error: `${rules.label} must be at most ${formatNumber(rules.max, Number.isInteger(rules.max) ? 0 : 2)}.` };
  }
  return { value: n, error: null };
}

/** Builds CSV text (RFC 4180 quoting) for schedule downloads. */
export function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell);
          return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(','),
    )
    .join('\r\n');
}
