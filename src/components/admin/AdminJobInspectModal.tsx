'use client';

import React, { useState } from 'react';
import {
  X,
  Code,
  FileSpreadsheet,
  RotateCw,
  Copy,
  Check,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { OCRJob } from '@/types/ocr';

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
  const [activeTab, setActiveTab] = useState<'extraction' | 'metadata' | 'raw'>('extraction');

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
  const isProcessing = job.status === 'processing';
  const docId = job.document_id || job.result?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] border border-[var(--color-brand)]/40 flex items-center justify-center text-[var(--color-ink)]">
              <Code className="w-5 h-5 text-[var(--color-brand-hover)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[var(--color-ink)]">
                  Job Inspector: {job.job_id}
                </h3>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isFailed
                      ? 'bg-red-100 text-red-800'
                      : isProcessing
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-zinc-100 text-zinc-800'
                  }`}
                >
                  {job.status}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Document ID: {job.document_id || '—'} &bull; File: {job.metadata?.filename || 'statement.pdf'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="btn btn-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)] text-xs font-bold flex items-center gap-1.5 px-3 cursor-pointer shadow-none"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcherh*/}
        <div className="px-6 pt-3 border-b border-[var(--color-border)] flex items-center gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('extraction')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'extraction'
                ? 'border-[var(--color-brand)] text-[var(--color-ink)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            Extraction Data (JSON)
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'metadata'
                ? 'border-[var(--color-brand)] text-[var(--color-ink)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            Job Metadata &amp; Timings
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'raw'
                ? 'border-[var(--color-brand)] text-[var(--color-ink)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            Raw Extracted Text
          </button>
        </div>

        {/* Modal Body / Code Viewer */}
        <div className="p-6 flex-1 overflow-y-auto bg-[var(--color-surface-subtle)]">
          {activeTab === 'extraction' && (
            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
              {job.result?.extraction
                ? JSON.stringify(job.result.extraction, null, 2)
                : '// No structured extraction generated yet (Status: ' + job.status + ')'}
            </pre>
          )}

          {activeTab === 'metadata' && (
            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
              {JSON.stringify(job, null, 2)}
            </pre>
          )}

          {activeTab === 'raw' && (
            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800 whitespace-pre-wrap">
              {job.result?.raw_text || '// No raw text captured'}
            </pre>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
            <span>Created: {new Date(job.created_at).toLocaleString()}</span>
            {job.completed_at && (
              <span>&bull; Completed: {new Date(job.completed_at).toLocaleTimeString()}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isFailed && (
              <button
                onClick={() => onRetry(job.job_id)}
                className="btn btn-sm rounded-lg bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-[var(--color-on-brand)] text-xs font-bold flex items-center gap-1.5 px-4 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Retry Job</span>
              </button>
            )}

            {isCompleted && docId && (
              <a
                href={`/api/export/download/${docId}?format=xlsx`}
                className="btn btn-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)] text-xs font-bold flex items-center gap-1.5 px-4 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="btn btn-sm rounded-lg border border-[var(--color-border)] px-4 text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
