/**
 * US mortgage payment (PITI) maths: principal and interest from the shared amortization engine,
 * plus property tax, homeowners insurance, private mortgage insurance (PMI) and HOA dues.
 *
 * PMI follows the Homeowners Protection Act timing for conventional loans:
 * - it is only charged when the starting loan-to-value (LTV) is above 80%;
 * - it ends automatically on the date the *scheduled* balance reaches 78% of the original value,
 *   or after the midpoint of the term, whichever comes first;
 * - the borrower may ask to cancel from the date the scheduled balance reaches 80%.
 * "Original value" is taken as the home price entered (the law uses the lower of the sale price
 * and the appraised value).
 *
 * Extra payments (monthly, yearly, one-off, biweekly) shorten the loan. They do not move the
 * automatic 78% date, which follows the original schedule, but the borrower can ask to cancel PMI
 * once the *actual* balance reaches 80% (CFPB). Biweekly payments (26 half-payments a year) are
 * modelled as one extra monthly payment a year: P&I ÷ 12 added to every monthly payment.
 */

import { amortize, yearlySummary, type AmortizeResult, type LumpSum, type YearRow } from './loan.ts';
import { yearlyLumpSums } from './loan-repayment.ts';
import { fromMinor, toMinor } from './money.ts';

export const PMI_REQUIRED_ABOVE_LTV = 80;
export const PMI_AUTO_END_LTV = 78;
export const PMI_REQUEST_LTV = 80;

export interface MortgageInput {
  homePrice: number;
  downPayment: number;
  annualRatePct: number;
  termMonths: number;
  propertyTaxAnnual: number;
  insuranceAnnual: number;
  /** Annual PMI premium as a % of the original loan amount. */
  pmiRatePct: number;
  hoaMonthly: number;
}

export interface MortgageResult {
  loanAmount: number;
  /** Starting loan-to-value, %. */
  ltvPct: number;
  principalAndInterest: number;
  monthlyTax: number;
  monthlyInsurance: number;
  /** PMI in month 1 (0 when not required). */
  monthlyPmi: number;
  hoaMonthly: number;
  /** First month's total housing payment. */
  totalMonthly: number;
  pmiRequired: boolean;
  /** Number of monthly PMI payments made. */
  pmiMonths: number;
  totalPmi: number;
  /** Month from which the borrower may request cancellation (scheduled balance ≤ 80%), or null. */
  pmiRequestMonth: number | null;
  /** First month with no PMI (automatic termination), or null when PMI never applied. */
  pmiAutoEndMonth: number | null;
  schedule: AmortizeResult;
  years: YearRow[];
  totalInterest: number;
  /** Everything paid over the term: P&I, tax, insurance, PMI and HOA. */
  totalCost: number;
}

export function monthlyShare(annual: number): number {
  return fromMinor(Math.round(toMinor(annual) / 12));
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const loanAmount = Math.max(0, input.homePrice - input.downPayment);
  const ltvPct = input.homePrice > 0 ? (loanAmount / input.homePrice) * 100 : 0;
  const schedule = amortize({ principal: loanAmount, annualRatePct: input.annualRatePct, months: input.termMonths });

  const pmiRequired = ltvPct > PMI_REQUIRED_ABOVE_LTV && input.pmiRatePct > 0;
  const pmiMonthlyAmount = pmiRequired ? monthlyShare((loanAmount * input.pmiRatePct) / 100) : 0;
  const autoEndBalance = (input.homePrice * PMI_AUTO_END_LTV) / 100;
  const requestBalance = (input.homePrice * PMI_REQUEST_LTV) / 100;
  const midpoint = Math.ceil(input.termMonths / 2);

  let pmiMonths = 0;
  let pmiRequestMonth: number | null = null;
  if (pmiRequired) {
    for (const row of schedule.rows) {
      // PMI is charged with a payment while the balance going into that month is above 78% and
      // the midpoint of the term has not passed.
      if (row.opening > autoEndBalance + 0.004 && row.month <= midpoint) pmiMonths = row.month;
      else break;
    }
    const req = schedule.rows.find((r) => r.closing <= requestBalance + 0.004);
    // Cancellation can be requested from the month after the balance reaches 80%.
    pmiRequestMonth = req ? req.month + 1 : null;
  }

  const monthlyTax = monthlyShare(input.propertyTaxAnnual);
  const monthlyInsurance = monthlyShare(input.insuranceAnnual);
  const totalPmi = fromMinor(toMinor(pmiMonthlyAmount) * pmiMonths);
  const months = schedule.monthsTaken;
  const totalCost = fromMinor(
    toMinor(schedule.totalPaid) + (toMinor(monthlyTax) + toMinor(monthlyInsurance) + toMinor(input.hoaMonthly)) * months + toMinor(totalPmi),
  );

  return {
    loanAmount,
    ltvPct,
    principalAndInterest: schedule.payment,
    monthlyTax,
    monthlyInsurance,
    monthlyPmi: pmiMonthlyAmount,
    hoaMonthly: input.hoaMonthly,
    totalMonthly: fromMinor(
      toMinor(schedule.payment) + toMinor(monthlyTax) + toMinor(monthlyInsurance) + toMinor(pmiMonthlyAmount) + toMinor(input.hoaMonthly),
    ),
    pmiRequired,
    pmiMonths,
    totalPmi,
    pmiRequestMonth,
    pmiAutoEndMonth: pmiRequired ? pmiMonths + 1 : null,
    schedule,
    years: yearlySummary(schedule.rows),
    totalInterest: schedule.totalInterest,
    totalCost,
  };
}

