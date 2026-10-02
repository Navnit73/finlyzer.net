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
  Clock,
  Trash2,
  Download,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { BatchResponse } from '@/types/ocr';
import FinancialMetricCard from './FinancialMetricCard';
import AuthModal from '../auth/AuthModal';

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
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Batch_Consolidated_Master_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to download master consolidated report.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Informative Header */}
      <div className="p-4 sm:p-5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--media-violet-soft)] text-[var(--media-violet)] flex items-center justify-center font-bold">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h3 className="font-black text-base text-[var(--color-ink)]">
              Multi-File Batch Processor & Annual Consolidator
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Upload up to 50 statements or invoices at once. Automatically reconciles balances and merges all records into a unified master Excel workbook.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="badge badge-sm bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)] text-[10px] font-bold rounded-lg px-2.5 py-2">
            Max 50 Files
          </span>
          <span className="badge badge-sm bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] text-[10px] font-bold rounded-lg px-2.5 py-2">
            Auto-Consolidate
          </span>
        </div>
      </div>

      {/* Dropzone Area */}
      {!batchResult && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-brand)] bg-[var(--color-surface-subtle)]/50 hover:bg-[var(--color-surface-subtle)] rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 select-none"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.tiff"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)] flex items-center justify-center shadow-xs">
            <Upload className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div className="space-y-1 max-w-md">
            <p className="font-black text-sm sm:text-base text-[var(--color-ink)]">
              Drop multiple PDF statements or click to browse
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Supports Bank Statements (SBI, HDFC, ICICI, Chase, BoA), Invoices, and Multi-page Receipts
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="btn-brand-dark !min-h-[36px] !h-[36px] !px-4 text-xs font-bold inline-flex items-center gap-2 pointer-events-none rounded-lg"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Select Multi-File Queue</span>
            </button>
          </div>
        </div>
      )}

      {/* Selected Files Queue */}
      {selectedFiles.length > 0 && !batchResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <span>Selected Queue ({selectedFiles.length} files)</span>
            </h4>
            <button
              onClick={clearAllFiles}
              disabled={isProcessing}
              className="text-xs font-bold text-[var(--color-danger)] hover:underline cursor-pointer disabled:opacity-50"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs"
              >
                <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                  <FileText className="w-4 h-4 text-[var(--media-violet)] shrink-0" />
                  <span className="font-bold text-[var(--color-ink)] truncate">{file.name}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                {!isProcessing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="p-1 rounded hover:bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] rounded-lg text-xs text-[var(--color-danger)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Processing Progress Bar */}
          {isProcessing && (
            <div className="p-4 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--color-ink)] flex items-center gap-2">
                  <span className="loading loading-spinner loading-xs text-[var(--color-brand)]"></span>
                  Processing Multi-File Batch with DeepSeek AI...
                </span>
                <span className="font-mono font-bold text-[var(--color-ink)]">{progress}%</span>
              </div>
              <div className="w-full bg-[var(--color-border)] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[var(--color-brand)] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Start Button */}
          {!isProcessing && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={startBatchExtraction}
                className="w-full sm:w-auto btn-brand-primary !min-h-[44px] !h-[44px] !px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer rounded-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>Process {selectedFiles.length} Documents in Parallel</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-success)]" />
                <span>Parallel OCR &bull; Consolidated Master Sheet Output</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batch Results View */}
      {batchResult && (
        <div className="space-y-6 pt-2">
          {/* Success Banner & Master Download */}
          <div className="p-5 rounded-lg bg-[var(--color-surface-subtle)] border-2 border-[var(--color-brand)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                <h4 className="font-black text-base text-[var(--color-ink)]">
                  Batch Extraction Complete ({batchResult.successful_count} Files)
                </h4>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                All records parsed and reconciled in {(batchResult.total_processing_time_ms / 1000).toFixed(2)}s.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadConsolidatedExcel}
                className="btn-brand-primary !min-h-[40px] !h-[40px] !px-4 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer rounded-lg"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Master Excel (.xlsx)</span>
              </button>

              <button
                onClick={clearAllFiles}
                className="btn-brand-secondary !min-h-[40px] !h-[40px] !px-3 text-xs font-bold rounded-lg cursor-pointer"
              >
                New Batch
              </button>
            </div>
          </div>

          {/* Consolidated Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FinancialMetricCard
              title="Consolidated Total Inflow"
              value={`$ ${(batchResult.consolidated_inflow || 0).toLocaleString()}`}
              variant="brand"
            />
            <FinancialMetricCard
              title="Consolidated Total Outflow"
              value={`$ ${(batchResult.consolidated_outflow || 0).toLocaleString()}`}
              variant="pink"
            />
            <FinancialMetricCard
              title="Net Consolidated Balance"
              value={`$ ${(batchResult.net_consolidated_savings || 0).toLocaleString()}`}
              variant="neutral"
            />
          </div>

          {/* Batch Files List */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">
              Extracted Batch Documents
            </h4>

            <div className="space-y-2">
              {batchResult.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--color-ink)] text-sm">{item.filename}</span>
                      <span className="badge badge-sm bg-[var(--color-success-soft)] text-[var(--color-success)] font-bold text-[10px] rounded-lg border-none">
                        Success
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-2">
                      <span>Time: {((item.processing_time_ms || 1000) / 1000).toFixed(2)}s</span>
                      <span>&bull;</span>
                      <span>Bank: {item.extraction?.bank_name || 'Financial Statement'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        if (onSelectExtraction) {
                          onSelectExtraction(item.id);
                        } else {
                          router.push(`/document/${item.id}`);
                        }
                      }}
                      className="btn btn-xs sm:btn-sm rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-border)] text-[var(--color-ink)] font-bold px-3 border border-[var(--color-border)] flex items-center gap-1.5"
                    >
                      <span>View Statement</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
