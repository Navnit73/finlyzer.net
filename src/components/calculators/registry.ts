/**
 * Live /calculators/<slug> pages. A markdown file in src/content/calculators without an entry here
 * is not served (and vice versa). Each slug needs a loader in ./CalculatorLoader.tsx;
 * site-integrity.test.ts checks that the three lists match.
 */
export const CALCULATOR_SLUGS: ReadonlySet<string> = new Set([
  'cash-flow-calculator',
  'emi-calculator',
  'mortgage-calculator',
  'loan-repayment-calculator',
  'credit-card-interest-calculator',
  'debt-payoff-calculator',
  'loan-comparison-calculator',
  'compound-interest-calculator',
  'simple-interest-calculator',
  'sip-calculator',
  'cagr-calculator',
]);