/* ------------------------------------------------------------------ extra payments */

export interface MortgageExtras {
  extraMonthly: number;
  extraYearly: number;
  lumpSum: LumpSum | null;
  biweekly: boolean;
}

export interface AcceleratedMortgage {
  /** Extra principal added to every monthly payment (includes the biweekly equivalent). */
  extraPerMonth: number;
  schedule: AmortizeResult;
  yearRows: YearRow[];
  monthsTaken: number;
  monthsSaved: number;
  interestSaved: number;
  /** First payment from which PMI cancellation can be requested on the actual (prepaid) balance. */
  pmiRequestMonth: number | null;
}

export function hasExtras(e: MortgageExtras): boolean {
  return e.biweekly || e.extraMonthly > 0 || e.extraYearly > 0 || (e.lumpSum !== null && e.lumpSum.amount > 0);
}

/** The loan repaid with extra payments, compared with the contractual schedule in `base`. */
export function accelerateMortgage(input: MortgageInput, base: MortgageResult, extras: MortgageExtras): AcceleratedMortgage | null {
  if (base.loanAmount <= 0 || !hasExtras(extras)) return null;
  const biweeklyExtra = extras.biweekly ? fromMinor(Math.round(toMinor(base.principalAndInterest) / 12)) : 0;
  const extraPerMonth = fromMinor(toMinor(Math.max(0, extras.extraMonthly)) + toMinor(biweeklyExtra));
  const lumpSums = [...yearlyLumpSums(extras.extraYearly, input.termMonths), ...(extras.lumpSum && extras.lumpSum.amount > 0 ? [extras.lumpSum] : [])];
  const schedule = amortize({ principal: base.loanAmount, annualRatePct: input.annualRatePct, months: input.termMonths, extraMonthly: extraPerMonth, lumpSums });
  let pmiRequestMonth: number | null = null;
  if (base.pmiRequired) {
    const requestBalance = (input.homePrice * PMI_REQUEST_LTV) / 100;
    const row = schedule.rows.find((r) => r.closing <= requestBalance + 0.004);
    pmiRequestMonth = row ? row.month + 1 : null;
  }
  return {
    extraPerMonth,
    schedule,
    yearRows: yearlySummary(schedule.rows),
    monthsTaken: schedule.monthsTaken,
    monthsSaved: base.schedule.monthsTaken - schedule.monthsTaken,
    interestSaved: fromMinor(toMinor(base.totalInterest) - toMinor(schedule.totalInterest)),
    pmiRequestMonth,
  };
}

/* ------------------------------------------------------------------ rate sensitivity */

export interface RateRow {
  ratePct: number;
  principalAndInterest: number;
  totalMonthly: number;
  totalInterest: number;
}

/** Month-1 payment and lifetime interest at nearby rates, all other inputs unchanged. */
export function rateSensitivity(input: MortgageInput, deltas: number[] = [-1, -0.5, 0, 0.5, 1]): RateRow[] {
  return deltas
    .map((d) => Math.round((input.annualRatePct + d) * 1000) / 1000)
    .filter((r) => r >= 0)
    .map((ratePct) => {
      const m = calculateMortgage({ ...input, annualRatePct: ratePct });
      return { ratePct, principalAndInterest: m.principalAndInterest, totalMonthly: m.totalMonthly, totalInterest: m.totalInterest };
    });
}

/** Down payment that brings the loan-to-value to 80%, the point below which PMI is not required. */
export function downPaymentToAvoidPmi(homePrice: number): number {
  return fromMinor(Math.round((toMinor(homePrice) * (100 - PMI_REQUIRED_ABOVE_LTV)) / 100));
}
