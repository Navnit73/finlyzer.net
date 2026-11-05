# SEO audit: /calculators/emi-calculator

Date: 2026-11-05. Market: India. Primary keyword: **emi calculator**.

## Competitors analysed

| URL | Structure (H2s) | Tool features | Notes |
|---|---|---|---|
| https://groww.in/calculators/emi-calculator | Factors affecting EMI · how the calculator helps · formula · types (home/car/personal/education/LAP as H3) · how to use · advantages | Amount, rate, tenure; yearly/monthly amortization; principal vs interest | ~900–1,000 words, no FAQ. Formula on page is misprinted. |
| https://cred.club/calculators/emi-calculator | What/how/why · worked example · advantages · effect of prepayment · factors · FAQ | Sliders, table + chart, share buttons | ~1,400 words. FAQ: what EMI means, how to calculate, does EMI change, what is pre-EMI, tenure effect. |
| https://indmoney.com/calculators/emi-calculator | What/how to use (step H3s) · how it works · limitations · types · FAQ | Amount, rate, tenure | ~1,500 words. FAQ: same calculator for all loans, debt-to-income, pre-EMI, missed EMI, reduce EMI, EMI change. |
| https://emicalculator.net/ | What is EMI · how to use · floating-rate EMI calculation | Loan-type tabs, EMI in advance/arrears, schedule by calendar or **financial year**, yearly chart, PDF/Excel, share link | Long-standing #1-type result; strongest tool. |
| Search snippets (Angel One, Business Today, Kotak Neo Stockshaala) | "How to calculate EMI" guides | — | Formula + worked examples; Excel PMT as a shortcut. |

People-also-ask themes seen across results: what is EMI, how is it calculated, can EMI change, pre-EMI, how to reduce EMI, what if I miss an EMI, debt-to-income/how much salary, Excel PMT.

## Gaps found (before)

- Content: no quick-answer table (EMI per ₹1 lakh), no Excel method, no pre-EMI, nothing per loan type, no missed-EMI or affordability answer, no tenure-vs-cost table. Outline was the same "How to use → Formula → Example → What changes" as every other page; 659 words.
- Tool: no financial-year/calendar-year schedule (the strongest competitor has it and Indian borrowers need it for interest certificates), no EMI per lakh, no affordability share.
- Ours already better: floating-rate what-if (higher EMI vs more EMIs) tied to RBI reset rules; exact paisa schedule; CSV.

## Changes

- **Title/meta:** metaTitle "EMI Calculator for Home, Car & Personal Loans | Finlyzers" (57); new description leads with schedule by financial year and per-lakh table (146).
- **New outline (intent-led, not the shared template):** EMI per ₹1 Lakh at Common Rates (lookup table first) → The EMI Formula, Step by Step (incl. Excel PMT) → Where Each EMI Goes (tenure vs total interest table) → Your EMI by Loan Type (home/pre-EMI, car/EMI in advance, personal/flat rate and fees, education/moratorium) → When Your EMI Changes (rate table + RBI rights) → Ways to Pay Less (tenure, down payment, prepayment rule, APR/KFS) → Reading the Schedule by Financial Year.
- **FAQs** rewritten from PAA: formula, Excel, can EMI change, pre-EMI, missed EMI, salary share, tenure, flat vs reducing, last EMI.
- **Tool:** optional first-EMI month/year → schedule grouped by financial year (Apr–Mar) or calendar year, with an EMI count column and dated monthly rows (`src/lib/calculators/emi.ts`, 5 tests); EMI per ₹1 lakh (per 1,000 for other currencies); optional take-home income → EMI as % of income, with no invented lender limit.
- **Keywords added** (unowned elsewhere): education loan emi calculator, emi per lakh, emi calculation in excel, pre emi calculation.
- **Sources added:** RBI KFS circular (APR in the Key Facts Statement, loans sanctioned from 1 Oct 2024).
- Words: 659 → 975 (body, excluding FAQs). Every figure computed by the engine and cross-checked in Python.
