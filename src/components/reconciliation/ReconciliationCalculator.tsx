'use client';

import React, { useId, useState } from 'react';
import { CheckCircle2, AlertCircle, Plus, Trash2, RotateCcw } from 'lucide-react';

interface Line {
  id: number;
  label: string;
  amount: string;
}

type ListKey = 'depositsInTransit' | 'outstandingCheques' | 'bankCredits' | 'bankCharges';

interface CalcState {
  bankBalance: string;
  bookBalance: string;
  bankError: string;
  bookError: string;
  depositsInTransit: Line[];
  outstandingCheques: Line[];
  bankCredits: Line[];
  bankCharges: Line[];
}

let nextId = 100;
const line = (label = '', amount = ''): Line => ({ id: nextId++, label, amount });

const EXAMPLE: CalcState = {
  bankBalance: '12450.00',
  bookBalance: '11830.00',
  bankError: '',
  bookError: '',
  depositsInTransit: [line('Customer cheque deposited 30 Sep', '1200.00')],
  outstandingCheques: [line('Cheque #1043 to supplier', '1650.00'), line('Cheque #1045 rent', '200.00')],
  bankCredits: [line('Interest earned', '15.00')],
  bankCharges: [line('Monthly service fee', '25.00'), line('NSF cheque returned', '20.00')],
};

const EMPTY: CalcState = {
  bankBalance: '',
  bookBalance: '',
  bankError: '',
  bookError: '',
  depositsInTransit: [line()],
  outstandingCheques: [line()],
  bankCredits: [line()],
  bankCharges: [line()],
};

/** Parses a typed amount into integer cents so the totals never pick up floating-point noise. */
function toCents(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.') return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

const sumCents = (lines: Line[]) => lines.reduce((total, l) => total + toCents(l.amount), 0);

function formatCents(cents: number): string {
  const sign = cents < 0 ? '−' : '';
  return `${sign}${(Math.abs(cents) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function AmountInput({ id, value, onChange, label }: { id: string; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <input
      id={id}
      inputMode="decimal"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0.00"
      aria-label={label}
      className="input input-sm h-11 sm:h-9 w-full sm:w-36 text-right tabular-nums bg-[var(--color-surface)] border-[var(--color-border)]"
    />
  );
}

function LineList({
  title,
  hint,
  sign,
  lines,
  onChange,
}: {
  title: string;
  hint: string;
  sign: '+' | '−';
  lines: Line[];
  onChange: (lines: Line[]) => void;
}) {
  const baseId = useId();
  const update = (id: number, patch: Partial<Line>) => onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  return (
    <fieldset className="space-y-2">
      <legend className="w-full flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">
          <span className="inline-block w-3 text-[var(--color-text-muted)] mr-1">{sign}</span>
          {title}
        </span>
        <span className="text-sm tabular-nums text-[var(--color-text-secondary)]">{formatCents(sumCents(lines))}</span>
      </legend>
      <p className="text-xs text-[var(--color-text-secondary)]">{hint}</p>
      {lines.map((l, i) => (
        <div key={l.id} className="flex items-center gap-2">
          <input
            value={l.label}
            onChange={(e) => update(l.id, { label: e.target.value })}
            placeholder="Description (optional)"
            aria-label={`${title} ${i + 1} description`}
            className="input input-sm h-11 sm:h-9 flex-1 min-w-0 bg-[var(--color-surface)] border-[var(--color-border)]"
          />
          <AmountInput
            id={`${baseId}-${l.id}`}
            label={`${title} ${i + 1} amount`}
            value={l.amount}
            onChange={(amount) => update(l.id, { amount })}
          />
          <button
            type="button"
            onClick={() => onChange(lines.length > 1 ? lines.filter((x) => x.id !== l.id) : [line()])}
            className="w-11 h-11 sm:w-9 sm:h-9 shrink-0 inline-flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface-subtle)] transition-colors"
            aria-label={`Remove ${title.toLowerCase()} line ${i + 1}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...lines, line()])}
        className="link inline-flex items-center gap-1 min-h-[44px] sm:min-h-[36px] text-sm font-medium"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        Add line
      </button>
    </fieldset>
  );
}

/**
 * Bank reconciliation statement calculator: adjusts the bank balance (deposits in transit,
 * outstanding cheques, bank errors) and the book balance (bank-only credits and charges, book
 * errors) and shows whether the two adjusted balances agree. Runs entirely in the browser.
 */
