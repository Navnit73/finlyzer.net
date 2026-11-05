'use client';

import React, { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalculatorLayout,
  CurrencySelect,
  DataTable,
  EmptyResult,
  FieldGrid,
  FormHeader,
  HeadlineResult,
  Notice,
  NumberField,
  ResetButton,
  ResultList,
  Segmented,
  SelectField,
} from './ui';
import {
  annualCompoundInterest,
  annualRatePct,
  daysBetween,
  interestPerPeriod,
  simpleSchedule,
  solveSimpleInterest,
  toYears,
  type DayBasis,
  type RatePeriod,
  type SimpleYearRow,
  type SolveFor,
} from '@/lib/calculators/simple-interest.ts';
import { CURRENCIES, type CurrencyCode, formatMoney, formatNumber, type Parsed, validateNumber } from '@/lib/calculators/money.ts';

type TimeUnit = 'years' | 'months' | 'days' | 'dates';

interface State {
  currency: CurrencyCode;
  solveFor: SolveFor;
  principal: string;
  rate: string;
  /** Whether the entered rate is per year or per month (2% a month = 24% a year). */
  ratePeriod: RatePeriod;
  time: string;
  unit: TimeUnit;
  basis: DayBasis;
  startDate: string;
  endDate: string;
  interest: string;
}

/** Page example: ₹50,000 at 8% for 3 years → SI ₹12,000. */
const EXAMPLE: State = {
  currency: 'INR',
  solveFor: 'interest',
  principal: '50000',
  rate: '8',
  ratePeriod: 'year',
  time: '3',
  unit: 'years',
  basis: 365,
  startDate: '2026-03-01',
  endDate: '2026-05-30',
  interest: '12000',
};

const SOLVE_OPTIONS: { value: SolveFor; label: string }[] = [
  { value: 'interest', label: 'Interest' },
  { value: 'principal', label: 'Principal' },
  { value: 'rate', label: 'Rate' },
  { value: 'time', label: 'Time' },
];

const UNIT_OPTIONS: { value: TimeUnit; label: string }[] = [
  { value: 'years', label: 'Years' },
  { value: 'months', label: 'Months' },
  { value: 'days', label: 'Days' },
  { value: 'dates', label: 'Between two dates' },
];

/** Up to `max` decimals, without trailing zeros: 9, 7.5, 0.2466. */
function trim(value: number, max = 4): string {
  const text = formatNumber(value, max);
  return text.includes('.') ? text.replace(/\.?0+$/, '') : text;
}

