'use client';

import React, { useState } from 'react';
import {
  CalculatorLayout,
  CurrencySelect,
  DataTable,
  EmptyResult,
  FieldGrid,
  FormHeader,
  HeadlineResult,
  LineChart,
  Notice,
  NumberField,
  ResetButton,
  ResultList,
  SERIES,
  Segmented,
  SplitBar,
} from './ui';
import {
  inTodaysMoney,
  inflateGoal,
  lumpsumValue,
  projectSip,
  requiredMonthlySip,
  type RateConvention,
  type SipYearRow,
} from '@/lib/calculators/sip.ts';
import { CURRENCIES, type CurrencyCode, formatMoney, formatPercent, validateNumber } from '@/lib/calculators/money.ts';

type Mode = 'returns' | 'goal';

interface State {
  mode: Mode;
  currency: CurrencyCode;
  monthly: string;
  target: string;
  rate: string;
  years: string;
  stepUp: string;
  /** Optional; empty hides the inflation figures. */
  inflation: string;
  convention: RateConvention;
}

/**
 * Worked examples on the page: ₹10,000 a month at an assumed 12% for 15 years → ₹50,45,760;
 * ₹1 crore in 15 years at 12% needs ₹19,819 a month.
 */
const EXAMPLE: State = {
  mode: 'returns',
  currency: 'INR',
  monthly: '10000',
  target: '10000000',
  rate: '12',
  years: '15',
  stepUp: '0',
  inflation: '',
  convention: 'simple',
};

const SLIDER: Record<CurrencyCode, { min: number; max: number; step: number }> = {
  INR: { min: 500, max: 200_000, step: 500 },
  USD: { min: 25, max: 10_000, step: 25 },
  GBP: { min: 25, max: 10_000, step: 25 },
  EUR: { min: 25, max: 10_000, step: 25 },
};

const pct = (v: number) => formatPercent(v, v % 1 ? 2 : 0);

