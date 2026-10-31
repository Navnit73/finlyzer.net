'use client';

import React from 'react';
import { Check, Download, Layers, Lock } from 'lucide-react';
import { EXPORT_FORMATS, ExportDownloadState, ExportFormatOption } from './useExportDownload';

interface ExportActionBarProps {
  exportState: ExportDownloadState;
  onConsolidateClick?: () => void;
}

const GROUPS: { id: ExportFormatOption['group']; title: string }[] = [
  { id: 'spreadsheet', title: 'Working in a spreadsheet' },
  { id: 'accounting', title: 'Importing into accounting software' },
  { id: 'document', title: 'Printing or sharing' },
];

/** "Which file do I need?" — every export format grouped by where the data is going. */
export default function ExportActionBar({ exportState, onConsolidateClick }: ExportActionBarProps) {
  const { downloadingFormat, downloadSuccess, requiresUnlock, download, openUnlockModal } = exportState;

  return (
    <section id="export" aria-label="Export options" className="scroll-mt-24 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="type-title">Which file do I need?</h2>
        <p className="text-[17px] text-[var(--color-text-secondary)] max-w-xl mx-auto">
          {requiresUnlock
            ? 'This 11–30 page statement needs a one-time $10 unlock to export.'
            : 'Pick the one that matches where your transactions are going.'}
        </p>
        {requiresUnlock && (
          <div className="pt-3">
            <button type="button" onClick={openUnlockModal} className="btn-brand-primary">
              <Lock className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              Unlock all formats for $10
            </button>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {GROUPS.map((group) => (
          <div key={group.id} className="space-y-2">
            <h3 className="px-1 text-[13px] font-medium text-[var(--color-text-muted)]">{group.title}</h3>
            <ul className="overflow-hidden rounded-2xl bg-[var(--color-surface-subtle)] divide-y divide-[var(--color-border)]">
              {EXPORT_FORMATS.filter((opt) => opt.group === group.id).map((opt) => {
                const isDownloading = downloadingFormat === opt.format;
                const isSuccess = downloadSuccess === opt.format;
                const Icon = opt.icon;

                return (
                  <li key={opt.format}>
                    <button
                      type="button"
                      onClick={() => download(opt.format)}
                      disabled={downloadingFormat !== null}
                      aria-label={`Download ${opt.name} (${opt.ext})${requiresUnlock ? ' - unlock required' : ''}`}
                      className="group flex w-full items-center gap-4 px-4 sm:px-5 py-4 text-left transition-colors hover:bg-[var(--color-surface-muted)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface)] text-[var(--color-ink)]">
                        <Icon className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="text-[17px] font-semibold text-[var(--color-ink)] truncate">{opt.name}</span>
                          <span className="text-[13px] text-[var(--color-text-muted)] shrink-0">{opt.ext}</span>
                        </span>
                        <span className="block text-sm text-[var(--color-text-secondary)]">{opt.description}</span>
                      </span>

                      <span
                        className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors ${
                          isSuccess
                            ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
                            : 'bg-[var(--color-surface)] text-[var(--color-brand-dark)] group-hover:bg-[var(--color-brand)] group-hover:text-[var(--color-on-brand)]'
                        }`}
                      >
                        {isDownloading ? (
                          <span className="loading loading-spinner loading-xs" aria-label="Downloading"></span>
                        ) : isSuccess ? (
                          <Check className="w-4 h-4" aria-hidden="true" />
                        ) : requiresUnlock ? (
                          <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <Download className="w-4 h-4" aria-hidden="true" />
                        )}
                        <span className="hidden sm:inline">
                          {isSuccess ? 'Downloaded' : requiresUnlock ? 'Unlock' : 'Download'}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {onConsolidateClick && (
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Have several statements?{' '}
            <button type="button" onClick={onConsolidateClick} className="link inline-flex items-center gap-1 cursor-pointer">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              Combine them into one P&amp;L
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
