'use client';

import React, { useMemo, useState } from 'react';
import {
  CalculatorLayout,
  CurrencySelect,
  DataTable,
  EmptyResult,
  FieldGrid,
  FormHeader,
  HeadlineResult,
  LineChart,
  NumberField,
  ResetButton,
  ResultList,
  SERIES,
  Segmented,
  SelectField,
  SplitBar,
} from './ui';
import {
  compound,
  doublingYears,
  inflationAdjusted,
  rateRange,
  type Compounding,
  type CompoundYearRow,
  type ContributionFrequency,
  type ContributionTiming,
} from '@/lib/calculators/compound-interest.ts';
import { CURRENCIES, type CurrencyCode, formatMoney, formatMonths, formatNumber, formatPercent, validateNumber } from '@/lib/calculators/money.ts';

interface State {
  currency: CurrencyCode;
  principal: string;
  rate: string;
  years: string;
  months: string;
  compounding: Compounding;
  contribution: string;
  frequency: ContributionFrequency;
  timing: ContributionTiming;
  /** What-if: percentage points either side of the rate. */
  spread: string;
  /** Optional inflation assumption for the today's-money figure. */
  inflation: string;
}

/** Page example: 10,000 + 200 a month at an example 7% compounded monthly for 20 years → 144,572.72. */
const EXAMPLE: State = {
  currency: 'USD',
  principal: '10000',
  rate: '7',
  years: '20',
  months: '0',
  compounding: 'monthly',
  contribution: '200',
  frequency: 'monthly',
  timing: 'end',
  spread: '2',
  inflation: '',
};

const COMPOUNDING_OPTIONS: { value: Compounding; label: string }[] = [
  { value: 'annually', label: 'Annually (1× a year)' },
  { value: 'semiannually', label: 'Semi-annually (2× a year)' },
  { value: 'quarterly', label: 'Quarterly (4× a year)' },
  { value: 'monthly', label: 'Monthly (12× a year)' },
  { value: 'daily', label: 'Daily (365× a year)' },
  { value: 'continuous', label: 'Continuously' },
];

const FREQUENCY_OPTIONS: { value: ContributionFrequency; label: string }[] = [
  { value: 'monthly', label: 'Every month' },
  { value: 'quarterly', label: 'Every quarter' },
  { value: 'semiannually', label: 'Every 6 months' },
  { value: 'annually', label: 'Every year' },
];

const MAX_YEARS = 100;

