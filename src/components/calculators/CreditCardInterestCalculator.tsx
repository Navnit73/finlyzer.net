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
} from './ui';
import {
  type CardResult,
  type CardRow,
  type DayBasis,
  type MinimumRule,
  cycleRate,
  dailyRate,
  effectiveAnnualRate,
  paymentToClearIn,
  simulateBalanceTransfer,
  simulateCard,
} from '@/lib/calculators/credit-card.ts';
import { useIsMounted } from '@/lib/useIsMounted';
import { CURRENCIES, type CurrencyCode, formatMoney, formatMonths, formatPercent, validateNumber } from '@/lib/calculators/money.ts';

type Mode = 'fixed' | 'minimum' | 'target';

interface State {
  currency: CurrencyCode;
  balance: string;
  apr: string;
  basis: '365' | '360';
  cycleDays: string;
  mode: Mode;
  payment: string;
  targetMonths: string;
  minPercent: string;
  minFloor: string;
  plusInterest: 'yes' | 'no';
  btFee: string;
  btPromoApr: string;
  btPromoMonths: string;
  btAprAfter: string;
}

/** Worked example on the page: $5,000 at 24% APR, $200 a month → 35 months, $1,957.82 interest. */
const EXAMPLE: State = {
  currency: 'USD',
  balance: '5000',
  apr: '24',
  basis: '365',
  cycleDays: '30',
  mode: 'fixed',
  payment: '200',
  targetMonths: '24',
  minPercent: '1',
  minFloor: '25',
  plusInterest: 'yes',
  // Balance transfer what-if: 3% fee, 0% for 18 months, then the card's APR (empty = same as the card).
  btFee: '3',
  btPromoApr: '0',
  btPromoMonths: '18',
  btAprAfter: '',
};

/** The balance chart stops here so a decades-long minimum-payment plan doesn't flatten the other line. */
const CHART_MAX_YEARS = 30;