export default function ReconciliationCalculator() {
  const [state, setState] = useState<CalcState>(EXAMPLE);
  const set = <K extends keyof CalcState>(key: K) => (value: CalcState[K]) => setState((s) => ({ ...s, [key]: value }));
  const setList = (key: ListKey) => (lines: Line[]) => setState((s) => ({ ...s, [key]: lines }));
  const ids = useId();

  const adjustedBank =
    toCents(state.bankBalance) + sumCents(state.depositsInTransit) - sumCents(state.outstandingCheques) + toCents(state.bankError);
  const adjustedBook =
    toCents(state.bookBalance) + sumCents(state.bankCredits) - sumCents(state.bankCharges) + toCents(state.bookError);
  const difference = adjustedBank - adjustedBook;
  const hasInput = state.bankBalance.trim() !== '' && state.bookBalance.trim() !== '';

  return (
    <section id="calculator" aria-labelledby="calculator-title" className="scroll-mt-24 intro-panel space-y-8 sm:space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div className="space-y-3 max-w-2xl">
          <h2 id="calculator-title" className="type-display text-balance">
            Bank Reconciliation Statement Calculator
          </h2>
          <p className="type-lead">
            Enter both balances and the reconciling items. The example figures show a reconciliation that balances; clear them to start your own.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={() => setState(EMPTY)} className="btn-brand-ghost">
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Clear</span>
          </button>
          <button type="button" onClick={() => setState(EXAMPLE)} className="btn-brand-ghost">
            Example
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="card-surface p-5 sm:p-7 space-y-6">
          <h3 className="type-headline">Bank side</h3>
          <label htmlFor={`${ids}-bank`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[15px] font-medium text-[var(--color-ink)]">Balance per bank statement</span>
            <AmountInput id={`${ids}-bank`} label="Balance per bank statement" value={state.bankBalance} onChange={set('bankBalance')} />
          </label>
          <LineList
            title="Deposits in transit"
            hint="Recorded in your books but not yet on the bank statement."
            sign="+"
            lines={state.depositsInTransit}
            onChange={setList('depositsInTransit')}
          />
          <LineList
            title="Outstanding cheques"
            hint="Issued and recorded in your books but not yet cleared by the bank."
            sign="−"
            lines={state.outstandingCheques}
            onChange={setList('outstandingCheques')}
          />
          <label htmlFor={`${ids}-bank-error`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm text-[var(--color-ink)]">
              <span className="font-medium">± Bank error correction</span>
              <span className="block text-xs text-[var(--color-text-secondary)]">Positive if the bank under-recorded your balance</span>
            </span>
            <AmountInput id={`${ids}-bank-error`} label="Bank error correction" value={state.bankError} onChange={set('bankError')} />
          </label>
          <div className="flex items-baseline justify-between pt-5 border-t border-[var(--color-border)]">
            <span className="text-[15px] font-medium text-[var(--color-ink)]">Adjusted bank balance</span>
            <span className="text-2xl font-semibold tracking-tight tabular-nums text-[var(--color-ink)]">{formatCents(adjustedBank)}</span>
          </div>
        </div>

        <div className="card-surface p-5 sm:p-7 space-y-6">
          <h3 className="type-headline">Book side (ledger / cash book)</h3>
          <label htmlFor={`${ids}-book`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[15px] font-medium text-[var(--color-ink)]">Balance per books</span>
            <AmountInput id={`${ids}-book`} label="Balance per books" value={state.bookBalance} onChange={set('bookBalance')} />
          </label>
          <LineList
            title="Credits on the statement only"
            hint="Interest, collections or transfers the bank recorded that your books don't have yet."
            sign="+"
            lines={state.bankCredits}
            onChange={setList('bankCredits')}
          />
          <LineList
            title="Charges on the statement only"
            hint="Bank fees, returned (NSF) cheques and direct debits not yet in your books."
            sign="−"
            lines={state.bankCharges}
            onChange={setList('bankCharges')}
          />
          <label htmlFor={`${ids}-book-error`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm text-[var(--color-ink)]">
              <span className="font-medium">± Book error correction</span>
              <span className="block text-xs text-[var(--color-text-secondary)]">Positive if your books under-recorded the balance</span>
            </span>
            <AmountInput id={`${ids}-book-error`} label="Book error correction" value={state.bookError} onChange={set('bookError')} />
          </label>
          <div className="flex items-baseline justify-between pt-5 border-t border-[var(--color-border)]">
            <span className="text-[15px] font-medium text-[var(--color-ink)]">Adjusted book balance</span>
            <span className="text-2xl font-semibold tracking-tight tabular-nums text-[var(--color-ink)]">{formatCents(adjustedBook)}</span>
          </div>
        </div>
      </div>

      <div
        aria-live="polite"
        className={`p-5 sm:p-6 rounded-2xl border flex items-start gap-3.5 ${
          !hasInput
            ? 'border-[var(--color-border)] bg-[var(--color-surface)]'
            : difference === 0
              ? 'border-[var(--color-success-border)] bg-[var(--color-success-soft)]'
              : 'border-[var(--color-warning-border)] bg-[var(--color-warning-soft)]'
        }`}
      >
        {hasInput && difference === 0 ? (
          <CheckCircle2 className="w-6 h-6 text-[var(--color-success)] shrink-0" aria-hidden="true" />
        ) : (
          <AlertCircle className={`w-6 h-6 shrink-0 ${hasInput ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-muted)]'}`} aria-hidden="true" />
        )}
        <div className="flex-1 space-y-1">
          <p className="text-[17px] font-semibold text-[var(--color-ink)] tabular-nums">
            {!hasInput
              ? 'Enter the bank and book balances to see the result.'
              : difference === 0
                ? 'Reconciled: the adjusted balances agree.'
                : `Unreconciled difference: ${formatCents(difference)}`}
          </p>
          {hasInput && difference !== 0 && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              {difference > 0 ? 'The adjusted bank balance is higher' : 'The adjusted book balance is higher'}. Look for a missing
              reconciling item, a transposed figure, or an entry recorded twice.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
