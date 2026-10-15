'use client';

import React from 'react';
import { Search, RotateCw, Eye, FileSpreadsheet, XCircle, FileText, AlertCircle } from 'lucide-react';
import { AdminStats, OCRJob } from '@/types/ocr';

/** Time only for today's jobs; otherwise date + time so older rows aren't ambiguous. */
function formatCreated(iso: string): string {
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  return isToday
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_BADGE: Record<OCRJob['status'], string> = {
  completed: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  processing: 'bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]',
  queued: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
  failed: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  cancelled: 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]',
};

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]';

const ICON_BUTTON = `inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] cursor-pointer disabled:cursor-wait disabled:opacity-40 ${FOCUS_RING}`;

const TOOL_BUTTON = `inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-subtle)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${FOCUS_RING}`;

const TH = 'sticky top-0 z-10 bg-[var(--color-surface)] px-4 py-2.5 text-[13px] font-normal text-[var(--color-text-muted)] whitespace-nowrap shadow-[inset_0_-1px_0_var(--color-border)]';

interface AdminJobsTableProps {
  jobs: OCRJob[];
  total: number;
  stats?: AdminStats | null;
  page: number;
  pageSize: number;
  activeStatus: string;
  searchQuery: string;
  isLoading: boolean;
  hasError?: boolean;
  busyJobIds?: Set<string>;
  onPageChange: (page: number) => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  onInspectJob: (job: OCRJob) => void;
  onCancelJob: (jobId: string) => void;
  onRetryJob: (jobId: string) => void;
  onRefresh: () => void;
}

