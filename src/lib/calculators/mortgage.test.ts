import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateMortgage, monthlyShare, type MortgageInput } from './mortgage.ts';

// Expected values recomputed independently from the closed-form payment and balance formulas
// (B_k = P(1+r)^k − A((1+r)^k − 1)/r), not from this module.

const EXAMPLE: MortgageInput = {
  homePrice: 400_000,
  downPayment: 40_000,
  annualRatePct: 6.5,
  termMonths: 360,
  propertyTaxAnnual: 4_400,
  insuranceAnnual: 1_800,
  pmiRatePct: 0.5,
  hoaMonthly: 0,
};

test('PITI for the page example', () => {
  const m = calculateMortgage(EXAMPLE);
  assert.equal(m.loanAmount, 360_000);
  assert.equal(m.ltvPct, 90);
  assert.equal(m.principalAndInterest, 2275.44);
  assert.equal(m.monthlyTax, 366.67);
  assert.equal(m.monthlyInsurance, 150);
  assert.equal(m.monthlyPmi, 150); // 0.5% × 360,000 ÷ 12
  assert.equal(m.totalMonthly, 2942.11);
});

test('PMI stops when the scheduled balance reaches 78% of the original value', () => {
  const m = calculateMortgage(EXAMPLE);
  // Scheduled balance first falls to ≤ 312,000 (78% of 400,000) after payment 109.
  assert.equal(m.pmiMonths, 109);
  assert.equal(m.pmiAutoEndMonth, 110);
  assert.equal(m.totalPmi, 16_350);
  // ≤ 320,000 (80%) after payment 95: cancellation can be requested from month 96.
  assert.equal(m.pmiRequestMonth, 96);
  assert.ok(m.schedule.rows[108].closing <= 312_000 && m.schedule.rows[107].closing > 312_000);
});

test('PMI ends at the midpoint of the term even if the balance is still above 78%', () => {
  // 0% interest repays slowly enough that 78% is reached after the midpoint? No: use a long
  // interest-heavy loan where the balance at the midpoint is still above 78%.
  const m = calculateMortgage({ ...EXAMPLE, downPayment: 4_000, annualRatePct: 12, termMonths: 360 });
  assert.ok(m.schedule.rows[179].closing > 312_000);
  assert.equal(m.pmiMonths, 180);
});

test('no PMI at 20% down or more, or with a 0% PMI rate', () => {
  const twenty = calculateMortgage({ ...EXAMPLE, downPayment: 80_000 });
  assert.equal(twenty.pmiRequired, false);
  assert.equal(twenty.monthlyPmi, 0);
  assert.equal(twenty.pmiAutoEndMonth, null);
  assert.equal(twenty.principalAndInterest, 2022.62);
  assert.equal(twenty.totalMonthly, 2539.29);
  assert.equal(calculateMortgage({ ...EXAMPLE, pmiRatePct: 0 }).pmiRequired, false);
});

test('a 15-year term pays more each month and far less interest', () => {
  const m = calculateMortgage({ ...EXAMPLE, termMonths: 180 });
  assert.equal(m.principalAndInterest, 3135.99);
  assert.equal(m.totalInterest, 204_477.13);
  assert.equal(m.pmiMonths, 37);
});

test('total cost adds every component over the term', () => {
  const m = calculateMortgage({ ...EXAMPLE, hoaMonthly: 100 });
  const expected = m.schedule.totalPaid + (366.67 + 150 + 100) * 360 + m.totalPmi;
  assert.ok(Math.abs(m.totalCost - expected) < 0.005);
  assert.equal(m.totalInterest, 459_164); // last payment absorbs payment rounding
  assert.equal(m.schedule.rows.at(-1)!.closing, 0);
});

test('paying cash means no loan and no NaN', () => {
  const m = calculateMortgage({ ...EXAMPLE, downPayment: 400_000 });
  assert.equal(m.loanAmount, 0);
  assert.equal(m.principalAndInterest, 0);
  assert.equal(m.pmiRequired, false);
  assert.equal(m.totalMonthly, 516.67);
});

test('monthlyShare rounds an annual amount to the cent', () => {
  assert.equal(monthlyShare(4_400), 366.67);
  assert.equal(monthlyShare(1_000), 83.33);
});
