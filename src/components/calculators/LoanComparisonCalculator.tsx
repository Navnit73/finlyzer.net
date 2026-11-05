'use client';

import React, { useId, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  CalculatorLayout,
  CurrencySelect,
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
  SelectField,
} from './ui';
import { type FeeHandling, type OfferResult, breakEvenMonth, earlyRepaymentCost, evaluateOffer } from '@/lib/calculators/loan-comparison.ts';
import { CURRENCIES, type CurrencyCode, formatMoney, formatMonths, formatPercent, validateNumber } from '@/lib/calculators/money.ts';

interface OfferInput {
  id: string;
  name: string;
  rate: string;
  months: string;
  upfrontFee: string;
  feeHandling: FeeHandling;
  monthlyFee: string;
}

interface State {
  currency: CurrencyCode;
  amount: string;
  offers: OfferInput[];
}

/** Series colors in offer order; the trio passes the dataviz palette check (CVD ΔE ≥ 21.8). */
const OFFER_COLORS = [SERIES.primary, SERIES.secondary, 'var(--media-pink)'];

/** Worked example on the page: $20,000 from three lenders. */
const EXAMPLE: State = {
  currency: 'USD',
  amount: '20000',
  offers: [
    { id: 'a', name: 'Offer A', rate: '9.9', months: '60', upfrontFee: '600', feeHandling: 'deducted', monthlyFee: '0' },
    { id: 'b', name: 'Offer B', rate: '11.5', months: '60', upfrontFee: '0', feeHandling: 'deducted', monthlyFee: '0' },
    { id: 'c', name: 'Offer C', rate: '10.5', months: '84', upfrontFee: '0', feeHandling: 'deducted', monthlyFee: '0' },
  ],
};

const BLANK_C: OfferInput = { id: 'c', name: 'Offer C', rate: '', months: '', upfrontFee: '0', feeHandling: 'deducted', monthlyFee: '0' };

