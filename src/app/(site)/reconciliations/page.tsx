'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, AlertTriangle, BookOpen, CheckCircle2, ChevronRight, GitCompareArrows, Landmark, RefreshCw, XCircle } from 'lucide-react';
import ReconciliationUploader from '@/components/reconciliation/ReconciliationUploader';

interface ListItem {
  reconciliation_id: string;
  bank_filename: string;
  ledger_filename: string;
  pages: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  summary: {
    currency: string | null;
    matched: number;
    unmatched_bank: number;
    unmatched_ledger: number;
    amount_mismatches: number;
    possible_duplicates: number;
    balance_status: string | null;
  } | null;
  error: string | null;
  created_at: string;
}

const PAGE_SIZE = 20;

const badge = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap';

function StatusCell({ item }: { item: ListItem }) {
  if (item.status === 'failed') {
    return (
      <span className={`${badge} bg-[var(--color-danger-soft)] text-[var(--color-danger)]`} title={item.error || undefined}>
        <XCircle className="w-3.5 h-3.5" aria-hidden="true" /> Failed
      </span>
    );
  }
  if (item.status !== 'completed' || !item.summary) {
    return (
      <span className={`${badge} bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]`}>
        <span className="loading loading-spinner w-3 h-3" aria-hidden="true" /> Processing
      </span>
    );
  }
  const issues = item.summary.unmatched_bank + item.summary.unmatched_ledger + item.summary.amount_mismatches;
  return issues === 0 ? (
    <span className={`${badge} bg-[var(--color-success-soft)] text-[var(--color-success)]`}>
      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> All matched
    </span>
  ) : (
    <span className={`${badge} bg-[var(--color-warning-soft)] text-[var(--color-warning)]`}>
      <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> {issues} to review
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

/** Bank file over ledger file, each with its role icon; failed runs show the reason inline. */
function FilesCell({ item }: { item: ListItem }) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="flex items-center gap-2 min-w-0">
        <Landmark className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" aria-label="Bank statement" />
        <span className="font-medium text-[var(--color-ink)] truncate" title={item.bank_filename}>{item.bank_filename}</span>
      </p>
      <p className="flex items-center gap-2 min-w-0">
        <BookOpen className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" aria-label="Ledger" />
        <span className="text-[13px] text-[var(--color-text-secondary)] truncate" title={item.ledger_filename}>{item.ledger_filename}</span>
      </p>
      {item.status === 'failed' && item.error && (
        <p className="text-xs text-[var(--color-danger)] line-clamp-2">{item.error}</p>
      )}
    </div>
  );
}

