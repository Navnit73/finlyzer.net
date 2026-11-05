'use client';

import React, { useMemo, useState } from 'react';
import {
  CalculatorLayout,
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
import type { ScheduleRow, YearRow } from '@/lib/calculators/loan.ts';
import { MONTH_NAMES, type MonthRef, formatMonthRef, paymentMonth } from '@/lib/calculators/loan-repayment.ts';
import {
  PMI_AUTO_END_LTV,
  PMI_REQUEST_LTV,
  accelerateMortgage,
  calculateMortgage,
  downPaymentToAvoidPmi,
  rateSensitivity,
  type MortgageInput,
  type RateRow,
} from '@/lib/calculators/mortgage.ts';
import { formatMoney, formatMonths, formatPercent, round2, validateNumber } from '@/lib/calculators/money.ts';

type Mode = 'amount' | 'percent';
type Term = '30' | '20' | '15' | 'custom';
type Schedule = 'monthly' | 'biweekly';
type MonthOption = '' | `${number}`;

interface State {
  price: string;
  downMode: Mode;
  down: string;
  rate: string;
  term: Term;
  customYears: string;
  taxMode: Mode;
  tax: string;
  insurance: string;
  pmiRate: string;
  hoa: string;
  startMonth: MonthOption;
  startYear: string;
  schedule: Schedule;
  extraMonthly: string;
  extraYearly: string;
  lumpAmount: string;
  lumpMonth: string;
}

/**
 * Worked example on the page (an illustration, not a market rate): $400,000 home, 10% down,
 * 6.5% for 30 years, 1.1% property tax, $1,800 insurance, 0.5% PMI → $2,942.11 a month.
 * The first-payment month starts empty so server and browser render the same thing.
 */
const EXAMPLE: State = {
  price: '400000',
  downMode: 'percent',
  down: '10',
  rate: '6.5',
  term: '30',
  customYears: '25',
  taxMode: 'percent',
  tax: '1.1',
  insurance: '1800',
  pmiRate: '0.5',
  hoa: '0',
  startMonth: '',
  startYear: '',
  schedule: 'monthly',
  extraMonthly: '0',
  extraYearly: '0',
  lumpAmount: '0',
  lumpMonth: '12',
};

const CURRENCY = 'USD' as const;
const money = (v: number, decimals = 2) => formatMoney(v, CURRENCY, { decimals });

const MONTH_OPTIONS: { value: MonthOption; label: string }[] = [
  { value: '', label: 'Not set' },
  ...MONTH_NAMES.map((name, i) => ({ value: String(i) as MonthOption, label: name })),
];

export default function MortgageCalculator() {
  const [state, setState] = useState<State>(EXAMPLE);
  const [view, setView] = useState<'yearly' | 'monthly'>('yearly');
  const set = (key: keyof State) => (value: string) => setState((s) => ({ ...s, [key]: value }));

  const price = validateNumber(state.price, { label: 'Home price', min: 0, minExclusive: true, max: 1e10 });
  const down = validateNumber(state.down, {
    label: 'Down payment',
    min: 0,
    max: state.downMode === 'percent' ? 100 : price.value ?? undefined,
    emptyAs: 0,
  });
  const rate = validateNumber(state.rate, { label: 'Interest rate', min: 0, max: 30 });
  const custom = validateNumber(state.customYears, { label: 'Loan term', min: 1, max: 50, integer: true });
  const termYears = state.term === 'custom' ? custom.value : Number(state.term);
  const tax = validateNumber(state.tax, { label: 'Property tax', min: 0, max: state.taxMode === 'percent' ? 10 : 1e8, emptyAs: 0 });
  const insurance = validateNumber(state.insurance, { label: 'Homeowners insurance', min: 0, max: 1e7, emptyAs: 0 });
  const pmiRate = validateNumber(state.pmiRate, { label: 'PMI rate', min: 0, max: 5, emptyAs: 0 });
  const hoa = validateNumber(state.hoa, { label: 'HOA dues', min: 0, max: 1e6, emptyAs: 0 });
  const extraMonthly = validateNumber(state.extraMonthly, { label: 'Extra each month', min: 0, max: 1e8, emptyAs: 0 });
  const extraYearly = validateNumber(state.extraYearly, { label: 'Extra once a year', min: 0, max: 1e9, emptyAs: 0 });
  const lumpAmount = validateNumber(state.lumpAmount, { label: 'One-time payment', min: 0, max: 1e10, emptyAs: 0 });
  const lumpMonth = validateNumber(state.lumpMonth, { label: 'Payment number', min: 1, max: 600, integer: true });
  const startYear = validateNumber(state.startYear, { label: 'Year', min: 1950, max: 2150, integer: true });
  const start: MonthRef | null = state.startMonth !== '' && startYear.value !== null ? { year: startYear.value, month: Number(state.startMonth) } : null;
  const startYearError = state.startMonth !== '' ? startYear.error : null;

  const downAmount = price.value !== null && down.value !== null ? (state.downMode === 'percent' ? round2((price.value * down.value) / 100) : down.value) : null;
  const taxAnnual = price.value !== null && tax.value !== null ? (state.taxMode === 'percent' ? round2((price.value * tax.value) / 100) : tax.value) : null;

  const inputReady =
    price.value !== null &&
    downAmount !== null &&
    rate.value !== null &&
    termYears !== null &&
    taxAnnual !== null &&
    insurance.value !== null &&
    pmiRate.value !== null &&
    hoa.value !== null;
  const input = useMemo<MortgageInput | null>(
    () =>
      inputReady
        ? {
            homePrice: price.value!,
            downPayment: downAmount!,
            annualRatePct: rate.value!,
            termMonths: termYears! * 12,
            propertyTaxAnnual: taxAnnual!,
            insuranceAnnual: insurance.value!,
            pmiRatePct: pmiRate.value!,
            hoaMonthly: hoa.value!,
          }
        : null,
    [inputReady, price.value, downAmount, rate.value, termYears, taxAnnual, insurance.value, pmiRate.value, hoa.value],
  );
  const extrasValid = extraMonthly.value !== null && extraYearly.value !== null && lumpAmount.value !== null && (lumpAmount.value === 0 || lumpMonth.value !== null);

  const result = useMemo(() => (input ? calculateMortgage(input) : null), [input]);
  const fast = useMemo(
    () =>
      input && result && extrasValid
        ? accelerateMortgage(input, result, {
            extraMonthly: extraMonthly.value!,
            extraYearly: extraYearly.value!,
            lumpSum: lumpAmount.value! > 0 ? { month: lumpMonth.value!, amount: lumpAmount.value! } : null,
            biweekly: state.schedule === 'biweekly',
          })
        : null,
    [input, result, extrasValid, extraMonthly.value, extraYearly.value, lumpAmount.value, lumpMonth.value, state.schedule],
  );
  const rates = useMemo(() => (input && input.homePrice > input.downPayment ? rateSensitivity(input) : []), [input]);

  const dateOf = (n: number) => (start ? formatMonthRef(paymentMonth(start, n)) : null);
  const paymentLabel = (n: number) => (start ? `${dateOf(n)} (payment ${n})` : `payment ${n}`);

  /** Switch $ ↔ % without changing the underlying amount. */
  const switchMode = (modeKey: 'downMode' | 'taxMode', valueKey: 'down' | 'tax', current: number | null) => (mode: Mode) =>
    setState((s) => {
      if (s[modeKey] === mode || current === null || !price.value) return { ...s, [modeKey]: mode };
      const next = mode === 'percent' ? round2((current / price.value) * 100) : round2(current);
      return { ...s, [modeKey]: mode, [valueKey]: String(next) };
    });

  const reset = () => {
    setState(EXAMPLE);
    setView('yearly');
  };

  const modeOptions = (label: string) => [
    { value: 'amount' as const, label },
    { value: 'percent' as const, label: '%' },
  ];

  const form = (
    <>
      <FormHeader title="Home and loan">
        <ResetButton onClick={reset} />
      </FormHeader>
      <div className="space-y-6">
        <NumberField label="Home price" value={state.price} onChange={set('price')} error={price.error} prefix="$" range={{ min: 50_000, max: 2_000_000, step: 5_000 }} />
        <FieldGrid>
          <NumberField
            label="Down payment"
            value={state.down}
            onChange={set('down')}
            error={down.error}
            prefix={state.downMode === 'amount' ? '$' : undefined}
            suffix={state.downMode === 'percent' ? '%' : undefined}
            hint={
              downAmount !== null && price.value
                ? state.downMode === 'percent'
                  ? money(downAmount, 0)
                  : formatPercent((downAmount / price.value) * 100, 1)
                : undefined
            }
          />
          <Segmented label="Enter down payment as" value={state.downMode} onChange={switchMode('downMode', 'down', downAmount)} options={modeOptions('$')} />
        </FieldGrid>
        <FieldGrid>
          <NumberField
            label="Interest rate"
            value={state.rate}
            onChange={set('rate')}
            error={rate.error}
            suffix="% a year"
            hint="The interest rate on your Loan Estimate, not the APR."
            range={{ min: 0, max: 12, step: 0.125 }}
          />
          <div className="space-y-3">
            <Segmented
              label="Loan term"
              value={state.term}
              onChange={(term) => setState((s) => ({ ...s, term }))}
              options={[
                { value: '30', label: '30 yr' },
                { value: '20', label: '20 yr' },
                { value: '15', label: '15 yr' },
                { value: 'custom', label: 'Other' },
              ]}
            />
            {state.term === 'custom' && (
              <NumberField label="Term in years" value={state.customYears} onChange={set('customYears')} error={custom.error} suffix="years" integer />
            )}
          </div>
        </FieldGrid>
        <FieldGrid>
          <SelectField
            label="First payment month (optional)"
            value={state.startMonth}
            onChange={(v) => setState((s) => ({ ...s, startMonth: v }))}
            options={MONTH_OPTIONS}
            hint="Shows calendar dates for payoff and PMI."
          />
          {state.startMonth !== '' && <NumberField label="Year" value={state.startYear} onChange={set('startYear')} error={startYearError} integer placeholder="e.g. 2027" />}
        </FieldGrid>

        <div className="pt-6 border-t border-[var(--color-border)] space-y-6">
          <div>
            <h3 className="type-headline !text-[17px]">Taxes, insurance and fees</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Use the figures from your Loan Estimate or county tax bill. Leave a field empty or at 0 if it does not apply.</p>
          </div>
          <FieldGrid>
            <NumberField
              label="Property tax per year"
              value={state.tax}
              onChange={set('tax')}
              error={tax.error}
              prefix={state.taxMode === 'amount' ? '$' : undefined}
              suffix={state.taxMode === 'percent' ? '% of price' : undefined}
              hint={taxAnnual !== null && state.taxMode === 'percent' ? `${money(taxAnnual, 0)} a year` : undefined}
            />
            <Segmented label="Enter property tax as" value={state.taxMode} onChange={switchMode('taxMode', 'tax', taxAnnual)} options={modeOptions('$ / yr')} />
          </FieldGrid>
          <FieldGrid>
            <NumberField label="Homeowners insurance per year" value={state.insurance} onChange={set('insurance')} error={insurance.error} prefix="$" />
            <NumberField label="HOA dues per month" value={state.hoa} onChange={set('hoa')} error={hoa.error} prefix="$" />
          </FieldGrid>
          <NumberField
            label="PMI rate per year"
            value={state.pmiRate}
            onChange={set('pmiRate')}
            error={pmiRate.error}
            suffix="% of loan"
            hint="Only charged when you put down less than 20%. Your lender quotes the rate."
            className="sm:max-w-xs"
          />
        </div>

        <div className="pt-6 border-t border-[var(--color-border)] space-y-6">
          <div>
            <h3 className="type-headline !text-[17px]">Pay it off faster</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Extra money paid toward principal. Leave these at 0 to see the standard schedule.
            </p>
          </div>
          <Segmented
            label="Payment schedule"
            value={state.schedule}
            onChange={(schedule) => setState((s) => ({ ...s, schedule }))}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'biweekly', label: 'Biweekly (half every 2 weeks)' },
            ]}
          />
          <FieldGrid>
            <NumberField label="Extra each month" value={state.extraMonthly} onChange={set('extraMonthly')} error={extraMonthly.error} prefix="$" />
            <NumberField label="Extra once a year" value={state.extraYearly} onChange={set('extraYearly')} error={extraYearly.error} prefix="$" hint="Paid with every 12th payment." />
          </FieldGrid>
          <FieldGrid>
            <NumberField label="One-time payment" value={state.lumpAmount} onChange={set('lumpAmount')} error={lumpAmount.error} prefix="$" hint="A bonus, tax refund or sale proceeds." />
            <NumberField label="With payment number" value={state.lumpMonth} onChange={set('lumpMonth')} error={lumpAmount.value ? lumpMonth.error : null} integer hint={start && lumpMonth.value ? dateOf(lumpMonth.value) ?? undefined : undefined} />
          </FieldGrid>
        </div>
      </div>
    </>
  );

  const payoffMonths = fast ? fast.monthsTaken : result?.schedule.monthsTaken ?? 0;

  const summary = result ? (
    <>
      <HeadlineResult label="Monthly payment" value={money(result.totalMonthly)} caption={result.pmiRequired ? 'in month 1, including PMI' : 'principal, interest, taxes and insurance'} />
      <ResultList
        rows={[
          { label: 'Principal and interest', value: money(result.principalAndInterest) },
          { label: 'Property tax', value: money(result.monthlyTax) },
          { label: 'Homeowners insurance', value: money(result.monthlyInsurance) },
          ...(result.pmiRequired ? [{ label: 'PMI', value: money(result.monthlyPmi) }] : []),
          ...(result.hoaMonthly > 0 ? [{ label: 'HOA dues', value: money(result.hoaMonthly) }] : []),
          ...(fast && fast.extraPerMonth > 0
            ? [{ label: state.schedule === 'biweekly' && extraMonthly.value === 0 ? 'Biweekly extra (monthly equivalent)' : 'Extra principal', value: money(fast.extraPerMonth) }]
            : []),
        ]}
      />
      <ResultList
        divided
        rows={[
          { label: 'Loan amount', value: money(result.loanAmount) },
          { label: 'Loan-to-value', value: formatPercent(result.ltvPct, 1) },
          { label: 'Total interest', value: money(fast ? fast.schedule.totalInterest : result.totalInterest) },
          ...(result.pmiRequired ? [{ label: 'Total PMI (if not cancelled early)', value: money(result.totalPmi) }] : []),
          ...(fast ? [] : [{ label: 'Total of all payments', value: money(result.totalCost), strong: true }]),
          ...(result.loanAmount > 0 ? [{ label: 'Paid off', value: start ? dateOf(payoffMonths)! : `after ${formatMonths(payoffMonths)}` }] : []),
        ]}
      />
      {fast && (
        <Notice tone="success">
          With the extra payments the loan is repaid in {formatMonths(fast.monthsTaken)}, {formatMonths(fast.monthsSaved)} sooner, and you pay{' '}
          <strong>{money(fast.interestSaved)}</strong> less interest.
          {fast.pmiRequestMonth !== null && result.pmiRequestMonth !== null && fast.pmiRequestMonth < result.pmiRequestMonth && (
            <> You could also ask to cancel PMI from {paymentLabel(fast.pmiRequestMonth)} instead of {paymentLabel(result.pmiRequestMonth)}.</>
          )}
        </Notice>
      )}
      {result.pmiRequired && result.pmiAutoEndMonth !== null && (
        <Notice>
          PMI is paid for {result.pmiMonths} months ({formatMonths(result.pmiMonths)}) and ends automatically from {paymentLabel(result.pmiAutoEndMonth)}, when the scheduled balance reaches{' '}
          {PMI_AUTO_END_LTV}% of the home&apos;s original value.
          {result.pmiRequestMonth !== null && result.pmiRequestMonth < result.pmiAutoEndMonth && (
            <> You can ask your servicer to cancel it from {paymentLabel(result.pmiRequestMonth)}, at {PMI_REQUEST_LTV}%.</>
          )}{' '}
          A down payment of {money(downPaymentToAvoidPmi(input!.homePrice), 0)} (20%) would avoid it.
        </Notice>
      )}
      {!result.pmiRequired && result.ltvPct > 80 && (
        <Notice tone="warning">Your down payment is under 20%, so a conventional lender will usually charge PMI. Enter the PMI rate from your quote to include it.</Notice>
      )}
      {result.loanAmount === 0 && <Notice>With no loan, the monthly cost is taxes, insurance and any HOA dues.</Notice>}
    </>
  ) : (
    <EmptyResult />
  );

  const xLabels = result ? ['Start', ...result.years.map((y) => (start ? String(paymentMonth(start, y.year * 12).year) : `Yr ${y.year}`))] : [];
  const fastYears = fast ? yearEndBalances(fast.schedule.rows, result!.years.length) : null;

  return (
    <CalculatorLayout
      title="Mortgage calculator"
      form={form}
      result={summary}
      mobileSummary={result ? { label: 'Monthly payment', value: money(result.totalMonthly) } : null}
    >
      {result && result.loanAmount > 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 space-y-3">
          <h3 className="type-headline !text-[17px]">Where your principal and interest go</h3>
          <SplitBar
            label="Share of principal and interest in total loan payments"
            currency={CURRENCY}
            parts={[
              { label: 'Principal', value: result.loanAmount, color: SERIES.primary },
              { label: 'Interest', value: fast ? fast.schedule.totalInterest : result.totalInterest, color: SERIES.secondary },
            ]}
          />
        </div>
      )}
      {result && result.years.length >= 2 && (
        <LineChart
          title={fast ? 'Loan balance with and without extra payments' : 'Loan balance and interest paid'}
          currency={CURRENCY}
          xLabels={xLabels}
          series={
            fast && fastYears
              ? [
                  { name: 'Standard schedule', color: SERIES.secondary, values: [result.loanAmount, ...result.years.map((y) => y.closing)] },
                  { name: 'With extra payments', color: SERIES.primary, values: [result.loanAmount, ...fastYears], area: true },
                ]
              : [
                  { name: 'Loan balance', color: SERIES.primary, values: [result.loanAmount, ...result.years.map((y) => y.closing)], area: true },
                  { name: 'Interest paid to date', color: SERIES.secondary, values: [0, ...cumulative(result.years.map((y) => y.interest))] },
                ]
          }
        />
      )}
      {rates.length > 1 && (
        <DataTable<RateRow>
          title="Your payment at nearby rates"
          csvName="mortgage-payment-by-rate.csv"
          defaultOpen
          rows={rates}
          columns={[
            { header: 'Interest rate', cell: (r) => `${Number(r.ratePct.toFixed(3))}%${r.ratePct === rate.value ? ' (yours)' : ''}` },
            { header: 'Principal and interest', cell: (r) => money(r.principalAndInterest), align: 'right' },
            { header: 'Monthly payment', cell: (r) => money(r.totalMonthly), align: 'right' },
            { header: 'Total interest', cell: (r) => money(r.totalInterest, 0), align: 'right', hideOnMobile: true },
          ]}
        />
      )}
      {result && result.schedule.rows.length > 0 && (
        <div className="space-y-3">
          <Segmented
            label="Amortization schedule view"
            hideLabel
            value={view}
            onChange={setView}
            options={[
              { value: 'yearly', label: 'By year' },
              { value: 'monthly', label: 'By month' },
            ]}
          />
          {view === 'yearly' ? (
            <DataTable<YearRow>
              title={fast ? 'Amortization schedule by year (with extra payments)' : 'Amortization schedule by year'}
              csvName="mortgage-amortization-yearly.csv"
              rows={fast ? fast.yearRows : result.years}
              columns={[
                { header: start ? 'Year ending' : 'Year', cell: (r) => (start ? formatMonthRef(paymentMonth(start, Math.min(r.year * 12, payoffMonths)), true) : String(r.year)) },
                { header: 'Opening balance', cell: (r) => money(r.opening), align: 'right', hideOnMobile: true },
                { header: 'Interest', cell: (r) => money(r.interest), align: 'right' },
                { header: 'Principal', cell: (r) => money(fast ? r.principal + r.extra : r.principal), align: 'right' },
                { header: 'Closing balance', cell: (r) => money(r.closing), align: 'right' },
              ]}
            />
          ) : (
            <DataTable<ScheduleRow>
              title={fast ? 'Amortization schedule by month (with extra payments)' : 'Amortization schedule by month'}
              csvName="mortgage-amortization-monthly.csv"
              rows={fast ? fast.schedule.rows : result.schedule.rows}
              columns={[
                { header: start ? 'Month' : 'Payment', cell: (r) => (start ? formatMonthRef(paymentMonth(start, r.month), true) : String(r.month)) },
                { header: 'Opening balance', cell: (r) => money(r.opening), align: 'right', hideOnMobile: true },
                { header: 'Interest', cell: (r) => money(r.interest), align: 'right' },
                { header: 'Principal', cell: (r) => money(r.principal), align: 'right' },
                ...(fast ? [{ header: 'Extra', cell: (r: ScheduleRow) => money(r.extra), align: 'right' as const }] : []),
                { header: 'PMI', cell: (r) => money(r.month <= result.pmiMonths ? result.monthlyPmi : 0), align: 'right', hideOnMobile: true },
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

/** Balance at the end of each loan year, padded with 0 after an early payoff. */
function yearEndBalances(rows: ScheduleRow[], years: number): number[] {
  return Array.from({ length: years }, (_, i) => rows[Math.min(rows.length, (i + 1) * 12) - 1]?.closing ?? 0).map((v, i) => ((i + 1) * 12 > rows.length ? 0 : v));
}
