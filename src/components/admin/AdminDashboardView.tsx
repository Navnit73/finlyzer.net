'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RotateCw } from 'lucide-react';
import { AdminStats, OCRJob } from '@/types/ocr';
import AdminMetricsGrid from './AdminMetricsGrid';
import AdminWorkerTelemetry from './AdminWorkerTelemetry';
import AdminLiveEventStream from './AdminLiveEventStream';
import AdminJobsTable from './AdminJobsTable';
import AdminJobInspectModal from './AdminJobInspectModal';

export default function AdminDashboardView() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [jobs, setJobs] = useState<OCRJob[]>([]);
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [selectedInspectJob, setSelectedInspectJob] = useState<OCRJob | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // 1. Fetch Admin Statistics
  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLastRefreshedAt(new Date());
      }
    } catch (e) {
      console.warn('Failed to load admin stats:', e);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // 2. Fetch Admin Background Jobs List
  const loadJobs = useCallback(async () => {
    try {
      setIsLoadingJobs(true);
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/admin/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.items || []);
        setTotalJobsCount(data.total || 0);
      }
    } catch (e) {
      console.warn('Failed to load admin jobs:', e);
    } finally {
      setIsLoadingJobs(false);
    }
  }, [page, pageSize, statusFilter, searchQuery]);

  // Initial load and periodic refresh
  useEffect(() => {
    loadStats();
    const statsTimer = setInterval(loadStats, 5000);
    return () => clearInterval(statsTimer);
  }, [loadStats]);

  useEffect(() => {
    loadJobs();
    const jobsTimer = setInterval(loadJobs, 4000);
    return () => clearInterval(jobsTimer);
  }, [loadJobs]);

  const handleRefreshAll = () => {
    loadStats();
    loadJobs();
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/ocr/jobs/${jobId}/cancel`, { method: 'POST' });
      if (res.ok) {
        handleRefreshAll();
      }
    } catch (e) {
      console.error('Cancel job error:', e);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/ocr/jobs/${jobId}/retry`, { method: 'POST' });
      if (res.ok) {
        handleRefreshAll();
        if (selectedInspectJob?.job_id === jobId) {
          setSelectedInspectJob(null);
        }
      }
    } catch (e) {
      console.error('Retry job error:', e);
    }
  };

  const isSyncing = isLoadingStats || isLoadingJobs;

  return (
    <div className="space-y-12 pb-12">
      {/* Page header */}
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="type-title">SuperAdmin system &amp; worker dashboard</h1>
          <p className="max-w-3xl text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
            Real database metrics, background Celery &amp; async worker pool health, live Redis/MongoDB telemetry, and global SSE event stream.
          </p>
        </div>

        {/* Live status & refresh */}
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <p className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]" aria-live="polite">
            <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
            <span>
              Refreshed{' '}
              <time className="tabular-nums text-[var(--color-text-secondary)]" dateTime={lastRefreshedAt.toISOString()}>
                {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </time>
            </span>
          </p>

          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isSyncing}
            className="btn-brand-primary"
          >
            <RotateCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Sync live data</span>
          </button>
        </div>
      </header>

      {/* 1. Core KPIs */}
      <section aria-labelledby="admin-overview-heading" className="space-y-4">
        <h2 id="admin-overview-heading" className="type-headline">Overview</h2>
        <AdminMetricsGrid stats={stats} isLoading={isLoadingStats} />
      </section>

      {/* 2. Worker infrastructure & resource telemetry */}
      <section aria-labelledby="admin-telemetry-heading" className="space-y-4">
        <h2 id="admin-telemetry-heading" className="type-headline">Worker telemetry</h2>
        <AdminWorkerTelemetry stats={stats} />
      </section>

      {/* 3. Global real-time SSE event stream */}
      <section aria-labelledby="admin-events-heading" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="admin-events-heading" className="type-headline">Global operations event stream</h2>
          <p className="text-[13px] text-[var(--color-text-muted)]">
            Live Server-Sent Events pushed from FastAPI worker node
          </p>
        </div>
        <AdminLiveEventStream />
      </section>

      {/* 4. Background jobs table & management */}
      <section aria-labelledby="admin-jobs-heading" className="space-y-4">
        <h2 id="admin-jobs-heading" className="type-headline">System job registry &amp; queue management</h2>
        <AdminJobsTable
          jobs={jobs}
          total={totalJobsCount}
          page={page}
          pageSize={pageSize}
          activeStatus={statusFilter}
          searchQuery={searchQuery}
          isLoading={isLoadingJobs}
          onPageChange={setPage}
          onStatusChange={(status) => {
            setStatusFilter(status);
            setPage(1);
          }}
          onSearchChange={(query) => {
            setSearchQuery(query);
            setPage(1);
          }}
          onInspectJob={(job) => setSelectedInspectJob(job)}
          onCancelJob={handleCancelJob}
          onRetryJob={handleRetryJob}
          onRefresh={handleRefreshAll}
        />
      </section>

      {/* 5. Job inspection modal */}
      <AdminJobInspectModal
        job={selectedInspectJob}
        isOpen={!!selectedInspectJob}
        onClose={() => setSelectedInspectJob(null)}
        onRetry={handleRetryJob}
      />
    </div>
  );
}