export default function SimpleInterestCalculator() {
  const ids = useId();
  const [state, setState] = useState<State>(EXAMPLE);
  const set = (key: keyof State) => (value: string) => setState((s) => ({ ...s, [key]: value }));
  const { currency, solveFor, unit, basis } = state;
  const money = (v: number) => formatMoney(v, currency);
  const symbol = CURRENCIES[currency].symbol;

  const skip: Parsed = { value: 0, error: null };
  const principal = solveFor === 'principal' ? skip : validateNumber(state.principal, { label: 'Principal', min: 0, minExclusive: solveFor !== 'interest', max: 1e12 });
  const rateIn = solveFor === 'rate' ? skip : validateNumber(state.rate, { label: 'Rate', min: 0, minExclusive: solveFor !== 'interest', max: state.ratePeriod === 'month' ? 10 : 100 });
  const rate: Parsed = rateIn.value === null ? rateIn : { value: annualRatePct(rateIn.value, state.ratePeriod), error: null };
  const perMonth = state.ratePeriod === 'month';
  const interest = solveFor === 'interest' ? skip : validateNumber(state.interest, { label: 'Interest', min: 0, max: 1e12 });

  // Time → years, plus how it reads in the worked formula ("90 ÷ 365").
  const time = useMemo((): { years: number | null; error: string | null; expr: string } => {
    if (solveFor === 'time') return { years: 0, error: null, expr: '' };
    if (unit === 'dates') {
      const days = daysBetween(state.startDate, state.endDate);
      if (days === null) return { years: null, error: 'Enter both dates.', expr: '' };
      if (days <= 0) return { years: null, error: 'The end date must be after the start date.', expr: '' };
      return { years: toYears(days, 'days', basis), error: null, expr: `${days} ÷ ${basis}` };
    }
    const v = validateNumber(state.time, { label: 'Time', min: 0, minExclusive: true, max: unit === 'years' ? 100 : unit === 'months' ? 1200 : 36_500 });
    if (v.value === null) return { years: null, error: v.error, expr: '' };
    const expr = unit === 'years' ? trim(v.value) : `${trim(v.value)} ÷ ${unit === 'months' ? 12 : basis}`;
    return { years: toYears(v.value, unit === 'months' ? 'months' : unit, basis), error: null, expr };
  }, [solveFor, unit, basis, state.startDate, state.endDate, state.time]);

  const valid = principal.value !== null && rate.value !== null && interest.value !== null && time.years !== null;

  const solved = useMemo(() => {
    if (!valid) return null;
    return solveSimpleInterest({ solveFor, principal: principal.value!, ratePct: rate.value!, years: time.years!, interest: interest.value! });
  }, [valid, solveFor, principal.value, rate.value, time.years, interest.value]);

  const result = solved && solved.ok ? solved : null;

  const headline = result
    ? {
        interest: { label: 'Simple interest', value: money(result.interest) },
        principal: { label: 'Principal needed', value: money(result.principal) },
        rate: { label: 'Interest rate', value: `${trim(result.ratePct)}% a year`, caption: `${trim(result.ratePct / 12)}% a month` },
        time: { label: 'Time needed', value: `${trim(result.years, 2)} years` },
      }[solveFor]
    : null;

  const steps = result
    ? [
        ...(perMonth && solveFor !== 'rate' && rateIn.value ? [`R = ${trim(rateIn.value)}% a month × 12 = ${trim(result.ratePct)}% a year`] : []),
        ...workedFormula(solveFor, result, time.expr, money),
      ]
    : null;
  const periodic = result && result.ratePct > 0 ? interestPerPeriod(result.principal, result.ratePct, basis) : null;
  const schedule = result && result.years >= 1 && result.years <= 100 ? simpleSchedule(result.principal, result.ratePct, result.years) : [];
  const compoundInterest = result && result.years > 0 ? annualCompoundInterest(result.principal, result.ratePct, result.years) : null;

  const timeFields =
    solveFor === 'time' ? null : (
      <div className="space-y-5">
        <FieldGrid>
          <SelectField label="Time in" value={unit} onChange={(v) => setState((s) => ({ ...s, unit: v }))} options={UNIT_OPTIONS} />
          {(unit === 'days' || unit === 'dates') && (
            <SelectField
              label="Day count"
              value={String(basis) as '365' | '360'}
              onChange={(v) => setState((s) => ({ ...s, basis: Number(v) as DayBasis }))}
              options={[
                { value: '365', label: 'Actual/365 (days ÷ 365)' },
                { value: '360', label: 'Actual/360 (days ÷ 360)' },
              ]}
              hint="Most savings and personal loans use 365. Some commercial loans use 360."
            />
          )}
        </FieldGrid>
        {unit === 'dates' ? (
          <FieldGrid>
            <DateField id={`${ids}-start`} label="Start date" value={state.startDate} onChange={set('startDate')} />
            <DateField id={`${ids}-end`} label="End date" value={state.endDate} onChange={set('endDate')} error={time.error} />
          </FieldGrid>
        ) : (
          <NumberField label={`Time (${unit})`} value={state.time} onChange={set('time')} error={time.error} suffix={unit} className="sm:max-w-xs" />
        )}
      </div>
    );

  const form = (
    <>
      <FormHeader>
        <CurrencySelect value={currency} onChange={(c) => setState((s) => ({ ...s, currency: c }))} />
        <ResetButton onClick={() => setState(EXAMPLE)} />
      </FormHeader>
      <div className="space-y-6">
        <Segmented label="What do you want to find?" value={solveFor} onChange={(v) => setState((s) => ({ ...s, solveFor: v }))} options={SOLVE_OPTIONS} />
        <FieldGrid>
          {solveFor !== 'principal' && <NumberField label="Principal (P)" value={state.principal} onChange={set('principal')} error={principal.error} prefix={symbol} />}
          {solveFor !== 'rate' && (
            <div className="space-y-2">
              <NumberField
                label="Rate (R)"
                value={state.rate}
                onChange={set('rate')}
                error={rateIn.error}
                suffix={perMonth ? '% a month' : '% a year'}
                hint={perMonth && rateIn.value ? `= ${trim(annualRatePct(rateIn.value, 'month'))}% a year` : undefined}
              />
              <Segmented
                label="Rate quoted per"
                hideLabel
                value={state.ratePeriod}
                onChange={(v) => setState((s) => ({ ...s, ratePeriod: v }))}
                options={[
                  { value: 'year', label: 'Per year' },
                  { value: 'month', label: 'Per month' },
                ]}
              />
            </div>
          )}
          {solveFor !== 'interest' && <NumberField label="Interest earned or paid (SI)" value={state.interest} onChange={set('interest')} error={interest.error} prefix={symbol} />}
        </FieldGrid>
        {timeFields}
      </div>
    </>
  );

  const summary =
    result && headline ? (
      <>
        <HeadlineResult label={headline.label} value={headline.value} caption={'caption' in headline ? headline.caption : undefined} />
        {solveFor === 'time' && (
          <p className="-mt-3 text-sm text-[var(--color-text-muted)]">
            = {trim(result.years * 12, 1)} months, or {trim(result.years * 365, 0)} days on a 365-day year
          </p>
        )}
        <ResultList
          divided
          rows={[
            { label: 'Principal', value: money(result.principal) },
            { label: 'Interest', value: money(result.interest) },
            { label: 'Total amount (P + SI)', value: money(result.amount), strong: true },
          ]}
        />
        {steps && (
          <div className="pt-5 border-t border-[var(--color-border)] space-y-1.5">
            <p className="text-sm text-[var(--color-text-secondary)]">Working</p>
            {steps.map((s) => (
              <p key={s} className="text-[14px] tabular-nums text-[var(--color-ink)] break-words">
                {s}
              </p>
            ))}
          </div>
        )}
        {periodic && (
          <ResultList
            divided
            rows={[
              { label: 'Interest per year', value: money(periodic.perYear) },
              { label: 'Interest per month', value: money(periodic.perMonth) },
              { label: `Interest per day (÷ ${basis})`, value: money(periodic.perDay) },
            ]}
          />
        )}
        {compoundInterest !== null && result.interest > 0 && (
          <p className="text-[13px] text-[var(--color-text-muted)]">
            With interest compounded once a year, the same {trim(result.years, 2)} years would earn {money(compoundInterest)} ({money(compoundInterest - result.interest)} more).{' '}
            <Link href="/calculators/compound-interest-calculator" className="link">
              Compare compounding options
            </Link>
          </p>
        )}
      </>
    ) : (
      <>
        {solved && !solved.ok ? <Notice tone="warning">{solved.error}</Notice> : <EmptyResult />}
      </>
    );

  return (
    <CalculatorLayout title="Simple interest calculator" form={form} result={summary} mobileSummary={result && headline ? { label: headline.label, value: headline.value } : null}>
      {schedule.length >= 2 && (
        <DataTable<SimpleYearRow>
          title="Simple interest year by year"
          csvName="simple-interest-by-year.csv"
          rows={schedule}
          columns={[
            { header: 'Year', cell: (r) => (r.fraction === 1 ? String(r.year) : `${r.year} (part)`) },
            { header: 'Interest this year', cell: (r) => money(r.interest), align: 'right' },
            { header: 'Total interest', cell: (r) => money(r.totalInterest), align: 'right' },
            { header: 'Balance (P + SI)', cell: (r) => money(r.balance), align: 'right' },
          ]}
        />
      )}
    </CalculatorLayout>
  );
}

