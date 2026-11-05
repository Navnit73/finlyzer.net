/**
 * Credit card interest and payoff maths for one card balance with no new purchases.
 *
 * Daily periodic rate (DPR) = APR ÷ day basis (365, or 360 for some issuers).
 * Interest for a billing cycle = balance × DPR × days in the cycle.
 * Each month: interest is added to the balance, then the payment is taken off.
 *
 * Simplifications, stated on the page: interest is charged on the balance at the start of the
 * cycle (real cards use the average daily balance and compound daily), there are no new
 * purchases, fees or promotional rates, and every payment arrives on time.
 *
 * Runs in integer minor units (cents/pence); each cycle's interest is rounded to the cent.
 */

import { fromMinor, toMinor } from './money.ts';

/** Stop simulating after 100 years of monthly payments. */
export const MAX_CARD_MONTHS = 1200;

export type DayBasis = 365 | 360;

export function dailyRate(aprPct: number, basis: DayBasis = 365): number {
  return aprPct / 100 / basis;
}

/** Interest rate for one billing cycle. */
export function cycleRate(aprPct: number, basis: DayBasis = 365, cycleDays = 30): number {
  return dailyRate(aprPct, basis) * cycleDays;
}

/** What the APR costs over a year once monthly interest is charged on interest (cycle compounding). */
export function effectiveAnnualRate(aprPct: number, basis: DayBasis = 365, cycleDays = 30): number {
  const r = cycleRate(aprPct, basis, cycleDays);
  return ((1 + r) ** (basis / cycleDays) - 1) * 100;
}

export interface MinimumRule {
  /** Percent of the statement balance (balance after this cycle's interest). */
  percent: number;
  /** The issuer's minimum dollar amount. */
  floor: number;
  /** Add this cycle's interest on top of the percentage ("1% plus interest"). */
  plusInterest: boolean;
}

/** Minimum payment due, in minor units, for a statement with `balance` (after interest) and `interest` charged. */
export function minimumDue(statementMinor: number, interestMinor: number, rule: MinimumRule): number {
  const percentPart = Math.round((statementMinor * rule.percent) / 100);
  const base = percentPart + (rule.plusInterest ? interestMinor : 0);
  return Math.min(statementMinor, Math.max(base, toMinor(rule.floor)));
}

export type PaymentPlan = { type: 'fixed'; amount: number } | { type: 'minimum'; rule: MinimumRule };

export interface CardRow {
  month: number;
  opening: number;
  interest: number;
  payment: number;
  closing: number;
}

export interface CardResult {
  rows: CardRow[];
  months: number;
  totalInterest: number;
  totalPaid: number;
  /** False when the balance is not cleared within MAX_CARD_MONTHS (or ever). */
  repaid: boolean;
  /** False when the first payment does not even cover the first cycle's interest. */
  coversInterest: boolean;
  firstInterest: number;
}

export interface CardInput {
  balance: number;
  aprPct: number;
  basis?: DayBasis;
  cycleDays?: number;
  plan: PaymentPlan;
  /** Introductory rate for the first `months` billing cycles (e.g. a 0% balance transfer). */
  promo?: { aprPct: number; months: number };
}

