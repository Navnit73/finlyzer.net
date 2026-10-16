'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Download, Link2, Search } from 'lucide-react';
import {
  CATEGORIES,
  formatMoney,
  formatShortDate,
  type CategoryId,
  type ParsedTransaction,
  type SpendingAnalysis,
} from '@/lib/spending-analysis';
import { SegmentedBar, SpendingTimeline } from './AnalysisCharts';

type TabId = 'overview' | 'transactions' | 'savings' | 'income';
type Money = (n: number, cents?: boolean) => string;

const PAGE_SIZE = 50;
const CHIP = 'rounded-full px-2.5 py-0.5 text-[12px] font-medium';

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="type-headline">{title}</h2>
        {hint && <p className="type-body !text-[15px]">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export default function AnalysisReport({ analysis, filename }: { analysis: SpendingAnalysis; filename?: string }) {
  const a = analysis;
  const [tab, setTab] = useState<TabId>('overview');
  const [txCategory, setTxCategory] = useState<CategoryId | 'all'>('all');
  const [copied, setCopied] = useState(false);
  const money: Money = (n, cents = false) => formatMoney(n, a.currency, { cents });

  const kept = a.kept >= 0;
  const spentShare = a.totalIn > 0 ? Math.min(1, a.totalOut / a.totalIn) : 0;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the link is still in the address bar.
    }
  };

  const openTransactions = (category: CategoryId | 'all') => {
    setTxCategory(category);
    setTab('transactions');
    document.getElementById('report-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'savings', label: 'Savings' },
    { id: 'income', label: 'Income' },
  ];

  const stats: { label: string; value: string; note: string }[] = [
    { label: 'Money in', value: money(a.totalIn), note: `${a.incomeSources.reduce((n, s) => n + s.count, 0)} deposits` },
    { label: 'Money out', value: money(a.totalOut), note: `${a.categories.reduce((n, c) => n + c.count, 0)} payments` },
    {
      label: 'Savings rate',
      value: a.savingsRate === null ? '–' : `${Math.round(a.savingsRate * 100)}%`,
      note: a.savingsRate === null ? 'No income found' : 'of money in',
    },
    { label: 'Daily average', value: money(a.averageDailySpend), note: 'spent per day' },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 sm:space-y-10">
      {/* Summary */}
      <header className="rounded-2xl bg-[var(--color-surface-subtle)] p-5 sm:p-8 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <p className="type-body !text-[15px] min-w-0">
            <span className="font-medium text-[var(--color-ink)]">{a.periodLabel}</span>
            {a.bankName ? ` · ${a.bankName}` : ''}
            {filename && <span className="block truncate type-caption mt-0.5">{filename}</span>}
          </p>
          <button type="button" onClick={share} className="btn-brand-secondary shrink-0 !min-h-[40px] !px-4 !bg-[var(--color-surface)]">
            {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Link2 className="w-4 h-4" aria-hidden="true" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>

        <div>
          <h1 className="type-hero !text-[clamp(2rem,8vw,3.5rem)]">
            {kept ? 'You kept' : 'You overspent by'}{' '}
            <span className={kept ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>{money(Math.abs(a.kept))}</span>
          </h1>
          <p className="mt-2 type-lead !text-[1rem] sm:!text-[1.125rem]">
            {kept
              ? `You received ${money(a.totalIn)} and spent ${money(a.totalOut)}.`
              : `You spent ${money(a.totalOut)} but only received ${money(a.totalIn)}.`}
          </p>
        </div>

        {a.totalIn > 0 && (
          <div className="space-y-2">
            <SegmentedBar
              label={`Spent ${Math.round(spentShare * 100)}% of money in`}
              className="h-3"
              segments={[
                { key: 'spent', share: spentShare, color: 'var(--color-ink)' },
                { key: 'kept', share: 1 - spentShare, color: 'var(--color-success)' },
              ]}
            />
            <p className="flex flex-wrap gap-x-5 gap-y-1 type-caption">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-ink)]" aria-hidden="true" />
                Spent {Math.round(spentShare * 100)}%
              </span>
              {kept && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
                  Kept {Math.round((1 - spentShare) * 100)}%
                </span>
              )}
            </p>
          </div>
        )}
      </header>

      {/* Key numbers */}
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
        {stats.map((s) => (
          <div key={s.label} className="border-t border-[var(--color-border)] pt-3">
            <dt className="type-caption !text-[13px]">{s.label}</dt>
            <dd className="mt-1 text-[1.5rem] sm:text-[1.75rem] font-semibold tracking-tight tabular-nums text-[var(--color-ink)] leading-tight">
              {s.value}
            </dd>
            <dd className="type-caption">{s.note}</dd>
          </div>
        ))}
      </dl>

      {/* Tabs */}
      <div id="report-tabs" className="scroll-mt-20 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
        <div role="tablist" aria-label="Report sections" className="inline-flex min-w-full sm:min-w-0 p-1 rounded-full bg-[var(--color-surface-subtle)] gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 sm:flex-none min-h-[44px] px-4 sm:px-6 rounded-full text-[14px] sm:text-[15px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                tab === t.id
                  ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {a.transactions.length === 0 ? (
        <p className="rounded-2xl bg-[var(--color-surface-subtle)] p-6 type-body">
          No transactions with an amount were found in this document, so there is nothing to analyze. Check that it is a bank
          statement and try again.
        </p>
      ) : (
        <div role="tabpanel">
          {tab === 'overview' && <Overview a={a} money={money} openTransactions={openTransactions} goTo={setTab} />}
          {tab === 'transactions' && (
            <TransactionsPanel key={txCategory} a={a} money={money} initialCategory={txCategory} />
          )}
          {tab === 'savings' && <Savings a={a} money={money} />}
          {tab === 'income' && <Income a={a} money={money} />}
        </div>
      )}

      <p className="type-caption pb-4">
        {a.skippedRows > 0 ? `${a.skippedRows} row${a.skippedRows === 1 ? '' : 's'} without an amount ${a.skippedRows === 1 ? 'was' : 'were'} left out. ` : ''}
        Categories are estimates based on merchant names, not financial advice.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Overview                                                                   */
/* -------------------------------------------------------------------------- */

function Overview({
  a,
  money,
  openTransactions,
  goTo,
}: {
  a: SpendingAnalysis;
  money: Money;
  openTransactions: (c: CategoryId) => void;
  goTo: (t: TabId) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? a.categories : a.categories.slice(0, 6);
  const maxShare = Math.max(0.0001, ...a.categories.map((c) => c.share));
  const fixedShare = a.totalOut > 0 ? a.fixedTotal / a.totalOut : 0;

  const insights: { label: string; value: string; text: string; action?: { label: string; run: () => void } }[] = [
    ...(a.cuttable > 0
      ? [{
          label: 'Could cut back',
          value: money(a.cuttable),
          text: `${Math.round((a.cuttable / a.totalOut) * 100)}% of your spending went on ${a.cuttableCategories.slice(0, 3).map((c) => c.label.toLowerCase()).join(', ')}.`,
          action: { label: 'See where', run: () => goTo('savings') },
        }]
      : []),
    ...(a.recurring.length > 0
      ? [{
          label: 'Repeating charges',
          value: money(a.recurringTotal),
          text: `${a.recurring.length} subscription${a.recurring.length === 1 ? '' : 's'} or monthly bill${a.recurring.length === 1 ? '' : 's'} found.`,
          action: { label: 'See each one', run: () => goTo('savings') },
        }]
      : []),
    ...(a.biggestDay
      ? [{ label: 'Biggest spending day', value: money(a.biggestDay.total), text: `On ${formatShortDate(a.biggestDay.date)}, mostly ${a.biggestDay.byCategory[0].label.toLowerCase()}.` }]
      : []),
    ...(a.largestExpense
      ? [{ label: 'Largest payment', value: money(a.largestExpense.amount), text: `${a.largestExpense.merchant}${a.largestExpense.date ? ` on ${formatShortDate(a.largestExpense.date)}` : ''}.` }]
      : []),
  ];

  return (
    <div className="space-y-10 sm:space-y-12">
      <Section title="Where your money went" hint="Tap a category to see its transactions.">
        <SegmentedBar
          label="Share of spending by category"
          className="h-4"
          segments={a.categories.map((c) => ({ key: c.id, share: c.share, color: c.color }))}
        />
        <ul className="divide-y divide-[var(--color-border)]">
          {visible.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => openTransactions(c.id)}
                className="group w-full text-left py-3.5 flex items-center gap-3 cursor-pointer"
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} aria-hidden="true" />
                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[16px] font-medium text-[var(--color-ink)] truncate group-hover:text-[var(--color-brand-dark)]">
                      {c.label}
                    </span>
                    <span className="shrink-0 text-[16px] font-semibold tabular-nums text-[var(--color-ink)]">{money(c.total)}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="block h-1.5 flex-1 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden">
                      <span className="block h-full rounded-full" style={{ width: `${(c.share / maxShare) * 100}%`, background: c.color }} />
                    </span>
                    <span className="type-caption w-24 text-right tabular-nums">
                      {Math.round(c.share * 100)}% · {c.count}×
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {a.categories.length > 6 && (
          <button type="button" onClick={() => setShowAll((v) => !v)} className="link inline-flex items-center gap-1 text-[15px] cursor-pointer">
            {showAll ? 'Show fewer' : `Show all ${a.categories.length} categories`}
            <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        )}
      </Section>

      <Section title="Spending over time" hint="Tap or drag across the bars to see a day.">
        <SpendingTimeline days={a.days} currency={a.currency} />
      </Section>

      {insights.length > 0 && (
        <Section title="Good to know">
          <ul className="grid gap-3 sm:grid-cols-2">
            {insights.map((i) => (
              <li key={i.label} className="rounded-2xl border border-[var(--color-border)] p-4 sm:p-5 flex flex-col gap-1">
                <p className="type-caption !text-[13px]">{i.label}</p>
                <p className="text-[1.5rem] font-semibold tracking-tight tabular-nums text-[var(--color-ink)]">{i.value}</p>
                <p className="type-body !text-[15px] flex-1">{i.text}</p>
                {i.action && (
                  <button type="button" onClick={i.action.run} className="link mt-2 self-start inline-flex items-center gap-1 text-[15px] cursor-pointer">
                    {i.action.label} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {a.fixedTotal > 0 && (
        <Section title="Fixed vs flexible" hint="Fixed costs repeat every month, like rent, bills and subscriptions. Flexible spending is the rest.">
          <SegmentedBar
            label={`${Math.round(fixedShare * 100)}% fixed, ${Math.round((1 - fixedShare) * 100)}% flexible`}
            className="h-4"
            segments={[
              { key: 'fixed', share: fixedShare, color: 'var(--color-chart-5)' },
              { key: 'flex', share: 1 - fixedShare, color: 'var(--color-chart-6)' },
            ]}
          />
          <p className="flex flex-wrap gap-x-6 gap-y-1 text-[15px] text-[var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-chart-5)' }} aria-hidden="true" />
              Fixed <b className="font-semibold text-[var(--color-ink)] tabular-nums">{money(a.fixedTotal)}</b>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-chart-6)' }} aria-hidden="true" />
              Flexible <b className="font-semibold text-[var(--color-ink)] tabular-nums">{money(a.flexibleTotal)}</b>
            </span>
          </p>
        </Section>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Savings                                                                    */
/* -------------------------------------------------------------------------- */

function RankedRow({ name, meta, value, share, color }: { name: string; meta: string; value: string; share: number; color: string }) {
  return (
    <li className="py-3 space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-[16px] font-medium text-[var(--color-ink)] truncate">{name}</span>
          <span className="block type-caption">{meta}</span>
        </span>
        <span className="shrink-0 text-[16px] font-semibold tabular-nums text-[var(--color-ink)]">{value}</span>
      </div>
      <span className="block h-1.5 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden">
        <span className="block h-full rounded-full" style={{ width: `${Math.max(2, share * 100)}%`, background: color }} />
      </span>
    </li>
  );
}

function Savings({ a, money }: { a: SpendingAnalysis; money: Money }) {
  const maxCut = Math.max(1, ...a.cuttableCategories.map((c) => c.total));
  const maxMerchant = Math.max(1, ...a.topMerchants.map((m) => m.total));

  return (
    <div className="space-y-10 sm:space-y-12">
      <Section
        title="Where you could cut back"
        hint={a.cuttable > 0 ? `${money(a.cuttable)} went on flexible things. Cutting a little here is the easiest way to save more.` : 'No flexible spending found.'}
      >
        {a.cuttableCategories.length > 0 && (
          <ul className="divide-y divide-[var(--color-border)]">
            {a.cuttableCategories.map((c) => (
              <RankedRow key={c.id} name={c.label} meta={`${c.count} payment${c.count === 1 ? '' : 's'}`} value={money(c.total)} share={c.total / maxCut} color={c.color} />
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Subscriptions and monthly bills"
        hint={a.recurring.length ? `${a.recurring.length} found, ${money(a.recurringTotal)} in total.` : 'No repeating charges were found.'}
      >
        {a.recurring.length > 0 && (
          <ul className="divide-y divide-[var(--color-border)]">
            {a.recurring.map((r) => (
              <li key={r.merchant} className="py-3 flex items-center justify-between gap-4">
                <span className="min-w-0">
                  <span className="block text-[16px] font-medium text-[var(--color-ink)] truncate">{r.merchant}</span>
                  <span className="block type-caption">
                    {r.count} charge{r.count === 1 ? '' : 's'} · about {money(r.amount, true)} each
                  </span>
                </span>
                <span className="shrink-0 text-[16px] font-semibold tabular-nums text-[var(--color-ink)]">{money(r.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Where you spend the most" hint="Your top merchants, biggest first.">
        <ul className="divide-y divide-[var(--color-border)]">
          {a.topMerchants.map((m) => (
            <RankedRow
              key={m.merchant}
              name={m.merchant}
              meta={`${CATEGORIES[m.category].label} · ${m.count} payment${m.count === 1 ? '' : 's'}`}
              value={money(m.total)}
              share={m.total / maxMerchant}
              color={CATEGORIES[m.category].color}
            />
          ))}
        </ul>
      </Section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Income                                                                     */
/* -------------------------------------------------------------------------- */

function Income({ a, money }: { a: SpendingAnalysis; money: Money }) {
  const max = Math.max(1, ...a.incomeSources.map((s) => s.total));
  const summary: [string, string][] = [
    ['Money in', money(a.totalIn)],
    ['Money out', money(a.totalOut)],
    [a.kept >= 0 ? 'Kept' : 'Overspent', money(Math.abs(a.kept))],
    ['Savings rate', a.savingsRate === null ? '–' : `${Math.round(a.savingsRate * 100)}%`],
    ['Fixed costs', money(a.fixedTotal)],
  ];

  return (
    <div className="space-y-10 sm:space-y-12">
      <Section title="Where your money came from" hint={a.incomeSources.length ? `${money(a.totalIn)} came in. Biggest sources first.` : 'No deposits were found in this statement.'}>
        {a.incomeSources.length > 0 && (
          <ul className="divide-y divide-[var(--color-border)]">
            {a.incomeSources.map((s) => (
              <RankedRow key={s.merchant} name={s.merchant} meta={`${s.count} deposit${s.count === 1 ? '' : 's'}`} value={money(s.total)} share={s.total / max} color="var(--color-success)" />
            ))}
          </ul>
        )}
      </Section>

      <Section title="What happened to it">
        <dl className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {summary.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3.5 text-[16px]">
              <dt className="text-[var(--color-text-secondary)]">{k}</dt>
              <dd className="font-semibold tabular-nums text-[var(--color-ink)]">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Transactions                                                               */
/* -------------------------------------------------------------------------- */

type Direction = 'all' | 'in' | 'out';
type SortKey = 'date' | 'amount' | 'merchant';

function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const FIELD =
  'w-full min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[16px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)]';

function TransactionsPanel({ a, money, initialCategory }: { a: SpendingAnalysis; money: Money; initialCategory: CategoryId | 'all' }) {
  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState<Direction>('all');
  const [category, setCategory] = useState<CategoryId | 'all'>(initialCategory);
  const [sort, setSort] = useState<SortKey>('date');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const categoryCounts = useMemo(() => {
    const map = new Map<CategoryId, number>();
    for (const t of a.transactions) map.set(t.category, (map.get(t.category) ?? 0) + 1);
    return [...map.entries()].sort((x, y) => y[1] - x[1]);
  }, [a.transactions]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = a.transactions.filter((t) => {
      if (direction !== 'all' && t.direction !== direction) return false;
      if (category !== 'all' && t.category !== category) return false;
      if (!q) return true;
      return (
        t.description.toLowerCase().includes(q) ||
        t.merchant.toLowerCase().includes(q) ||
        CATEGORIES[t.category].label.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      );
    });
    const sorted = [...filtered];
    if (sort === 'amount') sorted.sort((x, y) => y.amount - x.amount);
    else if (sort === 'merchant') sorted.sort((x, y) => x.merchant.localeCompare(y.merchant));
    else sorted.sort((x, y) => (x.date ?? '').localeCompare(y.date ?? '') || x.id - y.id);
    return sorted;
  }, [a.transactions, query, direction, category, sort]);

  const shownIn = rows.filter((t) => t.direction === 'in').reduce((n, t) => n + t.amount, 0);
  const shownOut = rows.filter((t) => t.direction === 'out').reduce((n, t) => n + t.amount, 0);

  const exportCsv = () => {
    const lines = [
      ['Date', 'Description', 'Merchant', 'Category', 'Direction', 'Amount'].join(','),
      ...rows.map((t) =>
        [t.date ?? t.rawDate, t.description, t.merchant, CATEGORIES[t.category].label, t.direction === 'in' ? 'In' : 'Out', t.amount]
          .map(csvEscape)
          .join(',')
      ),
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transactions-analysis.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setLimit(PAGE_SIZE);
  };

  return (
    <div className="space-y-5">
      <label className="relative block">
        <span className="sr-only">Search transactions</span>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => change(setQuery)(e.target.value)}
          placeholder="Search shop, category or amount"
          className={`${FIELD} pl-11`}
        />
      </label>

      <div className="grid grid-cols-3 p-1 rounded-full bg-[var(--color-surface-subtle)] gap-1" role="group" aria-label="Show">
        {([['all', 'All'], ['in', 'Money in'], ['out', 'Money out']] as [Direction, string][]).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={direction === id}
            onClick={() => change(setDirection)(id)}
            className={`min-h-[40px] rounded-full text-[14px] sm:text-[15px] font-medium cursor-pointer transition-colors ${
              direction === id ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto] gap-3">
        <label className="relative block">
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(e) => change(setCategory)(e.target.value as CategoryId | 'all')}
            className={`${FIELD} appearance-none pr-10 cursor-pointer`}
          >
            <option value="all">All categories</option>
            {categoryCounts.map(([id, n]) => (
              <option key={id} value={id}>
                {CATEGORIES[id].label} ({n})
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" aria-hidden="true" />
        </label>
        <label className="relative block">
          <span className="sr-only">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={`${FIELD} appearance-none pr-10 cursor-pointer`}>
            <option value="date">Sort: Date</option>
            <option value="amount">Sort: Biggest amount</option>
            <option value="merchant">Sort: Name A–Z</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" aria-hidden="true" />
        </label>
        <button type="button" onClick={exportCsv} className="btn-brand-secondary col-span-2 sm:col-span-1 !min-h-[48px] !rounded-xl">
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Export CSV</span>
        </button>
      </div>

      <p className="type-caption !text-[14px]" aria-live="polite">
        {rows.length} transaction{rows.length === 1 ? '' : 's'}
        {shownOut > 0 && <> · out <b className="font-semibold text-[var(--color-ink)] tabular-nums">{money(shownOut)}</b></>}
        {shownIn > 0 && <> · in <b className="font-semibold text-[var(--color-success)] tabular-nums">{money(shownIn)}</b></>}
      </p>

      {rows.length === 0 ? (
        <p className="py-12 text-center type-body">No transactions match your filters.</p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {rows.slice(0, limit).map((t) => (
            <TxRow key={t.id} t={t} money={money} />
          ))}
        </ul>
      )}

      {rows.length > limit && (
        <div className="text-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE_SIZE)} className="btn-brand-secondary">
            Show {Math.min(PAGE_SIZE, rows.length - limit)} more
          </button>
        </div>
      )}
    </div>
  );
}

function TxRow({ t, money }: { t: ParsedTransaction; money: Money }) {
  const isIn = t.direction === 'in';
  const color = isIn ? 'var(--color-success)' : CATEGORIES[t.category].color;
  return (
    <li className="flex items-center gap-3 sm:gap-4 py-3.5">
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-semibold shrink-0 bg-[var(--color-surface-subtle)] text-[var(--color-ink)]"
        aria-hidden="true"
      >
        {t.merchant.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 min-w-0">
          <span className="truncate text-[16px] font-medium text-[var(--color-ink)]">{t.merchant}</span>
          {t.recurring && <span className={`${CHIP} shrink-0 bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]`}>Repeats</span>}
        </p>
        <p className="flex items-center gap-1.5 type-caption !text-[13px] min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} aria-hidden="true" />
          <span className="truncate">
            {CATEGORIES[t.category].label} · {t.date ? formatShortDate(t.date) : t.rawDate || 'No date'}
          </span>
        </p>
      </div>
      <p className={`shrink-0 text-[16px] font-semibold tabular-nums ${isIn ? 'text-[var(--color-success)]' : 'text-[var(--color-ink)]'}`}>
        {isIn ? '+' : '−'}
        {money(t.amount, true)}
      </p>
    </li>
  );
}
