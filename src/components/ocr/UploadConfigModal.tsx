'use client';

import React from 'react';
import { createPortal } from 'react-dom';

import {
  X,
  FileText,
  Sparkles,
  ArrowRight,
  Globe,
  FileType,
  Lock,
} from 'lucide-react';
import { DocumentType, SupportedLanguage } from '@/types/ocr';
import { useIsMounted } from '@/lib/useIsMounted';

interface UploadConfigModalProps {
  isOpen: boolean;
  file: File | null;
  estimatedPages: number;
  isEncrypted: boolean;
  documentType: DocumentType;
  language: SupportedLanguage;
  cleanWithAi: boolean;
  onDocumentTypeChange: (type: DocumentType) => void;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onCleanWithAiChange: (clean: boolean) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadConfigModal({
  isOpen,
  file,
  estimatedPages,
  isEncrypted,
  documentType,
  language,
  cleanWithAi,
  onDocumentTypeChange,
  onLanguageChange,
  onCleanWithAiChange,
  onConfirm,
  onClose,
}: UploadConfigModalProps) {
  const mounted = useIsMounted();

  if (!isOpen || !file || !mounted) return null;


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] p-6 sm:p-8 space-y-6 animate-scale-up my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-config-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-brand-soft)] text-[var(--color-on-brand)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-ink)]" />
              Document Setup
            </span>
            {isEncrypted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning-border)]">
                <Lock className="w-3 h-3" /> Password Protected
              </span>
            )}
          </div>
          <h2
            id="upload-config-modal-title"
            className="text-2xl font-black text-[var(--color-ink)] tracking-tight pt-1"
          >
            Configure Extraction Settings
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Review document details and select extraction preferences before processing.
          </p>
        </div>

        {/* File Preview Card */}
        <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
          <div className="w-11 h-11 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-brand-hover)] shrink-0 shadow-xs">
            <FileText className="w-6 h-6 text-[var(--color-success)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--color-ink)] truncate" title={file.name}>
              {file.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-medium mt-0.5">
              <span>{formatFileSize(file.size)}</span>
              <span>&bull;</span>
              <span>{estimatedPages} {estimatedPages === 1 ? 'Page' : 'Pages'}</span>
              <span>&bull;</span>
              <span className="uppercase text-[10px] tracking-wider font-semibold">
                {file.name.split('.').pop() || 'PDF'}
              </span>
            </div>
          </div>
        </div>

        {/* Form Selection Fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <label
              htmlFor="modal-doc-type"
              className="flex items-center justify-between text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <FileType className="w-4 h-4 text-[var(--color-text-secondary)]" />
                Document Type
              </span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] lowercase">
                default: auto-detect
              </span>
            </label>
            <div className="relative">
              <select
                id="modal-doc-type"
                value={documentType}
                onChange={(e) => onDocumentTypeChange(e.target.value as DocumentType)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all cursor-pointer"
              >
                <option value="auto">Auto-Detect (Smart Classification)</option>
                <option value="bank_statement">Bank Statement</option>
                <option value="invoice">Invoice</option>
                <option value="receipt">Receipt</option>
                <option value="general">General Financial Document</option>
              </select>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              AI automatically classifies transaction tables, balances, or line items.
            </p>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <label
              htmlFor="modal-language"
              className="flex items-center justify-between text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[var(--color-text-secondary)]" />
                Language
              </span>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] lowercase">
                default: english (en)
              </span>
            </label>
            <div className="relative">
              <select
                id="modal-language"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all cursor-pointer"
              >
                <option value="en">English (EN)</option>
                <option value="hi">Hindi (HI)</option>
                <option value="es">Spanish (ES)</option>
                <option value="fr">French (FR)</option>
                <option value="de">German (DE)</option>
                <option value="auto">Auto-Detect Language</option>
              </select>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Primary language used in headers, descriptions, and numeric formats.
            </p>
          </div>

          {/* DeepSeek AI Reconciliation Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] cursor-pointer select-none hover:bg-[var(--color-surface-muted)] transition-colors">
              <input
                type="checkbox"
                checked={cleanWithAi}
                onChange={(e) => onCleanWithAiChange(e.target.checked)}
                className="checkbox checkbox-xs checkbox-success mt-0.5"
              />
              <div className="flex-1 text-xs">
                <span className="font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                  DeepSeek AI Reconciliation &amp; Formatting
                </span>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                  Auto-corrects OCR artifacts, fixes misaligned tables, and validates debit/credit balance.
                </p>
              </div>
            </label>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-brand-secondary py-2.5 px-5 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-brand-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <span>Start Extraction</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
