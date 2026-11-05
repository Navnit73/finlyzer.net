import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulatePlan, sumMinimums, type Debt } from './debt-payoff.ts';
import { amortize } from './loan.ts';

const DEBTS: Debt[] = [
  { id: 'a', name: 'Card A', balance: 4000, aprPct: 24, minPayment: 100 },
  { id: 'b', name: 'Card B', balance: 1500, aprPct: 18, minPayment: 40 },
  { id: 'c', name: 'Car loan', balance: 9000, aprPct: 7, minPayment: 250 },
  { id: 'd', name: 'Personal loan', balance: 2500, aprPct: 12, minPayment: 75 },
];

// Expected values come from an independent Python simulation of the same rules.

test('avalanche on the example debts', () => {
  const p = simulatePlan(DEBTS, 700, 'avalanche');
  assert.equal(p.repaid, true);
  assert.equal(p.months, 28);
  assert.equal(p.totalInterest, 2286.85);
  assert.deepEqual(p.debts.map((d) => d.payoffMonth), [14, 18, 28, 21]);
  assert.equal(p.balances[0], 17000);
  assert.equal(p.balances.at(-1), 0);
});

test('snowball on the example debts', () => {
  const p = simulatePlan(DEBTS, 700, 'snowball');
  assert.equal(p.months, 29);
  assert.equal(p.totalInterest, 2600.96);
  assert.deepEqual(p.debts.map((d) => d.payoffMonth), [22, 6, 29, 13]);
});

test('paying only the minimums (with rollover) takes 49 months', () => {
  assert.equal(sumMinimums(DEBTS), 465);
  const p = simulatePlan(DEBTS, 465, 'avalanche');
  assert.equal(p.months, 49);
  assert.equal(p.totalInterest, 5444.21);
});

test('zero-interest hand example: snowball clears the small debt in month 3', () => {
  const debts: Debt[] = [
    { id: 'a', name: 'A', balance: 100, aprPct: 0, minPayment: 10 },
    { id: 'b', name: 'B', balance: 200, aprPct: 0, minPayment: 10 },
  ];
  const p = simulatePlan(debts, 50, 'snowball');
  assert.deepEqual(p.debts.map((d) => d.payoffMonth), [3, 6]);
  assert.equal(p.totalPaid, 300);
  assert.equal(p.totalInterest, 0);
});

test('one debt matches the loan amortization engine', () => {
  const p = simulatePlan([{ id: 'x', name: 'X', balance: 1000, aprPct: 12, minPayment: 100 }], 100, 'avalanche');
  const s = amortize({ principal: 1000, annualRatePct: 12, months: 999, payment: 100 });
  assert.equal(p.months, s.monthsTaken);
  assert.equal(p.months, 11); // −ln(1 − 0.01 × 1000 / 100) / ln(1.01) = 10.59 → 11 payments
  assert.equal(p.totalInterest, s.totalInterest);
});

test('a budget that cannot beat the interest stops and reports not repaid', () => {
  const p = simulatePlan([{ id: 'x', name: 'X', balance: 10000, aprPct: 24, minPayment: 100 }], 150, 'avalanche');
  assert.equal(p.repaid, false);
  assert.equal(p.debts[0].payoffMonth, null);
});

test('the month-by-month plan adds up to the totals and never exceeds the budget', () => {
  for (const strategy of ['avalanche', 'snowball'] as const) {
    const plan = simulatePlan(DEBTS, 700, strategy);
    assert.equal(plan.schedule.length, plan.months);
    const cents = (v: number) => Math.round(v * 100);
    for (const m of plan.schedule) {
      assert.ok(m.payments.reduce((t, p) => t + cents(p), 0) <= 70_000, `month ${m.month} over budget`);
      assert.equal(m.balances.reduce((t, b) => t + cents(b), 0), cents(plan.balances[m.month]));
    }
    DEBTS.forEach((d, i) => {
      const paid = plan.schedule.reduce((t, m) => t + cents(m.payments[i]), 0);
      assert.equal(paid, cents(plan.debts[i].paid), `${d.name} payments`);
      const payoff = plan.debts[i].payoffMonth!;
      assert.equal(plan.schedule[payoff - 1].balances[i], 0);
      if (payoff > 1) assert.ok(plan.schedule[payoff - 2].balances[i] > 0);
    });
    assert.ok(plan.schedule.at(-1)!.balances.every((b) => b === 0));
  }
});

test('a one-off 1,000 in month 4 shortens the three-card plan (verified in Python)', () => {
  const cards: Debt[] = [
    { id: 'a', name: 'Card A', balance: 4000, aprPct: 24, minPayment: 100 },
    { id: 'b', name: 'Card B', balance: 1500, aprPct: 18, minPayment: 40 },
    { id: 'c', name: 'Card C', balance: 2500, aprPct: 27, minPayment: 75 },
  ];
  const av = simulatePlan(cards, 500, 'avalanche', [{ month: 4, amount: 1000 }]);
  assert.deepEqual([av.months, av.totalInterest, av.debts.map((d) => d.payoffMonth)], [17, 1301.06, [15, 17, 5]]);
  const sn = simulatePlan(cards, 500, 'snowball', [{ month: 4, amount: 1000 }]);
  assert.deepEqual([sn.months, sn.totalInterest, sn.debts.map((d) => d.payoffMonth)], [17, 1421.9, [17, 4, 9]]);
  assert.equal(av.schedule[3].payments.reduce((t, p) => t + p, 0), 1500);
});
