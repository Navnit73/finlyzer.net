import { test } from 'node:test';
import assert from 'node:assert/strict';
import { annualCompoundInterest, daysBetween, solveSimpleInterest, toYears } from './simple-interest.ts';
import { roundTo } from './money.ts';

// Expected values worked by hand from SI = P × R × T ÷ 100.

function ok(r: ReturnType<typeof solveSimpleInterest>) {
  assert.ok(r.ok, r.ok ? '' : r.error);
  return r as Extract<typeof r, { ok: true }>;
}

test('find interest: 50,000 at 8% for 3 years = 12,000', () => {
  const r = ok(solveSimpleInterest({ solveFor: 'interest', principal: 50_000, ratePct: 8, years: 3 }));
  assert.equal(r.interest, 12_000);
  assert.equal(r.amount, 62_000);
});

test('find rate: 20,000 earning 3,600 in 2 years = 9%', () => {
  assert.equal(ok(solveSimpleInterest({ solveFor: 'rate', principal: 20_000, interest: 3_600, years: 2 })).ratePct, 9);
});

test('find time: 15,000 at 6% earning 1,800 = 2 years', () => {
  assert.equal(ok(solveSimpleInterest({ solveFor: 'time', principal: 15_000, ratePct: 6, interest: 1_800 })).years, 2);
});

test('find principal: 4,500 at 7.5% over 3 years = 20,000', () => {
  assert.equal(roundTo(ok(solveSimpleInterest({ solveFor: 'principal', interest: 4_500, ratePct: 7.5, years: 3 })).principal), 20_000);
});

test('days with Actual/365 and Actual/360', () => {
  const t365 = toYears(90, 'days', 365);
  const t360 = toYears(90, 'days', 360);
  assert.equal(roundTo(ok(solveSimpleInterest({ solveFor: 'interest', principal: 100_000, ratePct: 9, years: t365 })).interest), 2219.18);
  assert.equal(roundTo(ok(solveSimpleInterest({ solveFor: 'interest', principal: 100_000, ratePct: 9, years: t360 })).interest), 2250);
  assert.equal(toYears(18, 'months'), 1.5);
});

test('division by zero is an error, not Infinity', () => {
  assert.equal(solveSimpleInterest({ solveFor: 'rate', principal: 0, interest: 100, years: 2 }).ok, false);
  assert.equal(solveSimpleInterest({ solveFor: 'time', principal: 1000, ratePct: 0, interest: 100 }).ok, false);
  assert.equal(solveSimpleInterest({ solveFor: 'principal', interest: 100, ratePct: 5, years: 0 }).ok, false);
  assert.equal(solveSimpleInterest({ solveFor: 'interest', principal: 1000, years: 1 }).ok, false);
});

test('days between dates counts actual days, including leap days', () => {
  assert.equal(daysBetween('2024-01-01', '2025-01-01'), 366);
  assert.equal(daysBetween('2026-01-01', '2027-01-01'), 365);
  assert.equal(daysBetween('2026-03-01', '2026-05-30'), 90);
  assert.equal(daysBetween('2026-05-30', '2026-03-01'), -90);
  assert.equal(daysBetween('2026-02-30', '2026-03-01'), null);
  assert.equal(daysBetween('', '2026-03-01'), null);
});

test('annual compounding comparison: 50,000 at 8% for 3 years', () => {
  assert.equal(roundTo(annualCompoundInterest(50_000, 8, 3)), 12985.6);
});

test('a monthly rate is twelve times the annual rate', async () => {
  const { annualRatePct, solveSimpleInterest } = await import('./simple-interest.ts');
  assert.equal(annualRatePct(2, 'month'), 24);
  assert.equal(annualRatePct(8, 'year'), 8);
  // ₹1,00,000 at 2% a month for 6 months: 1,00,000 × 24 × 0.5 ÷ 100 = ₹12,000.
  const r = solveSimpleInterest({ solveFor: 'interest', principal: 100_000, ratePct: 24, years: 0.5 });
  assert.ok(r.ok && Math.abs(r.interest - 12_000) < 1e-9);
});

test('interest per year, month and day', async () => {
  const { interestPerPeriod } = await import('./simple-interest.ts');
  const p = interestPerPeriod(50_000, 8);
  assert.equal(p.perYear, 4000);
  assert.ok(Math.abs(p.perMonth - 333.3333333) < 1e-6);
  assert.ok(Math.abs(p.perDay - 10.95890411) < 1e-6);
  assert.ok(Math.abs(interestPerPeriod(50_000, 8, 360).perDay - 11.1111111) < 1e-6);
});

test('simple schedule grows by the same amount each year, with a part year at the end', async () => {
  const { simpleSchedule } = await import('./simple-interest.ts');
  const rows = simpleSchedule(50_000, 8, 2.5);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map((r) => r.interest), [4000, 4000, 2000]);
  assert.equal(rows[2].balance, 60_000);
  assert.equal(rows[2].fraction, 0.5);
  assert.equal(simpleSchedule(50_000, 8, 3).at(-1)!.balance, 62_000);
});
