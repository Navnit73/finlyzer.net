'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  ArrowRight,
  Activity,
  Loader2,
} from 'lucide-react';
import { useActiveJobs } from '@/context/ActiveJobsContext';

export default function ActiveJobFloatingTracker() {
  const router = useRouter();
  const { activeJobs, removeJob, isFloatingTrackerOpen } = useActiveJobs();
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

  const statusLabel = isCompleted
    ? 'Extraction Complete'
    : isFailed
    ? 'Processing Error'
    : 'Background OCR Worker';

  const statusIcon = isCompleted ? (
    <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" aria-hidden="true" />
  ) : isFailed ? (
    <AlertCircle className="w-4 h-4 text-[var(--color-danger)]" aria-hidden="true" />
  ) : (
    <Loader2 className="w-4 h-4 animate-spin text-[var(--color-brand-dark)]" aria-hidden="true" />
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 select-none animate-slide-up">
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
          className="surface-overlay !rounded-full flex items-center justify-between gap-3 min-h-[52px] pl-4 pr-3 py-2 cursor-pointer hover:border-[var(--color-border-hover)] transition-colors group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="shrink-0 flex">{statusIcon}</span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium truncate text-[var(--color-ink)]">
                {activeJob.filename}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] truncate tabular-nums">
                {isCompleted
                  ? 'Complete — Click to view'
                  : isFailed
                  ? 'Extraction failed'
                  : `${activeJob.processedPages}/${activeJob.totalPages} pages • ${activeJob.processingProgress}%`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-[var(--color-text-secondary)] tabular-nums">
              {activeJob.processingProgress}%
            </span>
            <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-ink)] transition-colors" aria-hidden="true" />
          </div>
        </div>
      ) : (
        /* Expanded Floating Card */
        <div className="surface-overlay overflow-hidden text-[var(--color-ink)] animate-scale-up">
          {/* Header */}
          <div className="pl-4 pr-2 py-2 border-b border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 flex">{statusIcon}</span>
              <span className="text-[13px] font-semibold text-[var(--color-ink)] truncate">
                {statusLabel}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] tabular-nums shrink-0">
                {activeJob.totalPages} Pages
              </span>
            </div>

            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
                title="Minimize Tracker"
                aria-label="Minimize Tracker"
              >
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              </button>

              {(isCompleted || isFailed) && (
                <button
                  type="button"
                  onClick={() => removeJob(activeJob.jobId)}
                  className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
                  title="Dismiss"
                  aria-label="Dismiss job notification"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                {activeJob.filename}
              </p>
              {(activeJob.message || isProcessing) && (
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
                  {activeJob.message ||
                    (isProcessing ? 'Extracting financial statement pages...' : '')}
                </p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div
                role="progressbar"
                aria-valuenow={activeJob.processingProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Document processing progress"
                className="w-full bg-[var(--color-surface-muted)] h-1 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFailed ? 'bg-[var(--color-danger)]' : isCompleted ? 'bg-[var(--color-success)]' : 'bg-[var(--color-brand)]'
                  }`}
                  style={{ width: `${activeJob.processingProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--color-text-muted)] tabular-nums">
                <span>
                  {isCompleted ? 'Finished 100%' : `Page ${activeJob.processedPages} of ${activeJob.totalPages}`}
                </span>
                <span>{activeJob.processingProgress}%</span>
              </div>
            </div>

            {/* Stage info */}
            {isProcessing && (
              <div className="flex items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1 capitalize truncate">
                  <Activity className="w-3 h-3 shrink-0" aria-hidden="true" />
                  {activeJob.currentStage.replace(/_/g, ' ')}
                </span>
                <span className="shrink-0">Auto-syncs on route change</span>
              </div>
            )}

            {/* Actions when completed */}
            {isCompleted && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenDoc}
                  className="btn-brand-primary flex-1 !min-h-[40px] !px-4 !text-sm"
                >
                  <span>Open Document</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                {docId && (
                  <a
                    href={`/api/export/download/${docId}?format=xlsx`}
                    className="btn-brand-secondary !min-h-[40px] !px-3.5 !text-sm"
                    title="Download Excel"
                    aria-label="Download Excel workbook"
                  >
                    <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}

            {isFailed && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => removeJob(activeJob.jobId)}
                  className="btn-brand-secondary !min-h-[40px] !px-4 !text-sm"
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
