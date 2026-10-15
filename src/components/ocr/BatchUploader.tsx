'use client';

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { BatchResponse } from '@/types/ocr';
import FinancialMetricCard from './FinancialMetricCard';
import AuthModal from '../auth/AuthModal';
import { formatUSD } from '@/lib/format';

interface BatchUploaderProps {
  onSelectExtraction?: (id: string) => void;
}

export default function BatchUploader({ onSelectExtraction }: BatchUploaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchResult, setBatchResult] = useState<BatchResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
      setBatchResult(null);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArr = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
      setBatchResult(null);
      setErrorMessage(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setBatchResult(null);
    setErrorMessage(null);
  };

  const startBatchExtraction = async () => {
    if (selectedFiles.length === 0) return;

    if (!session?.user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsProcessing(true);
    setProgress(15);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('document_type', 'auto');
      formData.append('clean_with_ai', 'true');

      const interval = setInterval(() => {
        setProgress((p) => (p < 85 ? p + 12 : p));
      }, 400);

      const res = await fetch('/api/ocr/batch', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (!res.ok) {
        const errData = await res.json();
        if (errData.code === 'LOGIN_REQUIRED') {
          setIsAuthModalOpen(true);
          return;
        }
        throw new Error(errData.error || 'Batch processing failed');
      }

      const data: BatchResponse = await res.json();
      setBatchResult(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMessage(e.message || 'Batch extraction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadConsolidatedExcel = async () => {
    let url: string | null = null;
    try {
      const res = await fetch('/api/export/consolidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: batchResult?.batch_id || 'batch_master',
          format: 'xlsx',
          include_annual_pnl: true,
        }),
      });

      if (!res.ok) throw new Error('Consolidation export failed');
      const blob = await res.blob();
      url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Batch_Consolidated_Master_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.warn('Consolidated download failed:', (e as Error)?.message || 'Export error');
      alert('Failed to download master consolidated report.');
    } finally {
      if (url) {
        window.URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Informative Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 className="type-headline">
            Convert many files at once
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Upload up to 50 statements or invoices together, then download each one or a single combined Excel workbook.
          </p>
        </div>

      </div>

      {/* Dropzone Area */}
      {!batchResult && (
        <div
          onDragOver={(e) => e.preventDefault()}
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
          aria-label="Select multiple files for batch processing"
          className="border-2 border-dashed border-[var(--color-info-border)] bg-[var(--color-brand-soft)] hover:border-[var(--color-brand)] rounded-2xl px-4 py-10 sm:p-12 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center gap-4 select-none focus:outline-none focus-visible:border-[var(--color-brand)] focus-visible:ring-4 focus-visible:ring-[var(--color-brand)]/20"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.tiff"
            className="hidden"
          />

          <span className="w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-info-border)] flex items-center justify-center" aria-hidden="true">
            <Layers className="w-7 h-7 text-[var(--color-brand)]" />
          </span>

          <div className="space-y-1.5 max-w-md">
            <p className="font-semibold text-[17px] text-[var(--color-ink)]">
              Drop your files here, or browse
            </p>
            <p className="text-[13px] text-[var(--color-text-muted)]">
              PDF, PNG, JPG or TIFF · bank statements, invoices and receipts
            </p>
          </div>

          <span className="btn-brand-primary pointer-events-none" aria-hidden="true">
            <Upload className="w-4 h-4" />
            <span>Choose Files</span>
          </span>
        </div>
      )}

      {/* Selected Files Queue */}
      {selectedFiles.length > 0 && !batchResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-medium text-[var(--color-text-muted)]">
              Selected Queue ({selectedFiles.length} files)
            </h4>
            <button
              type="button"
              onClick={clearAllFiles}
              disabled={isProcessing}
              className="min-h-[36px] px-3 -mr-3 rounded-full text-[13px] font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors cursor-pointer disabled:opacity-40"
            >
              Clear All
            </button>
          </div>

          <ul className="max-h-60 overflow-y-auto rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border-subtle)]">
            {selectedFiles.map((file, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-3 pl-4 pr-2 py-2 text-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" aria-hidden="true" />
                  <span className="text-[var(--color-ink)] truncate">{file.name}</span>
                  <span className="text-xs text-[var(--color-text-muted)] tabular-nums shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                {!isProcessing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="w-11 h-11 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Error Message */}
          {errorMessage && (
            <div role="alert" className="p-3 bg-[var(--color-danger-soft)] rounded-xl text-[13px] text-[var(--color-danger)] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Processing Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm" aria-live="polite">
                <span className="text-[var(--color-ink)]">
                  Processing Multi-File Batch with AI Financial Engine...
                </span>
                <span className="tabular-nums font-medium text-[var(--color-ink)] shrink-0">{progress}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Batch processing progress"
                className="w-full bg-[var(--color-surface-muted)] rounded-full h-1 overflow-hidden"
              >
                <div
                  className="bg-[var(--color-brand)] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Start Button */}
          {!isProcessing && (
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={startBatchExtraction}
                className="btn-brand-primary w-full sm:w-auto"
              >
                <span>Process {selectedFiles.length} Documents in Parallel</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Parallel OCR &middot; Consolidated Master Sheet Output</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batch Results View */}
      {batchResult && (
        <div className="space-y-6">
          {/* Success header & Master Download */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-0.5">
                <h4 className="font-semibold text-[17px] text-[var(--color-ink)]">
                  Batch Extraction Complete ({batchResult.successful_count} Files)
                </h4>
                <p className="text-[13px] text-[var(--color-text-muted)] tabular-nums">
                  All records parsed and reconciled in {(batchResult.total_processing_time_ms / 1000).toFixed(2)}s.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadConsolidatedExcel}
                className="btn-brand-primary"
              >
                <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
                <span>Download Master Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={clearAllFiles}
                className="btn-brand-secondary"
              >
                New Batch
              </button>
            </div>
          </div>

          {/* Consolidated Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FinancialMetricCard
              title="Consolidated Total Inflow"
              value={formatUSD(batchResult.consolidated_inflow || 0)}
              variant="brand"
            />
            <FinancialMetricCard
              title="Consolidated Total Outflow"
              value={formatUSD(batchResult.consolidated_outflow || 0)}
              variant="pink"
            />
            <FinancialMetricCard
              title="Net Consolidated Balance"
              value={formatUSD(batchResult.net_consolidated_savings || 0)}
              variant="neutral"
            />
          </div>

          {/* Batch Files List */}
          <div className="space-y-2">
            <h4 className="text-[13px] font-medium text-[var(--color-text-muted)]">
              Extracted Batch Documents
            </h4>

            <ul className="rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border-subtle)]">
              {batchResult.items.map((item) => (
                <li
                  key={item.id}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[15px] text-[var(--color-ink)] truncate">{item.filename}</span>
                      <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
                        Success
                      </span>
                    </div>
                    <div className="text-[13px] text-[var(--color-text-muted)] flex flex-wrap items-center gap-x-2 tabular-nums">
                      <span>Time: {((item.processing_time_ms || 1000) / 1000).toFixed(2)}s</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>Bank: {item.extraction?.bank_name || 'Financial Statement'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectExtraction) {
                        onSelectExtraction(item.id);
                      } else {
                        router.push(`/document/${item.id}`);
                      }
                    }}
                    className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-3 -ml-3 sm:ml-0 rounded-full text-sm font-medium text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)] transition-colors cursor-pointer"
                  >
                    <span>View Statement</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Auth Modal if guest */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="batch_upload"
      />
    </div>
  );
}
