/**
 * Fixed-rate amortising loan maths, shared by the EMI, mortgage, loan repayment and loan
 * comparison calculators.
 *
 * Payment (annuity) formula:  A = P × r × (1 + r)^n / ((1 + r)^n − 1),  r = annual rate / 12 / 100.
 * With r = 0 the payment is P / n.
 *
 * Schedules run in integer minor units (cents, paise): each month's interest is rounded to the
 * cent, as lenders do, and the final payment absorbs the rounding difference so the balance
 * ends at exactly zero.
 */

import { fromMinor, toMinor } from './money.ts';

/** Hard stop for schedules: 100 years of monthly payments. */
export const MAX_SCHEDULE_MONTHS = 1200;

export function monthlyRate(annualRatePct: number): number {
  return annualRatePct / 12 / 100;
}

/** Unrounded level monthly payment. */
export function monthlyPayment(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = monthlyRate(annualRatePct);
  if (r === 0) return principal / months;
  const growth = (1 + r) ** months;
  return (principal * r * growth) / (growth - 1);
}

/**
 * Months needed to repay `principal` with a level `payment`, or Infinity when the payment does
 * not cover the first month's interest. Unrounded; use Math.ceil for a count of payments.
 */
export function monthsToRepay(principal: number, annualRatePct: number, payment: number): number {
  if (principal <= 0) return 0;
  if (payment <= 0) return Infinity;
  const r = monthlyRate(annualRatePct);
  if (r === 0) return principal / payment;
  if (payment <= principal * r) return Infinity;
  return -Math.log(1 - (r * principal) / payment) / Math.log(1 + r);
}

export interface ScheduleRow {
  month: number;
  opening: number;
  /** Scheduled payment actually made this month (interest + principal, excluding extra). */
  payment: number;
  interest: number;
  principal: number;
  /** Prepayment on top of the scheduled payment. */
  extra: number;
  closing: number;
}

export interface LumpSum {
  /** 1-based month in which the lump sum is paid (after that month's scheduled payment). */
  month: number;
  amount: number;
}

export interface AmortizeInput {
  principal: number;
  annualRatePct: number;
  /** Contract term in months; sets the scheduled payment unless `payment` is given. */
  months: number;
  /** Override the scheduled payment (e.g. a fixed amount the borrower chooses). */
  payment?: number;
  /** Extra paid every month from `extraFromMonth` (default 1). */
  extraMonthly?: number;
  extraFromMonth?: number;
  lumpSums?: LumpSum[];
}

export interface AmortizeResult {
  /** The scheduled monthly payment, rounded to the cent. */
  payment: number;
  rows: ScheduleRow[];
  totalInterest: number;
  /** Everything paid: scheduled payments + extras. */
  totalPaid: number;
  monthsTaken: number;
  /** True when the payment never covers the interest, so the loan would never be repaid. */
  negativeAmortization: boolean;
}

export function amortize(input: AmortizeInput): AmortizeResult {
  const r = monthlyRate(input.annualRatePct);
  const scheduled = input.payment ?? monthlyPayment(input.principal, input.annualRatePct, input.months);
  const paymentMinor = toMinor(scheduled);
  const extraMinor = toMinor(Math.max(0, input.extraMonthly ?? 0));
  const extraFrom = Math.max(1, Math.floor(input.extraFromMonth ?? 1));
  const lumpByMonth = new Map<number, number>();
  for (const l of input.lumpSums ?? []) {
    if (l.amount > 0 && l.month >= 1) lumpByMonth.set(Math.floor(l.month), (lumpByMonth.get(Math.floor(l.month)) ?? 0) + toMinor(l.amount));
  }

  let balance = toMinor(Math.max(0, input.principal));
  const rows: ScheduleRow[] = [];
  let interestTotal = 0;
  let paidTotal = 0;

  if (balance > 0 && paymentMinor + extraMinor <= Math.round(balance * r) && lumpByMonth.size === 0) {
    return { payment: fromMinor(paymentMinor), rows: [], totalInterest: 0, totalPaid: 0, monthsTaken: 0, negativeAmortization: true };
  }

  for (let month = 1; balance > 0 && month <= MAX_SCHEDULE_MONTHS; month++) {
    const opening = balance;
    const interest = Math.round(opening * r);
    // Final month pays exactly what is owed. On the contract's last month that includes the
    // cents left over from rounding the payment down, as lenders do.
    const due = opening + interest;
    const lastContractMonth = input.payment === undefined && month >= input.months;
    const payment = lastContractMonth ? due : Math.min(paymentMinor, due);
    balance = opening - (payment - interest);

    let extra = month >= extraFrom ? Math.max(0, Math.min(extraMinor, balance)) : 0;
    const lump = lumpByMonth.get(month) ?? 0;
    extra += Math.max(0, Math.min(lump, balance - extra));
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
  }

  return {
    payment: fromMinor(paymentMinor),
    rows,
    totalInterest: fromMinor(interestTotal),
    totalPaid: fromMinor(paidTotal),
    monthsTaken: rows.length,
    negativeAmortization: balance > 0,
  };
}

export interface YearRow {
  year: number;
  opening: number;
  payments: number;
  interest: number;
  principal: number;
  extra: number;
  closing: number;
}

/** Rolls a monthly schedule up into loan years (months 1–12 = year 1). */
export function yearlySummary(rows: ScheduleRow[]): YearRow[] {
  const years: YearRow[] = [];
  for (const row of rows) {
    const year = Math.ceil(row.month / 12);
    let y = years[year - 1];
    if (!y) {
      y = { year, opening: row.opening, payments: 0, interest: 0, principal: 0, extra: 0, closing: row.closing };
      years[year - 1] = y;
    }
    // Sum in minor units to avoid float drift across 12 additions.
    y.payments = fromMinor(toMinor(y.payments) + toMinor(row.payment));
    y.interest = fromMinor(toMinor(y.interest) + toMinor(row.interest));
    y.principal = fromMinor(toMinor(y.principal) + toMinor(row.principal));
    y.extra = fromMinor(toMinor(y.extra) + toMinor(row.extra));
    y.closing = row.closing;
  }
  return years;
}
