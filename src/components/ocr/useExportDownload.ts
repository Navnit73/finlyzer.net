'use client';

import { useState } from 'react';
import { FileSpreadsheet, FileText, FileCode, type LucideIcon } from 'lucide-react';
import { ExportFormat } from '@/types/ocr';
import { FREE_PAGE_LIMIT } from '@/types/pricing';

export interface ExportFormatOption {
  format: ExportFormat;
  name: string;
  ext: string;
  description: string;
  icon: LucideIcon;
  group: 'spreadsheet' | 'document' | 'accounting';
}

export const EXPORT_FORMATS: ExportFormatOption[] = [
  { format: 'xlsx', name: 'Excel', ext: '.xlsx', description: 'Open in Excel, Numbers or Google Sheets', icon: FileSpreadsheet, group: 'spreadsheet' },
  { format: 'csv', name: 'CSV', ext: '.csv', description: 'Plain rows for any spreadsheet or tool', icon: FileText, group: 'spreadsheet' },
  { format: 'pdf', name: 'PDF', ext: '.pdf', description: 'A clean copy to print or share', icon: FileText, group: 'document' },
  { format: 'qbo', name: 'QuickBooks', ext: '.qbo', description: 'Import as a QuickBooks bank feed', icon: FileCode, group: 'accounting' },
  { format: 'ofx', name: 'Xero, Zoho & Tally', ext: '.ofx', description: 'The OFX file most accounting apps accept', icon: FileCode, group: 'accounting' },
  { format: 'qif', name: 'Quicken', ext: '.qif', description: 'For Quicken desktop', icon: FileCode, group: 'accounting' },
];

interface UseExportDownloadOptions {
  documentId: string;
  documentTitle: string;
  pages: number;
  isGuest: boolean;
  isPaid: boolean;
}

export type ExportDownloadState = ReturnType<typeof useExportDownload>;

/** Download state shared by every export button on a result page, plus the guest unlock gate. */
export function useExportDownload({ documentId, documentTitle, pages, isGuest, isPaid }: UseExportDownloadOptions) {
  const [downloadingFormat, setDownloadingFormat] = useState<ExportFormat | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<ExportFormat | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  // UI hint only; the export API enforces the limit with a 402.
  const requiresUnlock = isGuest && pages > FREE_PAGE_LIMIT && !isPaid;

  const download = async (format: ExportFormat) => {
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
      setHasDownloaded(true);
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

  return {
    downloadingFormat,
    downloadSuccess,
    hasDownloaded,
    requiresUnlock,
    download,
    isUnlockModalOpen,
    openUnlockModal: () => setIsUnlockModalOpen(true),
    closeUnlockModal: () => setIsUnlockModalOpen(false),
  };
}
