import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projectSip, sipFutureValue, sipMonthlyRate } from './sip.ts';
import { roundTo } from './money.ts';

// Published by Axis Mutual Fund's SIP calculator page (i = annual ÷ 12, annuity due):
// ₹10,000 a month for 20 years at 12% → ₹99,91,479; ₹5,000 a month for 15 years → ₹25,22,880.
test('matches Axis MF published SIP values', () => {
  assert.equal(Math.round(sipFutureValue(10_000, 12, 240)), 9_991_479);
  assert.equal(Math.round(sipFutureValue(5_000, 12, 180)), 2_522_880);
});

test('monthly rate conventions', () => {
  assert.equal(sipMonthlyRate(12, 'simple'), 0.01);
  // HDFC MF: 12% a year is "approximately 0.95%" a month with (1 + r)^(1/12) − 1.
  assert.equal(roundTo(sipMonthlyRate(12, 'effective') * 100, 2), 0.95);
});

test('month-by-month projection equals the closed form without step-up', () => {
  const p = projectSip({ monthly: 10_000, annualRatePct: 12, years: 15 });
  assert.equal(p.invested, 1_800_000);
  assert.equal(p.value, 5_045_760); // python: 10000 × ((1.01^180 − 1)/0.01) × 1.01
  assert.equal(p.gains, 3_245_760);
  assert.equal(p.rows.length, 15);
  assert.equal(p.rows[0].value, 128_093.28);
  assert.equal(p.rows.at(-1)!.value, p.value);
});

test('effective-rate convention gives a lower value', () => {
  const p = projectSip({ monthly: 10_000, annualRatePct: 12, years: 15, convention: 'effective' });
  assert.equal(p.value, 4_759_313.99);
  assert.ok(p.value < sipFutureValue(10_000, 12, 180));
});

test('annual step-up raises the instalment each year', () => {
  const p = projectSip({ monthly: 5_000, annualRatePct: 12, years: 3, stepUpPct: 10 });
  // HDFC MF's step-up example: ₹5,000 → ₹5,500 → ₹6,050.
  assert.deepEqual(p.rows.map((r) => r.monthlyAmount), [5000, 5500, 6050]);
  assert.equal(p.invested, (5000 + 5500 + 6050) * 12);
});

test('step-up projection matches a sum of each instalment grown to maturity', () => {
  // Python: Σ amount_k × 1.01^(180 − k), amount = round(10000 × 1.1^year, 2).
  const p = projectSip({ monthly: 10_000, annualRatePct: 12, years: 15, stepUpPct: 10 });
  assert.equal(p.value, 8_683_849.35);
  assert.equal(p.invested, 3_812_697.72);
});

test('zero return: value equals what was invested', () => {
  const p = projectSip({ monthly: 2_500, annualRatePct: 0, years: 2 });
  assert.equal(p.value, 60_000);
  assert.equal(p.gains, 0);
  assert.equal(sipFutureValue(2_500, 0, 24), 60_000);
});

test('degenerate inputs', () => {
  assert.equal(sipFutureValue(0, 12, 120), 0);
  assert.equal(sipFutureValue(1000, 12, 0), 0);
  assert.deepEqual(projectSip({ monthly: 1000, annualRatePct: 12, years: 0 }), { invested: 0, value: 0, gains: 0, rows: [] });
});

test('required SIP for a goal reaches the goal and one unit less does not', async () => {
  const { requiredMonthlySip } = await import('./sip.ts');
  for (const [target, rate, years, step] of [
    [10_000_000, 12, 15, 0],
    [10_000_000, 12, 15, 10],
    [5_000_000, 10, 20, 5],
  ] as const) {
    const p = requiredMonthlySip(target, rate, years, step);
    assert.ok(projectSip({ monthly: p, annualRatePct: rate, years, stepUpPct: step }).value >= target - 1, `${target} ${p}`);
    assert.ok(projectSip({ monthly: p - 1, annualRatePct: rate, years, stepUpPct: step }).value < target, `${target} ${p - 1}`);
  }
  // Python: 1e7 / (((1.01^180 − 1)/0.01) × 1.01) = 19,818.4 → ₹19,819.
  assert.equal(requiredMonthlySip(10_000_000, 12, 15), 19_819);
  assert.equal(requiredMonthlySip(0, 12, 15), 0);
  assert.equal(requiredMonthlySip(1_200, 0, 1), 100);
});

test('lump sum and inflation helpers', async () => {
  const { lumpsumValue, inTodaysMoney, inflateGoal } = await import('./sip.ts');
  // Python: 1,800,000 × 1.01^180.
  assert.equal(lumpsumValue(1_800_000, 12, 15), 10_792_443.56);
  assert.equal(lumpsumValue(100_000, 12, 1, 'effective'), 112_000);
  // Python: 5,045,760.08 / 1.06^15 and 1e7 × 1.06^15.
  assert.equal(inTodaysMoney(5_045_760.08, 6, 15), 2_105_419.39);
  assert.equal(inflateGoal(10_000_000, 6, 15), 23_965_581.93);
  assert.equal(inTodaysMoney(1000, 0, 10), 1000);
});
