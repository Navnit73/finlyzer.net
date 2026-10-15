'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Lock,
  XCircle,
} from 'lucide-react';
import ReconciliationUnlockModal from './ReconciliationUnlockModal';
import { downloadReconciliationReport, reconciliationHeaders } from '@/lib/reconciliation-client';
import { APP_RECONCILIATIONS } from '@/lib/routes';
import { FREE_PAGE_LIMIT } from '@/types/pricing';
import type {
  CheckStatus,
  DocumentBalanceCheck,
  DuplicateItem,
  MatchedItem,
  MismatchItem,
  ReconciliationCategory,
  ReconciliationStatusResponse,
  ReconciliationTransactionsResponse,
  ReconItem,
  ReconTransaction,
  UnmatchedItem,
} from '@/types/reconciliation';

const PAGE_SIZE = 50;

const CATEGORY_TABS: { key: ReconciliationCategory; label: string; summaryKey: keyof NonNullable<ReconciliationStatusResponse['result']>['summary'] }[] = [
  { key: 'matched', label: 'Matched', summaryKey: 'matched' },
  { key: 'unmatched_bank', label: 'Only on bank statement', summaryKey: 'unmatched_bank' },
  { key: 'unmatched_ledger', label: 'Only in ledger', summaryKey: 'unmatched_ledger' },
  { key: 'amount_mismatches', label: 'Amount / direction mismatches', summaryKey: 'amount_mismatches' },
  { key: 'possible_duplicates', label: 'Possible duplicates', summaryKey: 'possible_duplicates' },
];

