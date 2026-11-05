# SEO Keyword Map: Finance Tools

One primary keyword and one search intent per URL. Before adding a page, check this table and the existing ownership list in the project memory (`seo-architecture`). Language for every page below is English (`en`); there is no hreflang because no page has a localized equivalent.

## URL architecture decision

- Keep the existing flat `/calculators/<slug>` pattern (cash flow already ranks there). No `/personal-finance/` or `/in/`/`/us/` folders: they would add a second URL layer with no localized content behind it.
- Jurisdiction lives *inside* a tool (a country selector driving a config) when the calculation is the same and only the rules differ. A separate URL is used only when the search intent itself is national (EMI, SIP and GST are Indian terms; paycheck is American; "salary after tax" is mostly UK).
- File-based utilities that are not calculators go under a new `/tools/<slug>` prefix.
- `/calculators` becomes a real hub page (indexable) once batch 1 ships; it is a hub, not a keyword target.

## Ownership table

| URL | Primary keyword | Secondary keywords | Intent | Market | Must not compete with |
|---|---|---|---|---|---|
| `/calculators/emi-calculator` | emi calculator | home/car/personal loan emi calculator, emi formula, emi calculation | Monthly instalment for a fixed loan | IN (global usable) | loan-repayment |
| `/calculators/mortgage-calculator` | mortgage calculator | mortgage payment calculator, PITI, mortgage with taxes and insurance, PMI | Monthly housing payment | US | emi, loan-repayment |
| `/calculators/loan-repayment-calculator` | loan repayment calculator | how long to pay off a loan, extra repayment calculator, early loan payoff | Payoff time and interest saved by overpaying | UK/AU/global | emi (no "emi" terms here) |
| `/calculators/credit-card-interest-calculator` | credit card interest calculator | credit card minimum payment calculator, how long to pay off a credit card, credit card amortization schedule, APR to daily/monthly rate | Cost and payoff time of **one** card | US/UK | debt-payoff (no "credit card payoff calculator" here since 2026-11-05) |
| `/calculators/debt-payoff-calculator` | credit card debt payoff calculator | multiple credit card payoff calculator, credit card payoff calculator (multiple cards / excel / with extra payments), credit card payoff spreadsheet, debt payoff calculator (excel), debt payoff planner/spreadsheet, pay down debt calculator, debt repayment calculator, debt snowball/avalanche calculator | Paying off **several** cards/debts, with a downloadable monthly plan | US | credit-card-interest; loan-repayment owns single-loan / student-loan / "pay off loan early" terms. "Dave Ramsey" terms are not targeted (brand). |
| `/calculators/loan-comparison-calculator` | loan comparison calculator | compare loan offers, compare two loans, loan fees vs rate | Choosing between offers | global | |
| `/calculators/compound-interest-calculator` | compound interest calculator | compound interest formula, monthly compounding, with contributions | Growth with compounding | global | sip, savings-goal |
| `/calculators/simple-interest-calculator` | simple interest calculator | simple interest formula, SI = PRT, find principal/rate/time | Flat interest | global (IN education) | compound-interest |
| `/calculators/sip-calculator` | sip calculator | step up sip calculator, mutual fund sip returns | Monthly mutual fund investing | IN | compound-interest |
| `/calculators/cagr-calculator` | cagr calculator | cagr formula, compound annual growth rate | Annualised growth between two values | global | xirr, roi |
| `/calculators/cash-flow-calculator` | (existing) find net cash flow | see memory | | global | |

Ownership for later batches is fixed in `TOOL_INVENTORY.md` (URLs) and is filled in here as each batch ships. Known overlaps already resolved:

- **EMI vs loan repayment vs mortgage**: same annuity maths, three intents. EMI = Indian "what is my instalment"; loan repayment = "when will I be debt-free / what if I overpay"; mortgage = US housing payment with escrow items. Each page gets functionality the others lack.
- **Income tax vs salary after tax vs paycheck**: split by jurisdiction, because the searches are national (India income tax regimes; UK take-home with NI; US per-paycheck withholding).
- **Profit margin vs gross profit vs net profit vs markup**: margin = price/cost ↔ margin %; gross profit = revenue − COGS with inventory movement; net profit = full P&L; markup = cost-based pricing and markup ↔ margin conversion.
- **Missing transaction detector vs bank statement matching tool**: single-statement integrity vs two-sided matching.
- **Capital gains tax**: one page with a jurisdiction selector rather than thin per-country copies.
