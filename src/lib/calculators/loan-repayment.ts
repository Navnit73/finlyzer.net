/**
 * Loan repayment scenarios on top of the shared amortization engine:
 * - overpayments (regular extra, yearly and one-off lump sums) compared with the contractual
 *   schedule, either shortening the term or lowering the monthly repayment;
 * - time to repay a loan with a payment the borrower chooses;
 * - the payment needed to clear a loan by a target date;
 * - calendar payoff dates from the month of the first payment.
 */

import { MAX_SCHEDULE_MONTHS, amortize, monthlyRate, monthsToRepay, type AmortizeResult, type LumpSum } from './loan.ts';
import { fromMinor, toMinor } from './money.ts';

export interface OverpaymentInput {
  principal: number;
  annualRatePct: number;
  months: number;
  extraMonthly: number;
  lumpSums: LumpSum[];
}

export interface OverpaymentResult {
  baseline: AmortizeResult;
  withOverpayments: AmortizeResult;
  monthsSaved: number;
  interestSaved: number;
  totalOverpaid: number;
}

export function compareOverpayments(input: OverpaymentInput): OverpaymentResult {
  const baseline = amortize({ principal: input.principal, annualRatePct: input.annualRatePct, months: input.months });
  const withOverpayments = amortize({
    principal: input.principal,
    annualRatePct: input.annualRatePct,
    months: input.months,
    extraMonthly: input.extraMonthly,
    lumpSums: input.lumpSums,
  });
  const totalOverpaid = fromMinor(withOverpayments.rows.reduce((t, r) => t + toMinor(r.extra), 0));
  return {
    baseline,
    withOverpayments,
    monthsSaved: baseline.monthsTaken - withOverpayments.monthsTaken,
    interestSaved: fromMinor(toMinor(baseline.totalInterest) - toMinor(withOverpayments.totalInterest)),
    totalOverpaid,
  };
}

export type RepayByPaymentResult =
  | { ok: true; schedule: AmortizeResult; months: number }
  | { ok: false; reason: 'payment-too-low' | 'too-long'; firstMonthInterest: number };

/** Interest charged in the first month; a payment must be larger than this to reduce the balance. */
export function firstMonthInterest(principal: number, annualRatePct: number): number {
  return fromMinor(Math.round(toMinor(principal) * monthlyRate(annualRatePct)));
}

export function repayByPayment(principal: number, annualRatePct: number, payment: number): RepayByPaymentResult {
  const interest = firstMonthInterest(principal, annualRatePct);
  const n = monthsToRepay(principal, annualRatePct, payment);
  if (payment <= interest || !Number.isFinite(n)) {
    return { ok: false, reason: 'payment-too-low', firstMonthInterest: interest };
  }
  if (Math.ceil(n) > MAX_SCHEDULE_MONTHS) return { ok: false, reason: 'too-long', firstMonthInterest: interest };
  // `months` only matters when no payment is given; the chosen payment drives the schedule.
  const schedule = amortize({ principal, annualRatePct, months: 1, payment });
  if (schedule.negativeAmortization) return { ok: false, reason: 'payment-too-low', firstMonthInterest: interest };
  return { ok: true, schedule, months: schedule.monthsTaken };
}

/* ------------------------------------------------------------------ calendar */

/** A calendar month: `month` is 0 (January) to 11 (December). */
export interface MonthRef {
  year: number;
  month: number;
}

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** The calendar month of payment number `n` (1-based) when payment 1 is made in `start`. */
export function paymentMonth(start: MonthRef, n: number): MonthRef {
  const index = start.year * 12 + start.month + Math.max(1, n) - 1;
  return { year: Math.floor(index / 12), month: index % 12 };
}

export function formatMonthRef(m: MonthRef, short = false): string {
  const name = MONTH_NAMES[m.month];
  return `${short ? name.slice(0, 3) : name} ${m.year}`;
}

/* ------------------------------------------------------------------ overpayment options */

/** One-off overpayments of `amount` every 12 months, from `firstMonth` up to `lastMonth`. */
export function yearlyLumpSums(amount: number, lastMonth: number, firstMonth = 12): LumpSum[] {
  if (amount <= 0) return [];
  const sums: LumpSum[] = [];
  for (let m = firstMonth; m <= lastMonth; m += 12) sums.push({ month: m, amount });
  return sums;
}

