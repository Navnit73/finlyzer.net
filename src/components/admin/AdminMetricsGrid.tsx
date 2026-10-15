'use client';

import React from 'react';
import { AdminStats } from '@/types/ocr';

interface AdminMetricsGridProps {
  stats: AdminStats | null;
  isLoading?: boolean;
}

const CELL = 'bg-[var(--color-surface)] p-5 sm:p-6 flex flex-col min-w-0';
const LABEL = 'text-[13px] text-[var(--color-text-muted)]';
const VALUE = 'mt-2 text-[32px] leading-none font-semibold tracking-tight tabular-nums text-[var(--color-ink)]';
const UNIT = 'ml-1.5 text-[15px] font-normal tracking-normal text-[var(--color-text-muted)]';
const FOOTNOTE = 'mt-3 text-[13px] text-[var(--color-text-secondary)] tabular-nums';

/** Formats an optional percentage; renders an em dash when the backend did not report it. */
function formatPercent(value: number | undefined | null): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(1) : '—';
}

export default function AdminMetricsGrid({ stats, isLoading }: AdminMetricsGridProps) {
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
  const totalPages = stats?.total_pages_processed || 0;
  const avgProcessingTime = stats?.average_processing_time_ms
    ? (stats.average_processing_time_ms / 1000).toFixed(1)
    : '—';
  const successRate = totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : '100.0';
  const health = stats?.worker_health;
  const servicesOnline = health ? health.redis_connected !== false && health.mongodb_connected !== false : null;

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)]">
      {/* 1. Total pages processed */}
      <div className={CELL}>
        <dt className="flex items-center justify-between gap-2">
          <span className={LABEL}>Total pages processed</span>
          <span className="text-[12px] text-[var(--color-text-muted)]">All time</span>
        </dt>
        <dd className={VALUE}>
          {totalPages.toLocaleString()}
          <span className={UNIT}>pages</span>
        </dd>
        <dd className={FOOTNOTE}>Avg processing time: {avgProcessingTime}s / doc</dd>
      </div>

      {/* 2. Active jobs & in-flight queue */}
      <div className={CELL}>
        <dt className="flex items-center justify-between gap-2">
          <span className={LABEL}>Active worker tasks</span>
          <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
            Live
          </span>
        </dt>
        <dd className={VALUE}>
          {processingJobs.toLocaleString()}
          <span className={UNIT}>processing</span>
        </dd>
        <dd className={FOOTNOTE}>
          <span className="text-[var(--color-ink)]">{queuedJobs.toLocaleString()}</span> queued
          <span className="mx-1.5 text-[var(--color-text-muted)]" aria-hidden="true">·</span>
          Worker pool: {health?.active_workers ?? '—'} threads running
        </dd>
      </div>

      {/* 3. Success & completion rate */}
      <div className={CELL}>
        <dt className="flex items-center justify-between gap-2">
          <span className={LABEL}>Completed documents</span>
          <span className="text-[12px] tabular-nums text-[var(--color-text-secondary)]">{successRate}% success</span>
        </dt>
        <dd className={VALUE}>
          {completedJobs.toLocaleString()}
          <span className={UNIT}>/ {totalJobs.toLocaleString()}</span>
        </dd>
        <dd className={FOOTNOTE}>
          Failed count:{' '}
          <span className={failedJobs > 0 ? 'text-[var(--color-danger)]' : undefined}>{failedJobs.toLocaleString()}</span>{' '}
          ({(stats?.retry_count_total || 0).toLocaleString()} retried)
        </dd>
      </div>

      {/* 4. Worker CPU & memory health */}
      <div className={CELL}>
        <dt className="flex items-center justify-between gap-2">
          <span className={LABEL}>Worker telemetry</span>
          <span className="truncate text-[12px] text-[var(--color-text-muted)]">
            {health?.mode || 'Async Worker Pool'}
          </span>
        </dt>
        <dd className={VALUE}>
          {formatPercent(health?.cpu_percent)}%<span className={UNIT}>CPU</span>
        </dd>
        <dd className={`${FOOTNOTE} flex flex-wrap items-center gap-x-1.5`}>
          <span>
            <span className="text-[var(--color-ink)]">{formatPercent(health?.memory_percent)}%</span> RAM
          </span>
          <span className="text-[var(--color-text-muted)]" aria-hidden="true">·</span>
          <span
            className={
              servicesOnline === false ? 'text-[var(--color-danger)]' : servicesOnline ? 'text-[var(--color-success)]' : undefined
            }
          >
            {servicesOnline === false ? 'Redis / MongoDB degraded' : 'Redis & MongoDB online'}
          </span>
        </dd>
      </div>
    </dl>
  );
}
