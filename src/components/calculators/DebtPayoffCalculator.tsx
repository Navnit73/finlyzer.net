'use client';

import React, { useId, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
} from './ui';
import { type Debt, type DebtOutcome, type PlanMonth, type Strategy, simulatePlan, sumMinimums } from '@/lib/calculators/debt-payoff.ts';
import { CURRENCIES, type CurrencyCode, formatMoney, formatMonths, validateNumber } from '@/lib/calculators/money.ts';

interface DebtInput {
  id: string;
  name: string;
  balance: string;
  apr: string;
  min: string;
}

interface State {
  currency: CurrencyCode;
  budget: string;
  /** One-off extra payment (bonus, tax refund) and the plan month it is paid in; empty = none. */
  extraAmount: string;
  extraMonth: string;
  debts: DebtInput[];
}

const MAX_DEBTS = 10;

/** Worked example on the page: $17,000 across four debts, $700 a month. */
const EXAMPLE: State = {
  currency: 'USD',
  budget: '700',
  extraAmount: '',
  extraMonth: '6',
  debts: [
    { id: 'd1', name: 'Card A', balance: '4000', apr: '24', min: '100' },
    { id: 'd2', name: 'Card B', balance: '1500', apr: '18', min: '40' },
    { id: 'd3', name: 'Car loan', balance: '9000', apr: '7', min: '250' },
    { id: 'd4', name: 'Personal loan', balance: '2500', apr: '12', min: '75' },
  ],
};

const STRATEGY_LABEL: Record<Strategy, string> = { avalanche: 'Avalanche', snowball: 'Snowball' };

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-ink)]">
        {label}
      </label>
      <input
        id={id}
        value={value}
        maxLength={40}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        className="input h-11 w-full rounded-xl text-[15px] bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none"
      />
    </div>
  );
}

