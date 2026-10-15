'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  ArrowRight,
  Globe,
  FileType,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { DocumentType, SupportedLanguage } from '@/types/ocr';
import { useIsMounted } from '@/lib/useIsMounted';

interface UploadConfigModalProps {
  isOpen: boolean;
  file: File | null;
  isEncrypted: boolean;
  documentType: DocumentType;
  language: SupportedLanguage;
  passwordError?: string | null;
  isLoading?: boolean;
  onDocumentTypeChange: (type: DocumentType) => void;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onConfirm: (password?: string) => void;
  onClose: () => void;
}

interface DialogProps extends Omit<UploadConfigModalProps, 'isOpen'> {
  file: File;
}

function UploadConfigModalDialog({
  isEncrypted,
  documentType,
  language,
  passwordError,
  isLoading = false,
  onDocumentTypeChange,
  onLanguageChange,
  onConfirm,
  onClose,
}: DialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEncrypted && !password.trim()) {
      return;
    }
    onConfirm(password.trim() || undefined);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md surface-overlay p-6 sm:p-7 space-y-6 animate-scale-up my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-config-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          disabled={isLoading}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="pr-12 space-y-1.5">
          <h2 id="upload-config-modal-title" className="text-[21px] font-semibold tracking-tight text-[var(--color-ink)]">
            Configure Processing Options
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Document Setup
            </span>
            {isEncrypted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
                <Lock className="w-3 h-3" aria-hidden="true" /> Password Protected
              </span>
            )}
          </div>
        </div>

        {/* Form Selection Fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Document Type Selection */}
          <div className="space-y-1.5">
            <label
              htmlFor="modal-doc-type"
              className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink)]"
            >
              <FileType className="w-3.5 h-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
              Document Type
            </label>
            <select
              id="modal-doc-type"
              value={documentType}
              disabled={isLoading}
              onChange={(e) => onDocumentTypeChange(e.target.value as DocumentType)}
              className="w-full h-11 px-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[15px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <option value="auto">Auto-Detect (Smart Classification)</option>
              <option value="bank_statement">Bank Statement</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="general">General Financial Document</option>
            </select>
          </div>

          {/* Language Selection */}
          <div className="space-y-1.5">
            <label
              htmlFor="modal-language"
              className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink)]"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
              Language
            </label>
            <select
              id="modal-language"
              value={language}
              disabled={isLoading}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              className="w-full h-11 px-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[15px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <option value="en">English (EN)</option>
              <option value="hi">Hindi (HI)</option>
              <option value="es">Spanish (ES)</option>
              <option value="fr">French (FR)</option>
              <option value="de">German (DE)</option>
              <option value="auto">Auto-Detect Language</option>
            </select>
          </div>

          {/* Password Input */}
          {isEncrypted && (
            <div className="space-y-1.5">
              <label
                htmlFor="modal-password"
                className="flex items-center justify-between text-[13px] font-medium text-[var(--color-ink)]"
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
                  PDF Password
                </span>
                <span className="text-xs font-normal text-[var(--color-text-muted)]">
                  Required
                </span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                  <KeyRound className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="modal-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter decryption password (e.g. DOB, PAN)..."
                  required
                  autoFocus
                  disabled={isLoading}
                  aria-invalid={passwordError ? true : undefined}
                  className={`w-full h-11 pl-10 pr-12 rounded-xl bg-[var(--color-surface)] border text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-4 transition-colors ${
                    passwordError
                      ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/15'
                      : 'border-[var(--color-border)] focus:border-[var(--color-brand)] focus:ring-[var(--color-brand)]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>

              {passwordError ? (
                <p role="alert" className="text-[13px] text-[var(--color-danger)] flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{passwordError}</span>
                </p>
              ) : (
                <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">
                  Password used by your bank to encrypt this statement (e.g. Date of Birth, PAN, Account No).
                </p>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-brand-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || (isEncrypted && !password.trim())}
              className="btn-brand-primary"
            >
              <span>{isLoading ? 'Processing...' : 'Start Extraction'}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UploadConfigModal(props: UploadConfigModalProps) {
  const mounted = useIsMounted();
  if (!props.isOpen || !props.file || !mounted) return null;
  return createPortal(<UploadConfigModalDialog {...props} file={props.file} />, document.body);
}