function workedFormula(solveFor: SolveFor, r: { principal: number; ratePct: number; years: number; interest: number }, timeExpr: string, money: (v: number) => string): string[] {
  const P = money(r.principal);
  const R = trim(r.ratePct);
  const SI = money(r.interest);
  const T = timeExpr && timeExpr.includes('÷') ? `(${timeExpr})` : timeExpr;
  switch (solveFor) {
    case 'interest':
      return ['SI = P × R × T ÷ 100', `SI = ${P} × ${R} × ${T} ÷ 100`, `SI = ${SI}`];
    case 'principal':
      return ['P = 100 × SI ÷ (R × T)', `P = 100 × ${SI} ÷ (${R} × ${T})`, `P = ${P}`];
    case 'rate':
      return ['R = 100 × SI ÷ (P × T)', `R = 100 × ${SI} ÷ (${P} × ${T})`, `R = ${R}% a year`];
    case 'time':
      return ['T = 100 × SI ÷ (P × R)', `T = 100 × ${SI} ÷ (${P} × ${R})`, `T = ${trim(r.years)} years`];
  }
}

function DateField({ id, label, value, onChange, error }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string | null }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-ink)]">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="input h-11 w-full rounded-xl text-[15px] tabular-nums bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none aria-[invalid=true]:border-[var(--color-danger)]"
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
