'use client';

import React, { useId, useState } from 'react';
import { RotateCcw, TrendingUp, TrendingDown, AlertCircle, ChevronDown, ArrowRight } from 'lucide-react';

type Method = 'direct' | 'indirect';
type Tab = 'operating' | 'investing' | 'financing';

interface Field {
  key: string;
  label: string;
  hint?: string;
  /** Less common line: hidden behind "More items" until opened or filled in. */
  more?: boolean;
}

/** Working-capital lines: an increase in an asset uses cash, an increase in a liability provides it. */
interface WorkingCapitalField extends Field {
  side: 'asset' | 'liability';
}

const OPERATING_RECEIPTS: Field[] = [
  { key: 'customers', label: 'Cash received from customers', hint: 'Sales collected by cash, card and transfer' },
  { key: 'otherReceipts', label: 'Other operating receipts', hint: 'Refunds, grants, interest received', more: true },
];

const OPERATING_PAYMENTS: Field[] = [
  { key: 'suppliers', label: 'Suppliers and inventory' },
  { key: 'payroll', label: 'Payroll and wages' },
  { key: 'rent', label: 'Rent and lease' },
  { key: 'otherPayments', label: 'Other operating costs', hint: 'Utilities, software, fees' },
  { key: 'taxesPaid', label: 'Income taxes paid' },
  { key: 'interestPaid', label: 'Interest paid', more: true },
  { key: 'insurance', label: 'Insurance', more: true },
  { key: 'advertising', label: 'Advertising and marketing', more: true },
];

const INDIRECT_START: Field[] = [
  { key: 'netIncome', label: 'Net income', hint: 'Profit after tax; negative for a loss' },
  { key: 'depreciation', label: 'Depreciation and amortisation', hint: 'Added back: it reduced profit, not cash' },
  { key: 'otherNonCash', label: 'Other non-cash items', hint: 'Enter gains on asset sales as negative', more: true },
];

const WORKING_CAPITAL: WorkingCapitalField[] = [
  { key: 'changeReceivables', label: 'Accounts receivable', side: 'asset' },
  { key: 'changeInventory', label: 'Inventory', side: 'asset' },
  { key: 'changePayables', label: 'Accounts payable', side: 'liability' },
  { key: 'changeAccrued', label: 'Accrued expenses', side: 'liability' },
  { key: 'changePrepaid', label: 'Prepaid expenses', side: 'asset', more: true },
];

const INVESTING_RECEIPTS: Field[] = [
  { key: 'saleOfAssets', label: 'Sale of equipment or property' },
  { key: 'saleOfInvestments', label: 'Sale of investments', more: true },
  { key: 'otherInvestingIn', label: 'Other investing receipts', hint: 'Loans repaid to you', more: true },
];

const INVESTING_PAYMENTS: Field[] = [
  { key: 'capex', label: 'Capital expenditures', hint: 'Equipment, vehicles, property, software' },
  { key: 'purchaseInvestments', label: 'Purchase of investments', more: true },
  { key: 'otherInvestingOut', label: 'Other investing payments', hint: 'Acquisitions, loans to others', more: true },
];

const FINANCING_RECEIPTS: Field[] = [
  { key: 'borrowing', label: 'New loans' },
  { key: 'equity', label: 'Owner or shareholder investment' },
];

const FINANCING_PAYMENTS: Field[] = [
  { key: 'loanRepayments', label: 'Loan repayments', hint: 'Principal only' },
  { key: 'dividends', label: 'Dividends and owner drawings' },
  { key: 'otherFinancingOut', label: 'Other financing payments', hint: 'Lease principal, share buybacks', more: true },
];

type Values = Record<string, string>;

interface CalcState {
  method: Method;
  values: Values;
}

/** One month of a small business. Both operating methods come to 7,500.00, so switching methods shows the same result. */
const EXAMPLE: CalcState = {
  method: 'direct',
  values: {
    beginningCash: '25000.00',
    customers: '48500.00',
    otherReceipts: '500.00',
    suppliers: '18200.00',
    payroll: '14600.00',
    rent: '3500.00',
    insurance: '650.00',
    advertising: '1200.00',
    otherPayments: '900.00',
    interestPaid: '350.00',
    taxesPaid: '2100.00',
    netIncome: '6200.00',
    depreciation: '1400.00',
    changeReceivables: '2300.00',
    changeInventory: '-800.00',
    changePayables: '1100.00',
    changeAccrued: '300.00',
    saleOfAssets: '2000.00',
    capex: '9500.00',
    borrowing: '10000.00',
    loanRepayments: '2400.00',
    dividends: '3000.00',
  },
};

