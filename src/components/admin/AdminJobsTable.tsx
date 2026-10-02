'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  RotateCw,
  Eye,
  FileSpreadsheet,
  XCircle,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { OCRJob } from '@/types/ocr';

interface AdminJobsTableProps {
  jobs: OCRJob[];
  total: number;
  page: number;
  pageSize: number;
  activeStatus: string;
  searchQuery: string;
  isLoading: boolean;
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
  page,
  pageSize,
  activeStatus,
  searchQuery,
  isLoading,
  onPageChange,
  onStatusChange,
  onSearchChange,
  onInspectJob,
  onCancelJob,
  onRetryJob,
  onRefresh,
}: AdminJobsTableProps) {
  const totalPages = Math.ceil(total / pageSize) || 1;

  const STATUS_TABS = [
    { id: 'all', label: 'All Jobs' },
    { id: 'processing', label: 'Processing' },
    { id: 'queued', label: 'Queued' },
    { id: 'completed', label: 'Completed' },
    { id: 'failed', label: 'Failed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs overflow-hidden space-y-4">
      {/* Top Header & Search / Filter Controls */}
      <div className="p-5 border-b border-[var(--color-border)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-soft)] border border-[var(--color-brand)]/40 flex items-center justify-center text-[var(--color-ink)]">
              <Cpu className="w-5 h-5 text-[var(--color-brand-hover)]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[var(--color-ink)]">
                System Background Tasks &amp; Jobs
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {total} Total background jobs recorded in MongoDB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="btn btn-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)] text-xs font-bold flex items-center gap-1.5 px-3.5 shadow-none cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[var(--color-brand-hover)]' : ''}`} />
              <span>Refresh Jobs</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onStatusChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeStatus === tab.id
                    ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs border border-[var(--color-border)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Job ID, Document ID, Filename..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-ink)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)]"
            />
          </div>
        </div>
      </div>

      {/* Interactive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-5">Job &amp; Document ID</th>
              <th className="py-3 px-4">Filename &amp; Pages</th>
              <th className="py-3 px-4">Status &amp; Progress</th>
              <th className="py-3 px-4">Stage / Pipeline</th>
              <th className="py-3 px-4">Created At</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {isLoading && jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[var(--color-text-muted)]">
                  <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--color-brand-hover)]" />
                  <span>Loading background jobs...</span>
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[var(--color-text-muted)]">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-muted)] opacity-40" />
                  <span>No background jobs match the current filter.</span>
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const isCompleted = job.status === 'completed';
                const isProcessing = job.status === 'processing';
                const isQueued = job.status === 'queued';
                const isFailed = job.status === 'failed';
                const isCancelled = job.status === 'cancelled';
                const docId = job.document_id || job.result?.id;

                return (
                  <tr
                    key={job.job_id}
                    className="hover:bg-[var(--color-surface-subtle)]/70 transition-colors"
                  >
                    {/* Job ID */}
                    <td className="py-3.5 px-5">
                      <p className="font-mono font-bold text-[var(--color-ink)] truncate max-w-[140px]">
                        {job.job_id}
                      </p>
                      {job.document_id && (
                        <p className="font-mono text-[10px] text-[var(--color-text-muted)] truncate max-w-[140px]">
                          Doc: {job.document_id}
                        </p>
                      )}
                    </td>

                    {/* Filename & Pages */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[var(--color-ink)] truncate max-w-[180px]">
                        {job.metadata?.filename || 'statement.pdf'}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">
                        {job.total_pages || job.result?.metadata?.pages || 1} pages
                      </p>
                    </td>

                    {/* Status & Progress */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5 max-w-[150px]">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isProcessing
                                ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]'
                                : isQueued
                                ? 'bg-amber-100 text-amber-800'
                                : isFailed
                                ? 'bg-red-100 text-red-800'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            {job.status}
                          </span>
                          {isProcessing && (
                            <span className="font-bold text-[11px] text-[var(--color-ink)]">
                              {job.progress}%
                            </span>
                          )}
                        </div>

                        {isProcessing && (
                          <div className="w-full bg-[var(--color-surface-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--color-border)]">
                            <div
                              className="bg-[var(--color-brand)] h-full rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Pipeline Stage */}
                    <td className="py-3.5 px-4">
                      <p className="font-mono text-[11px] font-bold text-[var(--color-text-secondary)] uppercase">
                        {job.current_stage ? job.current_stage.replace(/_/g, ' ') : '—'}
                      </p>
                      {job.processed_pages !== undefined && job.total_pages ? (
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                          {job.processed_pages} / {job.total_pages} extracted
                        </p>
                      ) : null}
                    </td>

                    {/* Created At */}
                    <td className="py-3.5 px-4 text-[var(--color-text-muted)] text-[11px]">
                      {new Date(job.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onInspectJob(job)}
                          className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)] transition cursor-pointer shadow-none"
                          title="Inspect JSON & Metadata"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {isProcessing && (
                          <button
                            onClick={() => onCancelJob(job.job_id)}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                            title="Cancel Job"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isFailed && (
                          <button
                            onClick={() => onRetryJob(job.job_id)}
                            className="p-1.5 rounded-lg border border-[var(--color-brand)]/40 bg-[var(--color-brand-soft)] hover:bg-[var(--color-brand-hover)]/20 text-[var(--color-ink)] transition cursor-pointer"
                            title="Retry Job"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isCompleted && docId && (
                          <a
                            href={`/api/export/download/${docId}?format=xlsx`}
                            className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-emerald-600 transition cursor-pointer"
                            title="Download Excel"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
          <p className="text-[var(--color-text-muted)]">
            Showing Page <span className="font-bold text-[var(--color-ink)]">{page}</span> of{' '}
            <span className="font-bold text-[var(--color-ink)]">{totalPages}</span> ({total} items)
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="btn btn-xs rounded-lg border border-[var(--color-border)] disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="btn btn-xs rounded-lg border border-[var(--color-border)] disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
