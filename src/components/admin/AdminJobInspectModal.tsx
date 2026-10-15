'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, FileSpreadsheet, RotateCw, Copy, Check } from 'lucide-react';
import { OCRJob } from '@/types/ocr';

const STATUS_BADGE: Record<OCRJob['status'], string> = {
  completed: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  processing: 'bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]',
  queued: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
  failed: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  cancelled: 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]',
};

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]';

const TOOL_BUTTON = `inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-subtle)] cursor-pointer ${FOCUS_RING}`;

const TABS = [
  { id: 'extraction', label: 'Extraction data (JSON)' },
  { id: 'metadata', label: 'Job metadata & timings' },
  { id: 'raw', label: 'Raw extracted text' },
] as const;

type InspectTab = (typeof TABS)[number]['id'];

interface AdminJobInspectModalProps {
  job: OCRJob | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: (jobId: string) => void;
}

export default function AdminJobInspectModal({
  job,
  isOpen,
  onClose,
  onRetry,
}: AdminJobInspectModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<InspectTab>('extraction');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Move focus into the dialog when it opens
  useEffect(() => {
    if (isOpen && job) closeButtonRef.current?.focus();
  }, [isOpen, job]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !job) return null;

  const handleCopy = () => {
    const textToCopy =
      activeTab === 'extraction'
        ? JSON.stringify(job.result?.extraction || {}, null, 2)
        : activeTab === 'metadata'
        ? JSON.stringify(job, null, 2)
        : job.result?.raw_text || 'No raw text available';

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const docId = job.document_id || job.result?.id;

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
    setActiveTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  const details: Array<{ label: string; value: React.ReactNode; mono?: boolean }> = [
    { label: 'Document ID', value: job.document_id || '—', mono: true },
    { label: 'File', value: job.metadata?.filename || 'statement.pdf' },
    { label: 'Pages', value: job.total_pages || job.result?.metadata?.pages || 1 },
    { label: 'Progress', value: `${job.progress ?? 0}%` },
    { label: 'Stage', value: job.current_stage ? job.current_stage.replace(/_/g, ' ') : '—' },
    { label: 'Retries', value: job.retry_count ?? 0 },
    { label: 'Created', value: new Date(job.created_at).toLocaleString() },
    { label: 'Completed', value: job.completed_at ? new Date(job.completed_at).toLocaleTimeString() : '—' },
  ];

  const codeClass =
    'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4 font-mono text-[12px] leading-relaxed text-[var(--color-ink)] overflow-x-auto';

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 sm:p-6 animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-inspect-modal-title"
        className="surface-overlay relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="job-inspect-modal-title" className="text-[17px] font-semibold text-[var(--color-ink)]">
                Job inspector:{' '}
                <span className="font-mono text-[15px] font-normal text-[var(--color-text-secondary)] break-all">{job.job_id}</span>
              </h2>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-medium capitalize ${
                  STATUS_BADGE[job.status] ?? STATUS_BADGE.cancelled
                }`}
              >
                {job.status}
              </span>
            </div>
            {job.error && <p className="text-[13px] text-[var(--color-danger)] break-words">{job.error}</p>}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={handleCopy} className={TOOL_BUTTON}>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[var(--color-success)]" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span aria-live="polite">{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] cursor-pointer ${FOCUS_RING}`}
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Summary */}
          <dl className="grid grid-cols-1 gap-x-8 border-b border-[var(--color-border)] px-5 py-2 sm:grid-cols-2 sm:px-6">
            {details.map((item) => (
              <div
                key={item.label}
                className="flex items-baseline justify-between gap-4 border-b border-[var(--color-border-subtle)] py-2.5 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0"
              >
                <dt className="shrink-0 text-[13px] text-[var(--color-text-muted)]">{item.label}</dt>
                <dd
                  className={`min-w-0 truncate text-right text-[13px] tabular-nums text-[var(--color-ink)] ${
                    item.mono ? 'font-mono text-[12px] text-[var(--color-text-secondary)]' : ''
                  }`}
                  title={typeof item.value === 'string' ? item.value : undefined}
                >
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Job Data Views"
            className="flex items-center gap-5 overflow-x-auto border-b border-[var(--color-border)] px-5 pt-3 sm:px-6"
          >
            {TABS.map((tab, index) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`job-inspect-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls="job-inspect-tabpanel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  className={`-mb-px whitespace-nowrap border-b-2 pb-2.5 text-[13px] transition-colors cursor-pointer ${FOCUS_RING} ${
                    isActive
                      ? 'border-[var(--color-brand)] font-medium text-[var(--color-ink)]'
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab panel */}
          <div
            role="tabpanel"
            id="job-inspect-tabpanel"
            aria-labelledby={`job-inspect-tab-${activeTab}`}
            aria-label={`${activeTab} view`}
            className="p-5 sm:p-6"
          >
            {activeTab === 'extraction' && (
              <pre className={codeClass}>
                {job.result?.extraction
                  ? JSON.stringify(job.result.extraction, null, 2)
                  : '// No structured extraction generated yet (Status: ' + job.status + ')'}
              </pre>
            )}

            {activeTab === 'metadata' && <pre className={codeClass}>{JSON.stringify(job, null, 2)}</pre>}

            {activeTab === 'raw' && (
              <pre className={`${codeClass} whitespace-pre-wrap`}>{job.result?.raw_text || '// No raw text captured'}</pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3 sm:px-6">
          {isFailed && (
            <button
              type="button"
              onClick={() => onRetry(job.job_id)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--color-brand)] px-3.5 text-[13px] font-medium text-[var(--color-on-brand)] transition-colors hover:bg-[var(--color-brand-hover)] cursor-pointer ${FOCUS_RING}`}
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Retry job</span>
            </button>
          )}

          {isCompleted && docId && (
            <a href={`/api/export/download/${docId}?format=xlsx`} className={TOOL_BUTTON}>
              <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export Excel</span>
            </a>
          )}

          <button type="button" onClick={onClose} className={TOOL_BUTTON}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