/** Parses a typed amount into integer cents so totals never pick up floating-point noise. */
function toCents(value: string | undefined): number {
  const cleaned = (value ?? '').replace(/[^0-9.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.') return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function formatCents(cents: number, signed = false): string {
  const sign = cents < 0 ? '−' : signed && cents > 0 ? '+' : '';
  return `${sign}${(Math.abs(cents) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const sum = (fields: Field[], values: Values) => fields.reduce((total, f) => total + toCents(values[f.key]), 0);

function AmountInput({ id, value, onChange, label }: { id: string; value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <input
      id={id}
      inputMode="decimal"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0.00"
      aria-label={label}
      className="input h-11 w-full sm:w-44 shrink-0 rounded-xl text-right text-[15px] tabular-nums bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none"
    />
  );
}

function FieldRow({ field, value, onChange, hint }: { field: Field; value: string; onChange: (v: string) => void; hint?: string }) {
  const id = useId();
  const shownHint = hint ?? field.hint;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6 py-3.5">
      <label htmlFor={id} className="min-w-0">
        <span className="block text-[15px] text-[var(--color-ink)]">{field.label}</span>
        {shownHint && <span className="block mt-0.5 text-[13px] text-[var(--color-text-muted)]">{shownHint}</span>}
      </label>
      <AmountInput id={id} value={value} onChange={onChange} />
    </div>
  );
}

/** A titled list of amount rows with its total; `more` fields sit behind a toggle unless filled in. */
function FieldGroup({
  title,
  total,
  fields,
  values,
  onChange,
  hintFor,
}: {
  title: string;
  total: string;
  fields: Field[];
  values: Values;
  onChange: (key: string, v: string) => void;
  hintFor?: (field: Field) => string | undefined;
}) {
  const extra = fields.filter((f) => f.more);
  const extraFilled = extra.some((f) => (values[f.key] ?? '').trim() !== '');
  const [open, setOpen] = useState(false);
  const showExtra = open || extraFilled;
  const visible = fields.filter((f) => !f.more || showExtra);

  return (
    <fieldset>
      <legend className="w-full flex items-baseline justify-between gap-3 pb-1">
        <span className="text-[13px] font-semibold text-[var(--color-text-muted)]">{title}</span>
        <span className="text-[13px] font-medium tabular-nums text-[var(--color-text-secondary)]">{total}</span>
      </legend>
      <div className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
        {visible.map((f) => (
          <FieldRow key={f.key} field={f} value={values[f.key] ?? ''} onChange={(v) => onChange(f.key, v)} hint={hintFor?.(f)} />
        ))}
      </div>
      {extra.length > 0 && !extraFilled && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={showExtra}
          className="link inline-flex items-center gap-1 min-h-[44px] text-sm font-medium"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showExtra ? 'rotate-180' : ''}`} aria-hidden="true" />
          {showExtra ? 'Fewer items' : `${extra.length} more item${extra.length > 1 ? 's' : ''}`}
        </button>
      )}
    </fieldset>
  );
}

/** Literal class names so Tailwind can see them. */
const TONE_CLASSES = {
  success: { box: 'bg-[var(--color-success-soft)] border-[var(--color-success-border)]', icon: 'text-[var(--color-success)]' },
  warning: { box: 'bg-[var(--color-warning-soft)] border-[var(--color-warning-border)]', icon: 'text-[var(--color-warning)]' },
  danger: { box: 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)]', icon: 'text-[var(--color-danger)]' },
} as const;

const TABS: { id: Tab; label: string; short: string }[] = [
  { id: 'operating', label: 'Operating', short: 'Day-to-day business' },
  { id: 'investing', label: 'Investing', short: 'Equipment and assets' },
  { id: 'financing', label: 'Financing', short: 'Loans and owners' },
];

/**
 * Cash flow statement calculator: operating (direct or indirect method), investing and financing
 * activities, net cash flow, ending cash and free cash flow. Runs entirely in the browser.
 */
