# Finance Tools: Inventory and Audit

Audit date: 2026-11-05. Scope: the 50-tool brief (30 personal finance, 20 business finance).

## Repository facts the plan builds on

| Area | Finding |
|---|---|
| Framework | Next.js 16.3.8 (App Router), React 19.2.8, Tailwind 4 + daisyUI 5, TypeScript strict |
| Route groups | English site in `src/app/(site)`, German site in `src/app/de` (own root layout) |
| Markdown pages | `src/lib/seo-markdown.ts` parses frontmatter + a small markdown subset (no dependency). One loader per content folder. |
| Calculators | `src/content/calculators/<slug>.md` + a component registered in `CALCULATORS` in `src/app/(site)/calculators/[slug]/page.tsx`. `dynamicParams = false`, so a page needs both content and a registered tool. |
| Access | `/calculators/*` is shared (guests and signed-in users), not in `PUBLIC_ONLY_PREFIXES`. Proxy lowercases slugs. |
| SEO | `pageMetadata()` (canonical, OG) and JSON-LD helpers in `src/lib/seo-config.ts`; hand-maintained `public/sitemap.xml` with no `<lastmod>` (owner decision); no English hreflang. |
| Charts | No chart library. Charts must be SVG. |
| PDF | `pdf-lib` is installed (usable for invoice and statement PDFs). |
| Tests | No test runner. Node 24 runs `.ts` natively, so calculation tests use `node --test` with no new dependency (`npm run test:calc`). |
| Payments/limits | `FREE_PAGE_LIMIT` = 10, `GUEST_MAX_PAGES` = 30 in `src/types/pricing.ts`; Razorpay; credits via `getUserQuota`. |
| Reserved paths | `/invoices` is the signed-in billing page, so invoice generators cannot live there. |

## Status of the 50 tools

Legend: **exists** = live before this work; **planned** = not built yet; **built** = shipped in a batch (see `IMPLEMENTATION_STATUS.md`).

### A. Personal finance

| # | Tool | URL | Status | Notes |
|---|---|---|---|---|
| 1 | EMI Calculator | `/calculators/emi-calculator` | **built** (batch 1) | India-first (INR default, lakh grouping), works in any currency |
| 2 | Mortgage Calculator | `/calculators/mortgage-calculator` | **built** (batch 1) | US PITI: tax, insurance, PMI, HOA as user inputs; no invented rates |
| 3 | Loan Repayment Calculator | `/calculators/loan-repayment-calculator` | **built** (batch 1) | Distinct from EMI: solves payoff time, extra payments, interest saved |
| 4 | Credit Card Interest Calculator | `/calculators/credit-card-interest-calculator` | **built** (batch 1) | APR → daily rate, minimum-payment trap, payoff time |
| 5 | Debt Payoff Calculator | `/calculators/debt-payoff-calculator` | **built** (batch 1) | Multiple debts, avalanche vs snowball |
| 6 | Loan Comparison Calculator | `/calculators/loan-comparison-calculator` | **built** (batch 1) | Two to three offers incl. fees, true cost |
| 7 | Compound Interest Calculator | `/calculators/compound-interest-calculator` | **built** (batch 1) | Compounding frequency, contributions |
| 8 | Simple Interest Calculator | `/calculators/simple-interest-calculator` | **built** (batch 1) | Solve for any variable, day-count basis |
| 9 | Savings Goal Calculator | `/calculators/savings-goal-calculator` | planned | |
| 10 | Emergency Fund Calculator | `/calculators/emergency-fund-calculator` | planned | |
| 11 | Retirement Calculator | `/calculators/retirement-calculator` | planned | |
| 12 | FIRE Calculator | `/calculators/fire-calculator` | planned | |
| 13 | Inflation Calculator | `/calculators/inflation-calculator` | planned | User-entered rate only; no CPI series is bundled, so no historical claims |
| 14 | Net Worth Calculator | `/calculators/net-worth-calculator` | planned | |
| 15 | SIP Calculator | `/calculators/sip-calculator` | **built** (batch 1) | India; step-up SIP |
| 16 | SWP Calculator | `/calculators/swp-calculator` | planned | India |
| 17 | CAGR Calculator | `/calculators/cagr-calculator` | **built** (batch 1) | |
| 18 | XIRR Calculator | `/calculators/xirr-calculator` | planned | Newton + bisection fallback, Excel-compatible |
| 19 | Stock Average Calculator | `/calculators/stock-average-calculator` | planned | |
| 20 | Stock Profit/Loss Calculator | `/calculators/stock-profit-calculator` | planned | |
| 21 | Dividend Yield Calculator | `/calculators/dividend-yield-calculator` | planned | |
| 22 | ROI Calculator | `/calculators/roi-calculator` | planned | |
| 23 | Income Tax Calculator | `/calculators/income-tax-calculator-india` | planned (tax batch) | Needs verified FY 2026-27 slabs, both regimes |
| 24 | Salary After Tax Calculator | `/calculators/uk-salary-after-tax-calculator` | planned (tax batch) | UK income tax + NI, 2026/27; Scotland separate bands |
| 25 | Hourly to Annual Salary | `/calculators/hourly-to-annual-salary-calculator` | planned | Global, no tax |
| 26 | Paycheck Calculator | `/calculators/paycheck-calculator` | planned (tax batch) | US federal withholding + FICA; state config with verified rates only |
| 27 | GST Calculator | `/calculators/gst-calculator` | planned (tax batch) | India GST slabs after the 2025 rationalisation must be verified |
| 28 | VAT Calculator | `/calculators/vat-calculator` | planned (tax batch) | UK + DE, FR, ES, NL, IT standard and reduced rates |
| 29 | Capital Gains Tax Calculator | `/calculators/capital-gains-tax-calculator` | planned (tax batch) | One page, jurisdiction selector (US, UK, IN) instead of thin country copies |
| 30 | Sales Tax Calculator | `/calculators/sales-tax-calculator` | planned (tax batch) | US; user-entered combined rate, state base rates only when verified |

