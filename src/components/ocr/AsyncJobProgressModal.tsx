'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  ArrowRight,
  RotateCw,
  Clock,
  Layers,
  Activity,
  Cpu,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Decorative Brand Accent Strip */}
        <div className="h-1.5 w-full bg-[var(--color-brand)]" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] border border-[var(--color-brand)]/40 flex items-center justify-center shrink-0">
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-hover)]" />
              ) : isFailed ? (
                <AlertCircle className="w-5 h-5 text-[var(--color-danger)]" />
              ) : (
                <Cpu className="w-5 h-5 text-[var(--color-brand-hover)] animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[var(--color-ink)]">
                  {isCompleted
                    ? 'Extraction Complete!'
                    : isFailed
                    ? 'Processing Error'
                    : isCancelled
                    ? 'Processing Cancelled'
                    : 'Asynchronous OCR Engine'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                  100–200 Pages
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] truncate max-w-xs sm:max-w-md">
                {filename || 'Long Financial Bank Statement / Document'}
              </p>
            </div>
          </div>

          {/* Close / Hide Button — Always accessible to unblock the user */}
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] transition cursor-pointer"
            title="Hide modal and run in background"
            aria-label="Hide modal and run in background"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* 1. In-Progress & Queued State */}
          {(isUploading || isQueued || isProcessing) && (
            <div className="space-y-5">
              {/* Status Header & Live Metrics */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-ping" />
                  <span className="font-bold text-[var(--color-ink)]">
                    {isUploading
                      ? 'Uploading document to cloud storage...'
                      : isQueued
                      ? 'Job queued — Assigning OCR background worker...'
                      : jobState.message || 'Extracting & verifying transactions with AI...'}
                  </span>
                </div>
                <span className="font-extrabold text-[var(--color-ink)] text-sm">{activeProgress}%</span>
              </div>

              {/* High-Contrast Progress Bar */}
              <div className="w-full bg-[var(--color-surface-subtle)] h-3 rounded-full overflow-hidden border border-[var(--color-border)] p-0.5">
                <div
                  className="bg-[var(--color-brand)] h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${activeProgress}%` }}
                />
              </div>

              {/* Progress Detail Cards */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Pages Processed</span>
                  </div>
                  <p className="text-base font-black text-[var(--color-ink)]">
                    {jobState.processedPages} <span className="text-xs font-semibold text-[var(--color-text-secondary)]">/ {jobState.totalPages > 0 ? jobState.totalPages : '—'}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Current Pipeline Stage</span>
                  </div>
                  <p className="text-xs font-bold text-[var(--color-brand-hover)] truncate uppercase">
                    {jobState.currentStage.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              {/* Webhook & Background Note */}
              <div className="p-3.5 rounded-xl bg-[var(--color-brand-soft)]/50 border border-[var(--color-brand)]/20 text-xs text-[var(--color-ink)] flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[var(--color-brand-hover)] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="font-bold">Webhook Auto-Sync Active:</strong> Large documents (100–200 pages) process safely in the background. You can hide this window and continue other work.
                </p>
              </div>

              {/* Action Buttons: Cancel or Run in Background */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] rounded-xl border border-[var(--color-danger-border)] transition cursor-pointer"
                >
                  Cancel Background Job
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto btn-brand-primary !min-h-[42px] !h-[42px] !px-5 text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Hide &amp; Work in Background</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Completed State */}
          {isCompleted && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[var(--color-brand-soft)]/60 border border-[var(--color-brand)]/40 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-white/90 border border-[var(--color-brand)]/60 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[var(--color-brand-hover)]" />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-[var(--color-ink)]">
                    Document Successfully Processed &amp; Structured!
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    All pages have been extracted, reconciled, and indexed with DeepSeek AI financial entity parsing.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleViewResults}
                  className="w-full sm:flex-1 btn-brand-primary !min-h-[46px] !h-[46px] !px-5 text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Open Financial Workspace</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                {docId && (
                  <a
                    href={`/api/export/download/${docId}?format=xlsx`}
                    className="w-full sm:w-auto btn-brand-secondary !min-h-[46px] !h-[46px] !px-5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 whitespace-nowrap border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                    <span>Download Excel</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 3. Failed State */}
          {isFailed && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-white/90 border border-[var(--color-danger-border)] flex items-center justify-center text-[var(--color-danger)] shrink-0 mt-0.5 shadow-xs">
                  <AlertCircle className="w-4.5 h-4.5 text-[var(--color-danger)]" />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-[var(--color-danger)]">Processing Failed</p>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {jobState.error || 'An unexpected error occurred during extraction. Please check the file and try again.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={onClose}
                  className="btn-brand-secondary !min-h-[42px] !h-[42px] !px-5 text-xs font-bold rounded-xl border border-[var(--color-border)] cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={onRetry}
                  className="btn-brand-primary !min-h-[42px] !h-[42px] !px-5 text-xs font-black rounded-xl flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Retry Processing</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Cancelled State */}
          {isCancelled && (
            <div className="space-y-5 text-center py-4">
              <p className="text-sm font-bold text-[var(--color-text-secondary)]">
                The background processing job was cancelled.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="btn-brand-secondary !min-h-[42px] !h-[42px] !px-6 text-xs font-bold rounded-xl border border-[var(--color-border)] cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={onRetry}
                  className="btn-brand-primary !min-h-[42px] !h-[42px] !px-6 text-xs font-black rounded-xl flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <RotateCw className="w-4 h-4" />
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
