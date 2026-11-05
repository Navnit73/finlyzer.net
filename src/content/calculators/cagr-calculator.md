---
slug: "cagr-calculator"
title: "CAGR Calculator: Compound Annual Growth Rate, Formula and Excel"
shortTitle: "CAGR Calculator"
metaTitle: "CAGR Calculator: Formula, Excel & Real Growth Rate | Finlyzers"
metaDescription: "Find the compound annual growth rate between two values, the value at a given CAGR or the years to a target. With Excel formulas and inflation-adjusted CAGR."
intro: "Turn any start and end value into one yearly growth rate, then compare it with inflation and copy the same calculation into Excel or Google Sheets. You can also project a value forward at a growth rate, or find how long it takes to reach a target."
badgeText: "Free CAGR calculator"
datePublished: "2026-11-05"
dateModified: "2026-11-05"
category: "personal"
group: "Investing"
market: "Global"
summary: "Yearly growth rate between two values, with Excel formulas."
ctaLabel: "Calculate CAGR"
faqSubtitle: "CAGR, absolute return, XIRR and spreadsheets."
ogTags:
  - "CAGR"
  - "Excel formula"
  - "Real growth"
keywords:
  - "cagr calculator"
  - "cagr formula"
  - "compound annual growth rate"
  - "compound annual growth rate calculator"
  - "how to calculate cagr"
  - "cagr calculation"
  - "annual growth rate calculator"
  - "cagr formula in excel"
  - "how to calculate cagr in excel"
  - "cagr vs absolute return"
  - "reverse cagr calculator"
  - "inflation adjusted cagr"
  - "revenue cagr"
benefits:
  - "Growth rate, future value or time to a target"
  - "Excel and Google Sheets formulas with your numbers"
  - "Real CAGR after inflation"
related:
  - "xirr-calculator"
  - "roi-calculator"
  - "sip-calculator"
  - "compound-interest-calculator"
faqs:
  - question: "How do you calculate CAGR?"
    answer: "Divide the ending value by the starting value, raise the result to the power of 1 ÷ number of years, and subtract 1. For 10,000 growing to 18,000 in 5 years: 1.8^(1/5) − 1 = 0.1247, a CAGR of 12.47% a year."
  - question: "How do I calculate CAGR in Excel?"
    answer: "With the start value in A2, the end value in B2 and the years in C2, use =(B2/A2)^(1/C2)-1 or =RRI(C2,A2,B2), then format the cell as a percentage. RRI is available in Excel 2013 and later and in Google Sheets. The calculator shows both formulas filled in with your numbers."
  - question: "What is a good CAGR?"
    answer: "There is no single number. Compare a CAGR with inflation over the same years to see whether the value grew in real terms, and with a relevant benchmark, such as an index or a competitor's revenue, over the same dates. A higher CAGR that came with much bigger swings is not necessarily better."
  - question: "What is the difference between CAGR and absolute return?"
    answer: "Absolute return is the total change, (end − start) ÷ start, with no allowance for time. CAGR spreads that change over the years as a compounded yearly rate. An 80% gain is 12.47% a year over 5 years but 34.16% a year over 2 years, so absolute return alone cannot compare holdings kept for different periods."
  - question: "Is CAGR the same as IRR or XIRR?"
    answer: "Only when there is a single investment and no money added or taken out. IRR and XIRR account for every cash flow and its timing; CAGR uses only the first and last value. For SIPs, top-ups or withdrawals, CAGR overstates or understates the return, so use XIRR."
  - question: "Why is CAGR lower than the average annual return?"
    answer: "Losses hurt more than equal gains help. 100 that rises 50% and then falls 50% ends at 75: the average of the two returns is 0%, but the CAGR is −13.40% a year, which matches what happened to the money."
  - question: "How do I calculate CAGR for months or between two dates?"
    answer: "Express the period in years as a decimal: months ÷ 12, or days between the dates ÷ 365. 10,000 growing to 14,000 in 2 years and 6 months is a CAGR of 14.41%. In Excel, =(B2/A2)^(1/YEARFRAC(C2,D2,3))-1 uses the two dates on an actual/365 basis."
  - question: "Can CAGR be negative?"
    answer: "Yes. A fall from 100 to 50 over 3 years is a CAGR of −20.63% a year, and a fall to zero is −100%. CAGR cannot be calculated from a starting value of zero or below, or to a negative ending value."
  - question: "What growth rate do I need to reach a target?"
    answer: "Enter today's value as the start and the target as the end. Doubling 500,000 to 1,000,000 in 7 years needs 10.41% a year. To find the time instead, choose Time to target: at 10% a year, 10,000 takes 6.2 years to reach 18,000."
---

# CAGR Formula

