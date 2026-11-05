import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compound, doublingYears, effectiveAnnualRate, futureValue } from './compound-interest.ts';
import { roundTo } from './money.ts';

// Expected values are textbook results recomputed independently (Python) from A = P(1 + r/m)^(mt),
// A = Pe^(rt) and the future value of an annuity, not taken from this code.

test('10,000 at 5% for 10 years, by compounding frequency', () => {
  const cases: [Parameters<typeof futureValue>[3], number][] = [
    ['annually', 16288.95],
    ['semiannually', 16386.16],
    ['quarterly', 16436.19],
    ['monthly', 16470.09],
    ['daily', 16486.65],
    ['continuous', 16487.21],
  ];
  for (const [freq, expected] of cases) {
    assert.equal(roundTo(futureValue(10_000, 5, 10, freq)), expected, freq);
    assert.equal(compound({ principal: 10_000, annualRatePct: 5, months: 120, compounding: freq }).finalBalance, expected, `sim ${freq}`);
  }
});

test('effective annual rate (APY)', () => {
  assert.equal(roundTo(effectiveAnnualRate(5, 'monthly') * 100, 4), 5.1162);
  assert.equal(roundTo(effectiveAnnualRate(5, 'daily') * 100, 4), 5.1267);
  assert.equal(roundTo(effectiveAnnualRate(5, 'continuous') * 100, 4), 5.1271);
  assert.equal(roundTo(effectiveAnnualRate(5, 'annually') * 100, 4), 5);
  assert.equal(roundTo(effectiveAnnualRate(7, 'monthly') * 100, 3), 7.229);
});

test('monthly contributions with monthly compounding match the annuity formula', () => {
  const end = compound({ principal: 10_000, annualRatePct: 5, months: 120, compounding: 'monthly', contribution: 100, contributionTiming: 'end' });
  assert.equal(end.finalBalance, 31998.32);
  assert.equal(end.contributionCount, 120);
  assert.equal(end.totalContributed, 22_000);
  assert.equal(end.interestEarned, 9998.32);
  const start = compound({ principal: 10_000, annualRatePct: 5, months: 120, compounding: 'monthly', contribution: 100, contributionTiming: 'start' });
  assert.equal(start.finalBalance, 32063.02);
});

test('page example: 10,000 + 200 a month at 7% monthly for 20 years', () => {
  const r = compound({ principal: 10_000, annualRatePct: 7, months: 240, compounding: 'monthly', contribution: 200 });
  assert.equal(r.finalBalance, 144572.72);
  assert.equal(r.totalContributed, 58_000);
  assert.equal(r.interestEarned, 86572.72);
  assert.equal(r.years[0].closing, 13201.42);
  assert.equal(r.years[9].closing, 54713.58);
});

test('contribution schedule different from compounding uses the effective monthly rate', () => {
  // Quarterly compounding, monthly contributions: monthly rate (1 + EAR)^(1/12) − 1, EAR = (1.0175)^4 − 1.
  const r = compound({ principal: 10_000, annualRatePct: 7, months: 240, compounding: 'quarterly', contribution: 200 });
  assert.equal(r.finalBalance, 143739.17);
  // On compounding dates a lump sum still matches the textbook formula.
  const q = compound({ principal: 10_000, annualRatePct: 7, months: 9, compounding: 'quarterly' });
  assert.equal(q.finalBalance, roundTo(10_000 * 1.0175 ** 3));
});

test('quarterly and annual contributions are counted by timing', () => {
  const end = compound({ principal: 0, annualRatePct: 0, months: 24, compounding: 'monthly', contribution: 500, contributionFrequency: 'quarterly', contributionTiming: 'end' });
  assert.equal(end.contributionCount, 8);
  assert.equal(end.finalBalance, 4000);
  const start = compound({ principal: 0, annualRatePct: 0, months: 13, compounding: 'monthly', contribution: 1000, contributionFrequency: 'annually', contributionTiming: 'start' });
  assert.equal(start.contributionCount, 2);
  const endAnnual = compound({ principal: 0, annualRatePct: 0, months: 13, compounding: 'monthly', contribution: 1000, contributionFrequency: 'annually', contributionTiming: 'end' });
  assert.equal(endAnnual.contributionCount, 1);
});

test('year rows tie out and the last row can be partial', () => {
  const r = compound({ principal: 5_000, annualRatePct: 6, months: 30, compounding: 'monthly', contribution: 50 });
  assert.equal(r.years.length, 3);
  assert.equal(r.years[2].months, 6);
  for (const y of r.years) assert.equal(roundTo(y.opening + y.contributions + y.interest), y.closing);
  assert.equal(r.years.at(-1)!.closing, r.finalBalance);
  assert.equal(r.years.at(-1)!.totalInterest, r.interestEarned);
});

test('zero rate, zero term and negative rates behave', () => {
  const zero = compound({ principal: 1000, annualRatePct: 0, months: 12, compounding: 'monthly', contribution: 10 });
  assert.equal(zero.finalBalance, 1120);
  assert.equal(zero.interestEarned, 0);
  const none = compound({ principal: 1000, annualRatePct: 5, months: 0, compounding: 'monthly' });
  assert.equal(none.finalBalance, 1000);
  assert.equal(none.years.length, 0);
  assert.ok(compound({ principal: 1000, annualRatePct: -1, months: 12, compounding: 'annually' }).finalBalance < 1000);
});

test('doubling time', () => {
  assert.equal(roundTo(doublingYears(6, 'annually'), 2), 11.9);
  assert.equal(doublingYears(0, 'monthly'), Infinity);
});

test('inflation adjustment divides by (1 + inflation)^years', async () => {
  const { inflationAdjusted } = await import('./compound-interest.ts');
  // 144,572.72 ÷ 1.03^20 (1.03^20 = 1.806111235) = 80,046.41, checked independently in Python.
  assert.equal(Math.round(inflationAdjusted(144_572.72, 3, 240) * 100) / 100, 80_046.41);
  assert.equal(inflationAdjusted(1000, 0, 120), 1000);
});

test('rate range runs the same plan at the rate and either side of it', async () => {
  const { rateRange } = await import('./compound-interest.ts');
  const rows = rateRange({ principal: 10_000, annualRatePct: 5, months: 120, compounding: 'monthly' }, 1);
  assert.deepEqual(rows.map((r) => r.ratePct), [4, 5, 6]);
  // Textbook: 10,000 × (1 + r/12)^120 at 4%, 5%, 6% = 14,908.33, 16,470.09, 18,193.97.
  assert.deepEqual(rows.map((r) => r.finalBalance), [14_908.33, 16_470.09, 18_193.97]);
  assert.equal(rateRange({ principal: 100, annualRatePct: 0, months: 12, compounding: 'annually' }, 0).length, 1);
});
