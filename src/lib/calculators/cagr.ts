/**
 * Compound annual growth rate.
 *
 *   CAGR = (end ÷ start)^(1 ÷ years) − 1
 *   end  = start × (1 + CAGR)^years
 *
 * CAGR only looks at the first and last value. It is undefined when the start value is zero or
 * negative, or when the end value is negative (no real root); an end value of exactly zero is
 * a −100% CAGR.
 *
 * Periods given as two dates count actual days ÷ 365, the same day basis as Excel's XIRR.
 */

export const DAYS_PER_YEAR = 365;

export type CagrError = 'start-not-positive' | 'end-negative' | 'period-not-positive';

export type CagrResult = { ok: true; rate: number } | { ok: false; error: CagrError };

/** CAGR as a fraction (0.1247 = 12.47%). */
export function cagr(start: number, end: number, years: number): CagrResult {
  if (!(start > 0)) return { ok: false, error: 'start-not-positive' };
  if (end < 0) return { ok: false, error: 'end-negative' };
  if (!(years > 0)) return { ok: false, error: 'period-not-positive' };
  if (end === 0) return { ok: true, rate: -1 };
  return { ok: true, rate: (end / start) ** (1 / years) - 1 };
}

/** Value after `years` of growth at `ratePct` a year, compounded annually. */
export function growAtCagr(start: number, ratePct: number, years: number): number {
  return start * (1 + ratePct / 100) ** years;
}

/** Total change as a fraction: (end − start) ÷ start. */
export function absoluteReturn(start: number, end: number): number {
  return start === 0 ? NaN : (end - start) / start;
}

/** Years from one ISO date (yyyy-mm-dd) to another, actual days ÷ 365. NaN for invalid dates. */
export function yearsBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  return (b - a) / 86_400_000 / DAYS_PER_YEAR;
}

/** Exact doubling time in years at a growth rate (fraction); Infinity when not growing. */
export function doublingYears(rate: number): number {
  return rate > 0 ? Math.log(2) / Math.log(1 + rate) : Infinity;
}

/** Rule-of-72 estimate of doubling time in years. */
export function ruleOf72(rate: number): number {
  return rate > 0 ? 72 / (rate * 100) : Infinity;
}

export interface CagrPathRow {
  year: number;
  value: number;
}

/** Value at the end of each whole year growing at a constant rate (what the CAGR implies). */
export function cagrPath(start: number, rate: number, years: number): CagrPathRow[] {
  const whole = Math.floor(years + 1e-9);
  const rows: CagrPathRow[] = [];
  for (let year = 1; year <= whole; year++) rows.push({ year, value: start * (1 + rate) ** year });
  return rows;
}

/** Years for `start` to reach `end` growing at `ratePct` a year. null when it never gets there. */
export function yearsToReach(start: number, end: number, ratePct: number): number | null {
  const r = ratePct / 100;
  if (!(start > 0) || !(end > 0) || r <= -1) return null;
  if (end === start) return 0;
  if (r === 0) return null;
  const n = Math.log(end / start) / Math.log1p(r);
  return n > 0 ? n : null;
}

/** Inflation-adjusted (real) growth rate as a fraction: (1 + nominal) ÷ (1 + inflation) − 1. */
export function realRate(nominal: number, inflationPct: number): number {
  return (1 + nominal) / (1 + inflationPct / 100) - 1;
}

/** Excel / Google Sheets formulas that reproduce a CAGR, with the numbers filled in. */
export function spreadsheetFormulas(start: number, end: number, years: number): { manual: string; rri: string } {
  const n = (v: number) => String(Number(v.toPrecision(10)));
  return { manual: `=(${n(end)}/${n(start)})^(1/${n(years)})-1`, rri: `=RRI(${n(years)},${n(start)},${n(end)})` };
}