/** Adds thousands separators to a decimal string without converting it to a float. */
function money(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const negative = value.startsWith('-');
  const [int, frac] = value.replace(/^[-+]/, '').split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '−' : ''}${grouped}${frac !== undefined ? `.${frac}` : ''}`;
}

function StatusPill({ status }: { status: CheckStatus | undefined }) {
  if (status === 'passed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success-border)]">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Passed
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger-border)]">
        <XCircle className="w-3.5 h-3.5" aria-hidden="true" /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
      <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" /> Unverifiable
    </span>
  );
}

function BalanceCard({ title, check }: { title: string; check: DocumentBalanceCheck | undefined }) {
  if (!check) return null;
  const opening = check.bank_opening_balance ?? check.opening_balance;
  const closing = check.bank_closing_balance ?? check.closing_balance;
  const rows: [string, string | null | undefined][] = [
    ['Opening balance', opening],
    ['Closing balance', closing],
    ['Calculated closing', check.calculated_closing_balance],
    ['Difference', check.difference],
  ];
  return (
    <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-[var(--color-ink)]">{title}</h3>
        <StatusPill status={check.status} />
      </div>
      <dl className="space-y-1.5 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-[var(--color-text-secondary)]">{label}</dt>
            <dd className="font-mono tabular-nums text-[var(--color-ink)]">{money(value)}</dd>
          </div>
        ))}
        {check.running_balance && (
          <div className="flex justify-between gap-3 pt-2 border-t border-[var(--color-border)]">
            <dt className="text-[var(--color-text-secondary)]">Running balance</dt>
            <dd className="text-[var(--color-ink)]">
              {check.running_balance.status === 'unverifiable'
                ? 'Not shown in document'
                : check.running_balance.breaks_count === 0
                  ? `${check.running_balance.checked} rows, no breaks`
                  : `${check.running_balance.breaks_count} break${check.running_balance.breaks_count === 1 ? '' : 's'}`}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function TxnCell({ txn }: { txn: ReconTransaction }) {
  return (
    <div className="min-w-0">
      <p className="font-medium text-[var(--color-ink)] truncate max-w-[18rem]" title={txn.description || ''}>
        {txn.description || '—'}
      </p>
      <p className="text-xs text-[var(--color-text-muted)] font-mono">
        {txn.id} · {txn.date || txn.original_date || 'no date'}
        {txn.reference ? ` · ${txn.reference}` : ''}
      </p>
    </div>
  );
}

const flowAmount = (txn: ReconTransaction) => `${txn.flow === 'out' ? '−' : '+'}${money(txn.amount)}`;

const th = 'py-2.5 px-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] whitespace-nowrap';
const td = 'py-2.5 px-3 align-top';

function ItemsTable({ category, items }: { category: ReconciliationCategory; items: ReconItem[] }) {
  if (category === 'matched') {
    return (
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)]">
          <tr>
            <th scope="col" className={th}>Bank statement</th>
            <th scope="col" className={th}>Ledger</th>
            <th scope="col" className={`${th} text-right`}>Amount</th>
            <th scope="col" className={th}>Matched on</th>
            <th scope="col" className={th}>Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {(items as MatchedItem[]).map((m) => (
            <tr key={`${m.bank_transaction.id}-${m.ledger_transaction.id}`}>
              <td className={td}><TxnCell txn={m.bank_transaction} /></td>
              <td className={td}><TxnCell txn={m.ledger_transaction} /></td>
              <td className={`${td} text-right font-mono tabular-nums whitespace-nowrap`}>{flowAmount(m.bank_transaction)}</td>
              <td className={`${td} text-xs text-[var(--color-text-secondary)]`}>{m.match_basis.join(', ').replace(/_/g, ' ')}</td>
              <td className={`${td} capitalize`}>{m.confidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (category === 'unmatched_bank' || category === 'unmatched_ledger') {
    return (
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)]">
          <tr>
            <th scope="col" className={th}>Transaction</th>
            <th scope="col" className={`${th} text-right`}>Amount</th>
            <th scope="col" className={th}>Why it is unmatched</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {(items as UnmatchedItem[]).map((u) => (
            <tr key={u.id}>
              <td className={td}><TxnCell txn={u} /></td>
              <td className={`${td} text-right font-mono tabular-nums whitespace-nowrap`}>{flowAmount(u)}</td>
              <td className={`${td} text-[var(--color-text-secondary)]`}>{u.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (category === 'amount_mismatches') {
    return (
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)]">
          <tr>
            <th scope="col" className={th}>Bank statement</th>
            <th scope="col" className={th}>Ledger</th>
            <th scope="col" className={`${th} text-right`}>Bank</th>
            <th scope="col" className={`${th} text-right`}>Ledger</th>
            <th scope="col" className={`${th} text-right`}>Difference</th>
            <th scope="col" className={th}>Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {(items as MismatchItem[]).map((m) => (
            <tr key={`${m.bank_transaction.id}-${m.ledger_transaction.id}`}>
              <td className={td}><TxnCell txn={m.bank_transaction} /></td>
              <td className={td}><TxnCell txn={m.ledger_transaction} /></td>
              <td className={`${td} text-right font-mono tabular-nums whitespace-nowrap`}>{money(m.bank_amount)}</td>
              <td className={`${td} text-right font-mono tabular-nums whitespace-nowrap`}>{money(m.ledger_amount)}</td>
              <td className={`${td} text-right font-mono tabular-nums whitespace-nowrap font-bold`}>{money(m.difference)}</td>
              <td className={`${td} text-[var(--color-text-secondary)]`}>{m.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <table className="w-full min-w-[640px] text-sm">
      <thead className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)]">
        <tr>
          <th scope="col" className={th}>Source</th>
          <th scope="col" className={th}>Entries</th>
          <th scope="col" className={`${th} text-right`}>Amount</th>
          <th scope="col" className={th}>Reason</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--color-border)]">
        {(items as DuplicateItem[]).map((d) => (
          <tr key={d.transaction_ids.join('-')}>
            <td className={`${td} capitalize`}>{d.source}</td>
            <td className={td}>
              {d.transactions[0] ? <TxnCell txn={d.transactions[0]} /> : null}
              <p className="text-xs text-[var(--color-text-muted)] font-mono">{d.count}× · {d.transaction_ids.join(', ')}</p>
            </td>
            <td className={`${td} text-right font-mono tabular-nums whitespace-nowrap`}>
              {d.transactions[0] ? flowAmount(d.transactions[0]) : '—'}
            </td>
            <td className={`${td} text-[var(--color-text-secondary)]`}>{d.reason}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CategoryDetails({
  id,
  category,
  total,
  locked,
  onUnlock,
}: {
  id: string;
  category: ReconciliationCategory;
  total: number;
  locked: boolean;
  onUnlock: () => void;
}) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ReconciliationTransactionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetch(`/api/reconciliation/${id}/transactions?status=${category}&page=${page}&page_size=${PAGE_SIZE}`, {
      headers: reconciliationHeaders(id),
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Could not load transactions.');
        if (!cancelled) setData(body);
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, category, page, locked]);

  if (total === 0) {
    return <p className="p-6 text-sm text-[var(--color-text-secondary)] text-center">Nothing in this category.</p>;
  }
  if (error) {
    return <p role="alert" className="p-6 text-sm text-[var(--color-danger)] text-center">{error}</p>;
  }
  if (!data) {
    return (
      <div className="p-8 flex justify-center" aria-busy="true">
        <span className="loading loading-spinner loading-md text-[var(--color-text-muted)]" />
      </div>
    );
  }

  const pageCount = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const hiddenRows = data.total - data.transactions.length;

  return (
    <div className={isLoading ? 'opacity-60 transition-opacity' : ''}>
      <div className="overflow-x-auto">
        <ItemsTable category={category} items={data.transactions} />
      </div>
      {data.locked && hiddenRows > 0 ? (
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)] flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="flex-1 flex items-center gap-2 text-sm text-[var(--color-ink)]">
            <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
            {hiddenRows} more row{hiddenRows === 1 ? '' : 's'} in this category.
          </p>
          <button type="button" onClick={onUnlock} className="btn-brand-primary">
            Unlock full report
          </button>
        </div>
      ) : (
        pageCount > 1 && (
          <div className="p-3 border-t border-[var(--color-border)] flex items-center justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">
              Page {page} of {pageCount} · {data.total} items
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1 || isLoading}
                className="p-2 rounded-lg hover:bg-[var(--color-surface-subtle)] disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pageCount || isLoading}
                className="p-2 rounded-lg hover:bg-[var(--color-surface-subtle)] disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

/** Live status and report for one reconciliation: polls until done, then shows the results. */
export default function ReconciliationReport({ id }: { id: string }) {
  const { status: sessionStatus } = useSession();
  const isSignedIn = sessionStatus === 'authenticated';
  // Signed-in users start new runs from the app page; guests from the public tool page.
  const startUrl = isSignedIn ? APP_RECONCILIATIONS : '/reconcile/bank-reconciliation-tool';
  const [data, setData] = useState<ReconciliationStatusResponse | null>(null);
  const [loadError, setLoadError] = useState<{ message: string; status: number } | null>(null);
  const [activeTab, setActiveTab] = useState<ReconciliationCategory>('unmatched_bank');
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [downloading, setDownloading] = useState<'xlsx' | 'csv' | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Returns 'retry' for temporary failures (service busy or briefly down) so polling continues.
  const load = useCallback(async (): Promise<ReconciliationStatusResponse | 'retry' | null> => {
    const res = await fetch(`/api/reconciliation/${id}`, { headers: reconciliationHeaders(id), cache: 'no-store' });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      if ([429, 502, 503, 504].includes(res.status)) return 'retry';
      setLoadError({ message: body.error || 'Could not load this reconciliation.', status: res.status });
      return null;
    }
    setData(body);
    return body;
  }, [id]);

  // Poll every 2.5 s for the first 30 s, then every 5 s (large scanned PDFs can take minutes).
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const startedAt = Date.now();
    const tick = async () => {
      try {
        const body = await load();
        if (cancelled || !body) return;
        if (body !== 'retry' && (body.status === 'completed' || body.status === 'failed')) return;
      } catch {
        // Network blip: keep polling.
      }
      if (!cancelled) timer = setTimeout(tick, Date.now() - startedAt < 30_000 ? 2500 : 5000);
    };
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [load]);

  // Open the first non-empty problem category once, when the report first arrives.
  const summary = data?.result?.summary;
  const tabChosen = useRef(false);
  useEffect(() => {
    if (!summary || tabChosen.current) return;
    tabChosen.current = true;
    const first = CATEGORY_TABS.find((t) => t.key !== 'matched' && Number(summary[t.summaryKey]) > 0);
    setActiveTab(first?.key ?? 'matched');
  }, [summary]);

  const download = async (format: 'xlsx' | 'csv') => {
    if (data?.access.locked) {
      setIsUnlockOpen(true);
      return;
    }
    setDownloading(format);
    setDownloadError(null);
    try {
      await downloadReconciliationReport(id, format);
    } catch (e) {
      setDownloadError((e as Error).message);
    } finally {
      setDownloading(null);
    }
  };

  if (loadError) {
    const notFound = loadError.status === 404;
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-[var(--color-text-muted)]" aria-hidden="true" />
        <h1 className="text-2xl font-extrabold text-[var(--color-ink)]">
          {notFound ? 'Reconciliation not found' : loadError.status === 410 ? 'This reconciliation has expired' : 'Something went wrong'}
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          {notFound
            ? 'Guest reports open only in the browser that uploaded them. If you signed in, make sure you use the same account.'
            : loadError.message}
        </p>
        <Link href={startUrl} className="btn-brand-primary">
          Start a new reconciliation
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-24 flex justify-center" aria-busy="true">
        <span className="loading loading-spinner loading-lg text-[var(--color-text-muted)]" />
      </div>
    );
  }

  const { access } = data;
  const fileLine = `${access.bank_filename} vs ${access.ledger_filename}`;

  if (data.status === 'failed' || (data.status === 'completed' && !data.result)) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <XCircle className="w-10 h-10 mx-auto text-[var(--color-danger)]" aria-hidden="true" />
        <h1 className="text-2xl font-extrabold text-[var(--color-ink)]">The reconciliation could not be completed</h1>
        <p className="text-sm text-[var(--color-text-muted)] break-words">{fileLine}</p>
        <p className="p-4 rounded-lg bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] text-sm text-[var(--color-danger)]">
          {data.error || 'Unknown error.'}
        </p>
        <Link href={startUrl} className="btn-brand-primary">
          Try again with different files
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  if (data.status !== 'completed' || !data.result) {
    return (
      <div className="max-w-xl mx-auto py-16 space-y-6" aria-live="polite">
        <div className="text-center space-y-2">
          <span className="loading loading-spinner loading-lg text-[var(--media-violet)]" aria-hidden="true" />
          <h1 className="text-2xl font-extrabold text-[var(--color-ink)]">Reconciling your documents…</h1>
          <p className="text-sm text-[var(--color-text-muted)] break-words">{fileLine}</p>
        </div>
        <div className="space-y-2">
          <div className="h-3 rounded-full bg-[var(--color-surface-muted)] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.progress}>
            <div className="h-full bg-[var(--color-brand)] transition-all duration-500" style={{ width: `${Math.max(4, data.progress)}%` }} />
          </div>
          <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
            <span>{data.message}</span>
            <span className="tabular-nums">{data.progress}%</span>
          </div>
        </div>
        <p className="text-sm text-center text-[var(--color-text-secondary)]">
          Spreadsheets finish in seconds. Long scanned PDFs can take a few minutes; keep this page open or come back to this link later.
        </p>
      </div>
    );
  }

  const { result } = data;
  const s = result.summary;
  const bookToBank = result.balance_check.book_to_bank;
  const issues = s.unmatched_bank + s.unmatched_ledger + s.amount_mismatches;

  return (
    <div className="space-y-8 sm:space-y-10">
      {isSignedIn && !access.is_guest && (
        <Link
          href={APP_RECONCILIATIONS}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          All reconciliations
        </Link>
      )}

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <span className="feature-badge">
            {issues === 0 ? <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> : <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>{issues === 0 ? 'Every transaction matched' : `${issues} item${issues === 1 ? '' : 's'} to review`}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-ink)]">Reconciliation report</h1>
          <p className="text-sm text-[var(--color-text-secondary)] break-words">
            {fileLine}
            {s.currency ? ` · ${s.currency}` : ''} · ±{s.date_tolerance_days} day{s.date_tolerance_days === 1 ? '' : 's'} date tolerance
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['xlsx', 'csv'] as const).map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => download(format)}
              disabled={downloading !== null}
              className={format === 'xlsx' ? 'btn-brand-primary' : 'btn-brand-secondary'}
            >
              {downloading === format ? (
                <span className="loading loading-spinner loading-sm" aria-hidden="true" />
              ) : access.locked ? (
                <Lock className="w-4 h-4" aria-hidden="true" />
              ) : format === 'xlsx' ? (
                <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Download className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{format === 'xlsx' ? 'Download Excel' : 'Download CSV'}</span>
            </button>
          ))}
        </div>
      </header>

      {downloadError && (
        <p role="alert" className="p-3 rounded-lg bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] text-sm text-[var(--color-danger)]">
          {downloadError}
        </p>
      )}

      {access.locked && (
        <div className="p-4 sm:p-5 rounded-xl border-2 border-[var(--color-brand)] bg-[var(--color-brand-soft)] flex flex-col sm:flex-row sm:items-center gap-3">
          <Lock className="w-5 h-5 shrink-0 text-[var(--color-ink)]" aria-hidden="true" />
          <p className="flex-1 text-sm text-[var(--color-ink)]">
            <strong>Preview:</strong> these {access.pages} pages are over the {FREE_PAGE_LIMIT}-page free limit. The summary and balance checks are free; unlock to see
            every transaction and download the report.
          </p>
          <button type="button" onClick={() => setIsUnlockOpen(true)} className="btn-brand-dark shrink-0">
            Unlock full report
          </button>
        </div>
      )}

      <section aria-label="Summary">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORY_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setActiveTab(t.key);
                document.getElementById('recon-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-left p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand)] transition-colors"
            >
              <span className="block text-xs font-semibold text-[var(--color-text-secondary)]">{t.label}</span>
              <span className="block mt-1 text-3xl font-extrabold tabular-nums text-[var(--color-ink)]">{Number(s[t.summaryKey])}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          {s.bank_transactions} bank transactions and {s.ledger_transactions} ledger transactions read.
          {s.ledger_direction_convention === 'book' && ' The ledger records deposits as debits (book convention), so its directions were flipped before matching.'}
        </p>
      </section>

      <section aria-labelledby="balance-title" className="space-y-4">
        <h2 id="balance-title" className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">Balance checks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <BalanceCard title="Bank statement" check={result.balance_check} />
          <BalanceCard title="Ledger" check={result.balance_check.ledger} />
          {bookToBank && (
            <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-[var(--color-ink)]">Book to bank</h3>
                <StatusPill status={bookToBank.status} />
              </div>
              <dl className="space-y-1.5 text-sm">
                {(
                  [
                    ['Closing balance gap', bookToBank.closing_balance_difference],
                    ['Opening balance gap', bookToBank.opening_balance_difference],
                    ['Explained by items found', bookToBank.explained_by_discrepancies],
                    ['Unexplained difference', bookToBank.unexplained_difference],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-[var(--color-text-secondary)]">{label}</dt>
                    <dd className="font-mono tabular-nums text-[var(--color-ink)]">{money(value)}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-[var(--color-text-muted)]">
                An unexplained difference of zero means the unmatched items and mismatches fully account for the gap between the two balances.
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="recon-details" aria-labelledby="details-title" className="space-y-4 scroll-mt-24">
        <h2 id="details-title" className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">Transactions</h2>
        <div role="tablist" aria-label="Transaction categories" className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={activeTab === t.key}
              onClick={() => setActiveTab(t.key)}
              className={`shrink-0 px-4 min-h-[40px] rounded-full text-sm font-semibold border transition-colors ${
                activeTab === t.key
                  ? 'bg-[var(--color-ink)] text-[var(--color-on-dark)] border-[var(--color-ink)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-ink)] border-[var(--color-border)] hover:border-[var(--color-ink)]'
              }`}
            >
              {t.label} <span className="tabular-nums opacity-70">{Number(s[t.summaryKey])}</span>
            </button>
          ))}
        </div>
        <div role="tabpanel" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <CategoryDetails
            key={activeTab}
            id={id}
            category={activeTab}
            total={Number(s[CATEGORY_TABS.find((t) => t.key === activeTab)!.summaryKey])}
            locked={access.locked}
            onUnlock={() => setIsUnlockOpen(true)}
          />
        </div>
      </section>

      {(result.warnings.length > 0 || s.amount_corrections > 0) && (
        <section aria-labelledby="warnings-title" className="intro-panel space-y-3">
          <h2 id="warnings-title" className="text-xl font-extrabold text-[var(--color-ink)]">Notes and warnings</h2>
          <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] list-disc pl-5">
            {result.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          {result.amount_corrections.length > 0 && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              {s.amount_corrections} OCR amount{s.amount_corrections === 1 ? ' was' : 's were'} corrected from the printed text; the downloaded
              report lists each one on the Amount Corrections sheet.
            </p>
          )}
        </section>
      )}

      {access.is_guest && access.expires_at && (
        <p className="text-xs text-[var(--color-text-muted)]">
          Guest report: deleted automatically on {new Date(access.expires_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}. Download it if you need
          to keep it.
        </p>
      )}

      <ReconciliationUnlockModal
        isOpen={isUnlockOpen}
        onClose={() => setIsUnlockOpen(false)}
        reconciliationId={id}
        pages={access.pages}
        onUnlocked={() => {
          setIsUnlockOpen(false);
          load();
        }}
      />
    </div>
  );
}
