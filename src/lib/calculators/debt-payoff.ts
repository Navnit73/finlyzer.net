/**
 * Multi-debt payoff plans: avalanche (highest APR first) and snowball (smallest balance first).
 *
 * Each month, for every unpaid debt:
 *   1. interest = balance × APR ÷ 12 ÷ 100 (rounded to the cent) is added;
 *   2. its minimum payment is paid (or the whole balance, if smaller);
 * then whatever is left of the monthly budget goes to the priority debt, spilling over to the
 * next one when it is cleared. A cleared debt's minimum stays in the budget, so it "rolls" into
 * the extra payment: that is the snowball/avalanche effect.
 *
 * Assumptions: fixed APRs, monthly compounding, no new borrowing, fixed minimums, no fees.
 */

import { fromMinor, toMinor } from './money.ts';

export const MAX_PLAN_MONTHS = 1200;

export type Strategy = 'avalanche' | 'snowball';

export interface Debt {
  id: string;
  name: string;
  balance: number;
  aprPct: number;
  minPayment: number;
}

export interface DebtOutcome {
  id: string;
  name: string;
  /** Month in which the debt reaches zero, or null if not within the plan. */
  payoffMonth: number | null;
  interest: number;
  paid: number;
}

export interface PlanResult {
  strategy: Strategy;
  /** Months until every debt is repaid (or months simulated if not repaid). */
  months: number;
  totalInterest: number;
  totalPaid: number;
  debts: DebtOutcome[];
  /** Total balance at the start (index 0) and at the end of each month. */
  balances: number[];
  /** Month-by-month plan: what is paid to each debt and what it still owes (same order as the input). */
  schedule: PlanMonth[];
  repaid: boolean;
}

export interface PlanMonth {
  month: number;
  /** Payment to each debt this month, in input order. */
  payments: number[];
  /** Balance of each debt at the end of the month, in input order. */
  balances: number[];
}

export function sumMinimums(debts: Pick<Debt, 'minPayment' | 'balance'>[]): number {
  return fromMinor(debts.filter((d) => d.balance > 0).reduce((t, d) => t + toMinor(d.minPayment), 0));
}

interface Working {
  debt: Debt;
  balance: number;
  min: number;
  interest: number;
  paid: number;
  payoffMonth: number | null;
}

function priority(strategy: Strategy) {
  return (a: Working, b: Working) =>
    strategy === 'avalanche'
      ? b.debt.aprPct - a.debt.aprPct || a.balance - b.balance
      : a.balance - b.balance || b.debt.aprPct - a.debt.aprPct;
}

/** A one-off extra payment (a bonus or tax refund) added to the budget in one month. */
export interface ExtraPayment {
  month: number;
  amount: number;
}

export function simulatePlan(debts: Debt[], monthlyBudget: number, strategy: Strategy, extras: ExtraPayment[] = []): PlanResult {
  const extraByMonth = new Map<number, number>();
  for (const e of extras) if (e.amount > 0 && e.month >= 1) extraByMonth.set(Math.floor(e.month), (extraByMonth.get(Math.floor(e.month)) ?? 0) + toMinor(e.amount));
  const work: Working[] = debts.map((debt) => ({
    debt,
    balance: toMinor(Math.max(0, debt.balance)),
    min: toMinor(Math.max(0, debt.minPayment)),
    interest: 0,
    paid: 0,
    payoffMonth: debt.balance > 0 ? null : 0,
  }));
  const budget = toMinor(monthlyBudget);
  const balances = [fromMinor(work.reduce((t, w) => t + w.balance, 0))];
  const schedule: PlanMonth[] = [];
  let month = 0;

  while (work.some((w) => w.balance > 0) && month < MAX_PLAN_MONTHS) {
    month += 1;
    const before = work.reduce((t, w) => t + w.balance, 0);
    const paidBefore = work.map((w) => w.paid);
    const active = work.filter((w) => w.balance > 0);

    for (const w of active) {
      const interest = Math.round((w.balance * w.debt.aprPct) / 1200);
      w.balance += interest;
      w.interest += interest;
    }

    let available = budget + (extraByMonth.get(month) ?? 0);
    for (const w of active) {
      const pay = Math.min(w.min, w.balance, Math.max(0, available));
      w.balance -= pay;
      w.paid += pay;
      available -= pay;
    }

    for (const w of [...active].sort(priority(strategy))) {
      if (available <= 0) break;
      const pay = Math.min(available, w.balance);
      w.balance -= pay;
      w.paid += pay;
      available -= pay;
    }

    for (const w of active) if (w.balance === 0 && w.payoffMonth === null) w.payoffMonth = month;
    const after = work.reduce((t, w) => t + w.balance, 0);
    balances.push(fromMinor(after));
    schedule.push({ month, payments: work.map((w, i) => fromMinor(w.paid - paidBefore[i])), balances: work.map((w) => fromMinor(w.balance)) });
    // The budget no longer beats the interest: the debts would never be repaid.
    if (after >= before) break;
  }

  const repaid = work.every((w) => w.balance === 0);
  return {
    strategy,
    months: month,
    totalInterest: fromMinor(work.reduce((t, w) => t + w.interest, 0)),
    totalPaid: fromMinor(work.reduce((t, w) => t + w.paid, 0)),
    debts: work.map((w) => ({ id: w.debt.id, name: w.debt.name, payoffMonth: w.payoffMonth, interest: fromMinor(w.interest), paid: fromMinor(w.paid) })),
    balances,
    schedule,
    repaid,
  };
}
