import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cycleRate, dailyRate, effectiveAnnualRate, minimumDue, paymentToClearIn, simulateBalanceTransfer, simulateCard } from './credit-card.ts';
import { roundTo } from './money.ts';

// Expected values were produced by a separate Python implementation (Decimal, half-up rounding)
// and the closed-form payment formula, not by this module.

test('APR converts to daily, cycle and effective annual rates', () => {
  assert.equal(roundTo(dailyRate(24) * 100, 5), 0.06575);
  assert.equal(roundTo(cycleRate(24, 365, 30) * 100, 4), 1.9726);
  assert.equal(roundTo(effectiveAnnualRate(24, 365, 30), 2), 26.83);
  // On a 360-day basis a 30-day cycle is exactly APR / 12.
  assert.equal(cycleRate(24, 360, 30), 0.02);
});

test('fixed $200 a month clears $5,000 at 24% in 35 months', () => {
  const r = simulateCard({ balance: 5000, aprPct: 24, plan: { type: 'fixed', amount: 200 } });
  assert.equal(r.firstInterest, 98.63);
  assert.equal(r.months, 35);
  assert.equal(r.totalInterest, 1957.82);
  assert.equal(r.totalPaid, 6957.82);
  assert.equal(r.repaid, true);
  assert.equal(r.rows.at(-1)!.closing, 0);
});

test('minimum of 1% plus interest (floor $25) takes 230 months', () => {
  const r = simulateCard({ balance: 5000, aprPct: 24, plan: { type: 'minimum', rule: { percent: 1, floor: 25, plusInterest: true } } });
  assert.equal(r.months, 230);
  assert.equal(r.totalInterest, 8598.27);
  assert.equal(r.repaid, true);
  // Month 1: statement 5,098.63 → 1% = 50.99, plus 98.63 interest = 149.62.
  assert.equal(r.rows[0].payment, 149.62);
});

test('a 2% minimum without interest is not repaid within 100 years', () => {
  const r = simulateCard({ balance: 5000, aprPct: 24, plan: { type: 'minimum', rule: { percent: 2, floor: 25, plusInterest: false } } });
  assert.equal(r.repaid, false);
  assert.equal(r.months, 1200);
});

test('minimum due respects the floor and never exceeds the balance', () => {
  assert.equal(minimumDue(1000_00, 20_00, { percent: 1, floor: 25, plusInterest: true }), 30_00);
  assert.equal(minimumDue(1000_00, 0, { percent: 1, floor: 25, plusInterest: false }), 25_00);
  assert.equal(minimumDue(10_00, 0, { percent: 1, floor: 25, plusInterest: false }), 10_00);
});

test('payment below the first month interest is flagged', () => {
  const r = simulateCard({ balance: 5000, aprPct: 24, plan: { type: 'fixed', amount: 98.63 } });
  assert.equal(r.coversInterest, false);
  assert.equal(r.repaid, false);
});

test('payment to clear in 24 and 36 months', () => {
  // Closed form: 263.5357… and 195.3022…, rounded up to the cent.
  assert.equal(paymentToClearIn(5000, 24, 24), 263.54);
  assert.equal(paymentToClearIn(5000, 24, 36), 195.31);
  const r = simulateCard({ balance: 5000, aprPct: 24, plan: { type: 'fixed', amount: 263.54 } });
  assert.equal(r.months, 24);
  assert.equal(r.totalInterest, 1324.87);
});

test('zero APR and zero balance edge cases', () => {
  assert.equal(paymentToClearIn(1200, 0, 12), 100);
  const r = simulateCard({ balance: 0, aprPct: 24, plan: { type: 'fixed', amount: 50 } });
  assert.equal(r.months, 0);
  assert.equal(r.repaid, true);
});

test('payment table for 5,000 at 24% (verified in Python)', () => {
  const cases: [number, number, number][] = [[150, 55, 3228.83], [300, 21, 1122.97], [500, 12, 625.07]];
  for (const [amount, months, interest] of cases) {
    const r = simulateCard({ balance: 5000, aprPct: 24, plan: { type: 'fixed', amount } });
    assert.deepEqual([r.months, r.totalInterest], [months, interest], String(amount));
  }
});

test('balance transfer: 3% fee, 0% for 18 months, then 24%, paying 200', () => {
  const t = simulateBalanceTransfer({ balance: 5000, payment: 200, feePct: 3, promoAprPct: 0, promoMonths: 18, aprAfterPct: 24 });
  assert.equal(t.fee, 150);
  assert.equal(t.balanceAtPromoEnd, 1550); // 5,150 − 18 × 200
  assert.equal(t.months, 27);
  assert.equal(t.totalInterest, 149.17);
  assert.equal(t.totalCost, 299.17);
  assert.equal(t.rows.at(-1)!.closing, 0);
});

test('balance transfer: a shorter promotion costs more', () => {
  const t = simulateBalanceTransfer({ balance: 5000, payment: 200, feePct: 3, promoAprPct: 0, promoMonths: 12, aprAfterPct: 24 });
  assert.deepEqual([t.months, t.totalInterest, t.totalCost, t.balanceAtPromoEnd], [29, 489.78, 639.78, 2750]);
});

test('a payment that beats 0% but not the go-to APR is reported as not repaid', () => {
  const t = simulateBalanceTransfer({ balance: 10000, payment: 50, feePct: 0, promoAprPct: 0, promoMonths: 3, aprAfterPct: 24 });
  assert.equal(t.repaid, false);
  assert.ok(t.rows.length > 3 && t.rows.length < 1200);
});
