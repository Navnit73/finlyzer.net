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
import AuthModal from '../auth/AuthModal';
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
      console.error(e);
      alert('Failed to download consolidated Excel file.');
    }
  };

  const modalContent = (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 animate-fade-in overflow-y-auto">
        <div
          className="relative w-full max-w-4xl bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6 sm:p-8 space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto my-auto shadow-none"
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors"
            aria-label="Close dialog"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="space-y-1 pr-8">
            <div className="flex items-center gap-2">
              <span className="badge bg-[var(--media-violet)] text-white font-bold text-xs border-none px-2.5 py-1">
                BULK PROCESSING
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">Up to 50 Files / .zip Archive</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight">
              Batch Financial Statement Extraction
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              Upload multiple monthly PDF statements to concurrently extract line items and generate a consolidated 12-Month Annual Cashflow Master Report.
            </p>
          </div>

          {/* Dropzone Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-brand)] bg-[var(--color-surface-subtle)] rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all hover:bg-[var(--color-surface-muted)] group"
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
            <div className="w-14 h-14 mx-auto rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
              <Upload className="w-7 h-7 stroke-[2.5]" />
            </div>
            <p className="font-bold text-sm text-[var(--color-ink)]">
              Choose files or drag &amp; drop multiple statements
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Supports PDF, Scanned Images &amp; .ZIP archives (Up to 50 files)
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] rounded-lg text-xs text-[var(--color-danger)] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selected File List */}
          {selectedFiles.length > 0 && !batchResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--color-ink)]">
                  Selected Files ({selectedFiles.length})
                </span>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-[var(--color-danger)] hover:underline font-semibold cursor-pointer"
                  disabled={isProcessing}
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-[var(--color-surface-subtle)] rounded-lg border border-[var(--color-border)] text-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileSpreadsheet className="w-4 h-4 text-[var(--color-brand-hover)] shrink-0" />
                      <span className="font-medium text-[var(--color-ink)] truncate">{file.name}</span>
                      <span className="text-[var(--color-text-muted)] font-mono shrink-0">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      disabled={isProcessing}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1 transition-colors cursor-pointer"
                      aria-label="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={startBatchExtraction}
                  disabled={isProcessing}
                  className="w-full btn-brand-primary !min-h-[52px] shadow-sm flex items-center justify-center gap-2 font-bold"
                >
                  {isProcessing ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Processing Batch ({progress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-5 h-5" />
                      <span>Process &amp; Reconcile {selectedFiles.length} Statements</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Batch Result View */}
          {batchResult && (
            <div className="space-y-6 pt-2">
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[var(--color-brand-soft)] border border-[var(--color-brand)]/40 rounded-lg">
                <div className="text-xs text-[var(--color-on-brand)]">
                  <p className="font-bold text-sm">12-Month Master Consolidated P&amp;L Ready</p>
                  <p className="text-[var(--color-text-secondary)]">
                    All monthly statements reconciled into a multi-sheet audited Excel master model.
                  </p>
                </div>
                <button
                  onClick={downloadConsolidatedMasterExcel}
                  className="btn-brand-primary !min-h-[44px] !py-0 !px-5 !text-xs font-bold shrink-0 shadow-xs flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Master Excel (.xlsx)</span>
                </button>
              </div>

              {/* Batch Item Breakdown List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                  Individual Statement Items ({batchResult.items.length})
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {batchResult.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-[var(--color-surface-subtle)] rounded-lg border border-[var(--color-border)] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CheckCircle2 className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
                        <div>
                          <p className="font-bold text-[var(--color-ink)] truncate">{item.filename}</p>
                          <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-2 font-mono">
                            <span>{item.extraction?.statement_period || 'Period Reconciled'}</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {item.processing_time_ms}ms
                            </span>
                          </p>
                        </div>
                      </div>

                      {onSelectExtraction && (
                        <button
                          onClick={() => {
                            onSelectExtraction(item.id);
                            onClose();
                          }}
                          className="btn btn-xs rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)] text-[var(--color-ink)] font-semibold shrink-0"
                        >
                          View Details &rarr;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setBatchResult(null);
                    setSelectedFiles([]);
                  }}
                  className="btn btn-sm rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-ink)] border-[var(--color-border)] text-xs font-bold px-4"
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