export default function CreditCardInterestCalculator() {
  const [state, setState] = useState<State>(EXAMPLE);
  const set = (key: keyof State) => (value: string) => setState((s) => ({ ...s, [key]: value }));
  const { currency } = state;
  const money = (v: number, decimals = 2) => formatMoney(v, currency, { decimals });
  const basis = Number(state.basis) as DayBasis;

  const balance = validateNumber(state.balance, { label: 'Card balance', min: 0, minExclusive: true, max: 1e9 });
  const apr = validateNumber(state.apr, { label: 'APR', min: 0, max: 100 });
  const cycleDays = validateNumber(state.cycleDays, { label: 'Billing cycle', min: 28, max: 31, integer: true });
  const payment = validateNumber(state.payment, { label: 'Monthly payment', min: 0, minExclusive: true, max: 1e9 });
  const targetMonths = validateNumber(state.targetMonths, { label: 'Months to pay off', min: 1, max: 600, integer: true });
  const minPercent = validateNumber(state.minPercent, { label: 'Minimum percentage', min: 0, max: 100 });
  const minFloor = validateNumber(state.minFloor, { label: 'Minimum amount', min: 0, max: 1e6, emptyAs: 0 });
  const btFee = validateNumber(state.btFee, { label: 'Transfer fee', min: 0, max: 20, emptyAs: 0 });
  const btPromoApr = validateNumber(state.btPromoApr, { label: 'Promotional APR', min: 0, max: 100, emptyAs: 0 });
  const btPromoMonths = validateNumber(state.btPromoMonths, { label: 'Promotion length', min: 0, max: 60, integer: true });
  const btAprAfter = validateNumber(state.btAprAfter, { label: 'APR after the promotion', min: 0, max: 100, emptyAs: apr.value ?? 0 });
  const mounted = useIsMounted();

  const baseValid = balance.value !== null && apr.value !== null && cycleDays.value !== null;
  const ruleValid = minPercent.value !== null && minFloor.value !== null && (minPercent.value > 0 || minFloor.value > 0);
  const modeValid = state.mode === 'fixed' ? payment.value !== null : state.mode === 'target' ? targetMonths.value !== null : ruleValid;
  const valid = baseValid && modeValid;

  const result = useMemo(() => {
    if (!valid) return null;
    const common = { balance: balance.value!, aprPct: apr.value!, basis, cycleDays: cycleDays.value! };
    const rule: MinimumRule | null = ruleValid ? { percent: minPercent.value!, floor: minFloor.value!, plusInterest: state.plusInterest === 'yes' } : null;
    const minimumPlan = rule ? simulateCard({ ...common, plan: { type: 'minimum', rule } }) : null;
    let chosenPayment: number | null = null;
    let plan: CardResult;
    if (state.mode === 'minimum') plan = minimumPlan!;
    else {
      chosenPayment = state.mode === 'fixed' ? payment.value! : paymentToClearIn(common.balance, common.aprPct, targetMonths.value!, basis, common.cycleDays);
      plan = simulateCard({ ...common, plan: { type: 'fixed', amount: chosenPayment } });
    }
    return { plan, minimumPlan, chosenPayment };
  }, [valid, ruleValid, balance.value, apr.value, basis, cycleDays.value, minPercent.value, minFloor.value, state.plusInterest, state.mode, payment.value, targetMonths.value]);

  // Same fixed payment on a balance transfer card, so the two routes are compared like for like.
  const transfer = useMemo(() => {
    if (!result || result.chosenPayment === null || !result.plan.repaid) return null;
    if (btFee.value === null || btPromoApr.value === null || btPromoMonths.value === null || btAprAfter.value === null) return null;
    return simulateBalanceTransfer({
      balance: balance.value!,
      payment: result.chosenPayment,
      feePct: btFee.value,
      promoAprPct: btPromoApr.value,
      promoMonths: btPromoMonths.value,
      aprAfterPct: btAprAfter.value,
      basis,
      cycleDays: cycleDays.value!,
    });
  }, [result, btFee.value, btPromoApr.value, btPromoMonths.value, btAprAfter.value, balance.value, basis, cycleDays.value]);

  const rates = apr.value !== null && cycleDays.value !== null
    ? {
        daily: dailyRate(apr.value, basis) * 100,
        cycle: cycleRate(apr.value, basis, cycleDays.value) * 100,
        effective: effectiveAnnualRate(apr.value, basis, cycleDays.value),
      }
    : null;

  const form = (
    <>
      <FormHeader title="Your card">
        <CurrencySelect value={currency} onChange={(c) => setState((s) => ({ ...s, currency: c }))} />
        <ResetButton onClick={() => setState(EXAMPLE)} />
      </FormHeader>
      <div className="space-y-6">
        <FieldGrid>
          <NumberField label="Card balance" value={state.balance} onChange={set('balance')} error={balance.error} prefix={CURRENCIES[currency].symbol} />
          <NumberField label="Purchase APR" value={state.apr} onChange={set('apr')} error={apr.error} suffix="%" hint="The APR on your statement, not a promotional rate." />
        </FieldGrid>

        <Segmented
          label="How will you pay?"
          value={state.mode}
          onChange={(m) => setState((s) => ({ ...s, mode: m }))}
          options={[
            { value: 'fixed', label: 'Fixed amount' },
            { value: 'minimum', label: 'Minimum only' },
            { value: 'target', label: 'Pay off by a date' },
          ]}
        />

        {state.mode === 'fixed' && (
          <NumberField
            label="Monthly payment"
            value={state.payment}
            onChange={set('payment')}
            error={payment.error}
            prefix={CURRENCIES[currency].symbol}
            hint="The same amount every month, with no new purchases."
            className="sm:max-w-xs"
          />
        )}
        {state.mode === 'target' && (
          <NumberField
            label="Months to pay off"
            value={state.targetMonths}
            onChange={set('targetMonths')}
            error={targetMonths.error}
            suffix="months"
            integer
            range={{ min: 3, max: 60, step: 1 }}
            className="sm:max-w-xs"
          />
        )}

        <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
          <div>
            <h3 className="type-headline !text-[17px]">Minimum payment rule</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              From your card agreement or statement. Many issuers use a percentage of the balance plus interest, with a minimum amount.
            </p>
          </div>
          <FieldGrid cols={3}>
            <NumberField label="Percent of balance" value={state.minPercent} onChange={set('minPercent')} error={minPercent.error} suffix="%" />
            <NumberField label="Or at least" value={state.minFloor} onChange={set('minFloor')} error={minFloor.error} prefix={CURRENCIES[currency].symbol} />
            <SelectField
              label="Plus interest?"
              value={state.plusInterest}
              onChange={(v) => setState((s) => ({ ...s, plusInterest: v }))}
              options={[
                { value: 'yes', label: 'Yes, plus interest' },
                { value: 'no', label: 'No, percent only' },
              ]}
            />
          </FieldGrid>
          {minPercent.value === 0 && minFloor.value === 0 && <Notice tone="warning">Enter a percentage or a minimum amount.</Notice>}
        </div>

        <details className="pt-6 border-t border-[var(--color-border)]" open>
          <summary className="cursor-pointer min-h-[44px] flex items-center type-headline !text-[17px]">Compare a balance transfer</summary>
          <div className="pt-2 space-y-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Move the balance to a card with a low introductory rate and keep paying the same amount. Enter the offer&apos;s terms; the fee is added to the
              transferred balance.
            </p>
            <FieldGrid>
              <NumberField label="Transfer fee" value={state.btFee} onChange={set('btFee')} error={btFee.error} suffix="% of balance" />
              <NumberField label="Promotional APR" value={state.btPromoApr} onChange={set('btPromoApr')} error={btPromoApr.error} suffix="%" />
              <NumberField
                label="Promotion length"
                value={state.btPromoMonths}
                onChange={set('btPromoMonths')}
                error={btPromoMonths.error}
                suffix="months"
                integer
              />
              <NumberField
                label="APR after the promotion"
                value={state.btAprAfter}
                onChange={set('btAprAfter')}
                error={btAprAfter.error}
                suffix="%"
                placeholder={apr.value !== null ? String(apr.value) : ''}
                hint="Leave empty to use your current APR."
              />
            </FieldGrid>
            {state.mode === 'minimum' ? (
              <p className="text-sm text-[var(--color-text-muted)]">Choose a fixed amount or a payoff date to compare a balance transfer.</p>
            ) : (
              transfer &&
              result?.plan.repaid && (
                <>
                  <ResultList
                    rows={[
                      { label: 'Transfer fee', value: money(transfer.fee) },
                      { label: 'Interest after the transfer', value: money(transfer.totalInterest) },
                      { label: 'Cost with the transfer (fee + interest)', value: money(transfer.totalCost), strong: true },
                      { label: 'Cost on your current card', value: money(result!.plan.totalInterest) },
                      {
                        label: 'Time to pay off',
                        value: transfer.repaid ? `${formatMonths(transfer.months)} (vs ${formatMonths(result!.plan.months)})` : 'Not repaid',
                      },
                    ]}
                  />
                  {!transfer.repaid ? (
                    <Notice tone="danger">After the promotion this payment no longer covers the interest, so the transferred balance would not be repaid.</Notice>
                  ) : transfer.totalCost < result!.plan.totalInterest ? (
                    <Notice tone="success">
                      The transfer saves {money(result!.plan.totalInterest - transfer.totalCost)}
                      {transfer.balanceAtPromoEnd > 0
                        ? `, but ${money(transfer.balanceAtPromoEnd)} is still owed when the promotion ends and starts accruing interest.`
                        : ' and clears the balance before the promotion ends.'}
                    </Notice>
                  ) : (
                    <Notice tone="warning">With these terms the transfer costs {money(transfer.totalCost - result!.plan.totalInterest)} more than staying on your card.</Notice>
                  )}
                </>
              )
            )}
          </div>
        </details>

        <details className="pt-6 border-t border-[var(--color-border)]">
          <summary className="cursor-pointer text-sm font-medium text-[var(--color-brand-dark)] min-h-[44px] flex items-center">Interest settings</summary>
          <div className="pt-3">
            <FieldGrid>
              <SelectField
                label="Days in the year"
                value={state.basis}
                onChange={(v) => setState((s) => ({ ...s, basis: v }))}
                options={[
                  { value: '365', label: '365 (most issuers)' },
                  { value: '360', label: '360' },
                ]}
                hint="Your agreement says which the daily rate uses."
              />
              <NumberField label="Billing cycle" value={state.cycleDays} onChange={set('cycleDays')} error={cycleDays.error} suffix="days" integer />
            </FieldGrid>
          </div>
        </details>
      </div>
    </>
  );

  const plan = result?.plan;
  const minimumPlan = result?.minimumPlan;
  const headline = !plan
    ? null
    : state.mode === 'target'
      ? { label: 'Monthly payment needed', value: money(result!.chosenPayment!), caption: `to clear the balance in ${formatMonths(targetMonths.value!)}` }
      : plan.repaid
        ? { label: 'Time to pay off', value: formatMonths(plan.months), caption: `${plan.months} monthly payments${mounted ? `, debt-free in ${debtFreeMonth(plan.months)}` : ''}` }
        : { label: 'Time to pay off', value: plan.coversInterest ? 'Over 100 years' : 'Never', caption: undefined };

  const summary =
    plan && headline ? (
      <>
        <HeadlineResult label={headline.label} value={headline.value} caption={headline.caption} />
        {!plan.coversInterest ? (
          <Notice tone="danger">
            This payment does not cover the first month&apos;s interest of {money(plan.firstInterest)}, so the balance would keep growing. Pay more than that each month.
          </Notice>
        ) : !plan.repaid ? (
          <Notice tone="danger">At this minimum the balance is not repaid within 100 years. Paying a fixed amount above the interest ends the debt.</Notice>
        ) : (
          <ResultList
            divided
            rows={[
              { label: 'Total interest', value: money(plan.totalInterest), strong: true },
              { label: 'Total paid', value: money(plan.totalPaid) },
              { label: 'Interest in the first month', value: money(plan.firstInterest) },
              ...(state.mode === 'minimum' && plan.rows[0] ? [{ label: 'First minimum payment', value: money(plan.rows[0].payment) }] : []),
            ]}
          />
        )}
        {state.mode !== 'minimum' && minimumPlan && plan.repaid && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            Paying only the minimum would take{' '}
            <strong className="font-semibold text-[var(--color-ink)]">{minimumPlan.repaid ? formatMonths(minimumPlan.months) : 'over 100 years'}</strong>
            {minimumPlan.repaid && (
              <>
                {' '}and cost <strong className="font-semibold text-[var(--color-ink)]">{money(minimumPlan.totalInterest)}</strong> in interest
              </>
            )}
            .
          </p>
        )}
        {rates && (
          <ResultList
            divided
            rows={[
              { label: 'Daily periodic rate', value: formatPercent(rates.daily, 5) },
              { label: `Interest per ${cycleDays.value}-day cycle`, value: formatPercent(rates.cycle, 4) },
              { label: 'Effective annual rate', value: formatPercent(rates.effective) },
            ]}
          />
        )}
      </>
    ) : (
      <EmptyResult />
    );

  const mobileSummary = plan && headline ? { label: headline.label, value: headline.value } : null;

  // Year-end balances for the chosen plan and for minimum payments, padded with 0 after payoff.
  const chart = useMemo(() => {
    if (!plan || !plan.repaid || plan.months < 13) return null;
    const lines = [plan, state.mode !== 'minimum' && minimumPlan ? minimumPlan : null].filter((p): p is CardResult => Boolean(p));
    const years = Math.min(CHART_MAX_YEARS, Math.ceil(Math.max(...lines.map((p) => p.months)) / 12));
    const yearEnd = (p: CardResult, y: number) => (y * 12 >= p.months ? (p.repaid ? 0 : p.rows.at(-1)!.closing) : p.rows[y * 12 - 1].closing);
    return {
      years,
      xLabels: ['Now', ...Array.from({ length: years }, (_, i) => `Yr ${i + 1}`)],
      series: lines.map((p, i) => ({
        name: i === 0 && state.mode !== 'minimum' ? 'Your payment' : 'Minimum payments',
        color: i === 0 && state.mode !== 'minimum' ? SERIES.primary : SERIES.secondary,
        values: [balance.value!, ...Array.from({ length: years }, (_, y) => yearEnd(p, y + 1))],
        area: i === 0,
      })),
    };
  }, [plan, minimumPlan, state.mode, balance.value]);

  return (
    <CalculatorLayout title="Credit card interest calculator" form={form} result={summary} mobileSummary={mobileSummary}>
      {chart && <LineChart title="Card balance at the end of each year" currency={currency} xLabels={chart.xLabels} series={chart.series} />}
      {plan && plan.rows.length > 0 && (
        <DataTable<CardRow>
          title="Month-by-month payoff schedule"
          csvName="credit-card-payoff-schedule.csv"
          rows={plan.rows}
          columns={[
            { header: 'Month', cell: (r) => String(r.month) },
            { header: 'Starting balance', cell: (r) => money(r.opening), align: 'right', hideOnMobile: true },
            { header: 'Interest', cell: (r) => money(r.interest), align: 'right' },
            { header: 'Payment', cell: (r) => money(r.payment), align: 'right' },
            { header: 'Ending balance', cell: (r) => money(r.closing), align: 'right' },
          ]}
        />
      )}
    </CalculatorLayout>
  );
}

/** Month of the last payment if the first is made next month, e.g. "March 2029". Client-only (uses today's date). */
function debtFreeMonth(payments: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + payments);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
