import { test } from 'node:test';
import assert from 'node:assert/strict';
import { absoluteReturn, cagr, cagrPath, doublingYears, growAtCagr, ruleOf72, yearsBetween } from './cagr.ts';
import { roundTo } from './money.ts';

// Expected values recomputed independently in Python: (end / start) ** (1 / years) - 1.

const rate = (start: number, end: number, years: number) => {
  const r = cagr(start, end, years);
  assert.ok(r.ok);
  return r.rate;
};

test('10,000 → 18,000 over 5 years is 12.47% a year', () => {
  assert.equal(roundTo(rate(10_000, 18_000, 5) * 100, 2), 12.47);
});

test('doubling in 10 years is 7.18% a year', () => {
  assert.equal(roundTo(rate(1, 2, 10) * 100, 2), 7.18);
});

test('a loss gives a negative CAGR', () => {
  assert.equal(roundTo(rate(100, 50, 3) * 100, 2), -20.63);
});

test('no change gives 0%; total loss gives −100%', () => {
  assert.equal(rate(500, 500, 4), 0);
  assert.equal(rate(500, 0, 4), -1);
});

test('invalid inputs return a reason instead of NaN', () => {
  assert.deepEqual(cagr(0, 100, 5), { ok: false, error: 'start-not-positive' });
  assert.deepEqual(cagr(-100, 100, 5), { ok: false, error: 'start-not-positive' });
  assert.deepEqual(cagr(100, -5, 5), { ok: false, error: 'end-negative' });
  assert.deepEqual(cagr(100, 200, 0), { ok: false, error: 'period-not-positive' });
});

test('growing at the CAGR reproduces the end value', () => {
  const r = rate(10_000, 18_000, 5);
  assert.equal(roundTo(growAtCagr(10_000, r * 100, 5)), 18_000);
  assert.equal(roundTo(growAtCagr(10_000, 12.47, 5)), 17_996.31);
});

test('fractional periods from dates use actual days ÷ 365', () => {
  // 2020-01-01 to 2025-07-01 is 2,008 days (two leap days included).
  const years = yearsBetween('2020-01-01', '2025-07-01');
  assert.equal(roundTo(years, 6), roundTo(2008 / 365, 6));
  assert.equal(roundTo(rate(10_000, 15_000, years) * 100, 2), 7.65);
  assert.ok(Number.isNaN(yearsBetween('not-a-date', '2025-01-01')));
});

test('absolute return and doubling time', () => {
  assert.equal(absoluteReturn(10_000, 18_000), 0.8);
  const r = rate(10_000, 18_000, 5);
  assert.equal(roundTo(doublingYears(r), 2), 5.9);
  assert.equal(roundTo(ruleOf72(r), 2), 5.77);
  assert.equal(doublingYears(0), Infinity);
  assert.equal(ruleOf72(-0.1), Infinity);
});

test('year-by-year path ends at the end value', () => {
  const r = rate(10_000, 18_000, 5);
  const path = cagrPath(10_000, r, 5);
  assert.deepEqual(path.map((p) => roundTo(p.value)), [11_247.46, 12_650.54, 14_228.64, 16_003.61, 18_000]);
  assert.equal(cagrPath(100, 0.1, 2.5).length, 2);
});

test('years to reach a target at a growth rate', async () => {
  const { yearsToReach } = await import('./cagr.ts');
  // ln(2)/ln(1.08) = 9.0065 years to double at 8%.
  assert.ok(Math.abs(yearsToReach(100, 200, 8)! - 9.00646) < 1e-4);
  // 10,000 → 18,000 at 12.47% ≈ 5 years (the inverse of the page example).
  assert.ok(Math.abs(yearsToReach(10_000, 18_000, 12.4746)! - 5) < 1e-3);
  assert.equal(yearsToReach(100, 100, 5), 0);
  assert.equal(yearsToReach(100, 200, 0), null);
  assert.equal(yearsToReach(100, 200, -5), null); // shrinking never reaches a higher target
  assert.ok(Math.abs(yearsToReach(100, 50, -10)! - 6.5788) < 1e-3); // ln(0.5)/ln(0.9)
});

test('real (inflation-adjusted) CAGR', async () => {
  const { realRate } = await import('./cagr.ts');
  // (1.1247 / 1.04) − 1 = 0.081442…
  assert.ok(Math.abs(realRate(0.1247, 4) - 0.0814423) < 1e-6);
  assert.ok(Math.abs(realRate(0.05, 0) - 0.05) < 1e-12); // no inflation leaves the rate unchanged
});

test('spreadsheet formulas use the entered numbers and agree with the CAGR', async () => {
  const { spreadsheetFormulas, cagr } = await import('./cagr.ts');
  const f = spreadsheetFormulas(10_000, 18_000, 5);
  assert.equal(f.manual, '=(18000/10000)^(1/5)-1');
  assert.equal(f.rri, '=RRI(5,10000,18000)');
  const r = cagr(10_000, 18_000, 5);
  assert.ok(r.ok && Math.abs(r.rate - (18000 / 10000) ** (1 / 5) + 1) < 1e-12);
  assert.equal(spreadsheetFormulas(1, 2, 2.5).manual, '=(2/1)^(1/2.5)-1');
});