export interface LowerPaymentResult {
  rows: AmortizeResult['rows'];
  /** The repayment in month 1, before any overpayment. */
  firstPayment: number;
  /** The regular repayment in force at the end of the loan, after the lender recalculates it. */
  finalRegularPayment: number;
  totalInterest: number;
  totalPaid: number;
  monthsTaken: number;
}

/**
 * One-off overpayments that keep the end date and lower the monthly repayment instead: after each
 * lump sum the lender recalculates the repayment over the months left. Regular monthly
 * overpayments still go straight to the balance and shorten the term (recalculating after every
 * one would shrink the repayment towards zero, which is not how lenders treat them).
 * Saves less interest than shortening the term, because the balance falls more slowly afterwards.
 */
export function overpayLowerPayment(input: OverpaymentInput): LowerPaymentResult {
  const r = monthlyRate(input.annualRatePct);
  const n = input.months;
  let balance = toMinor(input.principal);
  let regular = toMinor(monthlyPaymentFor(input.principal, input.annualRatePct, n));
  const firstPayment = fromMinor(regular);
  const extraMinor = toMinor(Math.max(0, input.extraMonthly));
  const lumps = new Map<number, number>();
  for (const l of input.lumpSums) if (l.amount > 0 && l.month >= 1) lumps.set(Math.floor(l.month), (lumps.get(Math.floor(l.month)) ?? 0) + toMinor(l.amount));

  const rows: AmortizeResult['rows'] = [];
  let interestTotal = 0;
  let paidTotal = 0;
  for (let month = 1; balance > 0 && month <= n; month++) {
    const opening = balance;
    const interest = Math.round(opening * r);
    const due = opening + interest;
    const payment = month === n ? due : Math.min(regular, due);
    balance = due - payment;
    const extra = Math.max(0, Math.min(extraMinor + (lumps.get(month) ?? 0), balance));
    balance -= extra;
    interestTotal += interest;
    paidTotal += payment + extra;
    rows.push({
      month,
      opening: fromMinor(opening),
      payment: fromMinor(payment),
      interest: fromMinor(interest),
      principal: fromMinor(payment - interest),
      extra: fromMinor(extra),
      closing: fromMinor(balance),
    });
    if ((lumps.get(month) ?? 0) > 0 && balance > 0 && month < n) regular = toMinor(monthlyPaymentFor(fromMinor(balance), input.annualRatePct, n - month));
  }
  return {
    rows,
    firstPayment,
    finalRegularPayment: fromMinor(regular),
    totalInterest: fromMinor(interestTotal),
    totalPaid: fromMinor(paidTotal),
    monthsTaken: rows.length,
  };
}

function monthlyPaymentFor(principal: number, annualRatePct: number, months: number): number {
  return amortize({ principal, annualRatePct, months: Math.max(1, months) }).payment;
}

/* ------------------------------------------------------------------ target date */

export interface TargetResult {
  /** Smallest monthly payment (rounded up to the cent) that clears the loan within the target. */
  requiredPayment: number;
  schedule: AmortizeResult;
  /** Compared with what you pay now, when given. */
  current: { payment: number; schedule: AmortizeResult | null; extraNeeded: number; interestSaved: number | null; monthsSaved: number | null } | null;
}

/** The monthly payment needed to clear `principal` in `targetMonths`, optionally compared with the current payment. */
export function paymentToClearBy(principal: number, annualRatePct: number, targetMonths: number, currentPayment?: number | null): TargetResult {
  const r = monthlyRate(annualRatePct);
  const exact = r === 0 ? principal / targetMonths : (principal * r * (1 + r) ** targetMonths) / ((1 + r) ** targetMonths - 1);
  const requiredPayment = Math.ceil(Number((exact * 100).toPrecision(12))) / 100;
  const schedule = amortize({ principal, annualRatePct, months: targetMonths, payment: requiredPayment });

  let current: TargetResult['current'] = null;
  if (currentPayment && currentPayment > 0) {
    const now = repayByPayment(principal, annualRatePct, currentPayment);
    const nowSchedule = now.ok ? now.schedule : null;
    current = {
      payment: currentPayment,
      schedule: nowSchedule,
      extraNeeded: fromMinor(Math.max(0, toMinor(requiredPayment) - toMinor(currentPayment))),
      interestSaved: nowSchedule ? fromMinor(toMinor(nowSchedule.totalInterest) - toMinor(schedule.totalInterest)) : null,
      monthsSaved: nowSchedule ? nowSchedule.monthsTaken - schedule.monthsTaken : null,
    };
  }
  return { requiredPayment, schedule, current };
}
