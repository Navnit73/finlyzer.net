'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  RotateCw,
  Activity,
  Layers,
  Sparkles,
  Cpu,
  Server,
  Download,
  CheckCircle2,
} from 'lucide-react';
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

  return (
    <div className="space-y-8 pb-12">
      {/* SuperAdmin Top Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-on-brand)] shadow-xs">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight">
              SuperAdmin System &amp; Worker Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
            Real database metrics, background Celery &amp; async worker pool health, live Redis/MongoDB telemetry, and global SSE event stream.
          </p>
        </div>

        {/* Live Status & Refresh Button */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-[var(--color-ink)]">
              Refreshed: {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <button
            onClick={handleRefreshAll}
            disabled={isLoadingStats || isLoadingJobs}
            className="btn btn-brand-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isLoadingStats || isLoadingJobs ? 'animate-spin' : ''}`} />
            <span>Sync Live Data</span>
          </button>
        </div>
      </div>

      {/* 1. Core KPIs Metric Cards */}
      <AdminMetricsGrid stats={stats} isLoading={isLoadingStats} />

      {/* 2. Worker Infrastructure & Resource Telemetry */}
      <AdminWorkerTelemetry stats={stats} />

      {/* 3. Global Real-time SSE Event Stream (Terminal Console) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[var(--color-ink)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--color-brand-hover)]" />
            <span>Global Operations Event Stream</span>
          </h3>
          <span className="text-xs text-[var(--color-text-muted)] font-medium">
            Live Server-Sent Events pushed from FastAPI worker node
          </span>
        </div>
        <AdminLiveEventStream />
      </div>

      {/* 4. Background Jobs Table & Management */}
      <div className="space-y-3">
        <h3 className="text-base font-black text-[var(--color-ink)] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--media-violet)]" />
          <span>System Job Registry &amp; Queue Management</span>
        </h3>
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
      </div>

      {/* 5. Job JSON Inspection Modal */}
      <AdminJobInspectModal
        job={selectedInspectJob}
        isOpen={!!selectedInspectJob}
        onClose={() => setSelectedInspectJob(null)}
        onRetry={handleRetryJob}
      />
    </div>
  );
}
