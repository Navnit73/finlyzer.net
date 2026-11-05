import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emiDate, groupSchedule } from './emi.ts';
import { amortize, yearlySummary } from './loan.ts';
import { roundTo } from './money.ts';

const loan = amortize({ principal: 2_500_000, annualRatePct: 8.5, months: 240 });

test('emiDate walks across year ends', () => {
  assert.deepEqual(emiDate(10, 2026, 1), { month: 10, year: 2026 }); // Nov 2026
  assert.deepEqual(emiDate(10, 2026, 3), { month: 0, year: 2027 }); // Jan 2027
  assert.deepEqual(emiDate(0, 2026, 240), { month: 11, year: 2045 });
});

test('loan-year grouping matches yearlySummary', () => {
  const g = groupSchedule(loan.rows, 'loan');
  const y = yearlySummary(loan.rows);
  assert.equal(g.length, 20);
  g.forEach((p, i) => {
    assert.equal(p.label, `Year ${i + 1}`);
    assert.equal(p.interest, y[i].interest);
    assert.equal(p.closing, y[i].closing);
  });
});

test('financial-year grouping: first EMI in November 2026', () => {
  // Nov 2026–Mar 2027 = 5 EMIs in FY 2026-27, then 12 a year, and the last 7 (Apr–Oct 2046) in FY 2046-47.
  const g = groupSchedule(loan.rows, 'financial', 10, 2026);
  assert.equal(g[0].label, 'FY 2026-27');
  assert.equal(g[0].emis, 5);
  assert.equal(g[1].label, 'FY 2027-28');
  assert.equal(g[1].emis, 12);
  assert.equal(g.at(-1)!.label, 'FY 2046-47');
  assert.equal(g.at(-1)!.emis, 7);
  assert.equal(g.length, 21);
  assert.equal(g.reduce((t, p) => t + p.emis, 0), 240);
  // Interest in the first 5 EMIs equals the sum of the monthly rows.
  assert.equal(g[0].interest, roundTo(loan.rows.slice(0, 5).reduce((t, r) => t + r.interest, 0)));
  assert.equal(roundTo(g.reduce((t, p) => t + p.interest, 0)), loan.totalInterest);
  assert.equal(g.at(-1)!.closing, 0);
});

test('calendar-year grouping: first EMI in January covers whole years', () => {
  const g = groupSchedule(loan.rows, 'calendar', 0, 2027);
  assert.equal(g.length, 20);
  assert.equal(g[0].label, '2027');
  assert.ok(g.every((p) => p.emis === 12));
});

test('financial year label rolls over the century correctly', () => {
  const g = groupSchedule(amortize({ principal: 1000, annualRatePct: 10, months: 2 }).rows, 'financial', 3, 2099);
  assert.equal(g[0].label, 'FY 2099-00');
});
