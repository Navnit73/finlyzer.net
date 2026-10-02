'use client';

import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  Layers,
  ChevronDown,
  Check,
} from 'lucide-react';
import { ExportFormat } from '@/types/ocr';

interface ExportActionBarProps {
  documentId: string;
  documentTitle?: string;
  onConsolidateClick?: () => void;
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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[var(--color-surface-subtle)] rounded-2xl border border-[var(--color-border)]">
      {/* Title / Format info */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] flex items-center justify-center font-bold">
          <Download className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider">
            Export Financial Models
          </h4>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Instant compatibility with Excel, QuickBooks, Xero &amp; Zoho
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Primary 1-Click Excel Download */}
        <button
          onClick={() => handleDownload('xlsx')}
          disabled={downloadingFormat !== null}
          className="btn-brand-primary !min-h-[42px] !py-0 !px-4 !text-xs sm:!text-sm shadow-xs"
        >
          {downloadingFormat === 'xlsx' ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : downloadSuccess === 'xlsx' ? (
            <Check className="w-4 h-4" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          <span>Download Excel (.xlsx)</span>
        </button>

        {/* CSV Quick Download */}
        <button
          onClick={() => handleDownload('csv')}
          disabled={downloadingFormat !== null}
          className="btn-brand-secondary !min-h-[42px] !py-0 !px-3 !text-xs font-bold flex items-center gap-1.5"
        >
          {downloadingFormat === 'csv' ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <FileText className="w-4 h-4 text-[var(--color-text-secondary)]" />
          )}
          <span>CSV</span>
        </button>

        {/* More Formats Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-sm btn-ghost rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-xs font-bold text-[var(--color-ink)] flex items-center gap-1 h-[42px] px-3"
          >
            <span>More Formats</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-50 menu p-2 shadow-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-56 text-xs space-y-1 mt-1"
          >
            <li>
              <button
                onClick={() => handleDownload('pdf')}
                className="py-2 flex items-center justify-between font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>PDF Document (.pdf)</span>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleDownload('qbo')}
                className="py-2 flex items-center justify-between font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span>QuickBooks Online (.qbo)</span>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleDownload('ofx')}
                className="py-2 flex items-center justify-between font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Xero / Zoho / Tally (.ofx)</span>
                </div>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleDownload('qif')}
                className="py-2 flex items-center justify-between font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-violet-600" />
                  <span>Quicken Desktop (.qif)</span>
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* Consolidate statements button (if provided) */}
        {onConsolidateClick && (
          <button
            onClick={onConsolidateClick}
            className="btn btn-sm btn-ghost rounded-full border border-[var(--media-violet)]/40 bg-[#F2EDFD] hover:bg-[#E9E0FC] text-xs font-bold text-[var(--media-violet)] flex items-center gap-1.5 h-[42px] px-3"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Consolidate Annual P&amp;L</span>
          </button>
        )}
      </div>
    </div>
  );
}
