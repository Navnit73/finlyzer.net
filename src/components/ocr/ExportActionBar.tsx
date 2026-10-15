'use client';

import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  Layers,
  Check,
} from 'lucide-react';
import { ExportFormat } from '@/types/ocr';
import GuestUnlockModal from '@/components/guest/GuestUnlockModal';

interface ExportActionBarProps {
  documentId: string;
  documentTitle?: string;
  pages?: number;
  isGuest?: boolean;
  isPaid?: boolean;
  onConsolidateClick?: () => void;
  onUnlockSuccess?: () => void;
}

interface FormatOption {
  format: ExportFormat;
  name: string;
  ext: string;
  subtitle: string;
  icon: React.ElementType;
  isPrimary?: boolean;
}

export default function ExportActionBar({
  documentId,
  documentTitle = 'Financial Statement',
  pages = 1,
  isGuest = false,
  isPaid = true,
  onConsolidateClick,
  onUnlockSuccess,
}: ExportActionBarProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<ExportFormat | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  const requiresUnlock = isGuest && pages > 10 && !isPaid;

  const handleDownload = async (format: ExportFormat) => {
    if (requiresUnlock) {
      setIsUnlockModalOpen(true);
      return;
    }

    setDownloadingFormat(format);
    setDownloadSuccess(null);
    let downloadUrl: string | null = null;

    try {
      const response = await fetch(`/api/export/download/${documentId}?format=${format}`);
      if (!response.ok) {
        if (response.status === 402) {
          setIsUnlockModalOpen(true);
          return;
        }
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${documentTitle.replace(/\s+/g, '_')}_${documentId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setDownloadSuccess(format);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.warn('Export download failed:', (e as Error)?.message || 'Export error');
      alert('Failed to download export file. Please try again.');
    } finally {
      if (downloadUrl) {
        window.URL.revokeObjectURL(downloadUrl);
      }
      setDownloadingFormat(null);
    }
  };

  const formatOptions: FormatOption[] = [
    {
      format: 'xlsx',
      name: 'Excel Workbook',
      ext: '.xlsx',
      subtitle: 'Formulas & Charts',
      icon: FileSpreadsheet,
      isPrimary: true,
    },
    {
      format: 'csv',
      name: 'CSV Spreadsheet',
      ext: '.csv',
      subtitle: 'Universal Raw Data',
      icon: FileText,
    },
    {
      format: 'pdf',
      name: 'PDF Statement',
      ext: '.pdf',
      subtitle: 'Formatted Document',
      icon: FileText,
    },
    {
      format: 'qbo',
      name: 'QuickBooks',
      ext: '.qbo',
      subtitle: 'Intuit Bank Feed',
      icon: FileCode,
    },
    {
      format: 'ofx',
      name: 'Xero / OFX',
      ext: '.ofx',
      subtitle: 'Zoho / Tally / Xero',
      icon: FileCode,
    },
    {
      format: 'qif',
      name: 'Quicken',
      ext: '.qif',
      subtitle: 'Desktop Finance',
      icon: FileCode,
    },
  ];

  return (
    <>
      <section
        aria-label="Export options"
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 space-y-4"
      >
        {/* Header Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-[15px] font-semibold text-[var(--color-ink)] flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[var(--color-text-muted)]" aria-hidden="true" />
                Export Reconciled Statement
              </span>
              {requiresUnlock ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
                  $10 Unlock Required
                </span>
              ) : (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-success-soft)] text-[var(--color-success)]">
                  6 Formats Unlocked
                </span>
              )}
            </h3>
            <p className="text-[13px] text-[var(--color-text-muted)]">
              {requiresUnlock
                ? 'This 11–30 page statement requires a $10 one-time unlock pass to export all 6 formats'
                : 'Direct 1-click downloads with automatic account structure and formulas'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {requiresUnlock && (
              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(true)}
                className="btn-brand-primary !min-h-[40px] !px-4 !text-sm"
              >
                <span>Unlock All Exports ($10)</span>
              </button>
            )}

            {onConsolidateClick && (
              <button
                type="button"
                onClick={onConsolidateClick}
                className="btn-brand-secondary !min-h-[40px] !px-4 !text-sm"
                title="Consolidate multiple statements into unified P&L"
                aria-label="Consolidate multiple statements into unified P&L"
              >
                <Layers className="w-4 h-4" aria-hidden="true" />
                <span>Consolidate P&amp;L</span>
              </button>
            )}
          </div>
        </div>

        {/* 1-click download toolbar for ALL formats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {formatOptions.map((opt) => {
            const isDownloading = downloadingFormat === opt.format;
            const isSuccess = downloadSuccess === opt.format;
            const Icon = opt.icon;
            const emphasize = opt.isPrimary && !requiresUnlock;

            return (
              <button
                type="button"
                key={opt.format}
                onClick={() => handleDownload(opt.format)}
                disabled={downloadingFormat !== null}
                aria-label={`Export as ${opt.name} (${opt.ext})${requiresUnlock ? ' - Unlock required' : ''}`}
                className={`min-h-[56px] px-3 py-2.5 rounded-xl text-left flex items-center gap-2.5 transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
                  emphasize
                    ? 'bg-[var(--color-brand-soft)] hover:bg-[var(--color-brand-soft)]/70'
                    : 'bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)]'
                }`}
              >
                <span
                  className={`w-4 h-4 flex items-center justify-center shrink-0 ${
                    isSuccess
                      ? 'text-[var(--color-success)]'
                      : emphasize
                      ? 'text-[var(--color-brand-dark)]'
                      : requiresUnlock
                      ? 'text-[var(--color-text-muted)]'
                      : 'text-[var(--color-ink)]'
                  }`}
                >
                  {isDownloading ? (
                    <span className="loading loading-spinner loading-xs" aria-label="Downloading"></span>
                  ) : isSuccess ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-1.5 min-w-0">
                    <span className={`text-[13px] font-medium truncate ${emphasize ? 'text-[var(--color-brand-dark)]' : 'text-[var(--color-ink)]'}`}>
                      {opt.name}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)] shrink-0">{opt.ext}</span>
                  </span>
                  <span className="block text-xs text-[var(--color-text-muted)] truncate">
                    {requiresUnlock ? 'Click to Unlock ($10)' : isSuccess ? 'Downloaded!' : opt.subtitle}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Guest Unlock Modal */}
      <GuestUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        documentId={documentId}
        filename={documentTitle}
        pageCount={pages}
        onUnlockSuccess={() => {
          if (onUnlockSuccess) {
            onUnlockSuccess();
          }
        }}
      />
    </>
  );
}