export default function LoanComparisonCalculator() {
  const [state, setState] = useState<State>(EXAMPLE);
  const { currency } = state;
  const money = (v: number, decimals = 2) => formatMoney(v, currency, { decimals });
  const symbol = CURRENCIES[currency].symbol;

  const amount = validateNumber(state.amount, { label: 'Loan amount', min: 0, minExclusive: true, max: 1e12 });
  const parsed = state.offers.map((o) => {
    const name = o.name.trim() || `Offer ${o.id.toUpperCase()}`;
    const upfrontFee = validateNumber(o.upfrontFee, { label: 'Upfront fees', min: 0, max: 1e12, emptyAs: 0 });
    const feeError =
      upfrontFee.value !== null && amount.value !== null && o.feeHandling === 'deducted' && upfrontFee.value >= amount.value ? 'Fees must be less than the loan amount.' : null;
    return {
      input: o,
      name,
      rate: validateNumber(o.rate, { label: 'Interest rate', min: 0, max: 100 }),
      months: validateNumber(o.months, { label: 'Term', min: 1, max: 600, integer: true }),
      upfrontFee,
      feeError,
      monthlyFee: validateNumber(o.monthlyFee, { label: 'Monthly fee', min: 0, max: 1e9, emptyAs: 0 }),
    };
  });
  const valid =
    amount.value !== null && parsed.every((p) => p.rate.value !== null && p.months.value !== null && p.upfrontFee.value !== null && !p.feeError && p.monthlyFee.value !== null);

  // Three short schedules: cheap enough to recompute on every render.
  const results = !valid
    ? null
    : parsed.map((p) => ({
      id: p.input.id,
      name: p.name,
      rate: p.rate.value!,
      months: p.months.value!,
      offer: {
        amount: amount.value!,
        aprPct: p.rate.value!,
        months: p.months.value!,
        upfrontFee: p.upfrontFee.value!,
        monthlyFee: p.monthlyFee.value!,
        feeHandling: p.input.feeHandling,
      },
    })).map((r) => ({ ...r, result: evaluateOffer(r.offer), curve: earlyRepaymentCost(r.offer) }));

  const update = (id: string, key: keyof OfferInput) => (value: string) =>
    setState((s) => ({ ...s, offers: s.offers.map((o) => (o.id === id ? { ...o, [key]: value } : o)) }));

  const form = (
    <>
      <FormHeader title="Loan offers">
        <CurrencySelect value={currency} onChange={(c) => setState((s) => ({ ...s, currency: c }))} />
        <ResetButton onClick={() => setState(EXAMPLE)} />
      </FormHeader>
      <NumberField
        label="Amount you want to borrow"
        value={state.amount}
        onChange={(v) => setState((s) => ({ ...s, amount: v }))}
        error={amount.error}
        prefix={symbol}
        hint="The same amount is compared across every offer."
        className="sm:max-w-sm"
      />
      <ol className="mt-6 space-y-4">
        {parsed.map((p) => (
          <li key={p.input.id} className="rounded-2xl border border-[var(--color-border)] p-4 sm:p-5">
            <fieldset className="space-y-4">
              <legend className="sr-only">{p.name}</legend>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <OfferName value={p.input.name} onChange={update(p.input.id, 'name')} />
                </div>
                {state.offers.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setState((s) => ({ ...s, offers: s.offers.filter((o) => o.id !== p.input.id) }))}
                    className="btn btn-ghost btn-sm h-11 rounded-full text-[var(--color-text-secondary)]"
                    aria-label={`Remove ${p.name}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <FieldGrid>
                <NumberField label="Interest rate" value={p.input.rate} onChange={update(p.input.id, 'rate')} error={p.rate.error} suffix="% a year" />
                <NumberField
                  label="Term"
                  value={p.input.months}
                  onChange={update(p.input.id, 'months')}
                  error={p.months.error}
                  suffix="months"
                  integer
                  hint={p.months.value ? formatMonths(p.months.value) : undefined}
                />
                <NumberField
                  label="Upfront fees"
                  value={p.input.upfrontFee}
                  onChange={update(p.input.id, 'upfrontFee')}
                  error={p.upfrontFee.error ?? p.feeError}
                  prefix={symbol}
                  hint="Origination, arrangement or processing fees."
                />
                <SelectField<FeeHandling>
                  label="Upfront fees are"
                  value={p.input.feeHandling}
                  onChange={(v) => update(p.input.id, 'feeHandling')(v)}
                  options={[
                    { value: 'deducted', label: 'Paid upfront / deducted' },
                    { value: 'financed', label: 'Added to the loan' },
                  ]}
                />
                <NumberField label="Monthly fees" value={p.input.monthlyFee} onChange={update(p.input.id, 'monthlyFee')} error={p.monthlyFee.error} prefix={symbol} />
              </FieldGrid>
            </fieldset>
          </li>
        ))}
      </ol>
      {state.offers.length < 3 && (
        <button
          type="button"
          onClick={() => setState((s) => ({ ...s, offers: [...s.offers, { ...BLANK_C, id: ['a', 'b', 'c'].find((x) => !s.offers.some((o) => o.id === x))! }] }))}
          className="mt-4 btn btn-sm rounded-full gap-1.5 bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-ink)]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add a third offer
        </button>
      )}
    </>
  );

  const cheapest = results ? results.reduce((best, r) => (r.result.totalCost < best.result.totalCost ? r : best)) : null;
  const lowestPayment = results ? results.reduce((best, r) => (r.result.monthlyOutgoing < best.result.monthlyOutgoing ? r : best)) : null;
  const lowestRate = results ? results.reduce((best, r) => (r.rate < best.rate ? r : best)) : null;
  const lowestApr = results ? results.reduce((best, r) => (r.result.aprWithFees < best.result.aprWithFees ? r : best)) : null;
  // Months from which the cheapest offer stays cheaper than each other offer if you repay early.
  const breakEvens =
    results && cheapest
      ? results
          .filter((r) => r.id !== cheapest.id)
          .map((r) => ({ name: r.name, month: breakEvenMonth(cheapest.curve, r.curve) }))
          .filter((b): b is { name: string; month: number } => b.month !== null && b.month > 0)
      : [];
  const tied = results && cheapest ? results.filter((r) => Math.abs(r.result.totalCost - cheapest.result.totalCost) < 0.005).length > 1 : false;

  const summary =
    results && cheapest && lowestPayment && lowestRate && lowestApr ? (
      <>
        <HeadlineResult
          label="Cheapest overall"
          value={tied ? 'Tie' : cheapest.name}
          caption={`${money(cheapest.result.totalCost)} in interest and fees`}
        />
        <ResultList
          divided
          rows={results.map((r) => ({
            label: `${r.name}: total cost`,
            value: r.id === cheapest.id ? money(r.result.totalCost) : `${money(r.result.totalCost)} (+${money(r.result.totalCost - cheapest.result.totalCost, 0)})`,
            strong: r.id === cheapest.id,
          }))}
        />
        {lowestPayment.id !== cheapest.id && !tied && (
          <Notice tone="warning">
            {lowestPayment.name} has the lowest monthly payment ({money(lowestPayment.result.monthlyOutgoing)}) but costs{' '}
            {money(lowestPayment.result.totalCost - cheapest.result.totalCost)} more than {cheapest.name}
            {lowestPayment.months > cheapest.months ? ' because you pay interest for longer' : ''}.
          </Notice>
        )}
        {!tied && breakEvens.length > 0 && (
          <Notice>
            Repaying early? {cheapest.name} only becomes the cheaper choice once you have kept it{' '}
            {breakEvens.map((b, i) => (
              <React.Fragment key={b.name}>
                {i > 0 && (i === breakEvens.length - 1 ? ' and ' : ', ')}
                {b.month} months against {b.name}
              </React.Fragment>
            ))}
            . Before that, its fees make it dearer. See the chart below.
          </Notice>
        )}
        {lowestRate.id !== lowestApr.id && (
          <Notice>
            {lowestRate.name} has the lowest interest rate, but once fees are counted {lowestApr.name} has the lowest APR ({formatPercent(lowestApr.result.aprWithFees)}).
          </Notice>
        )}
      </>
    ) : (
      <EmptyResult />
    );

  return (
    <CalculatorLayout
      title="Loan comparison calculator"
      form={form}
      result={summary}
      mobileSummary={cheapest && !tied ? { label: 'Cheapest overall', value: cheapest.name } : null}
    >
      {results && <ComparisonTable rows={results} cheapestId={tied ? null : cheapest!.id} money={money} />}
      {results && <EarlyRepaymentChart rows={results} currency={currency} />}
    </CalculatorLayout>
  );
}

function OfferName({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-ink)]">
        Offer name
      </label>
      <input
        id={id}
        value={value}
        maxLength={30}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        className="input h-11 w-full rounded-xl text-[15px] bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none"
      />
    </div>
  );
}

function ComparisonTable({
  rows,
  cheapestId,
  money,
}: {
  rows: { id: string; name: string; rate: number; months: number; result: OfferResult }[];
  cheapestId: string | null;
  money: (v: number) => string;
}) {
  const metrics: { label: string; value: (r: (typeof rows)[number]) => string }[] = [
    { label: 'Interest rate', value: (r) => formatPercent(r.rate) },
    { label: 'Term', value: (r) => formatMonths(r.months) },
    { label: 'Cash you receive', value: (r) => money(r.result.cashReceived) },
    { label: 'Monthly payment', value: (r) => money(r.result.payment) },
    { label: 'Monthly payment incl. fees', value: (r) => money(r.result.monthlyOutgoing) },
    { label: 'Total interest', value: (r) => money(r.result.totalInterest) },
    { label: 'Total fees', value: (r) => money(r.result.totalFees) },
    { label: 'Total repaid', value: (r) => money(r.result.totalRepaid) },
    { label: 'Total cost (interest + fees)', value: (r) => money(r.result.totalCost) },
    { label: 'APR including fees', value: (r) => formatPercent(r.result.aprWithFees) },
    { label: 'Effective annual rate incl. fees', value: (r) => formatPercent(r.result.effectiveAnnualRate) },
  ];
  return (
    <section aria-labelledby="loan-compare-title" className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <h3 id="loan-compare-title" className="type-headline !text-[17px] mb-4">
        Side-by-side comparison
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-[14px] tabular-nums">
          <thead>
            <tr>
              <th scope="col" className="py-2 px-2 text-left font-semibold text-[var(--color-ink)] border-b border-[var(--color-border)]">
                <span className="sr-only">Measure</span>
              </th>
              {rows.map((r) => (
                <th key={r.id} scope="col" className="py-2 px-2 text-right font-semibold text-[var(--color-ink)] border-b border-[var(--color-border)] whitespace-nowrap">
                  {r.name}
                  {r.id === cheapestId && (
                    <span className="ml-2 inline-flex rounded-full bg-[var(--color-success-soft)] px-2 py-0.5 text-[12px] font-medium text-[var(--color-success)]">Cheapest</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.label} className="border-b border-[var(--color-border-subtle)] last:border-0">
                <th scope="row" className="py-2 px-2 text-left font-normal text-[var(--color-text-secondary)] whitespace-nowrap">
                  {m.label}
                </th>
                {rows.map((r) => (
                  <td key={r.id} className={`py-2 px-2 text-right whitespace-nowrap ${r.id === cheapestId ? 'text-[var(--color-ink)] font-medium' : 'text-[var(--color-text-secondary)]'}`}>
                    {m.value(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Cost to date if each loan is repaid in full after m months (no early repayment charge), at yearly points. */
function EarlyRepaymentChart({ rows, currency }: { rows: { id: string; name: string; curve: number[] }[]; currency: CurrencyCode }) {
  const longest = Math.max(...rows.map((r) => r.curve.length - 1));
  if (longest < 12) return null;
  const points = Array.from({ length: Math.floor(longest / 12) + 1 }, (_, y) => y * 12);
  if (points.at(-1) !== longest) points.push(longest);
  return (
    <div className="space-y-2">
      <LineChart
        title="What each loan has cost if you repay it early"
        currency={currency}
        xLabels={points.map((m) => (m === 0 ? 'Start' : m % 12 === 0 ? `Yr ${m / 12}` : `M${m}`))}
        series={rows.map((r, i) => ({
          name: r.name,
          color: OFFER_COLORS[i % OFFER_COLORS.length],
          // After its last payment a loan's cost stays at its total cost.
          values: points.map((m) => r.curve[Math.min(m, r.curve.length - 1)]),
        }))}
      />
      <p className="text-[13px] text-[var(--color-text-muted)] px-1">
        Interest and fees paid up to that point, assuming the rest of the balance is repaid then with no early repayment charge. The line that ends lowest is the
        cheapest if you keep the loan to the end.
      </p>
    </div>
  );
}
