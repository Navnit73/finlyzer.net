/**
 * Side-by-side loan offers with fees, and an APR that includes those fees.
 *
 * Scheduled payment and interest come from the shared amortization engine (loan.ts).
 * The fee-inclusive APR is the rate i (per month) at which the cash you actually receive equals
 * the present value of everything you pay back:
 *
 *   cash received = Σ (payment_t + monthly fee) ÷ (1 + i)^t,   t = 1…n
 *
 * solved by bisection. APR = 12 × i (the US Regulation Z / nominal convention); the effective
 * annual rate (1 + i)^12 − 1 is also returned, which is how EU APRC figures are expressed.
 */

import { amortize } from './loan.ts';
import { fromMinor, toMinor } from './money.ts';

export type FeeHandling = 'deducted' | 'financed';

export interface Offer {
  amount: number;
  aprPct: number;
  months: number;
  upfrontFee: number;
  monthlyFee: number;
  /** deducted: paid from the loan or out of pocket at the start; financed: added to the loan balance. */
  feeHandling: FeeHandling;
}

export interface OfferResult {
  /** Balance the interest is charged on. */
  principal: number;
  /** Cash the borrower actually gets to use. */
  cashReceived: number;
  payment: number;
  /** Payment plus any monthly fee. */
  monthlyOutgoing: number;
  totalInterest: number;
  totalFees: number;
  /** Everything paid back over the life of the loan, plus a deducted upfront fee. */
  totalRepaid: number;
  /** Interest + all fees: what the money costs. */
  totalCost: number;
  /** Fee-inclusive APR, nominal (12 × monthly rate), in percent. */
  aprWithFees: number;
  /** Fee-inclusive effective annual rate, in percent. */
  effectiveAnnualRate: number;
}

/** Monthly rate i with Σ cashflows_t / (1+i)^t = presentValue. Cash flows are paid at the end of months 1…n. */
export function solveMonthlyRate(presentValue: number, cashflows: number[]): number {
  const pv = (i: number) => cashflows.reduce((t, cf, k) => t + cf / (1 + i) ** (k + 1), 0);
  if (presentValue <= 0) return NaN;
  if (pv(0) <= presentValue) return 0;
  let lo = 0;
  let hi = 1;
  while (pv(hi) > presentValue && hi < 1e6) hi *= 2;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (pv(mid) > presentValue) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-14) break;
  }
  return (lo + hi) / 2;
}

export function evaluateOffer(offer: Offer): OfferResult {
  const financed = offer.feeHandling === 'financed';
  const principal = fromMinor(toMinor(offer.amount) + (financed ? toMinor(offer.upfrontFee) : 0));
  const cashReceived = financed ? offer.amount : fromMinor(toMinor(offer.amount) - toMinor(offer.upfrontFee));
  const schedule = amortize({ principal, annualRatePct: offer.aprPct, months: offer.months });
  const monthlyFee = Math.max(0, offer.monthlyFee);
  const cashflows = schedule.rows.map((r) => r.payment + monthlyFee);
  const totalFeesMinor = toMinor(offer.upfrontFee) + toMinor(monthlyFee) * schedule.rows.length;
  const totalRepaidMinor = cashflows.reduce((t, cf) => t + toMinor(cf), 0) + (financed ? 0 : toMinor(offer.upfrontFee));
  const i = solveMonthlyRate(cashReceived, cashflows);

  return {
    principal,
    cashReceived,
    payment: schedule.payment,
    monthlyOutgoing: fromMinor(toMinor(schedule.payment) + toMinor(monthlyFee)),
    totalInterest: schedule.totalInterest,
    totalFees: fromMinor(totalFeesMinor),
    totalRepaid: fromMinor(totalRepaidMinor),
    totalCost: fromMinor(totalRepaidMinor - toMinor(offer.amount)),
    aprWithFees: i * 12 * 100,
    effectiveAnnualRate: ((1 + i) ** 12 - 1) * 100,
  };
}

/**
 * What the loan has cost if it is repaid in full after `m` payments, for m = 0…n:
 *
 *   cost(m) = payments and monthly fees made so far + balance still owed − cash received
 *
 * cost(0) is the upfront fee (paid, or owed on top of the cash received) and cost(n) is the total
 * cost. Assumes no early repayment charge, so it shows when a fee-heavy, low-rate loan starts to
 * pay off against a no-fee loan.
 */
export function earlyRepaymentCost(offer: Offer): number[] {
  const financed = offer.feeHandling === 'financed';
  const principalMinor = toMinor(offer.amount) + (financed ? toMinor(offer.upfrontFee) : 0);
  const cashMinor = financed ? toMinor(offer.amount) : toMinor(offer.amount) - toMinor(offer.upfrontFee);
  const schedule = amortize({ principal: fromMinor(principalMinor), annualRatePct: offer.aprPct, months: offer.months });
  const feeMinor = toMinor(Math.max(0, offer.monthlyFee));
  const costs = [fromMinor(principalMinor - cashMinor)];
  let paidMinor = 0;
  for (const row of schedule.rows) {
    paidMinor += toMinor(row.payment) + feeMinor;
    costs.push(fromMinor(paidMinor + toMinor(row.closing) - cashMinor));
  }
  return costs;
}

/**
 * First month m (1…) from which offer A has cost no more than offer B if repaid at m, staying that way
 * up to the end of the shorter loan. Null when A never catches up, 0 when A is never more expensive.
 */
export function breakEvenMonth(costA: number[], costB: number[]): number | null {
  const last = Math.min(costA.length, costB.length) - 1;
  let since: number | null = null;
  for (let m = 0; m <= last; m++) {
    if (costA[m] <= costB[m] + 0.005) since ??= m;
    else since = null;
  }
  return since;
}
