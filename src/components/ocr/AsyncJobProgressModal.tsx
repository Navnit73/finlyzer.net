'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  ArrowRight,
  RotateCw,
  Clock,
  Layers,
  Activity,
  Minimize2,
} from 'lucide-react';
import { OCRJobState } from '@/types/ocr';

interface AsyncJobProgressModalProps {
  isOpen: boolean;
  jobState: OCRJobState;
  filename?: string;
  onCancel: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export default function AsyncJobProgressModal({
  isOpen,
  jobState,
  filename,
  onCancel,
  onRetry,
  onClose,
}: AsyncJobProgressModalProps) {
  const router = useRouter();

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const isUploading = jobState.status === 'uploading';
  const isQueued = jobState.status === 'queued';
  const isProcessing = jobState.status === 'processing';
  const isCompleted = jobState.status === 'completed';
  const isFailed = jobState.status === 'failed';
  const isCancelled = jobState.status === 'cancelled';

  const activeProgress = isUploading ? jobState.uploadProgress : jobState.processingProgress;
  const docId = jobState.documentId || jobState.result?.id;

  const handleViewResults = () => {
    if (docId) {
      onClose();
      router.push(`/document/${docId}`);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="async-job-modal-title"
        className="relative w-full max-w-lg surface-overlay overflow-hidden animate-scale-up"
      >
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="async-job-modal-title" className="text-[21px] font-semibold tracking-tight text-[var(--color-ink)]">
                {isCompleted
                  ? 'Extraction Complete!'
                  : isFailed
                  ? 'Processing Error'
                  : isCancelled
                  ? 'Processing Cancelled'
                  : 'Asynchronous OCR Engine'}
              </h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
                100–200 Pages
              </span>
            </div>
            <p className="text-[13px] text-[var(--color-text-muted)] truncate">
              {filename || 'Long Financial Bank Statement / Document'}
            </p>
          </div>

          {/* Close / Hide Button — Always accessible to unblock the user */}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
            title="Hide modal and run in background"
            aria-label="Hide modal and run in background"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 space-y-6">
          {/* 1. In-Progress & Queued State */}
          {(isUploading || isQueued || isProcessing) && (
            <div className="space-y-5">
              <div className="space-y-2.5">
                {/* Status line & live percentage */}
                <div className="flex items-baseline justify-between gap-3" aria-live="polite">
                  <span className="text-sm text-[var(--color-ink)]">
                    {isUploading
                      ? 'Uploading document to cloud storage...'
                      : isQueued
                      ? 'Job queued — Assigning OCR background worker...'
                      : jobState.message || 'Extracting & verifying transactions with AI...'}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-ink)] tabular-nums shrink-0">{activeProgress}%</span>
                </div>

                <div
                  role="progressbar"
                  aria-valuenow={activeProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Extraction Progress"
                  className="w-full bg-[var(--color-surface-muted)] h-1 rounded-full overflow-hidden"
                >
                  <div
                    className="bg-[var(--color-brand)] h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${activeProgress}%` }}
                  />
                </div>
              </div>

              {/* Progress details */}
              <dl className="grid grid-cols-2 border-y border-[var(--color-border-subtle)] divide-x divide-[var(--color-border-subtle)]">
                <div className="py-3 pr-4">
                  <dt className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
                    <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                    Pages Processed
                  </dt>
                  <dd className="mt-0.5 text-[17px] font-semibold text-[var(--color-ink)] tabular-nums">
                    {jobState.processedPages} <span className="text-[13px] font-normal text-[var(--color-text-muted)]">/ {jobState.totalPages > 0 ? jobState.totalPages : '—'}</span>
                  </dd>
                </div>

                <div className="py-3 pl-4 min-w-0">
                  <dt className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
                    <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                    Current Pipeline Stage
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--color-ink)] truncate capitalize">
                    {jobState.currentStage.replace(/_/g, ' ')}
                  </dd>
                </div>
              </dl>

              {/* Webhook & Background Note */}
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed flex items-start gap-2">
                <Clock className="w-4 h-4 text-[var(--color-text-muted)] shrink-0 mt-px" aria-hidden="true" />
                <span>
                  <span className="font-medium text-[var(--color-ink)]">Webhook Auto-Sync Active:</span> Large documents (100–200 pages) process safely in the background. You can hide this window and continue other work.
                </span>
              </p>

              {/* Action Buttons: Cancel or Run in Background */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <button
                  type="button"
                  onClick={onCancel}
                  className="min-h-[44px] px-4 rounded-full text-[15px] font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors cursor-pointer"
                >
                  Cancel Background Job
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="btn-brand-primary"
                >
                  <Minimize2 className="w-4 h-4" aria-hidden="true" />
                  <span>Hide &amp; Work in Background</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Completed State */}
          {isCompleted && (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-semibold text-[15px] text-[var(--color-ink)]">
                    Document Successfully Processed &amp; Structured!
                  </p>
                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                    All pages have been extracted, reconciled, and indexed with DeepSeek AI financial entity parsing.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleViewResults}
                  className="btn-brand-primary w-full sm:flex-1"
                >
                  <span>Open Financial Workspace</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>

                {docId && (
                  <a
                    href={`/api/export/download/${docId}?format=xlsx`}
                    className="btn-brand-secondary w-full sm:w-auto"
                  >
                    <FileSpreadsheet className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Download Excel</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 3. Failed State */}
          {isFailed && (
            <div className="space-y-5">
              <div role="alert" className="p-4 rounded-xl bg-[var(--color-danger-soft)] flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--color-danger)] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-semibold text-[15px] text-[var(--color-danger)]">Processing Failed</p>
                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                    {jobState.error || 'An unexpected error occurred during extraction. Please check the file and try again.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-brand-secondary"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={onRetry}
                  className="btn-brand-primary"
                >
                  <RotateCw className="w-4 h-4" aria-hidden="true" />
                  <span>Retry Processing</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Cancelled State */}
          {isCancelled && (
            <div className="space-y-5">
              <p className="text-[15px] text-[var(--color-text-secondary)]">
                The background processing job was cancelled.
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-brand-secondary"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={onRetry}
                  className="btn-brand-primary"
                >
                  <RotateCw className="w-4 h-4" aria-hidden="true" />
                  <span>Restart Job</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