export default function CashFlowCalculator() {
  const [state, setState] = useState<CalcState>(EXAMPLE);
  const [tab, setTab] = useState<Tab>('operating');
  const { method, values } = state;
  const setValue = (key: string, v: string) => setState((s) => ({ ...s, values: { ...s.values, [key]: v } }));
  const setMethod = (m: Method) => setState((s) => ({ ...s, method: m }));
  const ids = useId();

  const workingCapital = WORKING_CAPITAL.reduce((total, f) => total + (f.side === 'asset' ? -1 : 1) * toCents(values[f.key]), 0);
  const operating =
    method === 'direct'
      ? sum(OPERATING_RECEIPTS, values) - sum(OPERATING_PAYMENTS, values)
      : sum(INDIRECT_START, values) + workingCapital;
  const investing = sum(INVESTING_RECEIPTS, values) - sum(INVESTING_PAYMENTS, values);
  const financing = sum(FINANCING_RECEIPTS, values) - sum(FINANCING_PAYMENTS, values);
  const flows: Record<Tab, number> = { operating, investing, financing };
  const net = operating + investing + financing;
  const beginning = toCents(values.beginningCash);
  const ending = beginning + net;
  const freeCashFlow = operating - toCents(values.capex);

  const describe = (cents: number) => (cents >= 0 ? `generated ${formatCents(cents)}` : `used ${formatCents(-cents)}`);
  const NetIcon = net >= 0 ? TrendingUp : TrendingDown;
  const tabIndex = TABS.findIndex((t) => t.id === tab);
  const nextTab = TABS[tabIndex + 1];
  const tone = TONE_CLASSES[ending < 0 ? 'danger' : net >= 0 ? 'success' : 'warning'];

  return (
    <section id="calculator" aria-labelledby="calculator-title" className="scroll-mt-24 space-y-8 sm:space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div className="space-y-3 max-w-2xl">
          <h2 id="calculator-title" className="type-display text-balance">
            Net Cash Flow Calculator
          </h2>
          <p className="type-lead">
            Fill in each tab with the cash that came in and went out. The example is one month of a small business.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={() => setState((s) => ({ ...s, values: {} }))} className="btn-brand-secondary">
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Start blank</span>
          </button>
          <button type="button" onClick={() => setState(EXAMPLE)} className="btn-brand-ghost">
            Load example
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-10 items-start">
        {/* Inputs */}
        <div className="min-w-0">
          <div role="tablist" aria-label="Cash flow activity" className="grid grid-cols-3 gap-2">
            {TABS.map((t, i) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  id={`${ids}-tab-${t.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`${ids}-panel`}
                  onClick={() => setTab(t.id)}
                  className={`text-left rounded-2xl border px-3 py-3 sm:px-5 sm:py-4 transition-colors ${
                    active
                      ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)]'
                  }`}
                >
                  <span className={`block text-[13px] ${active ? 'text-[var(--color-brand-dark)]' : 'text-[var(--color-text-muted)]'}`}>
                    {i + 1}. <span className="hidden sm:inline">{t.short}</span>
                  </span>
                  <span className="block mt-0.5 text-[15px] sm:text-[17px] font-semibold text-[var(--color-ink)]">{t.label}</span>
                  <span className="block mt-1 text-[13px] sm:text-sm tabular-nums text-[var(--color-text-secondary)]">
                    {formatCents(flows[t.id], true)}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id={`${ids}-panel`}
            role="tabpanel"
            aria-labelledby={`${ids}-tab-${tab}`}
            className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 sm:px-8 sm:py-8 space-y-8"
          >
            {tab === 'operating' && (
              <>
                <div className="space-y-3">
                  <div role="group" aria-label="Operating cash flow method" className="grid grid-cols-2 rounded-full bg-[var(--color-surface-subtle)] p-1 max-w-sm">
                    {(['direct', 'indirect'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={method === m}
                        onClick={() => setMethod(m)}
                        className={`min-h-[40px] rounded-full text-sm font-medium transition-colors ${
                          method === m
                            ? 'bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)]'
                            : 'text-[var(--color-text-secondary)] border border-transparent hover:text-[var(--color-ink)]'
                        }`}
                      >
                        {m === 'direct' ? 'Direct method' : 'Indirect method'}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {method === 'direct'
                      ? 'Cash actually received and paid. Easiest if you work from bank statements.'
                      : 'Starts from net income. Use it if you have an income statement and two balance sheets.'}
                  </p>
                </div>

                {method === 'direct' ? (
                  <>
                    <FieldGroup title="Money in" total={formatCents(sum(OPERATING_RECEIPTS, values))} fields={OPERATING_RECEIPTS} values={values} onChange={setValue} />
                    <FieldGroup title="Money out" total={formatCents(sum(OPERATING_PAYMENTS, values))} fields={OPERATING_PAYMENTS} values={values} onChange={setValue} />
                  </>
                ) : (
                  <>
                    <FieldGroup title="Profit and non-cash items" total={formatCents(sum(INDIRECT_START, values), true)} fields={INDIRECT_START} values={values} onChange={setValue} />
                    <FieldGroup
                        title="Change in working capital (closing − opening)"
                        total={formatCents(workingCapital, true)}
                        fields={WORKING_CAPITAL}
                        values={values}
                        onChange={setValue}
                        hintFor={(f) => ((f as WorkingCapitalField).side === 'asset' ? 'An increase lowers cash' : 'An increase adds to cash')}
                      />
                  </>
                )}
              </>
            )}

            {tab === 'investing' && (
              <>
                <FieldGroup title="Money in" total={formatCents(sum(INVESTING_RECEIPTS, values))} fields={INVESTING_RECEIPTS} values={values} onChange={setValue} />
                <FieldGroup title="Money out" total={formatCents(sum(INVESTING_PAYMENTS, values))} fields={INVESTING_PAYMENTS} values={values} onChange={setValue} />
              </>
            )}

            {tab === 'financing' && (
              <>
                <FieldGroup title="Money in" total={formatCents(sum(FINANCING_RECEIPTS, values))} fields={FINANCING_RECEIPTS} values={values} onChange={setValue} />
                <FieldGroup title="Money out" total={formatCents(sum(FINANCING_PAYMENTS, values))} fields={FINANCING_PAYMENTS} values={values} onChange={setValue} />
              </>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[var(--color-border)]">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">{TABS[tabIndex].label} cash flow</p>
                <p className="text-[28px] font-semibold tracking-tight tabular-nums text-[var(--color-ink)]">{formatCents(flows[tab], true)}</p>
              </div>
              {nextTab ? (
                <button type="button" onClick={() => setTab(nextTab.id)} className="btn-brand-primary self-start sm:self-auto">
                  Next: {nextTab.label} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              ) : (
                <a href={`#${ids}-summary`} className="btn-brand-primary self-start sm:self-auto lg:hidden">
                  See summary <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Mobile: keep the answer in view while filling in the form. */}
          <div className="lg:hidden sticky bottom-0 z-10 -mx-4 mt-4 px-4 py-3 surface-frosted border-t border-[var(--color-border)] flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--color-text-secondary)]">Net cash flow</span>
            <span className="text-[19px] font-semibold tabular-nums text-[var(--color-ink)]">{formatCents(net, true)}</span>
          </div>
        </div>

        {/* Summary */}
        <aside
          id={`${ids}-summary`}
          aria-labelledby={`${ids}-summary-title`}
          className="scroll-mt-24 rounded-2xl bg-[var(--color-surface-subtle)] p-6 sm:p-8 space-y-6 lg:sticky lg:top-24"
        >
          <h3 id={`${ids}-summary-title`} className="type-headline">Your cash flow</h3>

          <div className="space-y-2">
            <label htmlFor={`${ids}-beginning`} className="block text-sm text-[var(--color-text-secondary)]">
              Cash at beginning of period
            </label>
            <input
              id={`${ids}-beginning`}
              inputMode="decimal"
              autoComplete="off"
              value={values.beginningCash ?? ''}
              onChange={(e) => setValue('beginningCash', e.target.value)}
              placeholder="0.00"
              className="input h-12 w-full rounded-xl text-right text-[17px] tabular-nums bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none"
            />
          </div>

          <dl className="space-y-3 text-[15px]">
            {TABS.map((t) => (
              <div key={t.id} className="flex items-baseline justify-between gap-3">
                <dt className="text-[var(--color-text-secondary)]">{t.label}</dt>
                <dd className="tabular-nums text-[var(--color-ink)]">{formatCents(flows[t.id], true)}</dd>
              </div>
            ))}
          </dl>

          <div className="pt-5 border-t border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-secondary)]">Net cash flow</p>
            <p className="text-[40px] leading-tight font-semibold tracking-tight tabular-nums text-[var(--color-ink)]">{formatCents(net, true)}</p>
          </div>

          <dl className="space-y-3 text-[15px] pt-5 border-t border-[var(--color-border)]">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[var(--color-text-secondary)]">Cash at end of period</dt>
              <dd className="font-semibold tabular-nums text-[var(--color-ink)]">{formatCents(ending)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[var(--color-text-secondary)]">Free cash flow</dt>
              <dd className="tabular-nums text-[var(--color-ink)]">{formatCents(freeCashFlow, true)}</dd>
            </div>
          </dl>

          <div
            aria-live="polite"
            className={`p-4 rounded-2xl border flex items-start gap-3 ${tone.box}`}
          >
            {ending < 0 ? (
              <AlertCircle className={`w-5 h-5 mt-0.5 shrink-0 ${tone.icon}`} aria-hidden="true" />
            ) : (
              <NetIcon className={`w-5 h-5 mt-0.5 shrink-0 ${tone.icon}`} aria-hidden="true" />
            )}
            <p className="text-sm text-[var(--color-ink)] leading-relaxed">
              Operations {describe(operating)}, investing {describe(investing)} and financing {describe(financing)}.{' '}
              {ending < 0
                ? 'Ending cash is negative: outflows exceed the cash available.'
                : `Cash ${net >= 0 ? 'rises' : 'falls'} to ${formatCents(ending)}.`}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
