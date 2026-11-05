# Implementation Status

Last updated: 2026-11-05 (end of batch 1). The plan and URLs for all 50 tools are in `TOOL_INVENTORY.md`.

## Summary

| | Count |
|---|---:|
| Already existed (reused, not rebuilt) | 4 (#31 reconciliation tool, #32 statement analyzer, #36 bank statement to CSV, #42 cash flow) |
| Built in batch 1 | 10 (#1–8, #15, #17) |
| Remaining | 36 |

## Batch 1: done

| # | Tool | URL |
|---|---|---|
| 1 | EMI Calculator | `/calculators/emi-calculator` |
| 2 | Mortgage Calculator | `/calculators/mortgage-calculator` |
| 3 | Loan Repayment Calculator | `/calculators/loan-repayment-calculator` |
| 4 | Credit Card Interest Calculator | `/calculators/credit-card-interest-calculator` |
| 5 | Debt Payoff Calculator | `/calculators/debt-payoff-calculator` |
| 6 | Loan Comparison Calculator | `/calculators/loan-comparison-calculator` |
| 7 | Compound Interest Calculator | `/calculators/compound-interest-calculator` |
| 8 | Simple Interest Calculator | `/calculators/simple-interest-calculator` |
| 15 | SIP Calculator | `/calculators/sip-calculator` |
| 17 | CAGR Calculator | `/calculators/cagr-calculator` |

Also shipped: the `/calculators` hub (was a 307 to the cash flow page), header and footer links, and sitemap entries.

## Architecture added in batch 1

- **Markdown-driven pages.** Each tool is `src/content/calculators/<slug>.md`: frontmatter for SEO, hub placement, CTAs, related tools, sources and FAQs; the body for the educational content. The `[slug]` template no longer hardcodes cash-flow copy.
- **Wiring.** A slug goes live when it is in `CALCULATOR_SLUGS` (`src/components/calculators/registry.ts`) and `CalculatorLoader.tsx`, and has a markdown file. `site-integrity.test.ts` fails if the three differ, or if the sitemap misses it.
- **Engines.** `src/lib/calculators/*.ts` are pure and import-free except for `money.ts` and `loan.ts`, so they run under `node --test` and in Next unchanged (`allowImportingTsExtensions` in tsconfig).
- **UI kit.** `src/components/calculators/ui.tsx` provides the layout with a sticky result panel and a mobile summary bar, validated number/select/segmented fields, currency picker, result lists, notices, empty state, an SVG line chart with hover/keyboard tooltip, a split bar, and a collapsible table with CSV export.
- **Code splitting.** Each page loads only its own calculator (verified in the production bundle).

## Open items and caveats

- **UK early repayment rule (loan repayment page).** The Consumer Credit Act 1974 s.95A caps were confirmed from legislation.gov.uk search snippets; the full statute page did not load for the agent. Check the wording before relying on it.
- **Shared fields to add when needed.** Three tools define their own date or text inputs. Move a `DateField` and `TextField` into `ui.tsx` before XIRR and the financial-year calculator.
- **Entitlements.** Not built yet: every batch-1 tool is free, runs client-side, and has no limits to enforce. The centralised entitlement config (`src/lib/entitlements.ts`) comes with batch 5, where file limits and exports first need it.
- **Tax tools** need verified rates. The schema and rules are in `COUNTRY_TAX_CONFIG.md`.

## Next batches

2. #9–14, #16, #18–22, #25 (remaining personal formula tools)
3. #37–41, #43, #44, #49 (business calculators)
4. #23, #24, #26–30 (tax; verified configs only)
5. #33–35, #45–48, #50 (`/tools` prefix: browser-side CSV tools, invoice/expense/statement generators with `pdf-lib`, entitlements)
