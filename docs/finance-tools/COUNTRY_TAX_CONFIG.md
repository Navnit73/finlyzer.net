# Country and Tax Configuration

Status: **design only.** No tax rates ship until batch 4. Every rate added then must have an official source and a verification date. This file fixes the shape so the tax calculators (#23, #24, #26–30) share one engine instead of each hardcoding brackets.

## Principles

1. **One engine, many configs.** Progressive-bracket maths, allowance tapering and percentage taxes are written once in `src/lib/calculators/tax/`. Countries differ only in data.
2. **Year-specific and dated.** A config is keyed by jurisdiction *and* tax year, carries `effectiveFrom`/`effectiveTo`, and the UI shows which year is being used. There is no "latest" fallback. If the selected year has no config, the calculator shows "rules for this year are not configured yet" instead of reusing last year's figures.
3. **Sourced.** Every config lists official sources (government or regulator URLs) and `lastVerified`. `site-integrity`-style tests fail when a config has no source, or when `lastVerified` is older than its tax year's start.
4. **Missing is explicit.** A field that could not be verified is `null` with a `missing` note, and the UI labels the result as incomplete. It is never filled with a guess.

## Schema (TypeScript, to be added in batch 4)

```ts
interface Source { label: string; url: string }

interface Bracket { from: number; to: number | null; rate: number } // rate as a fraction: 0.2 = 20%

interface IncomeTaxConfig {
  jurisdiction: 'IN' | 'US' | 'US-CA' | 'UK' | 'UK-SCT' | 'DE' | 'FR' | 'ES' | 'NL' | 'IT' | string;
  taxYear: string;               // "FY 2026-27", "2026", "2026/27"
  effectiveFrom: string;         // ISO date
  effectiveTo: string;           // ISO date
  currency: 'INR' | 'USD' | 'GBP' | 'EUR';
  regimes?: Record<string, { brackets: Bracket[]; standardDeduction?: number; rebate?: { incomeUpTo: number; maxRebate: number } }>;
  brackets?: Bracket[];
  personalAllowance?: { amount: number; taperFrom?: number; taperRate?: number };
  surcharge?: Bracket[];
  cess?: number;                 // e.g. India health & education cess
  social?: Record<string, Bracket[]>; // NI, FICA, etc.
  sources: Source[];
  lastVerified: string;          // ISO date
  missing?: string[];            // fields knowingly left unset
}

interface RateTaxConfig {        // VAT, GST, sales tax
  jurisdiction: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  standard: number;
  reduced: { rate: number; label: string }[];
  sources: Source[];
  lastVerified: string;
}
```

## Planned coverage

| Tool | Jurisdictions | Years | Notes |
|---|---|---|---|
| Income tax (India) | IN, new and old regime | Tax year 2026-27 | The Income-tax Act, 2025 came into force on 1 April 2026 (CBDT press release, incometaxindia.gov.in) and uses a single "tax year" in place of FY/AY. Section references must use the new Act's numbering; income of FY 2025-26 is still assessed under the 1961 Act. Slabs from the Finance Act 2026. |
| Salary after tax (UK) | UK (rUK), Scotland | 2026/27 | Income tax + Class 1 employee NI, personal allowance taper. Source: gov.uk. |
| Paycheck (US) | Federal + FICA; states only where verified | 2026 | Federal brackets and standard deduction from IRS Rev. Proc.; FICA wage base from SSA. States without a verified config accept a user-entered rate. |
| GST (India) | IN | current | Slab structure after the 2025 GST rationalisation must be verified on cbic-gst.gov.in. |
| VAT | UK, DE, FR, ES, NL, IT | current | Standard + reduced rates from each tax authority / EU VAT rates database. |
| Capital gains | US, UK, IN | 2026 / 2026-27 / FY 2026-27 | One page, jurisdiction selector. |
| Sales tax (US) | State base rates where verified | current | Local rates vary by address; the page asks for the combined rate rather than claiming exact local rates. |
