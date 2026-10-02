'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  Layers,
  Lock,
  Cpu,
  ArrowRight,
  FileSpreadsheet,
  RotateCw,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useOCRJob } from '@/hooks/useOCRJob';
import { useActiveJobs } from '@/context/ActiveJobsContext';
import { DocumentType, SupportedLanguage } from '@/types/ocr';
import { inspectPdfFile } from '@/lib/pdf-helper';
import AuthModal from '../auth/AuthModal';

export default function AsyncDocumentProcessor() {
  const router = useRouter();
  const { data: session } = useSession();
  const { activeJobs, removeJob } = useActiveJobs();
  const { jobState, uploadAndProcess, cancelJob, retryJob, resetJob } = useOCRJob();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [estimatedPages, setEstimatedPages] = useState<number>(1);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [documentType, setDocumentType] = useState<DocumentType>('bank_statement');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isDragging, setIsDragging] = useState(false);

  // Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const inspection = await inspectPdfFile(file);
    setEstimatedPages(inspection.pageCount);
    setIsEncrypted(inspection.isEncrypted);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (!session?.user && estimatedPages > 10) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await uploadAndProcess(selectedFile, {
        documentType,
        language,
        cleanWithAi: true,
        password: isEncrypted ? password : undefined,
        pageCount: estimatedPages,
      });
    } catch {
      // Error handled in hook
    }
  };

  const isUploading = jobState.status === 'uploading';
  const isQueued = jobState.status === 'queued';
  const isProcessing = jobState.status === 'processing';
  const isCompleted = jobState.status === 'completed';
  const isFailed = jobState.status === 'failed';
  const isBusy = isUploading || isQueued || isProcessing;

  const activeProgress = isUploading ? jobState.uploadProgress : jobState.processingProgress;
  const docId = jobState.documentId || jobState.result?.id;

  return (
    <div className="space-y-6">
      {/* Introduction Banner */}
      <div className="p-6 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-soft)] border border-[var(--color-brand)]/40 flex items-center justify-center text-[var(--color-ink)] shrink-0">
            <Cpu className="w-6 h-6 text-[var(--color-brand-hover)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-[var(--color-ink)]">
                Long Document OCR &amp; Webhook Engine
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] uppercase tracking-wider">
                100–200 Pages
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Processes massive multi-month bank statements and archives with background Celery workers and signed HMAC webhooks.
            </p>
          </div>
        </div>
      </div>

      {/* In-Flight Active Background Jobs Banner */}
      {!isBusy && activeJobs.length > 0 && (
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-brand)] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-on-brand)] shrink-0">
                <Cpu className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-2">
                  <span>Active Background Processing ({activeJobs.length})</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]">
                    In Progress
                  </span>
                </h4>
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  Your files are actively being processed by background Celery workers.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {activeJobs.map((job) => {
              const isDone = job.status === 'completed';
              const isErr = job.status === 'failed';
              const targetDocId = job.documentId || job.result?.id || job.jobId;

              return (
                <div
                  key={job.jobId}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300'
                      : isErr
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-300'
                      : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--color-ink)] truncate">{job.filename}</p>
                      <p className="text-[10px] text-[var(--color-text-secondary)]">
                        {job.message || `Extracting page ${job.processedPages} of ${job.totalPages}...`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono font-bold text-[11px] text-[var(--color-ink)]">
                        {job.processingProgress}%
                      </span>
                      <button
                        type="button"
                        onClick={() => removeJob(job.jobId)}
                        className="text-[var(--color-text-muted)] hover:text-red-600 px-1"
                        title="Dismiss"
                      >
                        &times;
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone ? 'bg-emerald-500' : 'bg-[var(--color-brand)]'
                      }`}
                      style={{ width: `${job.processingProgress}%` }}
                    />
                  </div>

                  {isDone && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                      <button
                        type="button"
                        onClick={() => router.push(`/document/${targetDocId}`)}
                        className="btn btn-xs rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)] font-bold flex items-center gap-1 px-2.5 shadow-xs cursor-pointer"
                      >
                        <span>Open Document</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Upload / State Container */}
      {!isBusy && !isCompleted && !isFailed ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer bg-[var(--color-surface)] ${
              isDragging
                ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]/40'
                : 'border-[var(--color-border)] hover:border-[var(--color-brand)] hover:bg-[var(--color-surface-subtle)]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink)]">
                <FileText className="w-7 h-7 text-[var(--color-brand-hover)]" />
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-black text-[var(--color-ink)] truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-[var(--color-brand-hover)] font-bold">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; ~{estimatedPages} Pages detected
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-[var(--color-ink)]">
                    Drop 100–200 Page Bank Statement Here
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Supports high-volume PDFs, encrypted statements, and multi-year financial ledgers.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Form Controls */}
          {selectedFile && (
            <div className="p-5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-ink)] mb-1.5">
                    Document Classification
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)]"
                  >
                    <option value="bank_statement">Bank Statement (100–200 Pages)</option>
                    <option value="invoice">Invoice / Accounts Payable</option>
                    <option value="receipt">Receipt / Expense Ledger</option>
                    <option value="auto">Auto-Detect Structure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-ink)] mb-1.5">
                    Language &amp; Region
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)]"
                  >
                    <option value="en">English (Global Financial Standard)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="fr">French (Français)</option>
                    <option value="de">German (Deutsch)</option>
                  </select>
                </div>
              </div>

              {isEncrypted && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-[var(--color-ink)] mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>PDF Password</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter document password..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)]"
                  />
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="btn btn-brand-primary px-8 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Queue Background OCR Task</span>
                </button>
              </div>
            </div>
          )}
        </form>
      ) : isBusy ? (
        /* Live Processing View */
        <div className="p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] border border-[var(--color-brand)]/40 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[var(--color-brand-hover)] animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-black text-[var(--color-ink)]">
                  {jobState.message || 'Processing 100–200 page financial statement...'}
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Job ID: {jobState.jobId || 'Allocating worker'} &bull; Document ID: {jobState.documentId || '—'}
                </p>
              </div>
            </div>

            <button
              onClick={cancelJob}
              className="px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer"
            >
              Cancel Job
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-[var(--color-ink)]">
              <span>{isUploading ? 'Upload Progress' : 'Extraction Progress'}</span>
              <span>{activeProgress}%</span>
            </div>
            <div className="w-full bg-[var(--color-surface-subtle)] h-3 rounded-full overflow-hidden border border-[var(--color-border)] p-0.5">
              <div
                className="bg-[var(--color-brand)] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${activeProgress}%` }}
              />
            </div>
          </div>

          {/* Progress Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Extracted Pages</span>
              </div>
              <p className="text-base font-black text-[var(--color-ink)]">
                {jobState.processedPages} <span className="text-xs text-[var(--color-text-secondary)]">/ {jobState.totalPages}</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Stage</span>
              </div>
              <p className="text-xs font-bold text-[var(--color-brand-hover)] truncate uppercase">
                {jobState.currentStage.replace(/_/g, ' ')}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Sync Protocol</span>
              </div>
              <p className="text-xs font-bold text-emerald-600 truncate">
                SSE &amp; HMAC Webhook
              </p>
            </div>
          </div>
        </div>
      ) : isCompleted ? (
        /* Completed View */
        <div className="p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-base font-black text-emerald-900 dark:text-emerald-300">
                Large Document Extracted Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                All {jobState.totalPages || jobState.result?.metadata?.pages || 1} pages have been converted into structured accounting transactions.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {docId && (
              <button
                onClick={() => router.push(`/document/${docId}`)}
                className="btn btn-brand-primary flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Inspect in Financial Viewer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {docId && (
              <a
                href={`/api/export/download/${docId}?format=xlsx`}
                className="btn btn-brand-secondary py-3 px-6 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-[var(--color-border)]"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Download Master Excel</span>
              </a>
            )}

            <button
              onClick={resetJob}
              className="btn btn-brand-secondary py-3 px-5 text-xs font-bold border border-[var(--color-border)] cursor-pointer"
            >
              Process Another File
            </button>
          </div>
        </div>
      ) : (
        /* Failed View */
        <div className="p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-base font-black text-red-900 dark:text-red-300">
                Processing Error
              </h4>
              <p className="text-xs text-red-700 dark:text-red-400">
                {jobState.error || 'The asynchronous OCR worker encountered an issue.'}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={resetJob}
              className="btn btn-brand-secondary px-5 py-2.5 text-xs font-bold border border-[var(--color-border)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={retryJob}
              className="btn btn-brand-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Retry Task</span>
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="page_limit"
        pageCount={estimatedPages}
      />
    </div>
  );
}