export function simulateCard(input: CardInput): CardResult {
  const standard = cycleRate(input.aprPct, input.basis ?? 365, input.cycleDays ?? 30);
  const promoRate = input.promo ? cycleRate(input.promo.aprPct, input.basis ?? 365, input.cycleDays ?? 30) : standard;
  const promoMonths = input.promo ? Math.max(0, Math.floor(input.promo.months)) : 0;
  const rateFor = (month: number) => (month <= promoMonths ? promoRate : standard);
  let balance = toMinor(Math.max(0, input.balance));
  const rows: CardRow[] = [];
  let interestTotal = 0;
  let paidTotal = 0;
  const firstInterest = Math.round(balance * rateFor(1));

  if (input.plan.type === 'fixed' && balance > 0 && toMinor(input.plan.amount) <= firstInterest) {
    return { rows: [], months: 0, totalInterest: 0, totalPaid: 0, repaid: false, coversInterest: false, firstInterest: fromMinor(firstInterest) };
  }

  for (let month = 1; balance > 0 && month <= MAX_CARD_MONTHS; month++) {
    const opening = balance;
    const interest = Math.round(opening * rateFor(month));
    const statement = opening + interest;
    const payment =
      input.plan.type === 'fixed' ? Math.min(toMinor(input.plan.amount), statement) : minimumDue(statement, interest, input.plan.rule);
    balance = statement - payment;
    interestTotal += interest;
    paidTotal += payment;
    rows.push({ month, opening: fromMinor(opening), interest: fromMinor(interest), payment: fromMinor(payment), closing: fromMinor(balance) });
    // A minimum that never gets ahead of the interest would loop to the cap; stop as soon as the balance is not
    // falling (only once any promotional rate is over, since a payment can beat 0% and then fall behind).
    if (payment <= interest && balance >= opening && month > promoMonths) break;
  }

  return {
    rows,
    months: rows.length,
    totalInterest: fromMinor(interestTotal),
    totalPaid: fromMinor(paidTotal),
    repaid: balance === 0,
    coversInterest: rows.length > 0 ? rows[0].payment > rows[0].interest : balance === 0,
    firstInterest: fromMinor(firstInterest),
  };
}

/**
 * Smallest fixed monthly payment (rounded up to the cent) that clears the balance within `months`.
 * Closed form P = B × r ÷ (1 − (1 + r)^−n), then rounded up so cent rounding can't add a month.
 */
export function paymentToClearIn(balance: number, aprPct: number, months: number, basis: DayBasis = 365, cycleDays = 30): number {
  if (balance <= 0 || months <= 0) return 0;
  const r = cycleRate(aprPct, basis, cycleDays);
  const exact = r === 0 ? balance / months : (balance * r) / (1 - (1 + r) ** -months);
  let cents = Math.ceil(Number((exact * 100).toPrecision(15)));
  // Guard against a rounding edge leaving one extra cycle.
  while (simulateCard({ balance, aprPct, basis, cycleDays, plan: { type: 'fixed', amount: cents / 100 } }).months > months) cents += 1;
  return cents / 100;
}

export interface BalanceTransferInput {
  balance: number;
  /** Fixed monthly payment, the same one compared on the current card. */
  payment: number;
  /** Transfer fee as a percentage of the amount moved; added to the new balance. */
  feePct: number;
  promoAprPct: number;
  promoMonths: number;
  /** APR once the promotion ends. */
  aprAfterPct: number;
  basis?: DayBasis;
  cycleDays?: number;
}

export interface BalanceTransferResult extends CardResult {
  fee: number;
  /** Interest plus the transfer fee: what the transfer route costs. */
  totalCost: number;
  /** Balance still owed when the promotional rate ends (0 if cleared before). */
  balanceAtPromoEnd: number;
}

/** Moves the balance to a promotional rate: fee added to the balance, promo rate, then the go-to APR. */
export function simulateBalanceTransfer(input: BalanceTransferInput): BalanceTransferResult {
  const feeMinor = Math.round(toMinor(input.balance) * Math.max(0, input.feePct) / 100);
  const result = simulateCard({
    balance: fromMinor(toMinor(input.balance) + feeMinor),
    aprPct: input.aprAfterPct,
    basis: input.basis,
    cycleDays: input.cycleDays,
    plan: { type: 'fixed', amount: input.payment },
    promo: { aprPct: input.promoAprPct, months: input.promoMonths },
  });
  const promoRow = result.rows[Math.min(result.rows.length, Math.floor(input.promoMonths)) - 1];
  return {
    ...result,
    fee: fromMinor(feeMinor),
    totalCost: fromMinor(toMinor(result.totalInterest) + feeMinor),
    balanceAtPromoEnd: input.promoMonths <= 0 ? fromMinor(toMinor(input.balance) + feeMinor) : promoRow ? promoRow.closing : 0,
  };
}
