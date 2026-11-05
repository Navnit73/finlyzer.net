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
  Notice,
  NumberField,
  ResetButton,
  ResultList,
  SERIES,
  Segmented,
  SelectField,
  SplitBar,
} from './ui';
import { amortize, monthsToRepay, monthlyPayment, yearlySummary, type ScheduleRow } from '@/lib/calculators/loan.ts';
import { emiDate, groupSchedule, type PeriodRow, type ScheduleBasis } from '@/lib/calculators/emi.ts';
import { CURRENCIES, type CurrencyCode, formatMoney, formatMonths, formatPercent, round2, validateNumber } from '@/lib/calculators/money.ts';

type TenureUnit = 'years' | 'months';

interface State {
  currency: CurrencyCode;
  amount: string;
  rate: string;
  tenure: string;
  unit: TenureUnit;
  /** Rate change for the floating-rate what-if, in percentage points. */
  rateChange: string;
  /** First EMI month, '' when not set, else '0'–'11'. */
  firstMonth: string;
  firstYear: string;
  /** Optional monthly take-home income for the affordability share. */
  income: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Worked example used on the page: ₹25,00,000 at 8.5% for 20 years → EMI ₹21,695.58. */
const EXAMPLE: State = { currency: 'INR', amount: '2500000', rate: '8.5', tenure: '20', unit: 'years', rateChange: '0.5', firstMonth: '', firstYear: '', income: '' };

const MAX_MONTHS = 480;

const SLIDER: Record<CurrencyCode, { min: number; max: number; step: number }> = {
  INR: { min: 100_000, max: 20_000_000, step: 50_000 },
  USD: { min: 1_000, max: 2_000_000, step: 1_000 },
  GBP: { min: 1_000, max: 2_000_000, step: 1_000 },
  EUR: { min: 1_000, max: 2_000_000, step: 1_000 },
};

export default function EmiCalculator() {
  const [state, setState] = useState<State>(EXAMPLE);
  const [view, setView] = useState<'yearly' | 'monthly'>('yearly');
  const [basis, setBasis] = useState<Exclude<ScheduleBasis, 'loan'>>('financial');
  const set = (key: keyof State) => (value: string) => setState((s) => ({ ...s, [key]: value }));
  const { currency } = state;
  const money = (v: number, decimals = 2) => formatMoney(v, currency, { decimals });

  const amount = validateNumber(state.amount, { label: 'Loan amount', min: 0, minExclusive: true, max: 1e12 });
  const rate = validateNumber(state.rate, { label: 'Interest rate', min: 0, max: 50 });
  const tenureMax = state.unit === 'years' ? MAX_MONTHS / 12 : MAX_MONTHS;
  const tenure = validateNumber(state.tenure, { label: 'Loan tenure', min: 0, minExclusive: true, max: tenureMax, integer: state.unit === 'months' });
  const months = tenure.value === null ? null : Math.round(state.unit === 'years' ? tenure.value * 12 : tenure.value);
  const monthsError = months !== null && months < 1 ? 'Loan tenure must be at least 1 month.' : null;
  const firstYear = validateNumber(state.firstYear, { label: 'Year', min: 1990, max: 2100, integer: true });
  // Dates are optional: both month and year are needed before the schedule switches to dates.
  const dated = state.firstMonth !== '' && firstYear.value !== null;
  const income = validateNumber(state.income, { label: 'Monthly income', min: 0, minExclusive: true, max: 1e12, emptyAs: 0 });
  const rateChange = validateNumber(state.rateChange, { label: 'Rate change', min: -20, max: 20, emptyAs: 0 });

  const valid = amount.value !== null && rate.value !== null && months !== null && !monthsError;

  const result = useMemo(() => {
    if (!valid) return null;
    const schedule = amortize({ principal: amount.value!, annualRatePct: rate.value!, months: months! });
    return { schedule, years: yearlySummary(schedule.rows) };
  }, [valid, amount.value, rate.value, months]);

  /** Floating-rate reset at the start: higher EMI (same tenure) vs longer tenure (same EMI). */
  const whatIf = useMemo(() => {
    if (!result || rateChange.value === null || rateChange.value === 0) return null;
    const newRate = rate.value! + rateChange.value;
    if (newRate < 0) return null;
    const newEmi = round2(monthlyPayment(amount.value!, newRate, months!));
    const n = monthsToRepay(amount.value!, newRate, result.schedule.payment);
    return { newRate, newEmi, newMonths: Number.isFinite(n) ? Math.ceil(n) : null };
  }, [result, rateChange.value, rate.value, amount.value, months]);

  const periods = useMemo(
    () => (result ? groupSchedule(result.schedule.rows, dated ? basis : 'loan', Number(state.firstMonth || 0), firstYear.value ?? 2026) : null),
    [result, dated, basis, state.firstMonth, firstYear.value],
  );

  const reset = () => {
    setState(EXAMPLE);
    setView('yearly');
    setBasis('financial');
  };

  const changeUnit = (unit: TenureUnit) => {
    // Keep the same loan length when switching units.
    setState((s) => {
      if (s.unit === unit || months === null) return { ...s, unit };
      return { ...s, unit, tenure: unit === 'months' ? String(months) : String(round2(months / 12)) };
    });
  };

  const form = (
    <>
      <FormHeader title="Loan details">
        <CurrencySelect value={currency} onChange={(c) => setState((s) => ({ ...s, currency: c }))} />
        <ResetButton onClick={reset} />
      </FormHeader>
      <div className="space-y-6">
        <NumberField
          label="Loan amount"
          value={state.amount}
          onChange={set('amount')}
          error={amount.error}
          prefix={CURRENCIES[currency].symbol}
          range={SLIDER[currency]}
          hint={amount.value ? money(amount.value, 0) : undefined}
        />
        <NumberField
          label="Interest rate (per year)"
          value={state.rate}
          onChange={set('rate')}
          error={rate.error}
          suffix="% p.a."
          range={{ min: 0, max: 20, step: 0.05 }}
          hint="The annual rate in your sanction letter, reducing balance."
        />
        <FieldGrid>
          <NumberField
            label="Loan tenure"
            value={state.tenure}
            onChange={set('tenure')}
            error={tenure.error ?? monthsError}
            suffix={state.unit}
            integer={state.unit === 'months'}
            range={state.unit === 'years' ? { min: 1, max: 40, step: 1 } : { min: 6, max: MAX_MONTHS, step: 6 }}
          />
          <Segmented
            label="Tenure in"
            value={state.unit}
            onChange={changeUnit}
            options={[
              { value: 'years', label: 'Years' },
              { value: 'months', label: 'Months' },
            ]}
          />
        </FieldGrid>

        <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
          <div>
            <h3 className="type-headline !text-[17px]">If a floating rate changes</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Lenders usually keep the EMI and extend the tenure when a floating rate rises. See both options for a change at the start of the loan.
            </p>
          </div>
          <NumberField
            label="Rate change"
            value={state.rateChange}
            onChange={set('rateChange')}
            error={rateChange.error}
            suffix="% points"
            hint="Use a negative number for a rate cut."
            className="sm:max-w-xs"
          />
          {whatIf && result && (
            <ResultList
              rows={[
                { label: `EMI at ${formatPercent(whatIf.newRate)} (same tenure)`, value: `${money(whatIf.newEmi)} (${formatMoney(whatIf.newEmi - result.schedule.payment, currency, { signed: true })})` },
                {
                  label: `Tenure at ${formatPercent(whatIf.newRate)} (same EMI)`,
                  value: whatIf.newMonths === null ? 'Never repaid' : `${formatMonths(whatIf.newMonths)} (${whatIf.newMonths - months! >= 0 ? '+' : '−'}${Math.abs(whatIf.newMonths - months!)} EMIs)`,
                },
              ]}
            />
          )}
          {whatIf && whatIf.newMonths === null && (
            <Notice tone="danger">At {formatPercent(whatIf.newRate)} the current EMI no longer covers the monthly interest, so the lender would have to raise the EMI.</Notice>
          )}
        </div>

        <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
          <div>
            <h3 className="type-headline !text-[17px]">Schedule dates and budget (optional)</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Add the month of your first EMI to see the schedule by financial year (April to March) or calendar year, and your income to see how much of it the
              EMI takes.
            </p>
          </div>
          <FieldGrid cols={3}>
            <SelectField
              label="First EMI month"
              value={state.firstMonth}
              onChange={set('firstMonth')}
              options={[{ value: '', label: 'Not set' }, ...MONTHS.map((m, i) => ({ value: String(i), label: m }))]}
            />
            <NumberField label="Year" value={state.firstYear} onChange={set('firstYear')} error={state.firstYear ? firstYear.error : null} integer placeholder="e.g. 2027" />
            <NumberField
              label="Monthly take-home income"
              value={state.income}
              onChange={set('income')}
              error={income.error}
              prefix={CURRENCIES[currency].symbol}
              placeholder="Optional"
            />
          </FieldGrid>
        </div>
      </div>
    </>
  );

  const summary = result ? (
    <>
      <HeadlineResult label="Monthly EMI" value={money(result.schedule.payment)} caption={`for ${formatMonths(months!)} (${months} EMIs)`} />
      <SplitBar
        label="Share of principal and interest in total payments"
        currency={currency}
        parts={[
          { label: 'Principal', value: amount.value!, color: SERIES.primary },
          { label: 'Interest', value: result.schedule.totalInterest, color: SERIES.secondary },
        ]}
      />
      <ResultList
        divided
        rows={[
          { label: 'Principal', value: money(amount.value!) },
          { label: 'Total interest', value: money(result.schedule.totalInterest) },
          { label: 'Total amount payable', value: money(result.schedule.totalPaid), strong: true },
          {
            label: currency === 'INR' ? 'EMI per ₹1 lakh borrowed' : `EMI per ${formatMoney(1000, currency, { decimals: 0 })} borrowed`,
            value: money((result.schedule.payment * (currency === 'INR' ? 100_000 : 1_000)) / amount.value!),
          },
          ...(income.value ? [{ label: 'EMI as a share of income', value: formatPercent((result.schedule.payment / income.value) * 100, 1) }] : []),
        ]}
      />
      {(income.value ?? 0) > 0 && (
        <p className="text-[13px] text-[var(--color-text-muted)]">
          Lenders check what share of your income goes to all EMIs together, including existing loans, and each sets its own limit.
        </p>
      )}
      {rate.value === 0 && <Notice>At 0% the EMI is simply the loan amount divided by the number of months.</Notice>}
      {result.schedule.rows.at(-1) && result.schedule.rows.at(-1)!.payment !== result.schedule.payment && (
        <p className="text-[13px] text-[var(--color-text-muted)]">
          The last EMI is {money(result.schedule.rows.at(-1)!.payment)} because interest is rounded each month and the final instalment clears the remaining balance.
        </p>
      )}
    </>
  ) : (
    <EmptyResult />
  );

  return (
    <CalculatorLayout
      title="EMI calculator"
      form={form}
      result={summary}
      mobileSummary={result ? { label: 'Monthly EMI', value: money(result.schedule.payment) } : null}
    >
      {result && result.years.length >= 2 && (
        <LineChart
          title="Outstanding balance and interest paid"
          currency={currency}
          xLabels={['Start', ...result.years.map((y) => `Yr ${y.year}`)]}
          series={[
            { name: 'Outstanding balance', color: SERIES.primary, values: [amount.value!, ...result.years.map((y) => y.closing)], area: true },
            { name: 'Interest paid to date', color: SERIES.secondary, values: [0, ...cumulative(result.years.map((y) => y.interest))] },
          ]}
        />
      )}
      {result && (
        <div className="space-y-3">
          <Segmented
            label="Repayment schedule view"
            hideLabel
            value={view}
            onChange={setView}
            options={[
              { value: 'yearly', label: 'By year' },
              { value: 'monthly', label: 'By month' },
            ]}
          />
          {view === 'yearly' ? (
            <div className="space-y-3">
              {dated && (
                <Segmented
                  label="Group the schedule by"
                  value={basis}
                  onChange={setBasis}
                  options={[
                    { value: 'financial', label: 'Financial year (Apr–Mar)' },
                    { value: 'calendar', label: 'Calendar year' },
                  ]}
                />
              )}
              <DataTable<PeriodRow>
                title={dated ? (basis === 'financial' ? 'Repayment schedule by financial year' : 'Repayment schedule by calendar year') : 'Repayment schedule by year'}
                csvName={`emi-schedule-${dated ? basis : 'loan'}-year.csv`}
                rows={periods!}
                columns={[
                  { header: dated ? 'Period' : 'Year', cell: (r) => r.label },
                  ...(dated ? [{ header: 'EMIs', cell: (r: PeriodRow) => String(r.emis), align: 'right' as const }] : []),
                  { header: 'Opening balance', cell: (r) => money(r.opening), align: 'right', hideOnMobile: true },
                  { header: 'Interest', cell: (r) => money(r.interest), align: 'right' },
                  { header: 'Principal', cell: (r) => money(r.principal), align: 'right' },
                  { header: 'Closing balance', cell: (r) => money(r.closing), align: 'right' },
                ]}
              />
            </div>
          ) : (
            <DataTable<ScheduleRow>
              title="Repayment schedule by month"
              csvName="emi-schedule-monthly.csv"
              rows={result.schedule.rows}
              columns={[
                { header: 'EMI no.', cell: (r) => String(r.month) },
                ...(dated
                  ? [
                      {
                        header: 'Month',
                        cell: (r: ScheduleRow) => {
                          const d = emiDate(Number(state.firstMonth), firstYear.value!, r.month);
                          return `${MONTHS[d.month]} ${d.year}`;
                        },
                      },
                    ]
                  : []),
                { header: 'Opening balance', cell: (r) => money(r.opening), align: 'right', hideOnMobile: true },
                { header: 'EMI', cell: (r) => money(r.payment), align: 'right' },
                { header: 'Interest', cell: (r) => money(r.interest), align: 'right' },
                { header: 'Principal', cell: (r) => money(r.principal), align: 'right' },
                { header: 'Closing balance', cell: (r) => money(r.closing), align: 'right' },
              ]}
            />
          )}
        </div>
      )}
    </CalculatorLayout>
  );
}

function cumulative(values: number[]): number[] {
  let total = 0;
  return values.map((v) => (total = round2(total + v)));
}
