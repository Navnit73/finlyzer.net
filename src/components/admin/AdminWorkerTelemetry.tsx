'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { AdminStats } from '@/types/ocr';

interface AdminWorkerTelemetryProps {
  stats: AdminStats | null;
  isLoading?: boolean;
}

/** "3m ago" style label; falls back to the date for anything older than a day. */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff)) return '';
  const s = Math.max(0, Math.round(diff / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function formatUptime(seconds?: number): string {
  if (!seconds) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

type ServiceState = 'up' | 'down' | 'unknown';

function toState(flag: boolean | undefined): ServiceState {
  if (flag === true) return 'up';
  if (flag === false) return 'down';
  return 'unknown';
}

const STATE_STYLES: Record<ServiceState, { dot: string; text: string }> = {
  up: { dot: 'bg-[var(--color-success)]', text: 'text-[var(--color-success)]' },
  down: { dot: 'bg-[var(--color-danger)]', text: 'text-[var(--color-danger)]' },
  unknown: { dot: 'bg-[var(--color-border-hover)]', text: 'text-[var(--color-text-muted)]' },
};

function ServiceRow({
  name,
  description,
  state,
  upLabel,
}: {
  name: string;
  description: string;
  state: ServiceState;
  upLabel: string;
}) {
  const style = STATE_STYLES[state];
  const label = state === 'up' ? upLabel : state === 'down' ? 'Disconnected' : 'Unknown';
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--color-ink)]">{name}</p>
        <p className="truncate text-[13px] text-[var(--color-text-muted)]">{description}</p>
      </div>
      <span className={`flex shrink-0 items-center gap-1.5 text-[13px] ${style.text}`}>
        <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden="true" />
        <span>{label}</span>
      </span>
    </li>
  );
}

function UsageMeter({ label, value }: { label: string; value: number | null }) {
  const pct = value === null ? 0 : Math.min(100, Math.max(0, value));
  const isHigh = value !== null && value > 80;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        <span className={`tabular-nums font-medium ${isHigh ? 'text-[var(--color-danger)]' : 'text-[var(--color-ink)]'}`}>
          {value === null ? '—' : `${value.toFixed(1)}%`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            isHigh ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-brand)]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const PANEL = 'card-surface p-5 sm:p-6 flex flex-col min-w-0';
const PANEL_HEADER = 'flex items-baseline justify-between gap-3 pb-3 border-b border-[var(--color-border)]';
const PANEL_TITLE = 'text-[15px] font-semibold text-[var(--color-ink)]';
const PANEL_META = 'text-[13px] text-[var(--color-text-muted)] tabular-nums';

export default function AdminWorkerTelemetry({ stats, isLoading }: AdminWorkerTelemetryProps) {
  const health = stats?.worker_health;
  const recentErrors = stats?.recent_errors || [];

  const cpuPercent = typeof health?.cpu_percent === 'number' ? health.cpu_percent : null;
  const memoryPercent = typeof health?.memory_percent === 'number' ? health.memory_percent : null;

  const mongoState = toState(health?.mongodb_connected);
  const redisState = toState(health?.redis_connected);
  const workerState: ServiceState = !health ? 'unknown' : (health.active_workers ?? 0) > 0 ? 'up' : 'down';
  const states = [mongoState, redisState, workerState];
  const summary = states.includes('down')
    ? { label: 'Degraded', className: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]' }
    : states.every((s) => s === 'up')
    ? { label: 'All operational', className: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' }
    : { label: isLoading ? 'Checking' : 'Unknown', className: 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]' };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
      {/* 1. Infrastructure services connectivity */}
      <section className={PANEL} aria-labelledby="telemetry-services-heading">
        <div className={PANEL_HEADER}>
          <h3 id="telemetry-services-heading" className={PANEL_TITLE}>Services</h3>
          <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${summary.className}`}>
            {summary.label}
          </span>
        </div>

        <ul className="divide-y divide-[var(--color-border-subtle)]">
          <ServiceRow
            name="MongoDB"
            description="Jobs, extractions & orders"
            state={mongoState}
            upLabel="Connected"
          />
          <ServiceRow
            name="Redis"
            description="Task queue & event pub/sub"
            state={redisState}
            upLabel="Connected"
          />
          <ServiceRow
            name="OCR workers"
            description={health?.mode ? `${health.active_workers ?? 0} active · ${health.mode}` : `${health?.active_workers ?? '—'} active`}
            state={workerState}
            upLabel="Active"
          />
        </ul>
      </section>

      {/* 2. Worker resources */}
      <section className={PANEL} aria-labelledby="telemetry-load-heading">
        <div className={PANEL_HEADER}>
          <h3 id="telemetry-load-heading" className={PANEL_TITLE}>Worker load</h3>
          <span className={PANEL_META}>Up {formatUptime(health?.uptime_seconds)}</span>
        </div>

        <div className="space-y-5 pt-4">
          <UsageMeter label="CPU" value={cpuPercent} />
          <UsageMeter label="Memory" value={memoryPercent} />
        </div>

        <dl className="mt-5 flex items-baseline justify-between gap-4 border-t border-[var(--color-border)] pt-4">
          <dt className="text-[13px] text-[var(--color-text-muted)]">Queue depth</dt>
          <dd className="text-sm font-medium tabular-nums text-[var(--color-ink)]">
            {typeof health?.queue_size === 'number' ? `${health.queue_size.toLocaleString()} tasks` : '—'}
          </dd>
        </dl>
      </section>

      {/* 3. Recent exceptions */}
      <section className={PANEL} aria-labelledby="telemetry-errors-heading">
        <div className={PANEL_HEADER}>
          <h3 id="telemetry-errors-heading" className={PANEL_TITLE}>Recent errors</h3>
          {recentErrors.length > 0 && <span className={PANEL_META}>{recentErrors.length}</span>}
        </div>

        {recentErrors.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-[13px] text-[var(--color-text-secondary)]">No recent worker errors.</p>
          </div>
        ) : (
          <ul className="max-h-[220px] divide-y divide-[var(--color-border-subtle)] overflow-y-auto">
            {recentErrors.map((err, idx) => (
              <li key={`${err.job_id}-${idx}`} className="space-y-1 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-danger)]" aria-hidden="true" />
                    <span className="truncate font-mono text-[12px] text-[var(--color-text-secondary)]">{err.job_id}</span>
                  </span>
                  <time
                    className="shrink-0 text-[12px] tabular-nums text-[var(--color-text-muted)]"
                    dateTime={err.timestamp}
                    title={new Date(err.timestamp).toLocaleString()}
                  >
                    {timeAgo(err.timestamp)}
                  </time>
                </div>
                <p className="line-clamp-2 break-words pl-3.5 text-[13px] text-[var(--color-ink)]" title={err.error}>
                  {err.error}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
