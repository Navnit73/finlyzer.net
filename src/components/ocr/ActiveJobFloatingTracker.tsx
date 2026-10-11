'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  Layers,
  Activity,
  RotateCw,
} from 'lucide-react';
import { useActiveJobs, ActiveJobItem } from '@/context/ActiveJobsContext';

export default function ActiveJobFloatingTracker() {
  const router = useRouter();
  const { activeJobs, removeJob, isFloatingTrackerOpen, setIsFloatingTrackerOpen } = useActiveJobs();
  const [isMinimized, setIsMinimized] = useState(false);

  // If no jobs exist in storage, don't render anything
  if (!activeJobs || activeJobs.length === 0 || !isFloatingTrackerOpen) {
    return null;
  }

  const activeJob = activeJobs[0]; // Most recent active job
  const isCompleted = activeJob.status === 'completed';
  const isFailed = activeJob.status === 'failed';
  const isProcessing = activeJob.status === 'processing' || activeJob.status === 'queued';
  const docId = activeJob.documentId || activeJob.result?.id || activeJob.jobId;

  const handleOpenDoc = () => {
    if (docId) {
      router.push(`/document/${docId}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 select-none animate-in slide-in-from-bottom-5 duration-300">
      {isMinimized ? (
        /* Minimized Floating Pill */
        <div
          role="button"
          tabIndex={0}
          aria-label={`Expand OCR tracking for ${activeJob.filename}`}
          onClick={() => setIsMinimized(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsMinimized(false);
            }
          }}
          className="flex items-center justify-between p-3 rounded-2xl bg-[var(--color-ink)] text-white border border-zinc-700 shadow-2xl cursor-pointer hover:border-[var(--color-brand)] transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-xl bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-on-brand)] shrink-0 shadow-xs">
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-[var(--color-on-brand)]" aria-hidden="true" />
              ) : isFailed ? (
                <AlertCircle className="w-4 h-4 text-[var(--color-on-brand)]" aria-hidden="true" />
              ) : (
                <Cpu className="w-4 h-4 animate-spin text-[var(--color-on-brand)]" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-white">
                {activeJob.filename}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                {isCompleted
                  ? '✅ Complete — Click to view'
                  : isFailed
                  ? '❌ Extraction failed'
                  : `${activeJob.processedPages}/${activeJob.totalPages} pages • ${activeJob.processingProgress}%`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span className="text-[10px] font-bold text-[var(--color-brand)] font-mono">
              {activeJob.processingProgress}%
            </span>
            <ChevronUp className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" aria-hidden="true" />
          </div>
        </div>
      ) : (
        /* Expanded Floating Card */
        <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden text-[var(--color-ink)] animate-in zoom-in-95 duration-200">
          {/* Top Brand Strip */}
          <div
            className={`h-1 w-full ${
              isCompleted
                ? 'bg-[var(--color-brand)]'
                : isFailed
                ? 'bg-[var(--color-danger)]'
                : 'bg-[var(--color-brand)]'
            }`}
          />

          {/* Header */}
          <div className="p-3.5 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCompleted
                    ? 'bg-[var(--color-brand-dark)]'
                    : isFailed
                    ? 'bg-[var(--color-danger)]'
                    : 'bg-[var(--color-brand-dark)] animate-ping'
                }`}
              />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-ink)] truncate">
                {isCompleted
                  ? 'Extraction Complete'
                  : isFailed
                  ? 'Processing Error'
                  : 'Background OCR Worker'}
              </span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] uppercase">
                {activeJob.totalPages} Pages
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition cursor-pointer"
                title="Minimize Tracker"
                aria-label="Minimize Tracker"
              >
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              {(isCompleted || isFailed) && (
                <button
                  onClick={() => removeJob(activeJob.jobId)}
                  className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Dismiss"
                  aria-label="Dismiss job notification"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs font-bold text-[var(--color-ink)] truncate">
                {activeJob.filename}
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                {activeJob.message ||
                  (isProcessing ? 'Extracting financial statement pages...' : '')}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-[var(--color-text-muted)]">
                  {isCompleted ? 'Finished 100%' : `Page ${activeJob.processedPages} of ${activeJob.totalPages}`}
                </span>
                <span className="text-[var(--color-ink)] font-extrabold">
                  {activeJob.processingProgress}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={activeJob.processingProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Document processing progress"
                className="w-full bg-[var(--color-surface-subtle)] h-2 rounded-full overflow-hidden border border-[var(--color-border)] p-0.5"
              >
                <div
                  className="h-full rounded-full transition-all duration-300 bg-[var(--color-brand)]"
                  style={{ width: `${activeJob.processingProgress}%` }}
                />
              </div>
            </div>

            {/* Stage info */}
            {isProcessing && (
              <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] pt-0.5">
                <span className="flex items-center gap-1 font-mono uppercase">
                  <Activity className="w-3 h-3 text-[var(--color-brand-dark)]" aria-hidden="true" />
                  {activeJob.currentStage.replace(/_/g, ' ')}
                </span>
                <span className="text-[var(--color-brand-dark)] font-bold">Auto-syncs on route change</span>
              </div>
            )}

            {/* Actions when completed */}
            {isCompleted && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleOpenDoc}
                  className="btn-brand-primary flex-1 !min-h-[38px] !h-[38px] !px-3 text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Open Document</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>

                {docId && (
                  <a
                    href={`/api/export/download/${docId}?format=xlsx`}
                    className="btn-brand-secondary !min-h-[38px] !h-[38px] !px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)]"
                    title="Download Excel"
                    aria-label="Download Excel workbook"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--color-success)]" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}

            {isFailed && (
              <div className="text-right pt-1">
                <button
                  onClick={() => removeJob(activeJob.jobId)}
                  className="btn-brand-secondary !min-h-[34px] !h-[34px] px-3 text-xs font-bold rounded-xl border border-[var(--color-border)] cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
