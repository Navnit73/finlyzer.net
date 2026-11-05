'use client';

import React, { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
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
} from './ui';
import { MAX_SCHEDULE_MONTHS, type ScheduleRow, type LumpSum } from '@/lib/calculators/loan.ts';
import {
  MONTH_NAMES,
  compareOverpayments,
  formatMonthRef,
  overpayLowerPayment,
  paymentMonth,
  paymentToClearBy,
  repayByPayment,
  yearlyLumpSums,
  type MonthRef,
} from '@/lib/calculators/loan-repayment.ts';
import { CURRENCIES, type CurrencyCode, formatMoney, formatMonths, parseNumberInput, validateNumber } from '@/lib/calculators/money.ts';

type Mode = 'term' | 'payment' | 'target';
type Effect = 'shorter' | 'lower';
type MonthOption = '' | `${number}`;

interface LumpRow {
  id: number;
  month: string;
  amount: string;
}

interface State {
  currency: CurrencyCode;
  mode: Mode;
  amount: string;
  rate: string;
  years: string;
  payment: string;
  targetYears: string;
  targetMonths: string;
  currentPayment: string;
  extra: string;
  yearly: string;
  effect: Effect;
  lumps: LumpRow[];
  startMonth: MonthOption;
  startYear: string;
}

/**
 * Page example: £15,000 at 7.9% over 5 years, £100 a month extra and £1,000 in month 12.
 * The first-payment month starts empty so server and browser render the same thing.
 */
const EXAMPLE: State = {
  currency: 'GBP',
  mode: 'term',
  amount: '15000',
  rate: '7.9',
  years: '5',
  payment: '400',
  targetYears: '3',
  targetMonths: '0',
  currentPayment: '303.43',
  extra: '100',
  yearly: '0',
  effect: 'shorter',
  lumps: [{ id: 1, month: '12', amount: '1000' }],
  startMonth: '',
  startYear: '',
};

const MAX_LUMPS = 10;

const MONTH_OPTIONS: { value: MonthOption; label: string }[] = [
  { value: '', label: 'Not set' },
  ...MONTH_NAMES.map((name, i) => ({ value: String(i) as MonthOption, label: name })),
];

