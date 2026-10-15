'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Layers,
  Lock,
  ArrowRight,
  FileSpreadsheet,
  RotateCw,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  X,
  Upload,
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

  const stats = [
    {
      icon: Layers,
      label: 'Extracted Pages',
      value: (
        <>
          {jobState.processedPages} <span className="text-[13px] font-normal text-[var(--color-text-muted)]">/ {jobState.totalPages}</span>
        </>
      ),
    },
    { icon: Activity, label: 'Stage', value: <span className="text-sm font-medium capitalize">{jobState.currentStage.replace(/_/g, ' ')}</span> },
    { icon: Clock, label: 'Runs', value: <span className="text-sm font-medium">In the background</span> },
  ];

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="type-headline">
            Long statements and archives
          </h3>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          For 100–200 page PDFs, such as a year of statements in one file. Processing runs in the background and shows live progress.
        </p>
      </div>

      {/* In-Flight Active Background Jobs */}
      {!isBusy && activeJobs.length > 0 && (
        <section aria-labelledby="active-bg-jobs-title" className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-start gap-2.5">
            <Loader2 className="w-4 h-4 mt-0.5 animate-spin text-[var(--color-brand-dark)] shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <h4 id="active-bg-jobs-title" className="text-[15px] font-semibold text-[var(--color-ink)] flex flex-wrap items-center gap-2">
                <span>Active Background Processing ({activeJobs.length})</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-info-soft)] text-[var(--color-info)]">
                  In Progress
                </span>
              </h4>
              <p className="text-[13px] text-[var(--color-text-muted)]">
                These files are still being processed. You can keep working while they finish.
              </p>
            </div>
          </div>

          <ul className="divide-y divide-[var(--color-border-subtle)]">
            {activeJobs.map((job) => {
              const isDone = job.status === 'completed';
              const isErr = job.status === 'failed';
              const targetDocId = job.documentId || job.result?.id || job.jobId;

              return (
                <li key={job.jobId} className="px-5 py-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-ink)] truncate">{job.filename}</p>
                      <p className={`text-[13px] ${isErr ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'}`}>
                        {job.message || `Extracting page ${job.processedPages} of ${job.totalPages}...`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[13px] tabular-nums text-[var(--color-text-secondary)]">
                        {job.processingProgress}%
                      </span>
                      <button
                        type="button"
                        onClick={() => removeJob(job.jobId)}
                        className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
                        title="Dismiss"
                        aria-label={`Dismiss processing job for ${job.filename}`}
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div
                    role="progressbar"
                    aria-valuenow={job.processingProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Processing progress for ${job.filename}`}
                    className="w-full bg-[var(--color-surface-muted)] h-1 rounded-full overflow-hidden"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isErr ? 'bg-[var(--color-danger)]' : isDone ? 'bg-[var(--color-success)]' : 'bg-[var(--color-brand)]'
                      }`}
                      style={{ width: `${job.processingProgress}%` }}
                    />
                  </div>

                  {isDone && (
                    <div className="flex items-center justify-between gap-3 pt-0.5">
                      <span className="text-[13px] text-[var(--color-success)] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Ready
                      </span>
                      <button
                        type="button"
                        onClick={() => router.push(`/document/${targetDocId}`)}
                        className="inline-flex items-center gap-1 min-h-[36px] px-3 rounded-full text-sm font-medium text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)] transition-colors cursor-pointer"
                      >
                        <span>Open Document</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Main Upload / State Container */}
      {!isBusy && !isCompleted && !isFailed ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Upload a 100–200 page bank statement"
            className={`border-2 border-dashed rounded-2xl px-4 py-10 sm:p-12 text-center transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:border-[var(--color-brand)] focus-visible:ring-4 focus-visible:ring-[var(--color-brand)]/20 ${
              isDragging
                ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]'
                : 'border-[var(--color-info-border)] bg-[var(--color-brand-soft)] hover:border-[var(--color-brand)]'
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
              <span className="mx-auto w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-info-border)] flex items-center justify-center" aria-hidden="true">
                <FileText className="w-7 h-7 text-[var(--color-brand)]" />
              </span>

              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-[15px] font-medium text-[var(--color-ink)] truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[13px] text-[var(--color-text-muted)] tabular-nums">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &middot; ~{estimatedPages} Pages detected
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">
                    Drop a long statement here, or browse
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    PDF, scans and photos · password-protected PDFs supported
                  </p>
                  <span className="btn-brand-primary mt-3 pointer-events-none" aria-hidden="true">
                    <Upload className="w-4 h-4" />
                    <span>Choose File</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Form Controls */}
          {selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="async-doc-type" className="block text-[13px] font-medium text-[var(--color-ink)] mb-1.5">
                    Document Classification
                  </label>
                  <select
                    id="async-doc-type"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[15px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/20 transition-colors cursor-pointer"
                  >
                    <option value="bank_statement">Bank Statement (100–200 Pages)</option>
                    <option value="invoice">Invoice / Accounts Payable</option>
                    <option value="receipt">Receipt / Expense Ledger</option>
                    <option value="auto">Auto-Detect Structure</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="async-language" className="block text-[13px] font-medium text-[var(--color-ink)] mb-1.5">
                    Language &amp; Region
                  </label>
                  <select
                    id="async-language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[15px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/20 transition-colors cursor-pointer"
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
                <div>
                  <label htmlFor="async-password" className="block text-[13px] font-medium text-[var(--color-ink)] mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
                    <span>PDF Password</span>
                  </label>
                  <input
                    id="async-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter document password..."
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[15px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/20 transition-colors placeholder:text-[var(--color-text-muted)]"
                  />
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="btn-brand-primary w-full sm:w-auto"
                >
                  <span>Queue Background OCR Task</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </form>
      ) : isBusy ? (
        /* Live Processing View */
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0 space-y-0.5">
              <h4 className="text-[17px] font-semibold text-[var(--color-ink)]" aria-live="polite">
                {jobState.message || 'Processing 100–200 page financial statement...'}
              </h4>
              <p className="text-[13px] text-[var(--color-text-muted)] break-all">
                Job ID: {jobState.jobId || 'Allocating worker'} &middot; Document ID: {jobState.documentId || '—'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  resetJob();
                  setSelectedFile(null);
                }}
                className="btn-brand-secondary !min-h-[40px] !px-4 !text-sm"
                title="Process another document while this job runs in the background"
              >
                <span>Upload Another Doc</span>
              </button>

              <button
                type="button"
                onClick={cancelJob}
                className="min-h-[40px] px-4 rounded-full text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors cursor-pointer"
              >
                Cancel Job
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-[13px] text-[var(--color-text-secondary)]">
              <span>{isUploading ? 'Upload Progress' : 'Extraction Progress'}</span>
              <span className="tabular-nums text-[var(--color-ink)] font-medium">{activeProgress}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={activeProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={isUploading ? 'Upload Progress' : 'Extraction Progress'}
              className="w-full bg-[var(--color-surface-muted)] h-1 rounded-full overflow-hidden"
            >
              <div
                className="bg-[var(--color-brand)] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${activeProgress}%` }}
              />
            </div>
          </div>

          {/* Progress details */}
          <dl className="grid grid-cols-1 sm:grid-cols-3 border-t border-[var(--color-border-subtle)] sm:divide-x divide-[var(--color-border-subtle)]">
            {stats.map(({ icon: StatIcon, label, value }) => (
              <div key={label} className="pt-3 sm:px-4 first:sm:pl-0 min-w-0">
                <dt className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
                  <StatIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                </dt>
                <dd className="mt-0.5 text-[17px] font-semibold text-[var(--color-ink)] tabular-nums truncate">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : isCompleted ? (
        /* Completed View */
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h4 className="text-[17px] font-semibold text-[var(--color-ink)]">
                Large Document Extracted Successfully!
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                All {jobState.totalPages || jobState.result?.metadata?.pages || 1} pages have been converted into structured accounting transactions.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            {docId && (
              <button
                type="button"
                onClick={() => router.push(`/document/${docId}`)}
                className="btn-brand-primary w-full sm:flex-1"
              >
                <span>Inspect in Financial Viewer</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            )}

            {docId && (
              <a
                href={`/api/export/download/${docId}?format=xlsx`}
                className="btn-brand-secondary w-full sm:w-auto"
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Download Master Excel</span>
              </a>
            )}

            <button
              type="button"
              onClick={resetJob}
              className="btn-brand-secondary w-full sm:w-auto"
            >
              Process Another File
            </button>
          </div>
        </div>
      ) : (
        /* Failed View */
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-5">
          <div role="alert" className="p-4 rounded-xl bg-[var(--color-danger-soft)] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--color-danger)] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h4 className="text-[15px] font-semibold text-[var(--color-danger)]">
                Processing Error
              </h4>
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                {jobState.error || 'The asynchronous OCR worker encountered an issue.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={resetJob}
              className="btn-brand-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={retryJob}
              className="btn-brand-primary"
            >
              <RotateCw className="w-4 h-4" aria-hidden="true" />
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
