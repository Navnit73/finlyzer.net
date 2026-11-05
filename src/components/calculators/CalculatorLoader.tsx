'use client';

import dynamic from 'next/dynamic';
import type React from 'react';

/**
 * Loads only the calculator a page needs. Each entry is its own chunk; `next/dynamic` still
 * server-renders it, so the HTML has the full tool. (Static imports from the server page put
 * every calculator in every page's bundle.) Keep in sync with CALCULATOR_SLUGS in ./registry.ts;
 * site-integrity.test.ts checks this.
 */
const LOADERS: Record<string, React.ComponentType> = {
  'cash-flow-calculator': dynamic(() => import('./CashFlowCalculator')),
  'emi-calculator': dynamic(() => import('./EmiCalculator')),
  'mortgage-calculator': dynamic(() => import('./MortgageCalculator')),
  'loan-repayment-calculator': dynamic(() => import('./LoanRepaymentCalculator')),
  'credit-card-interest-calculator': dynamic(() => import('./CreditCardInterestCalculator')),
  'debt-payoff-calculator': dynamic(() => import('./DebtPayoffCalculator')),
  'loan-comparison-calculator': dynamic(() => import('./LoanComparisonCalculator')),
  'compound-interest-calculator': dynamic(() => import('./CompoundInterestCalculator')),
  'simple-interest-calculator': dynamic(() => import('./SimpleInterestCalculator')),
  'sip-calculator': dynamic(() => import('./SipCalculator')),
  'cagr-calculator': dynamic(() => import('./CagrCalculator')),
};

export default function CalculatorLoader({ slug }: { slug: string }) {
  const Calculator = LOADERS[slug];
  return Calculator ? <Calculator /> : null;
}
