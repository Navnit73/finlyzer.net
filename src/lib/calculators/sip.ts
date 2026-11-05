/**
 * SIP (systematic investment plan) projection.
 *
 * Each instalment is invested at the start of the month and grows at a constant monthly rate i
 * until the end of the term (an annuity due):
 *
 *   FV = P × ((1 + i)^n − 1) / i × (1 + i)
 *
 * Indian AMC calculators convert the annual return to i in one of two ways, so both are offered:
 *   - 'simple':    i = annual ÷ 12              (Axis MF's calculator)
 *   - 'effective': i = (1 + annual)^(1/12) − 1  (HDFC MF's calculator; the annual figure is then an
 *                  effective annual return, so this gives a lower result)
 *
 * A step-up raises the monthly amount by a fixed percentage at the start of each new year. There
 * is no tidy closed form for that, so the projection runs month by month; with no step-up it
 * equals the closed form above.
 *
 * The result is a projection at an assumed constant return, not a forecast: fund returns vary.
 */

import { fromMinor, round2, toMinor } from './money.ts';

export type RateConvention = 'simple' | 'effective';

export function sipMonthlyRate(annualRatePct: number, convention: RateConvention = 'simple'): number {
  const r = annualRatePct / 100;
  return convention === 'simple' ? r / 12 : (1 + r) ** (1 / 12) - 1;
}

/** Closed-form maturity value of a level SIP (no step-up). Unrounded. */
export function sipFutureValue(monthly: number, annualRatePct: number, months: number, convention: RateConvention = 'simple'): number {
  if (monthly <= 0 || months <= 0) return 0;
  const i = sipMonthlyRate(annualRatePct, convention);
  if (i === 0) return monthly * months;
  return monthly * (((1 + i) ** months - 1) / i) * (1 + i);
}

export interface SipInput {
  monthly: number;
  annualRatePct: number;
  years: number;
  /** Yearly increase in the monthly amount, in percent. 0 for a level SIP. */
  stepUpPct?: number;
  convention?: RateConvention;
}

export interface SipYearRow {
  year: number;
  /** Monthly instalment during this year. */
  monthlyAmount: number;
  /** Paid in during this year. */
  investedInYear: number;
  totalInvested: number;
  /** Projected value at the end of the year. */
  value: number;
  /** value − totalInvested */
  gains: number;
}

export interface SipResult {
  invested: number;
  value: number;
  gains: number;
  rows: SipYearRow[];
}

export function projectSip(input: SipInput): SipResult {
  const i = sipMonthlyRate(input.annualRatePct, input.convention ?? 'simple');
  const step = (input.stepUpPct ?? 0) / 100;
  const years = Math.max(0, Math.floor(input.years));
  const rows: SipYearRow[] = [];
  let value = 0;
  let investedMinor = 0;

  for (let year = 1; year <= years; year++) {
    // Instalment for the year, rounded to the paisa/cent as a mandate amount would be.
    const amount = round2(input.monthly * (1 + step) ** (year - 1));
    const amountMinor = toMinor(amount);
    for (let m = 0; m < 12; m++) {
      value = (value + amount) * (1 + i);
      investedMinor += amountMinor;
    }
    const totalInvested = fromMinor(investedMinor);
    rows.push({
      year,
      monthlyAmount: amount,
      investedInYear: fromMinor(amountMinor * 12),
      totalInvested,
      value: round2(value),
      gains: round2(value - totalInvested),
    });
  }

  const invested = fromMinor(investedMinor);
  return { invested, value: round2(value), gains: round2(value - invested), rows };
}

/**
 * Value at maturity of ₹1 a month in the first year, stepped up each year, without rounding the
 * instalments. A SIP's value is proportional to its starting amount, so dividing a target by this
 * gives the monthly SIP needed for the target.
 */
export function sipValuePerUnit(annualRatePct: number, years: number, stepUpPct = 0, convention: RateConvention = 'simple'): number {
  const i = sipMonthlyRate(annualRatePct, convention);
  const step = stepUpPct / 100;
  let value = 0;
  for (let year = 1; year <= Math.floor(years); year++) {
    const amount = (1 + step) ** (year - 1);
    for (let m = 0; m < 12; m++) value = (value + amount) * (1 + i);
  }
  return value;
}

/**
 * Starting monthly SIP needed to reach `target` after `years`, rounded up to the next whole unit
 * (rupee, dollar) so the projected value is never below the target. Infinity when no SIP can.
 */
export function requiredMonthlySip(target: number, annualRatePct: number, years: number, stepUpPct = 0, convention: RateConvention = 'simple'): number {
  if (target <= 0) return 0;
  const perUnit = sipValuePerUnit(annualRatePct, years, stepUpPct, convention);
  if (perUnit <= 0) return Infinity;
  return Math.ceil(Number((target / perUnit).toPrecision(12)));
}

/**
 * A single amount invested at the start and left for `years`, compounding at the same monthly
 * rate as the SIP, so the two are compared on the same assumption.
 */
export function lumpsumValue(amount: number, annualRatePct: number, years: number, convention: RateConvention = 'simple'): number {
  if (amount <= 0 || years <= 0) return Math.max(0, amount);
  return round2(amount * (1 + sipMonthlyRate(annualRatePct, convention)) ** (12 * years));
}

/** What a future amount is worth in today's money: amount ÷ (1 + inflation)^years. */
export function inTodaysMoney(amount: number, inflationPct: number, years: number): number {
  return round2(amount / (1 + inflationPct / 100) ** years);
}

/** A goal stated in today's money, grown by inflation to the amount needed in `years`. */
export function inflateGoal(amountToday: number, inflationPct: number, years: number): number {
  return round2(amountToday * (1 + inflationPct / 100) ** years);
}
