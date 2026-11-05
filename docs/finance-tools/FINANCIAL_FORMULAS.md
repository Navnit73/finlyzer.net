# Financial Formulas

The formula, conventions and assumptions behind each live calculator. The engine file's header comment is the source of truth. This page summarises it, and the tests in `src/lib/calculators/*.test.ts` pin the reference values.

## Shared conventions (`money.ts`, `loan.ts`)

- **Rounding:** half away from zero, after `toPrecision(15)` strips binary noise (1.005 → 1.01). Running totals and schedules use integer minor units (cents, paise), so totals never drift.
- **Schedules:** each month's interest is rounded to the cent, as a lender's schedule is. The payment is rounded to the cent, and the last contractual payment absorbs the remainder so the balance ends at exactly 0. Example: $200,000 at 6% for 30 years pays 359 × $1,199.10 plus a final $1,200.14.
- **Currency selector:** formatting only (en-IN grouping for INR). Amounts are never converted.
- **Input validation:** `validateNumber()` gives a per-field message. Invalid input shows an empty state, never NaN or stale figures.

## Loans and credit

| Calculator | Formula | Notes and assumptions |
|---|---|---|
| EMI | EMI = P·r·(1+r)^n ÷ ((1+r)^n − 1), r = annual ÷ 12 ÷ 100; EMI = P ÷ n at 0% | Reducing balance. The rate-change what-if uses the same formula at the new rate, plus n = −ln(1 − rP/A) ÷ ln(1+r) for the same-EMI tenure. |
| Mortgage | P&I as EMI; PITI = P&I + tax/12 + insurance/12 + PMI + HOA | PMI only if LTV > 80%. It ends automatically when the *scheduled* balance reaches 78% of original value or at the term midpoint; cancellation can be requested at 80% (Homeowners Protection Act, per CFPB). "Original value" = price entered. |
| Loan repayment | Baseline amortization vs amortization with monthly extra and lump sums; time-to-repay via n above | A payment ≤ the first month's interest is rejected as never repaying. Payoffs over 1,200 months are reported as too long. |
| Credit card interest | DPR = APR ÷ 365 (or 360); cycle interest = balance × DPR × days in cycle | Simplified: interest on the opening balance of each cycle (real cards use the average daily balance), no new purchases or fees. Minimum = max(floor, % of balance [+ interest]). |
| Debt payoff | Monthly: interest = balance × APR/12, pay minimums, budget surplus to the priority debt | Avalanche = highest APR first, snowball = smallest balance first. Freed minimums roll over. Fixed APRs and minimums. |
| Loan comparison | APR i solves cash received = Σ (payment + monthly fee) ÷ (1+i)^t (bisection); APR = 12i, effective = (1+i)^12 − 1 | Upfront fees either deducted from proceeds or added to the loan. Ranks offers by total cost (interest + fees), not by payment. |

## Savings and investing

| Calculator | Formula | Notes and assumptions |
|---|---|---|
| Compound interest | A = P(1 + r/m)^(mt); continuous A = Pe^(rt); APY = (1 + r/m)^m − 1 | Contributions on a different schedule grow at the equivalent monthly rate (1 + APY)^(1/12) − 1. This matches the textbook balance exactly at compounding dates. Reference: 10,000 at 5% monthly for 10 years = 16,470.09. |
| Simple interest | SI = P·R·T ÷ 100, solved for any of SI, P, R, T | Days ÷ 365 (Actual/365) or ÷ 360 (Actual/360). |
| SIP | FV = P·((1+i)^n − 1) ÷ i·(1+i) (start-of-month instalments) | i = annual ÷ 12 (default, matches Axis MF's published figures) or (1 + annual)^(1/12) − 1 (HDFC MF). Step-up is simulated month by month. The rate is the user's assumption. |
| CAGR | CAGR = (end ÷ start)^(1/years) − 1 | Undefined for start ≤ 0 or end < 0; end = 0 is −100%. Date periods use actual days ÷ 365 (as Excel XIRR does). |
| Cash flow (existing) | Net = operating + investing + financing; direct and indirect OCF | See `src/content/calculators/cash-flow-calculator.md`. |
