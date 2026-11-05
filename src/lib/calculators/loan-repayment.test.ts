import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareOverpayments, firstMonthInterest, repayByPayment } from './loan-repayment.ts';
import { monthsToRepay } from './loan.ts';

// Expected values recomputed independently with the closed forms
// A = P r (1+r)^n / ((1+r)^n − 1) and n = −ln(1 − rP/A) / ln(1+r).

const LOAN = { principal: 15_000, annualRatePct: 7.9, months: 60 };

test('baseline: £15,000 at 7.9% over 5 years is £303.43 a month', () => {
  const o = compareOverpayments({ ...LOAN, extraMonthly: 0, lumpSums: [] });
  assert.equal(o.baseline.payment, 303.43);
  assert.equal(o.baseline.monthsTaken, 60);
  assert.equal(o.baseline.totalInterest, 3205.71);
  assert.equal(o.monthsSaved, 0);
  assert.equal(o.interestSaved, 0);
  assert.equal(o.totalOverpaid, 0);
});

test('£100 a month extra: 43 payments instead of 60', () => {
  const o = compareOverpayments({ ...LOAN, extraMonthly: 100, lumpSums: [] });
  // Closed form with 403.43 a month: n ≈ 42.78 → 43 payments.
  assert.equal(o.withOverpayments.monthsTaken, Math.ceil(monthsToRepay(15_000, 7.9, 403.43)));
  assert.equal(o.withOverpayments.monthsTaken, 43);
  assert.equal(o.monthsSaved, 17);
  assert.equal(o.interestSaved, 944.95);
});

test('£100 a month plus £1,000 in month 12: page example', () => {
  const o = compareOverpayments({ ...LOAN, extraMonthly: 100, lumpSums: [{ month: 12, amount: 1000 }] });
  assert.equal(o.withOverpayments.monthsTaken, 40);
  assert.equal(o.monthsSaved, 20);
  assert.equal(o.interestSaved, 1160.73);
  assert.equal(o.totalOverpaid, 4907.78);
  assert.equal(o.withOverpayments.rows.at(-1)!.closing, 0);
  // Total paid falls by exactly the interest saved.
  assert.ok(Math.abs(o.baseline.totalPaid - o.withOverpayments.totalPaid - o.interestSaved) < 0.005);
});

test('repaying £400 a month takes 44 payments', () => {
  const r = repayByPayment(15_000, 7.9, 400);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.months, Math.ceil(monthsToRepay(15_000, 7.9, 400))); // n ≈ 43.21
  assert.equal(r.months, 44);
  assert.equal(r.schedule.totalInterest, 2283.59);
  assert.equal(r.schedule.rows.at(-1)!.payment, 83.59);
});

test('a payment that only covers the interest is rejected', () => {
  assert.equal(firstMonthInterest(15_000, 7.9), 98.75);
  const r = repayByPayment(15_000, 7.9, 98.75);
  assert.deepEqual(r, { ok: false, reason: 'payment-too-low', firstMonthInterest: 98.75 });
  assert.equal(repayByPayment(15_000, 7.9, 50).ok, false);
});

test('a payment that would take over 100 years is reported as too long', () => {
  const r = repayByPayment(15_000, 7.9, 98.76);
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.equal(r.reason, 'too-long');
});

test('zero interest: time is simply balance ÷ payment', () => {
  const r = repayByPayment(1_000, 0, 300);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.months, 4);
  assert.equal(r.schedule.rows.at(-1)!.payment, 100);
  assert.equal(r.schedule.totalInterest, 0);
});

test('a lump sum after the loan would have ended is ignored', () => {
  const o = compareOverpayments({ ...LOAN, extraMonthly: 0, lumpSums: [{ month: 90, amount: 5000 }] });
  assert.equal(o.monthsSaved, 0);
  assert.equal(o.totalOverpaid, 0);
});