### B. Business finance

| # | Tool | URL | Status | Notes |
|---|---|---|---|---|
| 31 | Bank Reconciliation Tool | `/reconcile/bank-reconciliation-tool` | **exists** | Backend matching; results at `/reconciliation/[id]`. Matching-rule configuration lives in the backend (`ocr.advance`), out of scope here. |
| 32 | Bank Statement Analyzer | `/analyzer/bank-statement-analyzer` | **exists** | |
| 33 | Duplicate Transaction Finder | `/tools/duplicate-transaction-finder` | planned | Browser-side CSV/XLSX; exact vs probable duplicates |
| 34 | Missing Transaction Detector | `/tools/missing-transaction-detector` | planned | Gaps *inside one statement* (balance breaks, date gaps, cheque sequence). Two-sided "missing from my books" stays with `/reconcile/bank-statement-matching-tool`. |
| 35 | Bank Balance Checker | `/tools/bank-balance-checker` | planned | Running-balance validation; reuse logic of `src/lib/balance-check.ts` |
| 36 | CSV Bank Statement Converter | `/convert/bank-statement-to-csv` | **exists** | |
| 37 | Profit Margin Calculator | `/calculators/profit-margin-calculator` | planned | |
| 38 | Gross Profit Calculator | `/calculators/gross-profit-calculator` | planned | COGS from inventory movement, distinct from #37 |
| 39 | Net Profit Calculator | `/calculators/net-profit-calculator` | planned | Mini P&L |
| 40 | Markup Calculator | `/calculators/markup-calculator` | planned | |
| 41 | Break-Even Calculator | `/calculators/break-even-calculator` | planned | |
| 42 | Cash Flow Calculator | `/calculators/cash-flow-calculator` | **exists** | Kept; template generalised around it |
| 43 | Business Valuation Calculator | `/calculators/business-valuation-calculator` | planned | DCF + multiples; multiples are user inputs |
| 44 | Accounts Receivable Calculator | `/calculators/accounts-receivable-calculator` | planned | Turnover, DSO, ageing |
| 45 | Invoice Generator | `/tools/invoice-generator` | planned | PDF via `pdf-lib`, browser-only |
| 46 | VAT Invoice Generator | `/tools/vat-invoice-generator` | planned | UK/EU required fields, reverse charge |
| 47 | GST Invoice Generator | `/tools/gst-invoice-generator` | planned | GSTIN, HSN/SAC, CGST/SGST vs IGST by place of supply |
| 48 | Expense Report Generator | `/tools/expense-report-generator` | planned | |
| 49 | Financial Year Calculator | `/calculators/financial-year-calculator` | planned | FY/AY/tax year for IN, US, UK, DE, FR, ES, NL, IT |
| 50 | Financial Statement Generator | `/tools/financial-statement-generator` | planned | P&L and balance sheet with balance check, PDF |

Related existing pages that are not in the brief but border on it: `/reconcile/bank-reconciliation-calculator`, `/reconcile/bank-statement-matching-tool`, `/reconcile/bank-statement-vs-ledger`, `/de/ratgeber/*`.

## Batches

1. **Batch 1**: shared architecture + #1–8, #15, #17 (formula-only tools, no jurisdiction data).
2. **Batch 2**: #9–14, #16, #18–22, #25 (remaining personal formula tools).
3. **Batch 3**: business calculators #37–41, #43, #44, #49.
4. **Batch 4 (tax)**: #23, #24, #26–30. Each rate must be verified against an official source and stored with `effectiveFrom`, `source` and `lastVerified`.
5. **Batch 5 (`/tools`)**: #33–35, #45–48, #50, plus the `/tools` route, hub and entitlement config for file limits.
