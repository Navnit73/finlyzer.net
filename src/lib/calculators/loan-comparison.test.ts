import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breakEvenMonth, earlyRepaymentCost, evaluateOffer, solveMonthlyRate } from './loan-comparison.ts';
import { roundTo } from './money.ts';

// APRs are checked against a separate Python Newton-Raphson IRR on the same cash flows.

test('with no fees the APR equals the note rate', () => {
  const r = evaluateOffer({ amount: 10000, aprPct: 12, months: 36, upfrontFee: 0, monthlyFee: 0, feeHandling: 'deducted' });
  assert.equal(roundTo(r.aprWithFees, 2), 12);
  assert.equal(r.payment, 332.14);
});

test('a $300 fee deducted from $10,000 at 12% over 36 months gives 14.13% APR', () => {
  const r = evaluateOffer({ amount: 10000, aprPct: 12, months: 36, upfrontFee: 300, monthlyFee: 0, feeHandling: 'deducted' });
  assert.equal(r.cashReceived, 9700);
  assert.equal(roundTo(r.aprWithFees, 2), 14.13);
});

test('one-month loan: 1% a month is 12% APR and 12.68% effective', () => {
  const i = solveMonthlyRate(1000, [1010]);
  assert.equal(roundTo(i, 10), 0.01);
  assert.equal(roundTo(((1 + i) ** 12 - 1) * 100, 2), 12.68);
});

test('page example offers', () => {
  const a = evaluateOffer({ amount: 20000, aprPct: 9.9, months: 60, upfrontFee: 600, monthlyFee: 0, feeHandling: 'deducted' });
  const b = evaluateOffer({ amount: 20000, aprPct: 11.5, months: 60, upfrontFee: 0, monthlyFee: 0, feeHandling: 'deducted' });
  const c = evaluateOffer({ amount: 20000, aprPct: 10.5, months: 84, upfrontFee: 0, monthlyFee: 0, feeHandling: 'deducted' });
  assert.deepEqual([a.payment, a.totalInterest, a.totalCost, roundTo(a.aprWithFees, 2), roundTo(a.effectiveAnnualRate, 2)], [423.96, 5437.43, 6037.43, 11.22, 11.82]);
  assert.deepEqual([b.payment, b.totalInterest, b.totalCost, roundTo(b.aprWithFees, 2)], [439.85, 6391.14, 6391.14, 11.5]);
  assert.deepEqual([c.payment, c.totalInterest, c.totalCost, roundTo(c.aprWithFees, 2)], [337.21, 8326.09, 8326.09, 10.5]);
});

test('a financed fee is charged interest and costs more', () => {
  const r = evaluateOffer({ amount: 20000, aprPct: 9.9, months: 60, upfrontFee: 600, monthlyFee: 0, feeHandling: 'financed' });
  assert.equal(r.principal, 20600);
  assert.equal(r.payment, 436.68);
  assert.equal(r.totalCost, 6200.5);
  assert.equal(roundTo(r.aprWithFees, 2), 11.18);
});

test('monthly fees add to the outgoing payment and the cost', () => {
  const r = evaluateOffer({ amount: 10000, aprPct: 12, months: 36, upfrontFee: 0, monthlyFee: 5, feeHandling: 'deducted' });
  assert.equal(r.monthlyOutgoing, 337.14);
  assert.equal(r.totalFees, 180);
  assert.ok(r.aprWithFees > 12);
});

test('early repayment cost starts at the fee and ends at the total cost', () => {
  const a = { amount: 20000, aprPct: 9.9, months: 60, upfrontFee: 600, monthlyFee: 0, feeHandling: 'deducted' as const };
  const curve = earlyRepaymentCost(a);
  assert.equal(curve.length, 61);
  assert.equal(curve[0], 600);
  assert.equal(curve[60], evaluateOffer(a).totalCost);
  const financed = earlyRepaymentCost({ ...a, feeHandling: 'financed' });
  assert.equal(financed[0], 600);
  assert.equal(financed[60], evaluateOffer({ ...a, feeHandling: 'financed' }).totalCost);
});

test('the 600-fee offer only beats the no-fee offer if kept 26 months or more (verified in Python)', () => {
  const a = earlyRepaymentCost({ amount: 20000, aprPct: 9.9, months: 60, upfrontFee: 600, monthlyFee: 0, feeHandling: 'deducted' });
  const b = earlyRepaymentCost({ amount: 20000, aprPct: 11.5, months: 60, upfrontFee: 0, monthlyFee: 0, feeHandling: 'deducted' });
  assert.deepEqual([a[12], b[12]], [2435.05, 2137.9]);
  assert.deepEqual([a[25], b[25], a[26], b[26]], [4041.63, 4022.83, 4147.58, 4147.67]);
  assert.equal(breakEvenMonth(a, b), 26);
  assert.equal(breakEvenMonth(b, a), null);
  assert.equal(breakEvenMonth(b, b), 0);
});