export default function AdminJobsTable({
  jobs,
  total,
  stats,
  page,
  pageSize,
  activeStatus,
  searchQuery,
  isLoading,
  hasError = false,
  busyJobIds,
  onPageChange,
  onStatusChange,
  onSearchChange,
  onInspectJob,
  onCancelJob,
  onRetryJob,
  onRefresh,
}: AdminJobsTableProps) {
  const totalPages = Math.ceil(total / pageSize) || 1;

  const STATUS_TABS: { id: string; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: stats?.total_jobs },
    { id: 'processing', label: 'Processing', count: stats?.processing_jobs },
    { id: 'queued', label: 'Queued', count: stats?.queued_jobs },
    { id: 'completed', label: 'Completed', count: stats?.completed_jobs },
    { id: 'failed', label: 'Failed', count: stats?.failed_jobs },
    { id: 'cancelled', label: 'Cancelled', count: stats?.cancelled_jobs },
  ];

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="card-surface overflow-hidden">
      {/* Toolbar */}
      <div className="space-y-4 border-b border-[var(--color-border)] p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-[13px] text-[var(--color-text-muted)]" aria-live="polite">
            {isLoading ? (
              'Loading jobs…'
            ) : (
              <>
                <span className="tabular-nums text-[var(--color-ink)]">{total.toLocaleString()}</span>{' '}
                {total === 1 ? 'job' : 'jobs'}
                {activeStatus !== 'all' && ` · ${activeStatus}`}
                {searchQuery && ` matching “${searchQuery}”`}
              </>
            )}
          </p>
        </div>

        {/* Status filter & search */}
        <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
          <div className="-mx-1 overflow-x-auto px-1">
            <div
              role="group"
              aria-label="Job status filters"
              className="inline-flex items-center gap-0.5 rounded-lg bg-[var(--color-surface-subtle)] p-0.5"
            >
              {STATUS_TABS.map((tab) => {
                const isActive = activeStatus === tab.id;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => onStatusChange(tab.id)}
                    aria-pressed={isActive}
                    className={`h-7 whitespace-nowrap rounded-md px-3 text-[13px] transition-colors cursor-pointer ${FOCUS_RING} ${
                      isActive
                        ? 'bg-[var(--color-surface)] font-medium text-[var(--color-ink)] ring-1 ring-[var(--color-border)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    {tab.label}
                    {typeof tab.count === 'number' && (
                      <span
                        className={`ml-1.5 tabular-nums ${
                          tab.id === 'failed' && tab.count > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'
                        }`}
                      >
                        {tab.count.toLocaleString()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by job ID, document ID, filename…"
              aria-label="Search by Job ID, Document ID, or Filename"
              className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border-hover)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-soft)]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[70vh] overflow-auto" aria-busy={isLoading}>
        <table className="w-full min-w-[920px] border-collapse text-left text-sm" aria-label="Background jobs">
          <thead>
            <tr>
              <th scope="col" className={`${TH} pl-4 sm:pl-5`}>Job &amp; document ID</th>
              <th scope="col" className={TH}>Filename</th>
              <th scope="col" className={`${TH} text-right`}>Pages</th>
              <th scope="col" className={TH}>Status &amp; progress</th>
              <th scope="col" className={TH}>Stage / pipeline</th>
              <th scope="col" className={`${TH} text-right`}>Created at</th>
              <th scope="col" className={`${TH} pr-4 text-right sm:pr-5`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {isLoading && jobs.length === 0 ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} aria-hidden="true">
                    <td className="py-4 pl-4 pr-4 sm:pl-5"><div className="skeleton-line h-3.5 w-32" /></td>
                    <td className="p-4"><div className="skeleton-line h-3.5 w-40" /></td>
                    <td className="p-4"><div className="skeleton-line ml-auto h-3.5 w-8" /></td>
                    <td className="p-4"><div className="skeleton-line h-5 w-20 rounded-full" /></td>
                    <td className="p-4"><div className="skeleton-line h-3.5 w-24" /></td>
                    <td className="p-4"><div className="skeleton-line ml-auto h-3.5 w-16" /></td>
                    <td className="py-4 pl-4 pr-4 sm:pr-5"><div className="skeleton-line ml-auto h-3.5 w-12" /></td>
                  </tr>
                ))}
                <tr className="sr-only">
                  <td colSpan={7}>Loading background jobs...</td>
                </tr>
              </>
            ) : hasError && jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
                    <AlertCircle className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="text-[15px] font-semibold text-[var(--color-ink)]">Couldn’t load jobs</p>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">The jobs API didn’t respond. It will retry automatically.</p>
                  <button type="button" onClick={onRefresh} className={`${TOOL_BUTTON} mt-4`}>
                    <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                    Try now
                  </button>
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="text-[15px] font-semibold text-[var(--color-ink)]">No jobs match</p>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">Try a different status or search term.</p>
                  {(activeStatus !== 'all' || searchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        onStatusChange('all');
                        onSearchChange('');
                      }}
                      className={`${TOOL_BUTTON} mt-4`}
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const isCompleted = job.status === 'completed';
                const isProcessing = job.status === 'processing';
                const isFailed = job.status === 'failed';
                const docId = job.document_id || job.result?.id;
                const filename = job.metadata?.filename;
                const pages = job.total_pages || job.result?.metadata?.pages;
                const isBusy = busyJobIds?.has(job.job_id) ?? false;

                return (
                  <tr
                    key={job.job_id}
                    onClick={() => onInspectJob(job)}
                    className={`align-top transition-colors hover:bg-[var(--color-surface-subtle)] cursor-pointer ${isBusy ? 'opacity-60' : ''}`}
                  >
                    {/* Job ID */}
                    <th scope="row" className="py-3 pl-4 pr-4 text-left font-normal sm:pl-5">
                      <p className="max-w-[180px] truncate font-mono text-[12px] text-[var(--color-text-secondary)]" title={job.job_id}>
                        {job.job_id}
                      </p>
                      {job.document_id && (
                        <p className="max-w-[180px] truncate font-mono text-[12px] text-[var(--color-text-muted)]" title={job.document_id}>
                          Doc: {job.document_id}
                        </p>
                      )}
                    </th>

                    {/* Filename */}
                    <td className="px-4 py-3">
                      {filename ? (
                        <p className="max-w-[220px] truncate text-[var(--color-ink)]" title={filename}>
                          {filename}
                        </p>
                      ) : (
                        <p className="text-[var(--color-text-muted)]">—</p>
                      )}
                    </td>

                    {/* Pages */}
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--color-ink)]">
                      {pages ?? '—'}
                    </td>

                    {/* Status & progress */}
                    <td className="px-4 py-3">
                      <div className="max-w-[160px] space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-medium capitalize ${
                              STATUS_BADGE[job.status] ?? STATUS_BADGE.cancelled
                            }`}
                          >
                            {job.status}
                          </span>
                          {isProcessing && (
                            <span className="text-[12px] tabular-nums text-[var(--color-text-secondary)]">{job.progress}%</span>
                          )}
                        </div>

                        {isProcessing && (
                          <div
                            role="progressbar"
                            aria-valuenow={job.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Progress for job ${job.job_id}`}
                            className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]"
                          >
                            <div
                              className="h-full rounded-full bg-[var(--color-brand)] transition-[width] duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Pipeline stage */}
                    <td className="px-4 py-3">
                      <p className="text-[13px] text-[var(--color-text-secondary)]">
                        {job.current_stage ? job.current_stage.replace(/_/g, ' ') : '—'}
                      </p>
                      {job.processed_pages !== undefined && job.total_pages ? (
                        <p className="text-[12px] tabular-nums text-[var(--color-text-muted)]">
                          {job.processed_pages} / {job.total_pages} extracted
                        </p>
                      ) : null}
                    </td>

                    {/* Created at */}
                    <td className="whitespace-nowrap px-4 py-3 text-right text-[13px] tabular-nums text-[var(--color-text-muted)]">
                      <time dateTime={job.created_at} title={new Date(job.created_at).toLocaleString()}>
                        {formatCreated(job.created_at)}
                      </time>
                    </td>

                    {/* Actions */}
                    <td className="py-2 pl-4 pr-3 text-right sm:pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        {isBusy && (
                          <span className="loading loading-spinner mr-1 h-3.5 w-3.5 text-[var(--color-text-muted)]" aria-label="Working" />
                        )}
                        <button
                          type="button"
                          onClick={() => onInspectJob(job)}
                          className={ICON_BUTTON}
                          title="Inspect JSON & metadata"
                          aria-label={`Inspect job ${job.job_id}`}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>

                        {isProcessing && (
                          <button
                            type="button"
                            onClick={() => onCancelJob(job.job_id)}
                            disabled={isBusy}
                            className={`${ICON_BUTTON} text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]`}
                            title="Cancel job"
                            aria-label={`Cancel job ${job.job_id}`}
                          >
                            <XCircle className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}

                        {isFailed && (
                          <button
                            type="button"
                            onClick={() => onRetryJob(job.job_id)}
                            disabled={isBusy}
                            className={`${ICON_BUTTON} text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-dark)]`}
                            title="Retry job"
                            aria-label={`Retry job ${job.job_id}`}
                          >
                            <RotateCw className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}

                        {isCompleted && docId && (
                          <a
                            href={`/api/export/download/${docId}?format=xlsx`}
                            className={ICON_BUTTON}
                            title="Download Excel"
                            aria-label={`Download Excel export for job ${job.job_id}`}
                          >
                            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <nav
          aria-label="Jobs pagination"
          className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-3 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <p className="tabular-nums text-[var(--color-text-muted)]">
            Showing {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} of {total.toLocaleString()} · Page{' '}
            <span className="text-[var(--color-ink)]">{page}</span> of{' '}
            <span className="text-[var(--color-ink)]">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
              className={TOOL_BUTTON}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
              className={TOOL_BUTTON}
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