**CAGR = (ending value ÷ starting value)^(1 ÷ years) − 1**

Multiply by 100 for a percentage. The period in years can be a decimal: 30 months is 2.5 years, and the days between two dates divided by 365 gives the years between them.

Worked through for an investment that grew from 10,000 to 18,000 in 5 years:

| Step | Result |
|---|---:|
| Ending ÷ starting value: 18,000 ÷ 10,000 | 1.8 |
| Raise to the power 1 ÷ 5 | 1.1247 |
| Subtract 1 | 0.1247 |
| **CAGR** | **12.47% a year** |

The reverse formula projects a value forward: **ending value = starting value × (1 + CAGR)^years**.

# CAGR Formula in Excel and Google Sheets

Neither Excel nor Google Sheets has a CAGR function, but three formulas give the same answer. With the starting value in A2, the ending value in B2 and the number of years in C2:

| Formula | Notes |
|---|---|
| =(B2/A2)^(1/C2)-1 | Works in every version |
| =POWER(B2/A2,1/C2)-1 | The same calculation written with POWER |
| =RRI(C2,A2,B2) | Built-in rate function: periods, start, end. Excel 2013 or later and Google Sheets |

With start and end dates in C2 and D2 instead of a number of years, use **=(B2/A2)^(1/YEARFRAC(C2,D2,3))-1**. The 3 tells YEARFRAC to count actual days ÷ 365, the same basis the calculator uses.

Format the result cell as a percentage. The calculator shows the first and third formulas with your own numbers, ready to paste.

# CAGR Examples

| Situation | Start | End | Period | CAGR |
|---|---:|---:|---|---:|
| Investment | 10,000 | 18,000 | 5 years | 12.47% |
| Company revenue | 2.4 million | 5.1 million | 4 years | 20.74% |
| Part-year holding | 10,000 | 14,000 | 2 years 6 months | 14.41% |
| Between dates | 10,000 | 15,000 | 1 Jan 2020 to 1 Jul 2025 | 7.65% |
| Falling value | 100 | 50 | 3 years | −20.63% |

Revenue CAGR is common in business plans and investor reports. Growing at 20.74% a year, revenue of 2.4 million would pass about 2.90 million, 3.50 million and 4.22 million before reaching 5.1 million in year 4. Actual revenue rarely grows that evenly, which is the point: CAGR summarises the trend in one number.

# CAGR vs Absolute Return vs XIRR

| Measure | What it shows | Use it for |
|---|---|---|
| Absolute return | Total change: (end − start) ÷ start | Holdings of a year or less |
| CAGR | Steady yearly rate from one start value to one end value | A lump sum held for several years, revenue or user growth |
| XIRR | Yearly rate that accounts for every deposit and withdrawal and its date | SIPs, top-ups, partial sales, portfolios |

The same 80% gain is a CAGR of 12.47% over 5 years and 34.16% over 2 years, which is why absolute returns over different periods cannot be compared directly. And if part of the ending value came from money you added along the way, CAGR counts it as growth; XIRR does not. For monthly investing, the [SIP calculator](/calculators/sip-calculator) projects the value of regular instalments.

# Why CAGR Is Lower Than the Average Return

An investment rises 50% in year one and falls 50% in year two. The average of the two yearly returns is 0%, which suggests you broke even. You did not: 100 became 150 and then 75. The CAGR is −13.40% a year.

The more a value swings from year to year, the further the simple average overstates growth. CAGR always matches the money you actually ended up with.

# Real CAGR: Growth After Inflation

A nominal CAGR includes the effect of rising prices. To see growth in purchasing power, remove inflation:

**Real CAGR = (1 + CAGR) ÷ (1 + inflation) − 1**

The 12.47% example with an assumed 4% inflation over the same years is a real CAGR of **8.15%** a year. Enter your own inflation assumption in the calculator; it ships no official inflation data.

# How Long to Reach a Target at a Given CAGR

Choose **Time to target** to turn the formula round: **years = ln(target ÷ start) ÷ ln(1 + CAGR)**. At 10% a year, 10,000 reaches 18,000 in 6.2 years.

To find the growth rate a goal needs, enter today's value and the target as the start and end values. Doubling money in 7 years needs a CAGR of 10.41%.

# The Limits of CAGR

- **It hides the path.** Two investments with the same CAGR can have had very different falls along the way.
- **It ignores money added or taken out.** Use XIRR when there were deposits or withdrawals.
- **It depends on the dates you pick.** Starting at a market low or ending at a peak flatters the result; check more than one period.
- **It describes the past.** A historical CAGR is not a forecast.

Use values after fees and costs for a fair figure. The calculator is a tool for measuring and comparing growth, not investment advice.
