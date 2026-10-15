'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { AdminStats } from '@/types/ocr';

interface AdminMetricsGridProps {
  stats: AdminStats | null;
  isLoading?: boolean;
  /** Jumps the jobs table to a status filter when a job-count tile is clicked. */
  onSelectStatus?: (status: string) => void;
}

const CELL = 'bg-[var(--color-surface)] p-5 sm:p-6 flex flex-col min-w-0 text-left';
const CLICKABLE = `${CELL} group transition-colors hover:bg-[var(--color-surface-subtle)] cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-brand)]`;
const LABEL = 'text-[13px] text-[var(--color-text-muted)]';
const VALUE = 'mt-2 text-[32px] leading-none font-semibold tracking-tight tabular-nums text-[var(--color-ink)]';
const UNIT = 'ml-1.5 text-[15px] font-normal tracking-normal text-[var(--color-text-muted)]';
const FOOTNOTE = 'mt-3 text-[13px] text-[var(--color-text-secondary)] tabular-nums';

function TileLabel({ children, clickable }: { children: React.ReactNode; clickable?: boolean }) {
  return (
    <span className="flex items-center justify-between gap-2">
      <span className={LABEL}>{children}</span>
      {clickable && (
        <ChevronRight
          className="h-4 w-4 text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        />
      )}
    </span>
  );
}

export default function AdminMetricsGrid({ stats, isLoading, onSelectStatus }: AdminMetricsGridProps) {
  if (isLoading && !stats) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)]"
        aria-busy="true"
        aria-label="Loading system metrics"
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${CELL} gap-3`}>
            <div className="skeleton-line h-3.5 w-28" />
            <div className="skeleton-line h-8 w-24" />
            <div className="skeleton-line h-3.5 w-40" />
          </div>
        ))}
      </div>
    );
  }

  const totalJobs = stats?.total_jobs || 0;
  const completedJobs = stats?.completed_jobs || 0;
  const processingJobs = stats?.processing_jobs || 0;
  const queuedJobs = stats?.queued_jobs || 0;
  const failedJobs = stats?.failed_jobs || 0;
  const cancelledJobs = stats?.cancelled_jobs || 0;
  const totalPages = stats?.total_pages_processed || 0;
  const avgSeconds = stats?.average_processing_time_ms ? (stats.average_processing_time_ms / 1000).toFixed(1) : null;
  // Success rate over finished jobs only, so in-flight work doesn't drag it down.
  const finishedJobs = completedJobs + failedJobs;
  const successRate = finishedJobs > 0 ? ((completedJobs / finishedJobs) * 100).toFixed(1) : null;

  const select = (status: string) => onSelectStatus?.(status);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)]">
      {/* Pages processed */}
      <div className={CELL}>
        <TileLabel>Pages processed</TileLabel>
        <p className={VALUE}>
          {totalPages.toLocaleString()}
          <span className={UNIT}>pages</span>
        </p>
        <p className={FOOTNOTE}>{avgSeconds ? `${avgSeconds}s average per document` : 'No timing data yet'}</p>
      </div>

      {/* In flight */}
      <button type="button" className={CLICKABLE} onClick={() => select('processing')} aria-label={`In flight: ${processingJobs} processing, ${queuedJobs} queued. Show processing jobs.`}>
        <TileLabel clickable>In flight</TileLabel>
        <span className={VALUE}>
          {processingJobs.toLocaleString()}
          <span className={UNIT}>processing</span>
        </span>
        <span className={FOOTNOTE}>
          <span className={queuedJobs > 0 ? 'text-[var(--color-warning)]' : undefined}>{queuedJobs.toLocaleString()} queued</span>
          <span className="mx-1.5 text-[var(--color-text-muted)]" aria-hidden="true">·</span>
          {stats?.worker_health?.active_workers ?? '—'} workers
        </span>
      </button>

      {/* Success rate */}
      <button type="button" className={CLICKABLE} onClick={() => select('completed')} aria-label={`Success rate ${successRate ?? 'not available'}. Show completed jobs.`}>
        <TileLabel clickable>Success rate</TileLabel>
        <span className={VALUE}>
          {successRate ?? '—'}
          {successRate && <span className={UNIT}>%</span>}
        </span>
        <span className={FOOTNOTE}>
          {completedJobs.toLocaleString()} of {totalJobs.toLocaleString()} jobs completed
        </span>
      </button>

      {/* Failed */}
      <button type="button" className={CLICKABLE} onClick={() => select('failed')} aria-label={`${failedJobs} failed jobs. Show failed jobs.`}>
        <TileLabel clickable>Failed</TileLabel>
        <span className={`${VALUE} ${failedJobs > 0 ? '!text-[var(--color-danger)]' : ''}`}>
          {failedJobs.toLocaleString()}
          <span className={UNIT}>jobs</span>
        </span>
        <span className={FOOTNOTE}>
          {(stats?.retry_count_total || 0).toLocaleString()} retries · {cancelledJobs.toLocaleString()} cancelled
        </span>
      </button>
    </div>
  );
}
