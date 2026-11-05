/**
 * Simple interest: SI = P × R × T ÷ 100, with R the annual rate in percent and T the time in years.
 * Rearranged:  P = 100·SI ÷ (R·T),  R = 100·SI ÷ (P·T),  T = 100·SI ÷ (P·R).
 * Amount A = P + SI.
 *
 * Time given in days is converted with a day-count basis: days ÷ 365 (Actual/365) or
 * days ÷ 360 (Actual/360, common for short-term commercial lending).
 */

export type SolveFor = 'interest' | 'principal' | 'rate' | 'time';
export type DayBasis = 365 | 360;

export interface SimpleInterestInput {
  solveFor: SolveFor;
  /** Values for the three known quantities; the one being solved for is ignored. */
  principal?: number;
  ratePct?: number;
  years?: number;
  interest?: number;
}

export type SimpleInterestResult =
  | { ok: true; principal: number; ratePct: number; years: number; interest: number; amount: number }
  | { ok: false; error: string };

export function solveSimpleInterest(input: SimpleInterestInput): SimpleInterestResult {
  const { solveFor } = input;
  let P = input.principal ?? NaN;
  let R = input.ratePct ?? NaN;
  let T = input.years ?? NaN;
  let SI = input.interest ?? NaN;

  switch (solveFor) {
    case 'interest':
      SI = (P * R * T) / 100;
      break;
    case 'principal':
      if (R * T === 0) return { ok: false, error: 'Rate and time must both be above zero to find the principal.' };
      P = (100 * SI) / (R * T);
      break;
    case 'rate':
      if (P * T === 0) return { ok: false, error: 'Principal and time must both be above zero to find the rate.' };
      R = (100 * SI) / (P * T);
      break;
    case 'time':
      if (P * R === 0) return { ok: false, error: 'Principal and rate must both be above zero to find the time.' };
      T = (100 * SI) / (P * R);
      break;
  }

  if (![P, R, T, SI].every(Number.isFinite)) return { ok: false, error: 'Enter the three known values.' };
  return { ok: true, principal: P, ratePct: R, years: T, interest: SI, amount: P + SI };
}

/** Converts a period to years. */
export function toYears(value: number, unit: 'years' | 'months' | 'days', basis: DayBasis = 365): number {
  if (unit === 'years') return value;
  if (unit === 'months') return value / 12;
  return value / basis;
}

/** Whole days from start to end (end exclusive), from yyyy-mm-dd strings; null if either is invalid. */
export function daysBetween(start: string, end: string): number | null {
  const parse = (s: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return null;
    const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const d = new Date(t);
    // Reject 2026-02-30 and similar rollovers.
    return d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]) ? t : null;
  };
  const a = parse(start);
  const b = parse(end);
  if (a === null || b === null) return null;
  return Math.round((b - a) / 86_400_000);
}

/** Interest on the same P, R, T with annual compounding, for the comparison note. */
export function annualCompoundInterest(principal: number, ratePct: number, years: number): number {
  return principal * ((1 + ratePct / 100) ** years - 1);
}

export type RatePeriod = 'year' | 'month';

/** Converts a rate quoted per month (e.g. 2% a month) to the annual rate the formula uses. */
export function annualRatePct(rate: number, period: RatePeriod): number {
  return period === 'month' ? rate * 12 : rate;
}

/** Simple interest earned per year, per month and per day (day = year ÷ basis). */
export function interestPerPeriod(principal: number, ratePctAnnual: number, basis: DayBasis = 365) {
  const perYear = (principal * ratePctAnnual) / 100;
  return { perYear, perMonth: perYear / 12, perDay: perYear / basis };
}

export interface SimpleYearRow {
  /** Year number; the last row can be a part year. */
  year: number;
  /** Fraction of a year covered by the row (1 except possibly the last). */
  fraction: number;
  interest: number;
  totalInterest: number;
  balance: number;
}

/** Year-by-year growth under simple interest: the same interest every full year, on the principal only. */
export function simpleSchedule(principal: number, ratePctAnnual: number, years: number): SimpleYearRow[] {
  const rows: SimpleYearRow[] = [];
  const perYear = (principal * ratePctAnnual) / 100;
  let elapsed = 0;
  for (let year = 1; elapsed < years - 1e-9 && year <= 200; year++) {
    const fraction = Math.min(1, years - elapsed);
    elapsed += fraction;
    const totalInterest = perYear * elapsed;
    rows.push({ year, fraction, interest: perYear * fraction, totalInterest, balance: principal + totalInterest });
  }
  return rows;
}