export default function LoanRepaymentCalculator() {
  const [state, setState] = useState<State>(EXAMPLE);
  const set = (key: 'amount' | 'rate' | 'years' | 'payment' | 'extra' | 'yearly' | 'targetYears' | 'targetMonths' | 'currentPayment' | 'startYear') => (value: string) =>
    setState((s) => ({ ...s, [key]: value }));
  const { currency } = state;
  const money = (v: number, decimals = 2) => formatMoney(v, currency, { decimals });

  const amount = validateNumber(state.amount, { label: 'Amount owed', min: 0, minExclusive: true, max: 1e12 });
  const rate = validateNumber(state.rate, { label: 'Interest rate', min: 0, max: 100 });
  const years = validateNumber(state.years, { label: 'Loan term', min: 0, minExclusive: true, max: 50 });
  const months = years.value === null ? null : Math.round(years.value * 12);
  const monthsError = months !== null && months < 1 ? 'Loan term must be at least 1 month.' : null;
  const payment = validateNumber(state.payment, { label: 'Monthly payment', min: 0, minExclusive: true, max: 1e12 });
  const extra = validateNumber(state.extra, { label: 'Extra every month', min: 0, max: 1e12, emptyAs: 0 });
  const yearly = validateNumber(state.yearly, { label: 'Extra once a year', min: 0, max: 1e12, emptyAs: 0 });
  const targetYears = validateNumber(state.targetYears, { label: 'Years', min: 0, max: 50, integer: true, emptyAs: 0 });
  const targetMonthsPart = validateNumber(state.targetMonths, { label: 'Months', min: 0, max: 11, integer: true, emptyAs: 0 });
  const targetMonths = targetYears.value !== null && targetMonthsPart.value !== null ? targetYears.value * 12 + targetMonthsPart.value : null;
  const targetError = targetMonths === 0 ? 'Choose at least 1 month.' : null;
  const currentPayment = validateNumber(state.currentPayment, { label: 'Current payment', min: 0, max: 1e12, emptyAs: 0 });
  const startYear = validateNumber(state.startYear, { label: 'Year', min: 1950, max: 2150, integer: true });
  const start: MonthRef | null = state.startMonth !== '' && startYear.value !== null ? { year: startYear.value, month: Number(state.startMonth) } : null;
  const lumps = state.lumps.map((l) => ({
    id: l.id,
    month: validateNumber(l.month, { label: 'Month', min: 1, max: MAX_SCHEDULE_MONTHS, integer: true }),
    amount: validateNumber(l.amount, { label: 'Amount', min: 0, max: 1e12, emptyAs: 0 }),
  }));
  const lumpsValid = lumps.every((l) => l.month.value !== null && l.amount.value !== null);

  const termValid =
    state.mode === 'term' && amount.value !== null && rate.value !== null && months !== null && !monthsError && extra.value !== null && yearly.value !== null && lumpsValid;
  const paymentValid = state.mode === 'payment' && amount.value !== null && rate.value !== null && payment.value !== null;
  const targetValid = state.mode === 'target' && amount.value !== null && rate.value !== null && targetMonths !== null && !targetError && currentPayment.value !== null;

  // Three schedules of at most 1,200 rows: cheap enough to run on every render.
  const overpay = (() => {
    if (!termValid) return null;
    const lumpSums: LumpSum[] = [
      ...state.lumps.map((l) => ({ month: parseNumberInput(l.month) ?? 0, amount: parseNumberInput(l.amount) ?? 0 })),
      ...yearlyLumpSums(yearly.value!, months!),
    ];
    const input = { principal: amount.value!, annualRatePct: rate.value!, months: months!, extraMonthly: extra.value!, lumpSums };
    return { shorter: compareOverpayments(input), lower: overpayLowerPayment(input), hasLumps: lumpSums.some((l) => l.amount > 0 && l.month <= months!) };
  })();

  const byPayment = useMemo(
    () => (paymentValid ? repayByPayment(amount.value!, rate.value!, payment.value!) : null),
    [paymentValid, amount.value, rate.value, payment.value],
  );

  const target = useMemo(
    () => (targetValid ? paymentToClearBy(amount.value!, rate.value!, targetMonths!, currentPayment.value || null) : null),
    [targetValid, amount.value, rate.value, targetMonths, currentPayment.value],
  );

  const updateLump = (id: number, key: 'month' | 'amount', value: string) =>
    setState((s) => ({ ...s, lumps: s.lumps.map((l) => (l.id === id ? { ...l, [key]: value } : l)) }));
  const addLump = () =>
    setState((s) => ({ ...s, lumps: [...s.lumps, { id: Math.max(0, ...s.lumps.map((l) => l.id)) + 1, month: '', amount: '' }] }));
  const removeLump = (id: number) => setState((s) => ({ ...s, lumps: s.lumps.filter((l) => l.id !== id) }));

  const symbol = CURRENCIES[currency].symbol;
  const finish = (n: number) => (start ? formatMonthRef(paymentMonth(start, n)) : formatMonths(n));
  const monthLabel = (n: number) => (start ? formatMonthRef(paymentMonth(start, n), true) : String(n));

  const form = (
    <>
      <FormHeader>
        <CurrencySelect value={currency} onChange={(c) => setState((s) => ({ ...s, currency: c }))} />
        <ResetButton onClick={() => setState(EXAMPLE)} />
      </FormHeader>
      <div className="space-y-6">
        <Segmented
          label="What do you want to find out?"
          value={state.mode}
          onChange={(mode) => setState((s) => ({ ...s, mode }))}
          options={[
            { value: 'term', label: 'Overpayment savings' },
            { value: 'payment', label: 'Time to repay' },
            { value: 'target', label: 'Pay off by a date' },
          ]}
        />
        <FieldGrid>
          <NumberField
            label={state.mode === 'term' ? 'Loan amount' : 'Amount owed now'}
            value={state.amount}
            onChange={set('amount')}
            error={amount.error}
            prefix={symbol}
          />
          <NumberField label="Interest rate" value={state.rate} onChange={set('rate')} error={rate.error} suffix="% a year" hint="The annual rate, not the APR." />
        </FieldGrid>

        {state.mode === 'term' && (
          <>
            <NumberField
              label="Loan term"
              value={state.years}
              onChange={set('years')}
              error={years.error ?? monthsError}
              suffix="years"
              hint={months ? `${months} monthly repayments` : undefined}
              range={{ min: 1, max: 35, step: 1 }}
              className="sm:max-w-sm"
            />
            <div className="pt-6 border-t border-[var(--color-border)] space-y-5">
              <div>
                <h3 className="type-headline !text-[17px]">Overpayments</h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Money you pay on top of the agreed repayment. It goes straight to the balance.</p>
              </div>
              <FieldGrid>
                <NumberField label="Extra every month" value={state.extra} onChange={set('extra')} error={extra.error} prefix={symbol} />
                <NumberField label="Extra once a year" value={state.yearly} onChange={set('yearly')} error={yearly.error} prefix={symbol} hint="Paid with every 12th repayment." />
              </FieldGrid>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-[var(--color-ink)]">One-off overpayments</legend>
                {state.lumps.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">None added.</p>}
                {state.lumps.map((l, i) => {
                  const v = lumps[i];
                  return (
                    <div key={l.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start">
                      <NumberField
                        label={`Payment ${i + 1}: in month`}
                        value={l.month}
                        onChange={(val) => updateLump(l.id, 'month', val)}
                        error={v.month.error}
                        integer
                        hint={start && v.month.value ? formatMonthRef(paymentMonth(start, v.month.value), true) : undefined}
                      />
                      <NumberField label="Amount" value={l.amount} onChange={(val) => updateLump(l.id, 'amount', val)} error={v.amount.error} prefix={symbol} />
                      <button
                        type="button"
                        onClick={() => removeLump(l.id)}
                        aria-label={`Remove one-off overpayment ${i + 1}`}
                        className="btn btn-sm btn-ghost btn-circle mt-7 text-[var(--color-text-secondary)]"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
                {state.lumps.length < MAX_LUMPS && (
                  <button type="button" onClick={addLump} className="btn btn-sm rounded-full gap-1.5 bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-ink)]">
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Add a one-off overpayment
                  </button>
                )}
              </fieldset>
              <div className="space-y-2">
                <Segmented
                  label="After a one-off or yearly overpayment, the lender should"
                  value={state.effect}
                  onChange={(effect) => setState((s) => ({ ...s, effect }))}
                  options={[
                    { value: 'shorter', label: 'Shorten the term' },
                    { value: 'lower', label: 'Lower my repayment' },
                  ]}
                />
                <p className="text-[13px] text-[var(--color-text-muted)]">Regular monthly overpayments always shorten the term.</p>
              </div>
            </div>
          </>
        )}

        {state.mode === 'payment' && (
          <NumberField
            label="Monthly payment"
            value={state.payment}
            onChange={set('payment')}
            error={payment.error}
            prefix={symbol}
            hint="What you can pay each month, including any extra."
            className="sm:max-w-sm"
          />
        )}

        {state.mode === 'target' && (
          <>
            <FieldGrid>
              <NumberField label="Pay it off in (years)" value={state.targetYears} onChange={set('targetYears')} error={targetYears.error ?? targetError} suffix="years" integer />
              <NumberField label="and months" value={state.targetMonths} onChange={set('targetMonths')} error={targetMonthsPart.error} suffix="months" integer />
            </FieldGrid>
            <NumberField
              label="What you pay now (optional)"
              value={state.currentPayment}
              onChange={set('currentPayment')}
              error={currentPayment.error}
              prefix={symbol}
              hint="Shows how much extra you need each month and what it saves."
              className="sm:max-w-sm"
            />
          </>
        )}

        <FieldGrid>
          <SelectField
            label="First payment month (optional)"
            value={state.startMonth}
            onChange={(v) => setState((s) => ({ ...s, startMonth: v }))}
            options={MONTH_OPTIONS}
            hint="Shows the calendar month you finish."
          />
          {state.startMonth !== '' && (
            <NumberField label="Year" value={state.startYear} onChange={set('startYear')} error={startYear.error} integer placeholder="e.g. 2027" />
          )}
        </FieldGrid>
      </div>
    </>
  );

  let summary: React.ReactNode = <EmptyResult />;
  let mobileSummary: { label: string; value: string } | null = null;
  let rows: ScheduleRow[] = [];
  let chart: ReturnType<typeof balanceByYear> | null = null;
  let chartNames: [string, string] = ['Without overpayments', 'With overpayments'];

  if (state.mode === 'term' && overpay) {
    const { shorter } = overpay;
    const baseline = shorter.baseline;
    const lower = state.effect === 'lower' && overpay.hasLumps;
    const actualRows = lower ? overpay.lower.rows : shorter.withOverpayments.rows;
    const actualMonths = lower ? overpay.lower.monthsTaken : shorter.withOverpayments.monthsTaken;
    const actualInterest = lower ? overpay.lower.totalInterest : shorter.withOverpayments.totalInterest;
    const interestSaved = Math.round((baseline.totalInterest - actualInterest) * 100) / 100;
    const totalOverpaid = Math.round(actualRows.reduce((t, r) => t + r.extra, 0) * 100) / 100;
    const hasExtra = totalOverpaid > 0;
    rows = actualRows;
    mobileSummary = { label: 'Paid off', value: finish(actualMonths) };
    chart = hasExtra ? balanceByYear(baseline.rows, actualRows) : null;
    summary = (
      <>
        <HeadlineResult
          label={hasExtra ? 'Paid off' : 'Repaid'}
          value={start ? finish(actualMonths) : `in ${formatMonths(actualMonths)}`}
          caption={hasExtra && actualMonths < baseline.monthsTaken ? `instead of ${start ? finish(baseline.monthsTaken) : formatMonths(baseline.monthsTaken)}` : `${actualMonths} monthly repayments`}
        />
        <ResultList
          rows={[
            { label: 'Monthly repayment', value: money(baseline.payment), strong: true },
            ...(lower ? [{ label: 'Repayment after your overpayments', value: money(overpay.lower.finalRegularPayment), strong: true }] : []),
          ]}
        />
        {hasExtra ? (
          <ResultList
            divided
            rows={[
              ...(actualMonths < baseline.monthsTaken ? [{ label: 'Time saved', value: formatMonths(baseline.monthsTaken - actualMonths) }] : []),
              { label: 'Interest saved', value: money(interestSaved), strong: true },
              { label: 'Total overpaid', value: money(totalOverpaid) },
              { label: 'Interest without overpaying', value: money(baseline.totalInterest) },
              { label: 'Interest with overpayments', value: money(actualInterest) },
            ]}
          />
        ) : (
          <ResultList
            divided
            rows={[
              { label: 'Total interest', value: money(baseline.totalInterest) },
              { label: 'Total repaid', value: money(baseline.totalPaid), strong: true },
            ]}
          />
        )}
        {lower && (
          <Notice>
            Lowering the repayment keeps your end date and saves {money(interestSaved)}. Shortening the term instead would save{' '}
            {money(shorter.interestSaved)}, because the balance keeps falling at the original pace.
          </Notice>
        )}
        {hasExtra && interestSaved === 0 && <Notice>These overpayments fall after the loan is already repaid, so they change nothing.</Notice>}
      </>
    );
  } else if (state.mode === 'payment' && byPayment) {
    if (byPayment.ok) {
      const last = byPayment.schedule.rows.at(-1)!;
      rows = byPayment.schedule.rows;
      mobileSummary = { label: 'Paid off', value: finish(byPayment.months) };
      summary = (
        <>
          <HeadlineResult label="Paid off" value={start ? finish(byPayment.months) : `in ${formatMonths(byPayment.months)}`} caption={`${byPayment.months} monthly payments`} />
          <ResultList
            divided
            rows={[
              { label: 'Total interest', value: money(byPayment.schedule.totalInterest) },
              { label: 'Total repaid', value: money(byPayment.schedule.totalPaid), strong: true },
              { label: 'Final payment', value: money(last.payment) },
            ]}
          />
        </>
      );
    } else {
      summary = (
        <Notice tone="danger">
          {byPayment.reason === 'payment-too-low' ? (
            <>
              This payment never repays the loan. The first month&apos;s interest is {money(byPayment.firstMonthInterest)}, so you need to pay more than that each month to
              reduce the balance.
            </>
          ) : (
            <>At this payment the loan would take more than 100 years to repay. Increase the payment to see a schedule.</>
          )}
        </Notice>
      );
    }
  } else if (state.mode === 'target' && target) {
    const cur = target.current;
    rows = target.schedule.rows;
    mobileSummary = { label: 'Monthly payment needed', value: money(target.requiredPayment) };
    if (cur?.schedule) {
      chart = balanceByYear(cur.schedule.rows, target.schedule.rows);
      chartNames = ['At your current payment', 'Paid off on target'];
    }
    summary = (
      <>
        <HeadlineResult
          label="Monthly payment needed"
          value={money(target.requiredPayment)}
          caption={`to be debt-free ${start ? `by ${finish(target.schedule.monthsTaken)}` : `in ${formatMonths(target.schedule.monthsTaken)}`}`}
        />
        <ResultList
          divided
          rows={[
            ...(cur ? [{ label: 'Extra on top of what you pay now', value: money(cur.extraNeeded), strong: true }] : []),
            { label: 'Total interest', value: money(target.schedule.totalInterest) },
            ...(cur?.interestSaved !== null && cur?.interestSaved !== undefined && cur.interestSaved > 0 ? [{ label: 'Interest saved', value: money(cur.interestSaved) }] : []),
            ...(cur?.monthsSaved ? [{ label: 'Time saved', value: formatMonths(cur.monthsSaved) }] : []),
          ]}
        />
        {cur && cur.extraNeeded === 0 && <Notice tone="success">What you pay now already clears the loan within this time.</Notice>}
        {cur && !cur.schedule && (
          <Notice tone="warning">Your current payment does not cover the interest, so the loan would never be repaid at that amount.</Notice>
        )}
      </>
    );
  }

  return (
    <CalculatorLayout title="Loan repayment calculator" form={form} result={summary} mobileSummary={mobileSummary}>
      {chart && chart.labels.length >= 2 && (
        <LineChart
          title="Balance over time"
          currency={currency}
          xLabels={chart.labels}
          series={[
            { name: chartNames[0], color: SERIES.secondary, values: chart.baseline },
            { name: chartNames[1], color: SERIES.primary, values: chart.actual, area: true },
          ]}
        />
      )}
      {rows.length > 0 && (
        <DataTable<ScheduleRow>
          title="Repayment schedule"
          csvName="loan-repayment-schedule.csv"
          rows={rows}
          columns={[
            { header: 'Month', cell: (r) => monthLabel(r.month) },
            { header: 'Opening balance', cell: (r) => money(r.opening), align: 'right', hideOnMobile: true },
            { header: 'Repayment', cell: (r) => money(r.payment), align: 'right' },
            ...(state.mode === 'term' ? [{ header: 'Overpayment', cell: (r: ScheduleRow) => money(r.extra), align: 'right' as const }] : []),
            { header: 'Interest', cell: (r) => money(r.interest), align: 'right' },
            { header: 'Closing balance', cell: (r) => money(r.closing), align: 'right' },
          ]}
        />
      )}
    </CalculatorLayout>
  );
}

/** Year-end balances for both schedules; the shorter one sits at 0 once repaid. Short loans use months. */
function balanceByYear(baseline: ScheduleRow[], actual: ScheduleRow[]) {
  const total = Math.max(baseline.length, actual.length);
  const step = total <= 36 ? 1 : 12;
  const unit = step === 1 ? 'Mo' : 'Yr';
  const labels = ['Start'];
  const base = [baseline[0]?.opening ?? 0];
  const act = [actual[0]?.opening ?? 0];
  for (let m = step; m < total + step; m += step) {
    const i = Math.min(m, total) - 1;
    labels.push(`${unit} ${Math.ceil((i + 1) / step)}`);
    base.push(i < baseline.length ? baseline[i].closing : 0);
    act.push(i < actual.length ? actual[i].closing : 0);
  }
  return { labels, baseline: base, actual: act };
}
