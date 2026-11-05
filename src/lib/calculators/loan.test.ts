import { test } from 'node:test';
import assert from 'node:assert/strict';
import { amortize, monthlyPayment, monthsToRepay, yearlySummary } from './loan.ts';
import { roundTo } from './money.ts';

// Reference values are independent of this code: they are the standard published examples
// (bank EMI tables and US mortgage amortization tables), recomputed by hand from the formula.

test('EMI: ₹10,00,000 at 10% for 20 years is ₹9,650.22', () => {
  assert.equal(roundTo(monthlyPayment(1_000_000, 10, 240)), 9650.22);
});

test('Mortgage: $200,000 at 6% for 30 years is $1,199.10', () => {
  assert.equal(roundTo(monthlyPayment(200_000, 6, 360)), 1199.1);
});

test('Car loan: $25,000 at 7% for 60 months is $495.03', () => {
  assert.equal(roundTo(monthlyPayment(25_000, 7, 60)), 495.03);
});

test('zero-rate loans split the principal evenly', () => {
  assert.equal(monthlyPayment(12_000, 0, 12), 1000);
  const s = amortize({ principal: 100_000, annualRatePct: 0, months: 12 });
  assert.equal(s.payment, 8333.33);
  assert.equal(s.monthsTaken, 12);
  assert.equal(s.totalInterest, 0);
  assert.equal(s.rows[11].payment, 8333.37); // final payment absorbs the rounding
  assert.equal(s.rows[11].closing, 0);
  assert.equal(s.totalPaid, 100_000);
});

test('degenerate inputs return zero rather than NaN', () => {
  assert.equal(monthlyPayment(0, 10, 12), 0);
  assert.equal(monthlyPayment(1000, 10, 0), 0);
  assert.equal(monthsToRepay(0, 10, 100), 0);
});

test('a full schedule ends at zero and its parts add up', () => {
  const s = amortize({ principal: 200_000, annualRatePct: 6, months: 360 });
  assert.equal(s.monthsTaken, 360);
  assert.equal(s.rows.at(-1)!.closing, 0);
  assert.equal(s.negativeAmortization, false);
  const principalSum = roundTo(s.rows.reduce((t, r) => t + r.principal, 0));
  assert.equal(principalSum, 200_000);
  assert.equal(roundTo(s.totalPaid - s.totalInterest), 200_000);
  // 359 × 1,199.10 plus a final payment of 1,200.14 (the payment is rounded down from 1,199.1010…,
  // and the ~0.1 cent a month shortfall compounds to 1.04 by month 360) − 200,000 = 231,677.04.
  assert.equal(s.rows.at(-1)!.payment, 1200.14);
  assert.equal(s.totalInterest, 231_677.04);
  // First month: 200,000 × 0.005 = 1,000.00 interest, 199.10 principal.
  assert.deepEqual([s.rows[0].interest, s.rows[0].principal, s.rows[0].closing], [1000, 199.1, 199_800.9]);
});

test('extra monthly payments shorten the loan and cut interest', () => {
  const base = amortize({ principal: 200_000, annualRatePct: 6, months: 360 });
  const extra = amortize({ principal: 200_000, annualRatePct: 6, months: 360, extraMonthly: 200 });
  assert.ok(extra.monthsTaken < base.monthsTaken);
  assert.ok(extra.totalInterest < base.totalInterest);
  assert.equal(extra.rows.at(-1)!.closing, 0);
  // Closed form with a 1,399.10 payment: n = −ln(1 − 0.005×200000/1399.10)/ln(1.005) ≈ 251.5 → 252 payments.
  assert.equal(extra.monthsTaken, Math.ceil(monthsToRepay(200_000, 6, 1399.1)));
});

test('a lump sum is applied once, in its month', () => {
  const s = amortize({ principal: 10_000, annualRatePct: 12, months: 12, lumpSums: [{ month: 3, amount: 2000 }] });
  assert.equal(s.rows[2].extra, 2000);
  assert.equal(s.rows[3].extra, 0);
  assert.ok(s.monthsTaken < 12);
});

test('a lump sum larger than the balance only clears the balance', () => {
  const s = amortize({ principal: 1000, annualRatePct: 12, months: 12, lumpSums: [{ month: 1, amount: 50_000 }] });
  assert.equal(s.monthsTaken, 1);
  assert.equal(s.rows[0].closing, 0);
  assert.ok(s.totalPaid < 1100);
});

test('a payment below the monthly interest is flagged as never repaying', () => {
  // 100,000 at 12% accrues 1,000.00 interest in month 1.
  const s = amortize({ principal: 100_000, annualRatePct: 12, months: 12, payment: 900 });
  assert.equal(s.negativeAmortization, true);
  assert.equal(monthsToRepay(100_000, 12, 1000), Infinity);
});

test('yearly summary rolls 12 months into each year', () => {
  const s = amortize({ principal: 200_000, annualRatePct: 6, months: 360 });
  const years = yearlySummary(s.rows);
  assert.equal(years.length, 30);
  assert.equal(years[0].opening, 200_000);
  assert.equal(roundTo(years.reduce((t, y) => t + y.interest, 0)), s.totalInterest);
  assert.equal(years[29].closing, 0);
});