export default function CompoundInterestCalculator() {
  const [state, setState] = useState<State>(EXAMPLE);
  const set = (key: keyof State) => (value: string) => setState((s) => ({ ...s, [key]: value }));
  const { currency } = state;
  const money = (v: number, decimals = 2) => formatMoney(v, currency, { decimals });

  const principal = validateNumber(state.principal, { label: 'Initial amount', min: 0, max: 1e12, emptyAs: 0 });
  const rate = validateNumber(state.rate, { label: 'Interest rate', min: -50, max: 100 });
  const years = validateNumber(state.years, { label: 'Years', min: 0, max: MAX_YEARS, integer: true, emptyAs: 0 });
  const monthsIn = validateNumber(state.months, { label: 'Months', min: 0, max: 11, integer: true, emptyAs: 0 });
  const contribution = validateNumber(state.contribution, { label: 'Regular contribution', min: 0, max: 1e10, emptyAs: 0 });
  const spread = validateNumber(state.spread, { label: 'Rate range', min: 0, max: 20, emptyAs: 0 });
  const inflation = validateNumber(state.inflation, { label: 'Inflation rate', min: -10, max: 50, emptyAs: 0 });

  const totalMonths = years.value !== null && monthsIn.value !== null ? years.value * 12 + monthsIn.value : null;
  const termError = totalMonths === 0 ? 'Enter a term of at least 1 month.' : null;
  const nothingInvested = principal.value === 0 && contribution.value === 0;

  const valid = principal.value !== null && rate.value !== null && totalMonths !== null && !termError && contribution.value !== null && !nothingInvested;

  const result = useMemo(() => {
    if (!valid) return null;
    return compound({
      principal: principal.value!,
      annualRatePct: rate.value!,
      months: totalMonths!,
      compounding: state.compounding,
      contribution: contribution.value!,
      contributionFrequency: state.frequency,
      contributionTiming: state.timing,
    });
  }, [valid, principal.value, rate.value, totalMonths, state.compounding, contribution.value, state.frequency, state.timing]);

  // What-if rows: the same plan at the rate and `spread` points either side.
  const range = useMemo(() => {
    if (!valid || !spread.value) return null;
    return rateRange(
      {
        principal: principal.value!,
        annualRatePct: rate.value!,
        months: totalMonths!,
        compounding: state.compounding,
        contribution: contribution.value!,
        contributionFrequency: state.frequency,
        contributionTiming: state.timing,
      },
      spread.value,
    );
  }, [valid, spread.value, principal.value, rate.value, totalMonths, state.compounding, contribution.value, state.frequency, state.timing]);
  const todaysMoney = result && inflation.value ? inflationAdjusted(result.finalBalance, inflation.value, totalMonths!) : null;

  // Yearly points for long terms, monthly for short ones, so the chart always has a shape.
  const chart = useMemo(() => {
    if (!result || result.points.length < 3) return null;
    const monthly = totalMonths! <= 24;
    const pts = monthly ? result.points : result.points.filter((p) => p.month % 12 === 0 || p.month === totalMonths);
    return {
      labels: pts.map((p) => (p.month === 0 ? 'Start' : monthly ? `Mo ${p.month}` : p.month % 12 === 0 ? `Yr ${p.month / 12}` : formatMonths(p.month))),
      balance: pts.map((p) => p.balance),
      contributed: pts.map((p) => p.contributed),
    };
  }, [result, totalMonths]);

  const doubling = rate.value !== null && rate.value > 0 ? doublingYears(rate.value, state.compounding) : null;
  const hasContribution = (contribution.value ?? 0) > 0;

  const form = (
    <>
      <FormHeader title="Your savings">
        <CurrencySelect value={currency} onChange={(c) => setState((s) => ({ ...s, currency: c }))} />
        <ResetButton onClick={() => setState(EXAMPLE)} />
      </FormHeader>
      <div className="space-y-6">
        <FieldGrid>
          <NumberField label="Initial amount" value={state.principal} onChange={set('principal')} error={principal.error} prefix={CURRENCIES[currency].symbol} hint="Leave at 0 if you only add regular amounts." />
          <NumberField label="Annual interest rate" value={state.rate} onChange={set('rate')} error={rate.error} suffix="% a year" hint="The nominal rate, before compounding." />
        </FieldGrid>
        <FieldGrid>
          <NumberField label="Years" value={state.years} onChange={set('years')} error={years.error ?? termError} integer suffix="years" />
          <NumberField label="Months" value={state.months} onChange={set('months')} error={monthsIn.error} integer suffix="months" hint="0–11, added to the years." />
        </FieldGrid>
        <SelectField label="Compounding frequency" value={state.compounding} onChange={(v) => setState((s) => ({ ...s, compounding: v }))} options={COMPOUNDING_OPTIONS} hint="How often interest is added to the balance." />

        <div className="pt-6 border-t border-[var(--color-border)] space-y-5">
          <h3 className="type-headline !text-[17px]">Regular contributions</h3>
          <FieldGrid>
            <NumberField label="Amount each time" value={state.contribution} onChange={set('contribution')} error={contribution.error} prefix={CURRENCIES[currency].symbol} hint="Leave at 0 for a single deposit." />
            <SelectField label="How often" value={state.frequency} onChange={(v) => setState((s) => ({ ...s, frequency: v }))} options={FREQUENCY_OPTIONS} />
          </FieldGrid>
          <Segmented
            label="Added at the"
            value={state.timing}
            onChange={(v) => setState((s) => ({ ...s, timing: v }))}
            options={[
              { value: 'end', label: 'End of each period' },
              { value: 'start', label: 'Start of each period' },
            ]}
          />
        </div>

        <div className="pt-6 border-t border-[var(--color-border)] space-y-5">
          <div>
            <h3 className="type-headline !text-[17px]">What if</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Returns are rarely fixed. See a range, and what the balance would buy in today&apos;s money.</p>
          </div>
          <FieldGrid>
            <NumberField label="Rate range" value={state.spread} onChange={set('spread')} error={spread.error} suffix="± points" hint="Shows the balance at this many points below and above your rate." />
            <NumberField label="Inflation rate (optional)" value={state.inflation} onChange={set('inflation')} error={inflation.error} suffix="% a year" hint="Your assumption. Leave empty to skip." />
          </FieldGrid>
        </div>
      </div>
    </>
  );

  const summary = result ? (
    <>
      <HeadlineResult label="Final balance" value={money(result.finalBalance)} caption={`after ${formatMonths(totalMonths!)}`} />
      {result.interestEarned > 0 && (
        <SplitBar
          label="Share of money you put in and interest earned"
          currency={currency}
          parts={[
            { label: 'You put in', value: result.totalContributed, color: SERIES.primary },
            { label: 'Interest', value: result.interestEarned, color: SERIES.secondary },
          ]}
        />
      )}
      <ResultList
        divided
        rows={[
          { label: 'Initial amount', value: money(principal.value!) },
          ...(hasContribution ? [{ label: `Contributions (${result.contributionCount})`, value: money(result.contributionsOnly) }] : []),
          { label: 'Total interest earned', value: money(result.interestEarned), strong: true },
        ]}
      />
      <ResultList
        divided
        rows={[
          { label: 'Effective annual rate (APY)', value: formatPercent(result.apyPct, 3) },
          ...(doubling !== null ? [{ label: 'Years to double a lump sum', value: formatNumber(doubling, 1) }] : []),
        ]}
      />
      {todaysMoney !== null && (
        <ResultList
          divided
          rows={[{ label: `In today's money at ${formatPercent(inflation.value!, 1)} inflation`, value: money(todaysMoney), strong: true }]}
        />
      )}
      {range && range.length > 1 && (
        <div className="pt-5 border-t border-[var(--color-border)] space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">Final balance at other rates</p>
          <ResultList rows={range.map((r) => ({ label: `At ${formatPercent(r.ratePct, 2)}`, value: money(r.finalBalance), strong: r.ratePct === rate.value }))} />
        </div>
      )}
    </>
  ) : (
    <EmptyResult message={nothingInvested ? 'Enter an initial amount or a regular contribution.' : undefined} />
  );

  return (
    <CalculatorLayout title="Compound interest calculator" form={form} result={summary} mobileSummary={result ? { label: 'Final balance', value: money(result.finalBalance) } : null}>
      {chart && (
        <LineChart
          title="Balance and money put in"
          currency={currency}
          xLabels={chart.labels}
          series={[
            { name: 'Balance', color: SERIES.primary, values: chart.balance, area: true },
            { name: 'Money put in', color: SERIES.secondary, values: chart.contributed },
          ]}
        />
      )}
      {result && (
        <DataTable<CompoundYearRow>
          title="Growth by year"
          csvName="compound-interest-by-year.csv"
          rows={result.years}
          columns={[
            { header: 'Year', cell: (r) => (r.months === 12 ? String(r.year) : `${r.year} (${r.months} mo)`) },
            { header: 'Opening balance', cell: (r) => money(r.opening), align: 'right', hideOnMobile: true },
            { header: 'Contributions', cell: (r) => money(r.contributions), align: 'right' },
            { header: 'Interest', cell: (r) => money(r.interest), align: 'right' },
            { header: 'Closing balance', cell: (r) => money(r.closing), align: 'right' },
            { header: 'Total interest', cell: (r) => money(r.totalInterest), align: 'right' },
          ]}
        />
      )}
    </CalculatorLayout>
  );
}
