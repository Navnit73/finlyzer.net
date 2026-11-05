# Test Report

Run: 2026-11-05, batch 1.

## Commands and results

| Check | Command | Result |
|---|---|---|
| Unit + integrity tests | `npm run test:calc` (Node 24 `node --test`, no new dependency) | **97 passed, 0 failed** |
| Type check | `npx tsc --noEmit -p .` | clean |
| Lint | `npm run lint` | 0 errors; 19 warnings, all in pre-existing files (API routes, OCR workspace, admin sidebar), none in new code |
| Production build | `npm run build` | success; 11 calculator pages prerendered (SSG) |

The older suites in `src/lib/__tests__` are standalone scripts with no runner, and are unchanged by this work.

## Test files

| File | Tests | Covers |
|---|---:|---|
| `money.test.ts` | 7 | Rounding (1.005, 2.675, negatives, −0), minor units, input parsing (lakh grouping, symbols, typographic minus, junk), validation messages, locale formatting, CSV quoting |
| `loan.test.ts` | 11 | Published EMI/mortgage/car-loan payments, 0% loans, degenerate inputs, schedule integrity (sums, final payment, zero balance), extra and lump-sum payments, negative amortization, yearly roll-up |
| `mortgage.test.ts` | 8 | PITI parts, PMI start/stop months (78% / 80% / midpoint), 20% down = no PMI, term variants |
| `loan-repayment.test.ts` | 8 | Interest and months saved, lump sums, pay-what-I-can mode, too-low and too-long payments |
| `credit-card.test.ts` | 8 | DPR and effective rate, fixed payment, minimum-payment rules, target-date payment, never-repaid case |
| `debt-payoff.test.ts` | 6 | Avalanche vs snowball order and totals, rollover, budget below minimums |
| `loan-comparison.test.ts` | 6 | Fee-inclusive APR (no-fee APR = note rate), deducted vs financed fees, cheapest-offer ranking |
| `compound-interest.test.ts` | 9 | All compounding frequencies against textbook values, continuous, APY, mixed contribution schedules, timing |
| `simple-interest.test.ts` | 8 | Solving for each variable, day-count bases, date ranges, zero divisors |
| `sip.test.ts` | 8 | Closed form vs simulation, Axis MF published values (₹99,91,479 / ₹25,22,880), effective-rate method, step-up |
| `cagr.test.ts` | 9 | CAGR and future value, losses, total loss, invalid start/end, date periods |
| `site-integrity.test.ts` | 9 | Registry ↔ loader ↔ markdown in sync; slug format; required frontmatter; unique titles/descriptions and SERP length; no raw H1 in bodies; no primary keyword owned twice across all content folders; related slugs valid; internal links resolve; hub and every calculator in the sitemap with no `<lastmod>` |

Expected values come from published references or independent recomputation (Python closed forms), never from the engine under test.

## Manual checks

- Rendered every calculator page at 1280 px and the EMI page at a true 390 px width (iframe; headless Chrome's minimum window is 500 px). Found and fixed: a hidden currency prefix, axis text scaling down on phones, a clipped last axis label.
- Production bundle: verified each calculator page loads only its own tool. Static imports had put all calculators in every page; they are now per-tool `next/dynamic` chunks, still server-rendered.
- Status codes: hub and all calculator pages 200; mixed-case slug 308; unknown slug 404; per-page share image 200.

## Not yet covered

- Browser interaction tests (typing, toggles, CSV download). There is no browser test runner in the project, and none was added.
- The older `src/lib/__tests__` scripts were not run.
