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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEncrypted && !password.trim()) {
      return;
    }
    onConfirm(password.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 bg-black/60 animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-md bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-5 sm:p-7 space-y-5 animate-scale-up my-auto shadow-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-config-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          disabled={isLoading}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-wrap items-center gap-2 pr-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[var(--color-brand-soft)] text-[var(--color-on-brand)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-ink)]" />
            Document Setup
          </span>
          {isEncrypted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success-border)]">
              <Lock className="w-3 h-3" /> Password Protected
            </span>
          )}
        </div>

        {/* Form Selection Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Document Type Selection */}
          <div className="space-y-1.5">
            <label
              htmlFor="modal-doc-type"
              className="flex items-center justify-between text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <FileType className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                Document Type
              </span>
             
            </label>
            <div className="relative">
              <select
                id="modal-doc-type"
                value={documentType}
                disabled={isLoading}
                onChange={(e) => onDocumentTypeChange(e.target.value as DocumentType)}
                className="w-full py-2.5 px-3.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs sm:text-sm font-semibold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all cursor-pointer"
              >
                <option value="auto">Auto-Detect (Smart Classification)</option>
                <option value="bank_statement">Bank Statement</option>
                <option value="invoice">Invoice</option>
                <option value="receipt">Receipt</option>
                <option value="general">General Financial Document</option>
              </select>
            </div>

          </div>

          {/* Language Selection */}
          <div className="space-y-1.5">
            <label
              htmlFor="modal-language"
              className="flex items-center justify-between text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                Language
              </span>
            
            </label>
            <div className="relative">
              <select
                id="modal-language"
                value={language}
                disabled={isLoading}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="w-full py-2.5 px-3.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs sm:text-sm font-semibold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all cursor-pointer"
              >
                <option value="en">English (EN)</option>
                <option value="hi">Hindi (HI)</option>
                <option value="es">Spanish (ES)</option>
                <option value="fr">French (FR)</option>
                <option value="de">German (DE)</option>
                <option value="auto">Auto-Detect Language</option>
              </select>
            </div>

          </div>

          {/* Password Input (Clean Dark Green Outlined) */}
          {isEncrypted && (
            <div className="space-y-2 pt-1">
              <label
                htmlFor="modal-password"
                className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]"
              >
                <span className="flex items-center gap-1.5 text-[var(--color-success)] font-extrabold">
                  <Lock className="w-3.5 h-3.5 text-[var(--color-success)] stroke-[2.5]" />
                  PDF Password
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success-border)] uppercase tracking-wider">
                  Required
                </span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-success)]">
                  <KeyRound className="w-4 h-4 stroke-[2.2]" />
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[var(--color-surface)] border-2 border-[var(--color-success)] text-xs sm:text-sm font-semibold text-[var(--color-ink)] placeholder:text-[var(--color-text-muted)] placeholder:font-normal focus:outline-none focus:border-[var(--color-success-hover)] focus:ring-2 focus:ring-[var(--color-success)]/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError ? (
                <p className="text-[11px] text-[var(--color-danger)] font-medium flex items-center gap-1.5 mt-1 bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] p-2 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                  Password used by your bank to encrypt this statement (e.g. Date of Birth, PAN, Account No).
                </p>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-brand-secondary !min-h-[44px] !h-[44px] !py-0 !px-4 sm:!px-5 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || (isEncrypted && !password.trim())}
              className="btn-brand-primary !min-h-[44px] !h-[44px] !py-0 !px-5 sm:!px-6 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-none hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50"
            >
              <span>{isLoading ? 'Processing...' : 'Start Extraction'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
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
