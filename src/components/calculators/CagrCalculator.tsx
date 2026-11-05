'use client';

import React, { useId, useMemo, useState } from 'react';
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
} from './ui';
import {
  absoluteReturn,
  cagr,
  cagrPath,
  type CagrError,
  type CagrPathRow,
  doublingYears,
  growAtCagr,
  realRate,
  ruleOf72,
  spreadsheetFormulas,
  yearsBetween,
  yearsToReach,
} from '@/lib/calculators/cagr.ts';
import { CURRENCIES, type CurrencyCode, formatMoney, formatMonths, formatNumber, formatPercent, validateNumber } from '@/lib/calculators/money.ts';

type Mode = 'rate' | 'value' | 'time';
type PeriodMode = 'duration' | 'dates';

interface State {
  currency: CurrencyCode;
  mode: Mode;
  periodMode: PeriodMode;
  start: string;
  end: string;
  rate: string;
  years: string;
  months: string;
  fromDate: string;
  toDate: string;
  /** Optional inflation assumption for the real (inflation-adjusted) CAGR. */
  inflation: string;
}

/** Worked example on the page: 10,000 → 18,000 in 5 years is a CAGR of 12.47%. */
const EXAMPLE: State = {
  currency: 'USD',
  mode: 'rate',
  periodMode: 'duration',
  start: '10000',
  end: '18000',
  rate: '10',
  years: '5',
  months: '0',
  fromDate: '2020-01-01',
  toDate: '2025-07-01',
  inflation: '',
};

const ERRORS: Record<CagrError, string> = {
  'start-not-positive': 'CAGR needs a starting value above zero. Growth from zero or a negative value has no compound rate.',
  'end-negative': 'CAGR cannot be calculated when the ending value is negative. Use the change in value instead.',
  'period-not-positive': 'The period must be longer than zero.',
};