/** Signed-in bank reconciliation: upload two files, and every past reconciliation on the account. */
export default function ReconciliationsPage() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollTick, setPollTick] = useState(0);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reconciliation?page=${page}&page_size=${PAGE_SIZE}`, { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Could not load your reconciliations.');
      setItems(body.reconciliations);
      setTotal(body.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Runs still in progress are refreshed through their status endpoint, which also records the
  // outcome, then the list is reloaded.
  const pendingIds = items.filter((i) => i.status === 'queued' || i.status === 'processing').map((i) => i.reconciliation_id);
  const pendingKey = pendingIds.join(',');
  useEffect(() => {
    if (!pendingKey) return;
    const timer = setTimeout(async () => {
      const ids = pendingKey.split(',').slice(0, 5);
      const results = await Promise.all(
        ids.map((id) => fetch(`/api/reconciliation/${id}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null))
      );
      if (results.some((r) => r && (r.status === 'completed' || r.status === 'failed'))) fetchList();
      else setPollTick((t) => t + 1);
    }, 5000);
    return () => clearTimeout(timer);
  }, [pendingKey, pollTick, fetchList]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="w-full space-y-8 sm:space-y-10 pb-16">
      <header className="space-y-1.5">
        <h1 className="type-title">Bank reconciliation</h1>
        <p className="text-[15px] text-[var(--color-text-secondary)] max-w-2xl">
          Upload a bank statement and your ledger or cash book. Pages are taken from your credits when the report is ready.
        </p>
      </header>

      <ReconciliationUploader variant="hero" />

      <section aria-labelledby="vault-title" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="vault-title" className="type-headline">
            Your reconciliations {total > 0 && <span className="text-[var(--color-text-muted)] font-normal tabular-nums">({total})</span>}
          </h2>
          <button
            type="button"
            onClick={fetchList}
            disabled={isLoading}
            className="btn-brand-secondary !min-h-[44px] sm:!min-h-[36px] !px-4 !text-[13px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="card-surface overflow-hidden">
          {error ? (
            <div role="alert" className="px-6 py-14 text-center space-y-3">
              <span className="mx-auto w-10 h-10 rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)] flex items-center justify-center">
                <AlertCircle className="w-5 h-5" aria-hidden="true" />
              </span>
              <p className="text-[17px] font-semibold text-[var(--color-ink)]">Couldn&apos;t load your reconciliations</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
              <button type="button" onClick={fetchList} className="btn-brand-ghost mt-2">
                Try again
              </button>
            </div>
          ) : isLoading && items.length === 0 ? (
            <div className="divide-y divide-[var(--color-border-subtle)]" aria-busy="true" aria-label="Loading reconciliations">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-6 px-4 sm:px-5 py-4">
                  <div className="flex-1 space-y-2">
                    <div className="skeleton-line h-3.5 w-1/2 sm:w-1/3" />
                    <div className="skeleton-line h-3 w-1/3 sm:w-1/4" />
                  </div>
                  <div className="skeleton-line h-3.5 w-16 hidden md:block" />
                  <div className="skeleton-line h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-14 text-center space-y-3">
              <span className="mx-auto w-12 h-12 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] flex items-center justify-center">
                <GitCompareArrows className="w-6 h-6" aria-hidden="true" />
              </span>
              <p className="text-[17px] font-semibold text-[var(--color-ink)]">No reconciliations yet</p>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto">
                Add a bank statement and a ledger above. Every report you run is saved here.
              </p>
            </div>
          ) : (
            <>
              {/* Phones and tablets: one tappable row per reconciliation, no sideways scrolling. */}
              <ul className="md:hidden divide-y divide-[var(--color-border-subtle)]">
                {items.map((item) => (
                  <li key={item.reconciliation_id}>
                    <Link
                      href={`/reconciliation/${item.reconciliation_id}`}
                      className="flex items-start gap-3 px-4 py-4 hover:bg-[var(--color-surface-subtle)] transition-colors"
                    >
                      <div className="min-w-0 flex-1 space-y-2.5">
                        <FilesCell item={item} />
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--color-text-muted)] tabular-nums">
                          <StatusCell item={item} />
                          <span>{formatDate(item.created_at)}</span>
                          <span>{item.pages} page{item.pages === 1 ? '' : 's'}</span>
                          {item.summary && <span>{item.summary.matched} matched</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
                    <tr className="text-left text-[13px] text-[var(--color-text-muted)]">
                      <th scope="col" className="py-3 px-5 font-normal">Files</th>
                      <th scope="col" className="py-3 px-4 font-normal">Date</th>
                      <th scope="col" className="py-3 px-4 font-normal text-right">Pages</th>
                      <th scope="col" className="py-3 px-4 font-normal text-right">Matched</th>
                      <th scope="col" className="py-3 px-4 font-normal text-right">Bank only</th>
                      <th scope="col" className="py-3 px-4 font-normal text-right">Ledger only</th>
                      <th scope="col" className="py-3 px-4 font-normal">Status</th>
                      <th scope="col" className="py-3 px-5 font-normal"><span className="sr-only">Open</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-subtle)]">
                    {items.map((item) => (
                      <tr key={item.reconciliation_id} className="group relative hover:bg-[var(--color-surface-subtle)] transition-colors">
                        <td className="py-3.5 px-5 max-w-[22rem]">
                          <FilesCell item={item} />
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-[var(--color-text-secondary)]">{formatDate(item.created_at)}</td>
                        <td className="py-3.5 px-4 text-right tabular-nums text-[var(--color-ink)]">{item.pages}</td>
                        <td className="py-3.5 px-4 text-right tabular-nums text-[var(--color-ink)]">{item.summary?.matched ?? '—'}</td>
                        <td className="py-3.5 px-4 text-right tabular-nums text-[var(--color-ink)]">{item.summary?.unmatched_bank ?? '—'}</td>
                        <td className="py-3.5 px-4 text-right tabular-nums text-[var(--color-ink)]">{item.summary?.unmatched_ledger ?? '—'}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap"><StatusCell item={item} /></td>
                        <td className="py-3.5 px-5 text-right">
                          {/* The link's ::after covers the row, so the whole row opens the report. */}
                          <Link
                            href={`/reconciliation/${item.reconciliation_id}`}
                            className="inline-flex items-center gap-0.5 min-h-[44px] text-[13px] font-medium text-[var(--color-brand-dark)] after:absolute after:inset-0 after:content-['']"
                            aria-label={`Open reconciliation of ${item.bank_filename}`}
                          >
                            Open <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {pageCount > 1 && (
            <div className="px-4 sm:px-5 py-2.5 border-t border-[var(--color-border)] flex items-center justify-between gap-3 text-[13px]">
              <span className="text-[var(--color-text-muted)] tabular-nums">Page {page} of {pageCount}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || isLoading} className="btn-brand-secondary !min-h-[44px] sm:!min-h-[32px] !px-4 !text-[13px]">
                  Previous
                </button>
                <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= pageCount || isLoading} className="btn-brand-secondary !min-h-[44px] sm:!min-h-[32px] !px-4 !text-[13px]">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
