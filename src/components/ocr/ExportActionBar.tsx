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

interface ExportActionBarProps {
  documentId: string;
  documentTitle?: string;
  onConsolidateClick?: () => void;
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
  onConsolidateClick,
}: ExportActionBarProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<ExportFormat | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownload = async (format: ExportFormat) => {
    setDownloadingFormat(format);
    setDownloadSuccess(null);

    try {
      const response = await fetch(`/api/export/download/${documentId}?format=${format}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${documentTitle.replace(/\s+/g, '_')}_${documentId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setDownloadSuccess(format);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error('Export download failed:', e);
      alert('Failed to download export file. Please try again.');
    } finally {
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
    <div className="bg-[var(--color-surface)] rounded-2xl sm:rounded-3xl border border-[var(--color-border)] p-4 sm:p-6 space-y-4 shadow-xs">
      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] flex items-center justify-center font-bold shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[var(--color-ink)] uppercase tracking-wider flex items-center gap-2">
              <span>Export Reconciled Statement</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-brand-soft)] text-[var(--color-on-brand)]">
                6 Formats
              </span>
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Direct 1-click downloads with automatic account structure and formulas
            </p>
          </div>
        </div>

        {onConsolidateClick && (
          <button
            onClick={onConsolidateClick}
            className="btn btn-xs sm:btn-sm rounded-full border border-[var(--media-violet)]/40 bg-[var(--media-violet-soft)] hover:bg-[var(--media-violet-hover)] text-[var(--media-violet)] text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-2xs cursor-pointer"
            title="Consolidate multiple statements into unified P&L"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Consolidate P&amp;L</span>
          </button>
        )}
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
              className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between space-y-2 cursor-pointer group active:scale-95 disabled:opacity-50 ${
                opt.isPrimary
                  ? 'bg-[var(--color-brand-soft)]/60 border-[var(--color-brand)]/50 hover:bg-[var(--color-brand-soft)] shadow-xs'
                  : 'bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] border-[var(--color-border)] hover:border-[var(--color-ink)]/20 shadow-2xs'
              }`}
            >
              {/* Top Row: Icon & Extension Badge */}
              <div className="flex items-center justify-between gap-1">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    opt.isPrimary
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
                  {isSuccess ? 'Downloaded!' : opt.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