export default function CagrCalculator() {
  const [state, setState] = useState<State>(EXAMPLE);
  const set = (key: keyof State) => (value: string) => setState((s) => ({ ...s, [key]: value }));
  const { currency } = state;
  const money = (v: number) => formatMoney(v, currency);
  const ids = useId();

  const start = validateNumber(state.start, { label: 'Starting value', min: 0, minExclusive: true, max: 1e15 });
  const end = validateNumber(state.end, { label: 'Ending value', min: 0, max: 1e15 });
  const rate = validateNumber(state.rate, { label: 'Growth rate', min: -99.99, max: 1000 });
  const yearsIn = validateNumber(state.years, { label: 'Years', min: 0, max: 200, integer: true, emptyAs: 0 });
  const monthsIn = validateNumber(state.months, { label: 'Months', min: 0, max: 11, integer: true, emptyAs: 0 });
  const inflation = validateNumber(state.inflation, { label: 'Inflation rate', min: -10, max: 100, emptyAs: 0 });
  const isTime = state.mode === 'time';

  let years: number | null = null;
  let periodError: string | null = null;
  if (state.periodMode === 'duration') {
    if (yearsIn.value !== null && monthsIn.value !== null) {
      years = yearsIn.value + monthsIn.value / 12;
      if (years <= 0) periodError = 'Enter a period of at least 1 month.';
    }
  } else {
    const y = yearsBetween(state.fromDate, state.toDate);
    if (Number.isNaN(y)) periodError = 'Enter both dates.';
    else if (y <= 0) periodError = 'The end date must be after the start date.';
    else years = y;
  }
  const periodOk = isTime || (years !== null && !periodError);

  // Time mode: how long the start takes to reach the end at the entered rate.
  const timeResult = useMemo(() => {
    if (!isTime || start.value === null || end.value === null || rate.value === null) return null;
    if (end.value <= 0) return { kind: 'error' as const, message: 'Enter a target value above zero.' };
    const n = yearsToReach(start.value, end.value, rate.value);
    if (n === null) return { kind: 'error' as const, message: 'At this rate the value never reaches the target. Use a positive rate for a higher target, or a negative rate for a lower one.' };
    return { kind: 'ok' as const, years: n };
  }, [isTime, start.value, end.value, rate.value]);

  const result = useMemo(() => {
    if (isTime || start.value === null || !periodOk) return null;
    if (state.mode === 'rate') {
      if (end.value === null) return null;
      const r = cagr(start.value, end.value, years!);
      if (!r.ok) return { kind: 'error' as const, message: ERRORS[r.error] };
      return { kind: 'ok' as const, rate: r.rate, endValue: end.value };
    }
    if (rate.value === null) return null;
    return { kind: 'ok' as const, rate: rate.value / 100, endValue: growAtCagr(start.value, rate.value, years!) };
  }, [isTime, start.value, end.value, rate.value, years, periodOk, state.mode]);
  const formulas = result?.kind === 'ok' && state.mode === 'rate' && start.value !== null && years !== null ? spreadsheetFormulas(start.value, result.endValue, Number(years.toFixed(6))) : null;
  const real = result?.kind === 'ok' && inflation.value ? realRate(result.rate, inflation.value) : null;

  const pathRate = result?.kind === 'ok' && result.rate > -1 ? result.rate : null;
  const path: CagrPathRow[] = pathRate !== null && start.value !== null ? cagrPath(start.value, pathRate, years!) : [];
  const periodLabel =
    years === null
      ? ''
      : state.periodMode === 'duration'
        ? [yearsIn.value ? `${yearsIn.value} ${yearsIn.value === 1 ? 'year' : 'years'}` : '', monthsIn.value ? `${monthsIn.value} ${monthsIn.value === 1 ? 'month' : 'months'}` : '']
            .filter(Boolean)
            .join(' ')
        : `${formatNumber(years, 2)} years`;

  const dateInput = (key: 'fromDate' | 'toDate', label: string) => (
    <div className="space-y-1.5">
      <label htmlFor={`${ids}-${key}`} className="block text-sm font-medium text-[var(--color-ink)]">
        {label}
      </label>
      <input
        id={`${ids}-${key}`}
        type="date"
        value={state[key]}
        onChange={(e) => set(key)(e.target.value)}
        className="input h-11 w-full rounded-xl text-[15px] bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none"
      />
    </div>
  );

  const form = (
    <>
      <FormHeader>
        <CurrencySelect value={currency} onChange={(c) => setState((s) => ({ ...s, currency: c }))} />
        <ResetButton onClick={() => setState(EXAMPLE)} />
      </FormHeader>
      <div className="space-y-6">
        <Segmented
          label="What do you want to find?"
          value={state.mode}
          onChange={(v) => setState((s) => ({ ...s, mode: v }))}
          options={[
            { value: 'rate', label: 'Growth rate (CAGR)' },
            { value: 'value', label: 'Future value' },
            { value: 'time', label: 'Time to target' },
          ]}
        />
        <FieldGrid>
          <NumberField
            label="Starting value"
            value={state.start}
            onChange={set('start')}
            error={start.error}
            prefix={CURRENCIES[currency].symbol}
            hint="Price, portfolio value, revenue or any positive figure."
          />
          {state.mode !== 'value' ? (
            <NumberField
              label={isTime ? 'Target value' : 'Ending value'}
              value={state.end}
              onChange={set('end')}
              error={end.error}
              prefix={CURRENCIES[currency].symbol}
              hint={isTime ? 'The value you want to reach.' : 'Or a target value, to see the growth rate you need.'}
            />
          ) : (
            <NumberField label="Growth rate (CAGR)" value={state.rate} onChange={set('rate')} error={rate.error} suffix="% a year" hint="Negative for a decline." />
          )}
        </FieldGrid>
        {isTime && (
          <NumberField label="Growth rate (CAGR)" value={state.rate} onChange={set('rate')} error={rate.error} suffix="% a year" hint="The yearly rate you expect. Your assumption." className="sm:max-w-xs" />
        )}

        {!isTime && (
        <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
          <Segmented
            label="Period"
            value={state.periodMode}
            onChange={(v) => setState((s) => ({ ...s, periodMode: v }))}
            options={[
              { value: 'duration', label: 'Years and months' },
              { value: 'dates', label: 'Between two dates' },
            ]}
          />
          {state.periodMode === 'duration' ? (
            <FieldGrid>
              <NumberField label="Years" value={state.years} onChange={set('years')} error={yearsIn.error} suffix="years" integer />
              <NumberField label="Months" value={state.months} onChange={set('months')} error={monthsIn.error} suffix="months" integer />
            </FieldGrid>
          ) : (
            <FieldGrid>
              {dateInput('fromDate', 'Start date')}
              {dateInput('toDate', 'End date')}
            </FieldGrid>
          )}
          {periodError && (
            <p role="alert" className="text-[13px] text-[var(--color-danger)]">
              {periodError}
            </p>
          )}
          {state.periodMode === 'dates' && periodOk && (
            <p className="text-[13px] text-[var(--color-text-muted)]">
              {formatNumber(years! * 365, 0)} days = {formatNumber(years!, 4)} years (actual days ÷ 365).
            </p>
          )}
        </div>
        )}
        {!isTime && (
          <NumberField
            label="Inflation rate (optional)"
            value={state.inflation}
            onChange={set('inflation')}
            error={inflation.error}
            suffix="% a year"
            hint="Your assumption, to see the real growth after inflation. Leave empty to skip."
            className="sm:max-w-xs"
          />
        )}
      </div>
    </>
  );

  let summary: React.ReactNode = <EmptyResult />;
  if (timeResult?.kind === 'error') {
    summary = <Notice tone="warning">{timeResult.message}</Notice>;
  } else if (timeResult?.kind === 'ok' && start.value !== null && end.value !== null) {
    summary = (
      <>
        <HeadlineResult label="Time to reach the target" value={timeResult.years === 0 ? 'Already there' : `${formatNumber(timeResult.years, 1)} years`} caption={timeResult.years > 0 ? `about ${formatMonths(Math.ceil(timeResult.years * 12))}` : undefined} />
        <ResultList
          divided
          rows={[
            { label: 'Starting value', value: money(start.value) },
            { label: 'Target value', value: money(end.value) },
            { label: 'Growth rate', value: `${formatPercent(rate.value!)} a year` },
            { label: 'Growth needed', value: formatPercent(absoluteReturn(start.value, end.value) * 100) },
          ]}
        />
        <p className="text-[13px] leading-relaxed text-[var(--color-text-muted)]">
          Years = ln(target ÷ start) ÷ ln(1 + rate). Real returns vary from year to year, so treat this as an estimate.
        </p>
      </>
    );
  } else if (result?.kind === 'error') {
    summary = <Notice tone="warning">{result.message}</Notice>;
  } else if (result?.kind === 'ok' && start.value !== null) {
    const change = result.endValue - start.value;
    const doubling = doublingYears(result.rate);
    summary = (
      <>
        {state.mode === 'rate' ? (
          <HeadlineResult label="CAGR" value={formatPercent(result.rate * 100)} caption={`a year, compounded, over ${periodLabel}`} />
        ) : (
          <HeadlineResult label="Future value" value={money(result.endValue)} caption={`after ${periodLabel} at ${formatPercent(result.rate * 100)} a year`} />
        )}
        <ResultList
          divided
          rows={[
            { label: 'Starting value', value: money(start.value) },
            { label: 'Ending value', value: money(result.endValue) },
            { label: 'Total change', value: formatMoney(change, currency, { signed: true }) },
            { label: 'Absolute return', value: formatPercent(absoluteReturn(start.value, result.endValue) * 100) },
            ...(state.mode === 'value' ? [] : [{ label: 'CAGR', value: formatPercent(result.rate * 100), strong: true }]),
          ]}
        />
        {result.rate > 0 ? (
          <ResultList
            divided
            rows={[
              { label: 'Doubles in (exact)', value: `${formatNumber(doubling, 1)} years` },
              { label: 'Rule of 72 estimate', value: `${formatNumber(ruleOf72(result.rate), 1)} years` },
            ]}
          />
        ) : (
          <Notice tone={result.rate < 0 ? 'warning' : 'info'}>
            {result.rate === -1
              ? 'The value fell to zero: a total loss.'
              : result.rate < 0
                ? `The value shrank by ${formatPercent(-result.rate * 100)} a year on average.`
                : 'No growth: the value is unchanged.'}
          </Notice>
        )}
        {real !== null && (
          <ResultList divided rows={[{ label: `Real CAGR after ${formatPercent(inflation.value!, 1)} inflation`, value: formatPercent(real * 100), strong: true }]} />
        )}
        {formulas && <SpreadsheetFormulas manual={formulas.manual} rri={formulas.rri} />}
        <p className="text-[13px] leading-relaxed text-[var(--color-text-muted)]">
          CAGR is a smoothed average. It ignores the ups and downs in between and any money added or withdrawn during the period.
        </p>
      </>
    );
  }

  return (
    <CalculatorLayout
      title="CAGR calculator"
      form={form}
      result={summary}
      mobileSummary={
        timeResult?.kind === 'ok'
          ? { label: 'Time to target', value: `${formatNumber(timeResult.years, 1)} years` }
          : result?.kind === 'ok'
          ? state.mode === 'rate'
            ? { label: 'CAGR', value: formatPercent(result.rate * 100) }
            : { label: 'Future value', value: money(result.endValue) }
          : null
      }
    >
      {path.length >= 2 && (
        <DataTable<CagrPathRow>
          title="Value at the end of each year at this CAGR"
          csvName="cagr-growth-path.csv"
          rows={path}
          columns={[
            { header: 'Year', cell: (r) => String(r.year) },
            { header: 'Value', cell: (r) => money(r.value), align: 'right' },
            { header: 'Change in year', cell: (r) => formatMoney(r.value - r.value / (1 + pathRate!), currency, { signed: true }), align: 'right' },
            { header: 'Growth since start', cell: (r) => formatPercent(absoluteReturn(start.value!, r.value) * 100), align: 'right' },
          ]}
        />
      )}
    </CalculatorLayout>
  );
}

/** The same CAGR as Excel / Google Sheets formulas, with a copy button for each. */
function SpreadsheetFormulas({ manual, rri }: { manual: string; rri: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };
  return (
    <div className="pt-5 border-t border-[var(--color-border)] space-y-2">
      <p className="text-sm text-[var(--color-text-secondary)]">Same result in Excel or Google Sheets</p>
      {[manual, rri].map((f) => (
        <div key={f} className="flex items-center justify-between gap-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2">
          <code className="font-mono text-[13px] text-[var(--color-ink)] break-all">{f}</code>
          <button type="button" onClick={() => copy(f)} className="btn btn-xs btn-ghost rounded-full shrink-0 text-[var(--color-brand-dark)]" aria-label={`Copy ${f}`}>
            {copied === f ? 'Copied' : 'Copy'}
          </button>
        </div>
      ))}
      <p className="text-[12px] text-[var(--color-text-muted)]">Format the cell as a percentage.</p>
    </div>
  );
}
