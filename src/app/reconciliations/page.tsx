'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ChevronRight, GitCompareArrows, RefreshCw, XCircle } from 'lucide-react';
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

function StatusCell({ item }: { item: ListItem }) {
  if (item.status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-danger)]" title={item.error || undefined}>
        <XCircle className="w-4 h-4" aria-hidden="true" /> Failed
      </span>
    );
  }
  if (item.status !== 'completed' || !item.summary) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)]">
        <span className="loading loading-spinner loading-xs" aria-hidden="true" /> Processing
      </span>
    );
  }
  const issues = item.summary.unmatched_bank + item.summary.unmatched_ledger + item.summary.amount_mismatches;
  return issues === 0 ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-success)]">
      <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> All matched
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-warning)]">
      <AlertTriangle className="w-4 h-4" aria-hidden="true" /> {issues} to review
    </span>
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
    <div className="w-full space-y-8 pb-16">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[var(--color-surface-subtle)] text-[var(--color-ink)] border border-[var(--color-border)]">
          <GitCompareArrows className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Bank Reconciliation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight">Reconcile a bank statement</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Upload a bank statement and your ledger or cash book. Pages are taken from your credits when the report is ready.
        </p>
      </div>

      <ReconciliationUploader layout="split" />

      <section aria-labelledby="vault-title" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="vault-title" className="text-lg font-black text-[var(--color-ink)]">
            Your reconciliations {total > 0 && <span className="text-[var(--color-text-muted)] font-bold">({total})</span>}
          </h2>
          <button
            type="button"
            onClick={fetchList}
            className="btn-brand-secondary !min-h-[36px] !h-[36px] !px-3 text-xs font-bold rounded-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          {error ? (
            <p role="alert" className="p-6 text-sm text-center text-[var(--color-danger)]">{error}</p>
          ) : isLoading && items.length === 0 ? (
            <div className="p-10 flex justify-center" aria-busy="true">
              <span className="loading loading-spinner loading-md text-[var(--color-text-muted)]" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center space-y-1">
              <p className="text-sm font-bold text-[var(--color-ink)]">No reconciliations yet</p>
              <p className="text-sm text-[var(--color-text-secondary)]">Add a bank statement and a ledger above to run your first one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)]">
                  <tr className="text-left text-xs font-semibold text-[var(--color-text-secondary)]">
                    <th scope="col" className="py-3 px-4">Files</th>
                    <th scope="col" className="py-3 px-4">Date</th>
                    <th scope="col" className="py-3 px-4 text-right">Pages</th>
                    <th scope="col" className="py-3 px-4 text-right">Matched</th>
                    <th scope="col" className="py-3 px-4 text-right">Bank only</th>
                    <th scope="col" className="py-3 px-4 text-right">Ledger only</th>
                    <th scope="col" className="py-3 px-4">Status</th>
                    <th scope="col" className="py-3 px-4"><span className="sr-only">Open</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {items.map((item) => (
                    <tr key={item.reconciliation_id} className="hover:bg-[var(--color-surface-subtle)] transition-colors">
                      <td className="py-3 px-4 max-w-[22rem]">
                        <Link href={`/reconciliation/${item.reconciliation_id}`} className="block min-w-0">
                          <span className="block font-semibold text-[var(--color-ink)] truncate" title={item.bank_filename}>{item.bank_filename}</span>
                          <span className="block text-xs text-[var(--color-text-secondary)] truncate" title={item.ledger_filename}>vs {item.ledger_filename}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[var(--color-text-secondary)]">
                        {new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">{item.pages}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{item.summary?.matched ?? '—'}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{item.summary?.unmatched_bank ?? '—'}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{item.summary?.unmatched_ledger ?? '—'}</td>
                      <td className="py-3 px-4 whitespace-nowrap"><StatusCell item={item} /></td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/reconciliation/${item.reconciliation_id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-ink)] hover:underline underline-offset-4"
                        >
                          Open <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pageCount > 1 && (
            <div className="p-3 border-t border-[var(--color-border)] flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Page {page} of {pageCount}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || isLoading} className="btn-brand-secondary !min-h-[32px] !h-[32px] !px-3 text-xs disabled:opacity-40">
                  Previous
                </button>
                <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= pageCount || isLoading} className="btn-brand-secondary !min-h-[32px] !h-[32px] !px-3 text-xs disabled:opacity-40">
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
