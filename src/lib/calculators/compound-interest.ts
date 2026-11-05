/**
 * Compound interest with optional regular contributions.
 *
 * Compound interest:  A = P × (1 + r/m)^(m·t)      (m compounding periods a year)
 * Continuous:         A = P × e^(r·t)
 * Effective annual rate (APY): (1 + r/m)^m − 1, or e^r − 1 when continuous.
 *
 * Contributions can be made on a different schedule from the compounding. The balance is grown
 * month by month at the equivalent monthly rate (1 + APY)^(1/12) − 1, which is the same as
 * converting the nominal rate to an effective rate per contribution period. At every compounding
 * date this gives exactly the textbook balance; contributions earn interest for the fraction of a
 * period they are invested. Contributions are added at the start or end of each contribution period.
 */

export type Compounding = 'annually' | 'semiannually' | 'quarterly' | 'monthly' | 'daily' | 'continuous';
export type ContributionFrequency = 'monthly' | 'quarterly' | 'semiannually' | 'annually';
export type ContributionTiming = 'start' | 'end';

export const COMPOUNDING_PERIODS: Record<Exclude<Compounding, 'continuous'>, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

/** Months between contributions. */
export const CONTRIBUTION_MONTHS: Record<ContributionFrequency, number> = {
  monthly: 1,
  quarterly: 3,
  semiannually: 6,
  annually: 12,
};

/** Effective annual rate as a fraction (0.05116… for 5% compounded monthly). */
export function effectiveAnnualRate(annualRatePct: number, compounding: Compounding): number {
  const r = annualRatePct / 100;
  if (compounding === 'continuous') return Math.expm1(r);
  const m = COMPOUNDING_PERIODS[compounding];
  return (1 + r / m) ** m - 1;
}

/** Textbook future value of a single sum, no contributions. */
export function futureValue(principal: number, annualRatePct: number, years: number, compounding: Compounding): number {
  const r = annualRatePct / 100;
  if (compounding === 'continuous') return principal * Math.exp(r * years);
  const m = COMPOUNDING_PERIODS[compounding];
  return principal * (1 + r / m) ** (m * years);
}

export interface CompoundInput {
  principal: number;
  annualRatePct: number;
  /** Term in whole months. */
  months: number;
  compounding: Compounding;
  contribution?: number;
  contributionFrequency?: ContributionFrequency;
  contributionTiming?: ContributionTiming;
}

export interface CompoundYearRow {
  /** 1-based year; the last row can be a partial year. */
  year: number;
  /** Months covered by this row (12 except possibly the last). */
  months: number;
  opening: number;
  contributions: number;
  interest: number;
  closing: number;
  /** Principal + all contributions to date. */
  totalContributed: number;
  /** All interest to date. */
  totalInterest: number;
}

export interface CompoundPoint {
  month: number;
  balance: number;
  contributed: number;
}

export interface CompoundResult {
  finalBalance: number;
  /** Initial amount + every regular contribution. */
  totalContributed: number;
  /** Regular contributions only. */
  contributionsOnly: number;
  contributionCount: number;
  interestEarned: number;
  /** Effective annual rate as a percentage. */
  apyPct: number;
  years: CompoundYearRow[];
  /** Balance at the end of every month, starting with month 0. */
  points: CompoundPoint[];
}

const round2 = (v: number) => {
  const s = Number((Math.abs(v) * 100).toPrecision(15));
  const r = (Math.sign(v) * Math.round(s)) / 100;
  return Object.is(r, -0) ? 0 : r;
};

export function compound(input: CompoundInput): CompoundResult {
  const months = Math.max(0, Math.floor(input.months));
  const ear = effectiveAnnualRate(input.annualRatePct, input.compounding);
  const g = (1 + ear) ** (1 / 12);
  const c = Math.max(0, input.contribution ?? 0);
  const step = CONTRIBUTION_MONTHS[input.contributionFrequency ?? 'monthly'];
  const timing = input.contributionTiming ?? 'end';

  let balance = Math.max(0, input.principal);
  let contributed = balance;
  let count = 0;
  const points: CompoundPoint[] = [{ month: 0, balance, contributed }];

  for (let m = 1; m <= months; m++) {
    if (c > 0 && timing === 'start' && (m - 1) % step === 0) {
      balance += c;
      contributed += c;
      count++;
    }
    balance *= g;
    if (c > 0 && timing === 'end' && m % step === 0) {
      balance += c;
      contributed += c;
      count++;
    }
    points.push({ month: m, balance, contributed });
  }

  // Year rows from rounded month-end balances, so each row's parts add up to the cent.
  const years: CompoundYearRow[] = [];
  for (let start = 0, year = 1; start < months; start += 12, year++) {
    const end = Math.min(months, start + 12);
    const opening = round2(points[start].balance);
    const closing = round2(points[end].balance);
    const contributions = round2(points[end].contributed - points[start].contributed);
    years.push({
      year,
      months: end - start,
      opening,
      contributions,
      interest: round2(closing - opening - contributions),
      closing,
      totalContributed: round2(points[end].contributed),
      totalInterest: round2(closing - points[end].contributed),
    });
  }

  const finalBalance = round2(balance);
  const totalContributed = round2(contributed);
  return {
    finalBalance,
    totalContributed,
    contributionsOnly: round2(c * count),
    contributionCount: count,
    interestEarned: round2(finalBalance - totalContributed),
    apyPct: ear * 100,
    years,
    points,
  };
}

/** Years for money to double at a given rate and compounding (exact, not the rule of 72). */
export function doublingYears(annualRatePct: number, compounding: Compounding): number {
  const ear = effectiveAnnualRate(annualRatePct, compounding);
  return ear > 0 ? Math.log(2) / Math.log1p(ear) : Infinity;
}

/**
 * A balance in today's money: value ÷ (1 + inflation)^(months ÷ 12). The inflation rate is the
 * user's assumption; the calculator ships no inflation data.
 */
export function inflationAdjusted(value: number, inflationPct: number, months: number): number {
  return value / (1 + inflationPct / 100) ** (months / 12);
}

/** Final balances at the entered rate and at `spreadPct` points either side (never below −99%). */
export function rateRange(input: CompoundInput, spreadPct: number): { ratePct: number; finalBalance: number; interestEarned: number }[] {
  const rates = [input.annualRatePct - spreadPct, input.annualRatePct, input.annualRatePct + spreadPct].filter((r, i, all) => r > -99 && all.indexOf(r) === i);
  return rates.map((ratePct) => {
    const r = compound({ ...input, annualRatePct: ratePct });
    return { ratePct, finalBalance: r.finalBalance, interestEarned: r.interestEarned };
  });
}
