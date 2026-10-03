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
  badgeColor: string;
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
      badgeColor: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success-border)]',
      isPrimary: true,
    },
    {
      format: 'csv',
      name: 'CSV Spreadsheet',
      ext: '.csv',
      subtitle: 'Universal Raw Data',
      icon: FileText,
      badgeColor: 'bg-[var(--color-surface-muted)] text-[var(--color-ink)] border-[var(--color-border)]',
    },
    {
      format: 'pdf',
      name: 'PDF Statement',
      ext: '.pdf',
      subtitle: 'Formatted Document',
      icon: FileText,
      badgeColor: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger-border)]',
    },
    {
      format: 'qbo',
      name: 'QuickBooks',
      ext: '.qbo',
      subtitle: 'Intuit Bank Feed',
      icon: FileCode,
      badgeColor: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success-border)]',
    },
    {
      format: 'ofx',
      name: 'Xero / OFX',
      ext: '.ofx',
      subtitle: 'Zoho / Tally / Xero',
      icon: FileCode,
      badgeColor: 'bg-[var(--media-blue-soft)] text-[var(--media-blue-text)] border-[var(--media-blue-border)]',
    },
    {
      format: 'qif',
      name: 'Quicken',
      ext: '.qif',
      subtitle: 'Desktop Finance',
      icon: FileCode,
      badgeColor: 'bg-[var(--media-violet-soft)] text-[var(--media-violet-text)] border-[var(--media-violet-border)]',
    },
  ];

  return (
    <>
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 sm:p-6 space-y-4 shadow-xs">
        {/* Header Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold shrink-0 ${
              requiresUnlock
                ? 'bg-[var(--color-surface-muted)] text-[var(--color-ink)]'
                : 'bg-[var(--color-brand-soft)] text-[var(--color-on-brand)]'
            }`}>
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-2">
                <span>Export Reconciled Statement</span>
                {requiresUnlock ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-surface-muted)] text-[var(--color-ink)] border border-[var(--color-border)]">
                    $10 Unlock Required
                  </span>
                ) : (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-brand-soft)] text-[var(--color-on-brand)]">
                    6 Formats Unlocked
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                {requiresUnlock
                  ? 'This 11–30 page statement requires a $10 one-time unlock pass to export all 6 formats'
                  : 'Direct 1-click downloads with automatic account structure and formulas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {requiresUnlock && (
              <button
                onClick={() => setIsUnlockModalOpen(true)}
                className="btn-brand-primary !min-h-[32px] !h-[32px] !px-3.5 text-xs font-bold flex items-center gap-1.5 rounded-lg shadow-xs cursor-pointer"
              >
                <span>Unlock All Exports ($10)</span>
              </button>
            )}

            {onConsolidateClick && (
              <button
                onClick={onConsolidateClick}
                className="btn btn-xs sm:btn-sm rounded-full border border-[var(--media-violet)]/40 bg-[var(--media-violet-soft)] hover:bg-[var(--media-violet-hover)] text-[var(--media-violet)] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Consolidate multiple statements into unified P&L"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Consolidate P&amp;L</span>
              </button>
            )}
          </div>
        </div>

        {/* Visible 1-Click Download Grid for ALL Formats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {formatOptions.map((opt) => {
            const isDownloading = downloadingFormat === opt.format;
            const isSuccess = downloadSuccess === opt.format;
            const Icon = opt.icon;

            return (
              <button
                key={opt.format}
                onClick={() => handleDownload(opt.format)}
                disabled={downloadingFormat !== null}
                className={`p-3 rounded-lg border transition-colors text-left flex flex-col justify-between space-y-2 cursor-pointer group active:scale-95 disabled:opacity-50 shadow-none ${
                  requiresUnlock
                    ? 'bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] border-[var(--color-border)] hover:border-[var(--color-ink)]'
                    : opt.isPrimary
                    ? 'bg-[var(--color-brand-soft)] border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]'
                    : 'bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                }`}
              >
                {/* Top Row: Icon & Extension Badge */}
                <div className="flex items-center justify-between gap-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      requiresUnlock
                        ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'
                        : opt.isPrimary
                        ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)]'
                        : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)]'
                    }`}
                  >
                    {isDownloading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : isSuccess ? (
                      <Check className="w-3.5 h-3.5 text-[var(--color-success)] stroke-[3]" />
                    ) : (
                      <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${opt.badgeColor}`}
                  >
                    {opt.ext}
                  </span>
                </div>

                {/* Bottom Row: Name & Subtitle */}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--color-ink)] truncate group-hover:text-[var(--color-ink-soft)]">
                    {opt.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-secondary)] truncate">
                    {requiresUnlock ? 'Click to Unlock ($10)' : isSuccess ? 'Downloaded!' : opt.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

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