export default function SipCalculator() {
  const [state, setState] = useState<State>(EXAMPLE);
  const set = (key: keyof State) => (value: string) => setState((s) => ({ ...s, [key]: value }));
  const { currency, mode } = state;
  const money = (v: number, decimals = 0) => formatMoney(v, currency, { decimals });

  const monthlyIn = validateNumber(state.monthly, { label: 'Monthly investment', min: 0, minExclusive: true, max: 1e9 });
  const target = validateNumber(state.target, { label: 'Goal amount', min: 0, minExclusive: true, max: 1e12 });
  const rate = validateNumber(state.rate, { label: 'Expected return', min: 0, max: 50 });
  const years = validateNumber(state.years, { label: 'Investment period', min: 1, max: 50, integer: true });
  const stepUp = validateNumber(state.stepUp, { label: 'Annual step-up', min: 0, max: 100, emptyAs: 0 });
  const inflation = validateNumber(state.inflation, { label: 'Inflation', min: 0, max: 30, emptyAs: 0 });
  const shared = rate.value !== null && years.value !== null && stepUp.value !== null && inflation.value !== null;
  const valid = shared && (mode === 'returns' ? monthlyIn.value !== null : target.value !== null);

  /** Goal mode: the goal in future money and the SIP that reaches it. */
  // Each projection is at most 600 monthly steps, so everything is recomputed on render.
  let goal: { future: number; monthly: number } | null = null;
  if (valid && mode === 'goal') {
    const future = inflation.value! > 0 ? inflateGoal(target.value!, inflation.value!, years.value!) : target.value!;
    goal = { future, monthly: requiredMonthlySip(future, rate.value!, years.value!, stepUp.value!, state.convention) };
  }

  const monthly = mode === 'goal' ? (goal && Number.isFinite(goal.monthly) ? goal.monthly : null) : monthlyIn.value;

  const result =
    valid && monthly !== null
      ? projectSip({ monthly, annualRatePct: rate.value!, years: years.value!, stepUpPct: stepUp.value!, convention: state.convention })
      : null;

  /** Same SIP without the step-up, to show what the step-up adds. */
  const level =
    result && monthly !== null && stepUp.value! > 0
      ? projectSip({ monthly, annualRatePct: rate.value!, years: years.value!, convention: state.convention })
      : null;

  const lumpsum = result ? lumpsumValue(result.invested, rate.value!, years.value!, state.convention) : null;
  const real = result && inflation.value! > 0 ? inTodaysMoney(result.value, inflation.value!, years.value!) : null;

  const form = (
    <>
      <FormHeader title="Your SIP">
        <CurrencySelect value={currency} onChange={(c) => setState((s) => ({ ...s, currency: c }))} />
        <ResetButton onClick={() => setState(EXAMPLE)} />
      </FormHeader>
      <div className="space-y-6">
        <Segmented
          label="What do you want to work out?"
          value={mode}
          onChange={(m) => setState((s) => ({ ...s, mode: m }))}
          options={[
            { value: 'returns', label: 'What my SIP grows to' },
            { value: 'goal', label: 'SIP needed for a goal' },
          ]}
        />
        {mode === 'returns' ? (
          <NumberField
            label="Monthly investment"
            value={state.monthly}
            onChange={set('monthly')}
            error={monthlyIn.error}
            prefix={CURRENCIES[currency].symbol}
            range={SLIDER[currency]}
            hint={monthlyIn.value ? `${money(monthlyIn.value)} on the same date every month` : undefined}
          />
        ) : (
          <NumberField
            label="Goal amount"
            value={state.target}
            onChange={set('target')}
            error={target.error}
            prefix={CURRENCIES[currency].symbol}
            hint={
              target.value
                ? `${money(target.value)}${inflation.value! > 0 ? " in today's money; inflation is added below" : ''}`
                : 'The amount you want to have at the end.'
            }
          />
        )}
        <NumberField
          label="Expected return (per year)"
          value={state.rate}
          onChange={set('rate')}
          error={rate.error}
          suffix="% p.a."
          range={{ min: 1, max: 30, step: 0.5 }}
          hint="Your assumption. Fund returns are not fixed and past returns do not predict future ones."
        />
        <FieldGrid>
          <NumberField
            label="Investment period"
            value={state.years}
            onChange={set('years')}
            error={years.error}
            suffix="years"
            integer
            range={{ min: 1, max: 40, step: 1 }}
          />
          <NumberField
            label="Annual step-up"
            value={state.stepUp}
            onChange={set('stepUp')}
            error={stepUp.error}
            suffix="% a year"
            range={{ min: 0, max: 25, step: 1 }}
            hint="Raise the SIP each year. 0 for a fixed SIP."
          />
        </FieldGrid>
        <NumberField
          label="Inflation (optional)"
          value={state.inflation}
          onChange={set('inflation')}
          error={inflation.error}
          suffix="% a year"
          placeholder="Leave empty to skip"
          hint={
            mode === 'goal'
              ? "Treats the goal as today's money and grows it by inflation to the amount you will need."
              : "Shows what the final value is worth in today's money."
          }
          className="sm:max-w-xs"
        />
        <div className="pt-6 border-t border-[var(--color-border)]">
          <Segmented
            label="How the annual return becomes a monthly rate"
            value={state.convention}
            onChange={(v) => setState((s) => ({ ...s, convention: v }))}
            options={[
              { value: 'simple', label: 'Annual ÷ 12' },
              { value: 'effective', label: 'Compounded' },
            ]}
          />
          <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
            {state.convention === 'simple'
              ? 'Monthly rate = annual return ÷ 12. Most SIP calculators use this; it gives the higher figure.'
              : 'Monthly rate = (1 + annual return)^(1/12) − 1, so the money grows by exactly the annual return over a year. More conservative.'}
          </p>
        </div>
      </div>
    </>
  );

  const headline =
    mode === 'goal' && goal && result ? (
      <HeadlineResult
        label={stepUp.value! > 0 ? 'Starting monthly SIP needed' : 'Monthly SIP needed'}
        value={money(goal.monthly)}
        caption={`to reach ${money(goal.future)} in ${years.value} ${years.value === 1 ? 'year' : 'years'} at ${pct(rate.value!)} a year`}
      />
    ) : result ? (
      <HeadlineResult label="Estimated value" value={money(result.value)} caption={`after ${years.value} ${years.value === 1 ? 'year' : 'years'} at ${pct(rate.value!)} a year`} />
    ) : null;

  const summary = result ? (
    <>
      {headline}
      <SplitBar
        label="Amount invested and estimated returns"
        currency={currency}
        parts={[
          { label: 'Invested', value: result.invested, color: SERIES.primary },
          { label: 'Est. returns', value: result.gains, color: SERIES.secondary },
        ]}
      />
      <ResultList
        divided
        rows={[
          ...(mode === 'goal' && goal && inflation.value! > 0
            ? [{ label: `Goal after ${pct(inflation.value!)} inflation`, value: money(goal.future) }]
            : []),
          { label: 'Amount invested', value: money(result.invested) },
          { label: 'Estimated returns', value: money(result.gains) },
          { label: 'Estimated value', value: money(result.value), strong: true },
          ...(real !== null ? [{ label: "Worth in today's money", value: money(real) }] : []),
          ...(result.rows.length > 0 && stepUp.value! > 0
            ? [{ label: `Monthly SIP in year ${result.rows.length}`, value: formatMoney(result.rows.at(-1)!.monthlyAmount, currency) }]
            : []),
        ]}
      />
      {level && (
        <Notice tone="info">
          The {pct(stepUp.value!)} yearly step-up adds {money(result.value - level.value)} compared with a fixed {money(monthly!)} SIP, for{' '}
          {money(result.invested - level.invested)} more invested.
        </Notice>
      )}
      {lumpsum !== null && result.invested > 0 && (
        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          <span className="font-medium text-[var(--color-ink)]">SIP vs lump sum:</span> the same {money(result.invested)} invested in one go today would
          reach {money(lumpsum)} at the same assumed return, because all of it is invested for the whole period. A SIP fits money you earn month by month
          and spreads out your buying price.
        </p>
      )}
      <p className="text-[13px] leading-relaxed text-[var(--color-text-muted)]">
        A projection at a constant return, before tax. Mutual fund returns go up and down with the market, so the real value can be higher or lower,
        including below what you invested.
      </p>
    </>
  ) : mode === 'goal' && valid && goal && !Number.isFinite(goal.monthly) ? (
    <EmptyResult message="No SIP reaches this goal with these inputs." />
  ) : (
    <EmptyResult />
  );

  return (
    <CalculatorLayout
      title="SIP calculator"
      form={form}
      result={summary}
      mobileSummary={
        result
          ? mode === 'goal' && goal
            ? { label: 'Monthly SIP needed', value: money(goal.monthly) }
            : { label: 'Estimated value', value: money(result.value) }
          : null
      }
    >
      {result && result.rows.length >= 2 && (
        <LineChart
          title="Amount invested and estimated value"
          currency={currency}
          xLabels={['Start', ...result.rows.map((r) => `Yr ${r.year}`)]}
          series={[
            { name: 'Estimated value', color: SERIES.secondary, values: [0, ...result.rows.map((r) => r.value)] },
            { name: 'Amount invested', color: SERIES.primary, values: [0, ...result.rows.map((r) => r.totalInvested)], area: true },
          ]}
        />
      )}
      {result && (
        <DataTable<SipYearRow>
          title="Year-by-year growth"
          csvName="sip-projection.csv"
          rows={result.rows}
          columns={[
            { header: 'Year', cell: (r) => String(r.year) },
            { header: 'Monthly SIP', cell: (r) => formatMoney(r.monthlyAmount, currency), align: 'right' },
            { header: 'Invested this year', cell: (r) => money(r.investedInYear), align: 'right', hideOnMobile: true },
            { header: 'Total invested', cell: (r) => money(r.totalInvested), align: 'right' },
            { header: 'Estimated returns', cell: (r) => money(r.gains), align: 'right', hideOnMobile: true },
            { header: 'Estimated value', cell: (r) => money(r.value), align: 'right' },
          ]}
        />
      )}
    </CalculatorLayout>
  );
}
