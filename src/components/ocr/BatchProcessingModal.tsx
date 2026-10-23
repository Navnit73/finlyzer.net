'use client';

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import {
  X,
  Upload,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Download,
} from 'lucide-react';
import { BatchResponse } from '@/types/ocr';
import FinancialMetricCard from './FinancialMetricCard';
import AuthModal from '../auth/LazyAuthModal';
import { useIsMounted } from '@/lib/useIsMounted';

interface BatchProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExtraction?: (id: string) => void;
}

export default function BatchProcessingModal({
  isOpen,
  onClose,
  onSelectExtraction,
}: BatchProcessingModalProps) {
  const { data: session } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchResult, setBatchResult] = useState<BatchResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mounted = useIsMounted();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, onClose]);

  if (!isOpen || !mounted) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
      setBatchResult(null);
      setErrorMessage(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const startBatchExtraction = async () => {
    if (selectedFiles.length === 0) return;

    // Check if user is logged in
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

      // Progress animation simulation
      const interval = setInterval(() => {
        setProgress((p) => (p < 85 ? p + 15 : p));
      }, 500);

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
    } catch (e: unknown) {
      const error = e as { message?: string };
      setErrorMessage(error.message || 'Batch OCR extraction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadConsolidatedMasterExcel = async () => {
    if (!batchResult || !batchResult.items) return;
    try {
      const requestIds = batchResult.items.map((it) => it.id);
      const res = await fetch('/api/export/consolidate?as_excel=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Batch Consolidated Master Cashflow Audit',
          request_ids: requestIds,
        }),
      });

      if (!res.ok) throw new Error('Consolidation export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Batch_Consolidated_Master_Audit_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Consolidation export error:', (e as Error)?.message || 'Export error');
      alert('Failed to download consolidated Excel file.');
    }
  };

  const modalContent = (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 animate-fade-in overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isProcessing) {
            onClose();
          }
        }}
      >
        <div
          className="relative w-full max-w-3xl surface-overlay p-6 sm:p-8 space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto my-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="batch-modal-title"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Close dialog"
            disabled={isProcessing}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Modal Header */}
          <div className="space-y-1.5 pr-12">
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]">
                Bulk processing
              </span>
              <span>Up to 50 Files / .zip Archive</span>
            </div>
            <h2 id="batch-modal-title" className="type-title">
              Batch Financial Statement Extraction
            </h2>
            <p className="text-[15px] text-[var(--color-text-secondary)]">
              Upload multiple monthly PDF statements to concurrently extract line items and generate a consolidated 12-Month Annual Cashflow Master Report.
            </p>
          </div>

          {/* Dropzone Area */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Choose files or drag and drop multiple financial statements"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className="border border-dashed border-[var(--color-border-hover)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] rounded-2xl px-4 py-8 sm:p-10 text-center cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:border-[var(--color-brand)] focus-visible:ring-4 focus-visible:ring-[var(--color-brand)]/20"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff,.zip"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <span className="mx-auto mb-3 w-11 h-11 rounded-full bg-[var(--color-surface-subtle)] flex items-center justify-center" aria-hidden="true">
              <Upload className="w-5 h-5 text-[var(--color-ink)]" />
            </span>
            <p className="font-semibold text-[17px] text-[var(--color-ink)]">
              Choose files or drag &amp; drop multiple statements
            </p>
            <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
              Supports PDF, Scanned Images &amp; .ZIP archives (Up to 50 files)
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div role="alert" className="p-3.5 bg-[var(--color-danger-soft)] rounded-xl text-[13px] text-[var(--color-danger)] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selected File List */}
          {selectedFiles.length > 0 && !batchResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[var(--color-text-muted)]">
                  Selected Files ({selectedFiles.length})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="min-h-[36px] px-3 -mr-3 rounded-full text-[13px] font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors cursor-pointer disabled:opacity-40"
                  disabled={isProcessing}
                >
                  Clear All
                </button>
              </div>

              <ul className="max-h-48 overflow-y-auto rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border-subtle)]">
                {selectedFiles.map((file, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 pl-4 pr-2 py-1.5 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileSpreadsheet className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" aria-hidden="true" />
                      <span className="text-[var(--color-ink)] truncate">{file.name}</span>
                      <span className="text-xs text-[var(--color-text-muted)] tabular-nums shrink-0">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      disabled={isProcessing}
                      className="w-11 h-11 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] transition-colors cursor-pointer disabled:opacity-40"
                      aria-label={`Remove ${file.name}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>

              {isProcessing && (
                <div
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Batch processing progress"
                  className="w-full bg-[var(--color-surface-muted)] h-1 rounded-full overflow-hidden"
                >
                  <div
                    className="bg-[var(--color-brand)] h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Action Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={startBatchExtraction}
                  disabled={isProcessing}
                  className="w-full btn-brand-primary"
                >
                  {isProcessing ? (
                    <>
                      <span className="loading loading-spinner loading-sm" aria-hidden="true"></span>
                      <span className="tabular-nums">Processing Batch ({progress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" aria-hidden="true" />
                      <span>Process &amp; Reconcile {selectedFiles.length} Statements</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Batch Result View */}
          {batchResult && (
            <div className="space-y-6">
              {/* Consolidated Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FinancialMetricCard
                  title="Consolidated Inflow"
                  value={batchResult.consolidated_inflow || 0}
                  subtitle="Total Deposits Across Files"
                  variant="brand"
                  currency="USD"
                />
                <FinancialMetricCard
                  title="Consolidated Outflow"
                  value={batchResult.consolidated_outflow || 0}
                  subtitle="Total Debits Across Files"
                  variant="pink"
                  currency="USD"
                />
                <FinancialMetricCard
                  title="Net Consolidated Savings"
                  value={batchResult.net_consolidated_savings || 0}
                  subtitle={`${batchResult.successful_count} Files Processed in ${batchResult.total_processing_time_ms}ms`}
                  variant="blue"
                  currency="USD"
                />
              </div>

              {/* Master Download CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[var(--color-surface-subtle)] rounded-2xl">
                <div className="space-y-0.5">
                  <p className="font-semibold text-[15px] text-[var(--color-ink)]">12-Month Master Consolidated P&amp;L Ready</p>
                  <p className="text-[13px] text-[var(--color-text-secondary)]">
                    All monthly statements reconciled into a multi-sheet audited Excel master model.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadConsolidatedMasterExcel}
                  className="btn-brand-primary shrink-0"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download Master Excel (.xlsx)</span>
                </button>
              </div>

              {/* Batch Item Breakdown List */}
              <div className="space-y-2">
                <h4 className="text-[13px] font-medium text-[var(--color-text-muted)]">
                  Individual Statement Items ({batchResult.items.length})
                </h4>
                <ul className="max-h-60 overflow-y-auto rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border-subtle)]">
                  {batchResult.items.map((item) => (
                    <li
                      key={item.id}
                      className="px-4 py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm text-[var(--color-ink)] truncate">{item.filename}</p>
                          <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 tabular-nums">
                            <span className="truncate">{item.extraction?.statement_period || 'Period Reconciled'}</span>
                            <span aria-hidden="true">&middot;</span>
                            <span className="flex items-center gap-0.5 shrink-0">
                              <Clock className="w-3 h-3" aria-hidden="true" /> {item.processing_time_ms}ms
                            </span>
                          </p>
                        </div>
                      </div>

                      {onSelectExtraction && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectExtraction(item.id);
                            onClose();
                          }}
                          className="shrink-0 min-h-[36px] px-3 -mr-2 rounded-full text-[13px] font-medium text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)] transition-colors cursor-pointer"
                        >
                          View Details &rarr;
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reset Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setBatchResult(null);
                    setSelectedFiles([]);
                  }}
                  className="btn-brand-secondary"
                >
                  Start New Batch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="batch_upload"
      />
    </>
  );

  return createPortal(modalContent, document.body);
}