export default function DebtPayoffCalculator() {
  const [state, setState] = useState<State>(EXAMPLE);
  const [nextId, setNextId] = useState(EXAMPLE.debts.length + 1);
  const [view, setView] = useState<Strategy>('avalanche');
  const { currency } = state;
  const money = (v: number, decimals = 2) => formatMoney(v, currency, { decimals });
  const symbol = CURRENCIES[currency].symbol;

  const budget = validateNumber(state.budget, { label: 'Monthly budget', min: 0, minExclusive: true, max: 1e9 });
  const parsed = state.debts.map((d, i) => ({
    input: d,
    label: d.name.trim() || `Debt ${i + 1}`,
    balance: validateNumber(d.balance, { label: 'Balance', min: 0, minExclusive: true, max: 1e9 }),
    apr: validateNumber(d.apr, { label: 'APR', min: 0, max: 100 }),
    min: validateNumber(d.min, { label: 'Minimum payment', min: 0, max: 1e9, emptyAs: 0 }),
  }));
  const debtsValid = parsed.every((p) => p.balance.value !== null && p.apr.value !== null && p.min.value !== null);
  const debts: Debt[] | null = debtsValid
    ? parsed.map((p) => ({ id: p.input.id, name: p.label, balance: p.balance.value!, aprPct: p.apr.value!, minPayment: p.min.value! }))
    : null;
  const minimums = debts ? sumMinimums(debts) : null;
  const budgetError = budget.error ?? (budget.value !== null && minimums !== null && budget.value < minimums ? `The budget must cover the minimum payments (${money(minimums)}).` : null);
  const extraAmount = validateNumber(state.extraAmount, { label: 'One-off payment', min: 0, max: 1e9, emptyAs: 0 });
  const extraMonth = validateNumber(state.extraMonth, { label: 'Month', min: 1, max: 600, integer: true });
  const extras =
    extraAmount.value && extraAmount.value > 0 && extraMonth.value !== null ? [{ month: extraMonth.value, amount: extraAmount.value }] : [];
  const extrasValid = extraAmount.value !== null && (extraAmount.value === 0 || extraMonth.value !== null);
  const valid = debts !== null && budget.value !== null && !budgetError && extrasValid;

  // Cheap enough (≤10 debts, ≤1,200 months) to run on every render.
  const plans = valid
    ? {
        avalanche: simulatePlan(debts!, budget.value!, 'avalanche', extras),
        snowball: simulatePlan(debts!, budget.value!, 'snowball', extras),
        minimumsOnly: simulatePlan(debts!, minimums!, 'avalanche'),
      }
    : null;

  const updateDebt = (id: string, key: keyof DebtInput) => (value: string) =>
    setState((s) => ({ ...s, debts: s.debts.map((d) => (d.id === id ? { ...d, [key]: value } : d)) }));
  const addDebt = () => {
    setState((s) => ({ ...s, debts: [...s.debts, { id: `d${nextId}`, name: '', balance: '', apr: '', min: '' }] }));
    setNextId((n) => n + 1);
  };
  const removeDebt = (id: string) => setState((s) => ({ ...s, debts: s.debts.filter((d) => d.id !== id) }));
  const reset = () => {
    setState(EXAMPLE);
    setNextId(EXAMPLE.debts.length + 1);
    setView('avalanche');
  };

  const form = (
    <>
      <FormHeader title="Your debts">
        <CurrencySelect value={currency} onChange={(c) => setState((s) => ({ ...s, currency: c }))} />
        <ResetButton onClick={reset} />
      </FormHeader>
      <ol className="space-y-4">
        {parsed.map((p, i) => (
          <li key={p.input.id} className="rounded-2xl border border-[var(--color-border)] p-4 sm:p-5">
            <fieldset className="space-y-4">
              <legend className="sr-only">{p.label}</legend>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <TextField label={`Debt ${i + 1} name`} value={p.input.name} onChange={updateDebt(p.input.id, 'name')} />
                </div>
                {state.debts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDebt(p.input.id)}
                    className="btn btn-ghost btn-sm h-11 rounded-full text-[var(--color-text-secondary)]"
                    aria-label={`Remove ${p.label}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <NumberField label="Balance" value={p.input.balance} onChange={updateDebt(p.input.id, 'balance')} error={p.balance.error} prefix={symbol} />
                <NumberField label="APR" value={p.input.apr} onChange={updateDebt(p.input.id, 'apr')} error={p.apr.error} suffix="%" />
                <NumberField label="Minimum payment" value={p.input.min} onChange={updateDebt(p.input.id, 'min')} error={p.min.error} prefix={symbol} />
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      {state.debts.length < MAX_DEBTS && (
        <button type="button" onClick={addDebt} className="mt-4 btn btn-sm rounded-full gap-1.5 bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-ink)]">
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add a debt
        </button>
      )}
      <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
        <NumberField
          label="Total you can pay each month"
          value={state.budget}
          onChange={(v) => setState((s) => ({ ...s, budget: v }))}
          error={budgetError}
          prefix={symbol}
          hint={minimums !== null && budget.value !== null && !budgetError ? `${money(budget.value - minimums)} above the minimums goes to the priority debt.` : undefined}
          className="sm:max-w-sm"
        />
        <div className="space-y-3">
          <div>
            <h3 className="type-headline !text-[17px]">One-off extra payment</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              A bonus, tax refund or sale you will put toward the debts. It goes to the priority debt in that month.
            </p>
          </div>
          <FieldGrid>
            <NumberField
              label="Amount"
              value={state.extraAmount}
              onChange={(v) => setState((s) => ({ ...s, extraAmount: v }))}
              error={extraAmount.error}
              prefix={symbol}
              placeholder="0"
            />
            <NumberField
              label="Paid in month"
              value={state.extraMonth}
              onChange={(v) => setState((s) => ({ ...s, extraMonth: v }))}
              error={extraAmount.value ? extraMonth.error : null}
              integer
              hint="1 = the first month of the plan."
            />
          </FieldGrid>
        </div>
      </div>
    </>
  );

  const chosen = plans?.[view];
  const other = plans?.[view === 'avalanche' ? 'snowball' : 'avalanche'];

  const summary =
    plans && chosen && other ? (
      <>
        <Segmented
          label="Strategy"
          value={view}
          onChange={setView}
          options={[
            { value: 'avalanche', label: 'Avalanche' },
            { value: 'snowball', label: 'Snowball' },
          ]}
        />
        {chosen.repaid ? (
          <HeadlineResult label="Debt-free in" value={formatMonths(chosen.months)} caption={`${STRATEGY_LABEL[view]}: ${money(chosen.totalInterest)} total interest`} />
        ) : (
          <Notice tone="danger">This budget does not get ahead of the interest, so the debts are not repaid. Raise the monthly amount.</Notice>
        )}
        <ResultList
          divided
          rows={[
            { label: 'Avalanche: debt-free in', value: plans.avalanche.repaid ? formatMonths(plans.avalanche.months) : 'Not repaid' },
            { label: 'Avalanche: total interest', value: money(plans.avalanche.totalInterest), swatch: SERIES.primary },
            { label: 'Snowball: debt-free in', value: plans.snowball.repaid ? formatMonths(plans.snowball.months) : 'Not repaid' },
            { label: 'Snowball: total interest', value: money(plans.snowball.totalInterest), swatch: SERIES.secondary },
          ]}
        />
        {plans.avalanche.repaid && plans.snowball.repaid && <Comparison avalanche={plans.avalanche} snowball={plans.snowball} money={money} />}
        {plans.minimumsOnly.repaid && budget.value! > minimums! && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            Paying only the minimums ({money(minimums!)}) would take {formatMonths(plans.minimumsOnly.months)} and cost {money(plans.minimumsOnly.totalInterest)} in interest.
          </p>
        )}
      </>
    ) : (
      <EmptyResult />
    );

  return (
    <CalculatorLayout
      title="Debt payoff calculator"
      form={form}
      result={summary}
      mobileSummary={chosen?.repaid ? { label: `Debt-free (${STRATEGY_LABEL[view].toLowerCase()})`, value: formatMonths(chosen.months) } : null}
    >
      {plans && plans.avalanche.repaid && plans.snowball.repaid && Math.max(plans.avalanche.months, plans.snowball.months) >= 2 && (
        <LineChart
          title="Total balance owed, month by month"
          currency={currency}
          xLabels={Array.from({ length: Math.max(plans.avalanche.balances.length, plans.snowball.balances.length) }, (_, i) => (i === 0 ? 'Now' : `M${i}`))}
          series={[
            { name: 'Avalanche', color: SERIES.primary, values: pad(plans.avalanche.balances, plans.snowball.balances.length) },
            { name: 'Snowball', color: SERIES.secondary, values: pad(plans.snowball.balances, plans.avalanche.balances.length) },
          ]}
        />
      )}
      {chosen && (
        <DataTable<DebtOutcome>
          title={`${STRATEGY_LABEL[view]} payoff order`}
          csvName={`debt-payoff-${view}.csv`}
          defaultOpen
          rows={[...chosen.debts].sort((a, b) => (a.payoffMonth ?? Infinity) - (b.payoffMonth ?? Infinity))}
          columns={[
            { header: 'Debt', cell: (r) => r.name },
            { header: 'Paid off in month', cell: (r) => (r.payoffMonth === null ? 'Not repaid' : String(r.payoffMonth)), align: 'right' },
            { header: 'Interest paid', cell: (r) => money(r.interest), align: 'right' },
            { header: 'Total paid', cell: (r) => money(r.paid), align: 'right' },
          ]}
        />
      )}
      {chosen && debts && chosen.schedule.length > 0 && (
        <DataTable<PlanMonth>
          title={`Month-by-month payment plan (${STRATEGY_LABEL[view].toLowerCase()})`}
          csvName={`debt-payoff-plan-${view}.csv`}
          rows={chosen.schedule}
          columns={[
            { header: 'Month', cell: (r) => String(r.month) },
            ...uniqueNames(debts.map((d) => d.name)).flatMap((name, i) => [
              { header: `${name}: pay`, cell: (r: PlanMonth) => money(r.payments[i]), align: 'right' as const },
              { header: `${name}: left`, cell: (r: PlanMonth) => money(r.balances[i]), align: 'right' as const },
            ]),
            { header: 'Total paid', cell: (r) => money(r.payments.reduce((t, p) => t + p, 0)), align: 'right' },
            { header: 'Total left', cell: (r) => money(r.balances.reduce((t, b) => t + b, 0)), align: 'right' },
          ]}
        />
      )}
    </CalculatorLayout>
  );
}

function Comparison({
  avalanche,
  snowball,
  money,
}: {
  avalanche: ReturnType<typeof simulatePlan>;
  snowball: ReturnType<typeof simulatePlan>;
  money: (v: number) => string;
}) {
  const saving = snowball.totalInterest - avalanche.totalInterest;
  const firstWin = (p: ReturnType<typeof simulatePlan>) => Math.min(...p.debts.map((d) => d.payoffMonth ?? Infinity));
  if (Math.abs(saving) < 0.005 && avalanche.months === snowball.months) {
    return <Notice>Both strategies pay the same interest for these debts, so pick the order that keeps you motivated.</Notice>;
  }
  if (saving < 0) {
    return <Notice>Snowball costs {money(-saving)} less interest here, because clearing small debts early frees their minimums sooner.</Notice>;
  }
  return (
    <Notice tone="success">
      Avalanche saves {money(saving)} in interest
      {snowball.months > avalanche.months ? ` and finishes ${snowball.months - avalanche.months} month${snowball.months - avalanche.months === 1 ? '' : 's'} sooner` : ''}. Snowball
      clears its first debt in month {firstWin(snowball)}
      {firstWin(snowball) < firstWin(avalanche) ? `, versus month ${firstWin(avalanche)} with avalanche` : ''}.
    </Notice>
  );
}

/** Column headers must be unique; two debts named "Card" become "Card" and "Card (2)". */
function uniqueNames(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((n) => {
    const count = (seen.get(n) ?? 0) + 1;
    seen.set(n, count);
    return count === 1 ? n : `${n} (${count})`;
  });
}

function pad(values: number[], length: number): number[] {
  return values.length >= length ? values : [...values, ...Array(length - values.length).fill(0)];
}
