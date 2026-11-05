# SEO audit: /calculators/loan-comparison-calculator

Date: 2026-11-05. Market: global. Primary keyword: **loan comparison calculator**.

## Competitors analysed

| Page | Notes |
|---|---|
| [NerdWallet personal loan comparison](https://www.nerdwallet.com/personal-loans/calculators/loan-comparison) | Two loans; amount, rate, term, origination fee %; outputs payment, interest, total cost, APR, "best option"; ~550–600 words; H2s: how to use, loan metrics, other features |
| [Omni Calculator loan](https://www.omnicalculator.com/finance/loan-comparison) | Single loan, nominal vs APR vs effective APR, prepaid/loaned/origination fees, ~2,000 words |
| [OurNetHelps](https://ournethelps.com/tools/finance/loan-comparison-calculator/) | Total cost incl. fees, extra-payment savings, break-even point |
| [WallStreetMojo](https://wallstreetmojo.com/loan-comparison-calculator), [Equate](https://equate.gbst.com/loan-comparison-calculator), Loan Market broker pages (AU) | Fees vs rate warnings, intro rates |
| APR vs interest rate: [Experian](https://www.experian.com/blogs/ask-experian/what-is-the-difference-between-apr-and-interest-rate-on-a-personal-loan/), [Fidelity](https://www.fidelity.com/learning-center/smart-money/apr-vs-interest-rate), [Discover](https://www.discover.com/personal-loans/resources/consolidate-debt/apr-vs-interest-rate/) | Worked origination-fee examples; "compare APR to APR" |

## Gaps found (before)

- No early-repayment view: fee-vs-rate trade-offs only pay off after a break-even month (one competitor shows a break-even; nobody shows it per month).
- APR vs interest rate (a large adjacent query) explained only in a FAQ.
- Lead section was "How to Use"; the answer (which offer is cheapest) came third.
- No chart.

## What changed

- **Tool:** "What each loan has cost if you repay it early" line chart (yearly points, three validated series colours) and a break-even notice ("Offer A only becomes the cheaper choice once you have kept it 26 months against Offer B and 29 months against Offer C"). Engine: `earlyRepaymentCost`, `breakEvenMonth`, 2 new tests.
- **Content outline (new):** Which Loan Offer Is Cheapest? → APR vs Interest Rate: Why the Lowest Rate Can Still Lose → Paying a Fee for a Lower Rate: How Long Until It Pays Off? (cost-at-month table, break-even 26) → Lower Monthly Payment or Lower Total Cost? → Fee Deducted or Added to the Loan? → What Every Loan Quote Should Tell You (TILA, SECCI, RBI KFS) → How the Calculator Compares Offers (method last).
- New title ("Which Loan Offer Really Costs Less?"), meta, benefits; FAQs rebuilt from PAA (APR vs rate, is a fee worth it, does a longer term cost more, different amounts). Added RBI KFS source.
- Words: 567 → 824.

## Keywords owned

loan comparison calculator; compare loan offers; compare two loans; compare loans; loan offer comparison; compare loans with fees; apr vs interest rate; apr with fees calculator; origination fee vs interest rate.

All figures from `loan-comparison.ts`, cross-checked in Python (curve, break-even, financed-fee APR 11.18%).
