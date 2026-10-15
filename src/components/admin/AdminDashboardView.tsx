'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, CheckCircle2, RotateCw, X } from 'lucide-react';
import { AdminStats, OCRJob } from '@/types/ocr';
import AdminMetricsGrid from './AdminMetricsGrid';
import AdminWorkerTelemetry from './AdminWorkerTelemetry';
import AdminLiveEventStream from './AdminLiveEventStream';
import AdminJobsTable from './AdminJobsTable';
import AdminJobInspectModal from './AdminJobInspectModal';

const STATS_INTERVAL_MS = 5000;
const JOBS_INTERVAL_MS = 4000;
const SEARCH_DEBOUNCE_MS = 300;

type Notice = { tone: 'success' | 'danger'; text: string } | null;

/** Runs `fn` on an interval, but only while the browser tab is visible; refetches on return. */
function useVisiblePolling(fn: () => void, intervalMs: number) {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer) return;
      timer = setInterval(fn, intervalMs);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        fn();
        start();
      }
    };

    fn();
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fn, intervalMs]);
}

export default function AdminDashboardView() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [jobs, setJobs] = useState<OCRJob[]>([]);
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [hasLoadedStats, setHasLoadedStats] = useState(false);
  const [hasLoadedJobs, setHasLoadedJobs] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [statsError, setStatsError] = useState(false);
  const [jobsError, setJobsError] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const [selectedInspectJob, setSelectedInspectJob] = useState<OCRJob | null>(null);
  const [busyJobIds, setBusyJobIds] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<Notice>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotice = useCallback((next: Notice) => {
    setNotice(next);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    if (next?.tone === 'success') noticeTimer.current = setTimeout(() => setNotice(null), 4000);
  }, []);

  // Debounce search so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
      setStatsError(false);
      setLastRefreshedAt(new Date());
    } catch (e) {
      console.warn('Failed to load admin stats:', e);
      setStatsError(true);
    } finally {
      setHasLoadedStats(true);
    }
  }, []);

  const jobsRequestSeq = useRef(0);
  const loadJobs = useCallback(async () => {
    const seq = ++jobsRequestSeq.current;
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/admin/jobs?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Ignore responses from a superseded filter/page.
      if (seq !== jobsRequestSeq.current) return;
      setJobs(data.items || []);
      setTotalJobsCount(data.total || 0);
      setJobsError(false);
      setHasLoadedJobs(true);
    } catch (e) {
      console.warn('Failed to load admin jobs:', e);
      if (seq !== jobsRequestSeq.current) return;
      setJobsError(true);
      setHasLoadedJobs(true);
    }
  }, [page, statusFilter, searchQuery]);

  useVisiblePolling(loadStats, STATS_INTERVAL_MS);
  useVisiblePolling(loadJobs, JOBS_INTERVAL_MS);

  // When filters change, show the table skeleton instead of stale rows from the old filter.
  useEffect(() => {
    setHasLoadedJobs(false);
  }, [page, statusFilter, searchQuery]);

  const handleRefreshAll = useCallback(async () => {
    setIsManualSyncing(true);
    await Promise.all([loadStats(), loadJobs()]);
    setIsManualSyncing(false);
  }, [loadStats, loadJobs]);

  const runJobAction = async (jobId: string, action: 'cancel' | 'retry') => {
    setBusyJobIds((prev) => new Set(prev).add(jobId));
    try {
      const res = await fetch(`/api/ocr/jobs/${jobId}/${action}`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || body?.detail || `HTTP ${res.status}`);
      }
      showNotice({ tone: 'success', text: action === 'cancel' ? 'Job cancelled.' : 'Job queued for retry.' });
      if (action === 'retry' && selectedInspectJob?.job_id === jobId) setSelectedInspectJob(null);
      await handleRefreshAll();
    } catch (e) {
      showNotice({
        tone: 'danger',
        text: `Couldn’t ${action} job ${jobId}: ${(e as Error).message || 'unknown error'}`,
      });
    } finally {
      setBusyJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  const handleCancelJob = (jobId: string) => {
    if (!window.confirm(`Cancel job ${jobId}? The user's document will stop processing.`)) return;
    runJobAction(jobId, 'cancel');
  };

  const handleRetryJob = (jobId: string) => runJobAction(jobId, 'retry');

  const isStale = statsError && !!lastRefreshedAt;
  const liveDot = !hasLoadedStats
    ? 'bg-[var(--color-border-hover)]'
    : statsError
    ? 'bg-[var(--color-danger)]'
    : 'bg-[var(--color-success)]';

  return (
    <div className="space-y-12 pb-12">
      {/* Page header */}
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="type-title">System dashboard</h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
            Job volume, worker health and the processing queue. Updates every few seconds while this tab is open.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <p className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]" aria-live="polite">
            <span className={`h-2 w-2 rounded-full ${liveDot}`} aria-hidden="true" />
            {!lastRefreshedAt ? (
              <span>{statsError ? 'Can’t reach the stats API' : 'Connecting…'}</span>
            ) : (
              <span>
                {isStale ? 'Stale since ' : 'Updated '}
                <time className="tabular-nums text-[var(--color-text-secondary)]" dateTime={lastRefreshedAt.toISOString()}>
                  {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </time>
              </span>
            )}
          </p>

          <button type="button" onClick={handleRefreshAll} disabled={isManualSyncing} className="btn-brand-secondary !min-h-9 !h-9 !px-4 !text-sm">
            <RotateCw className={`h-4 w-4 ${isManualSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Action feedback */}
      {notice && (
        <div
          role={notice.tone === 'danger' ? 'alert' : 'status'}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            notice.tone === 'danger'
              ? 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
              : 'border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-success)]'
          }`}
        >
          {notice.tone === 'danger' ? (
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="flex-1 break-words">{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-[var(--color-surface)] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <section aria-labelledby="admin-overview-heading" className="space-y-4">
        <h2 id="admin-overview-heading" className="type-headline">Overview</h2>
        <AdminMetricsGrid
          stats={stats}
          isLoading={!hasLoadedStats}
          onSelectStatus={(status) => {
            setStatusFilter(status);
            setPage(1);
            document.getElementById('admin-jobs-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />
      </section>

      <section aria-labelledby="admin-telemetry-heading" className="space-y-4">
        <h2 id="admin-telemetry-heading" className="type-headline">Worker health</h2>
        <AdminWorkerTelemetry stats={stats} isLoading={!hasLoadedStats} />
      </section>

      {/* Jobs come before the event log: it's where an admin acts. */}
      <section aria-labelledby="admin-jobs-heading" className="space-y-4 scroll-mt-24">
        <h2 id="admin-jobs-heading" className="type-headline">Jobs</h2>
        <AdminJobsTable
          jobs={jobs}
          total={totalJobsCount}
          stats={stats}
          page={page}
          pageSize={pageSize}
          activeStatus={statusFilter}
          searchQuery={searchInput}
          isLoading={!hasLoadedJobs}
          hasError={jobsError}
          busyJobIds={busyJobIds}
          onPageChange={setPage}
          onStatusChange={(status) => {
            setStatusFilter(status);
            setPage(1);
          }}
          onSearchChange={setSearchInput}
          onInspectJob={setSelectedInspectJob}
          onCancelJob={handleCancelJob}
          onRetryJob={handleRetryJob}
          onRefresh={handleRefreshAll}
        />
      </section>

      <section aria-labelledby="admin-events-heading" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="admin-events-heading" className="type-headline">Live events</h2>
          <p className="text-[13px] text-[var(--color-text-muted)]">Server-sent events from the OCR worker</p>
        </div>
        <AdminLiveEventStream />
      </section>

      <AdminJobInspectModal
        job={selectedInspectJob}
        isOpen={!!selectedInspectJob}
        onClose={() => setSelectedInspectJob(null)}
        onRetry={handleRetryJob}
      />
    </div>
  );
}
