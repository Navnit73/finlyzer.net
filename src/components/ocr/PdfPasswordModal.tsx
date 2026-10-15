'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, KeyRound, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { useIsMounted } from '@/lib/useIsMounted';

interface PdfPasswordModalProps {
  isOpen: boolean;
  filename: string;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmitPassword: (password: string) => void;
  isLoading?: boolean;
}

export default function PdfPasswordModal({
  isOpen,
  filename,
  errorMessage,
  onClose,
  onSubmitPassword,
  isLoading = false,
}: PdfPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const mounted = useIsMounted();

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

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onSubmitPassword(password);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md surface-overlay p-6 sm:p-7 space-y-5 animate-scale-up my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Close dialog"
          disabled={isLoading}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Header */}
        <div className="space-y-3 pr-12">
          <span className="w-10 h-10 rounded-full bg-[var(--color-surface-subtle)] flex items-center justify-center text-[var(--color-ink)]" aria-hidden="true">
            <Lock className="w-[18px] h-[18px]" />
          </span>
          <div className="space-y-0.5">
            <h2 id="password-modal-title" className="text-[21px] font-semibold tracking-tight text-[var(--color-ink)]">
              Encrypted PDF File
            </h2>
            <p className="text-[13px] text-[var(--color-text-muted)] truncate" title={filename}>
              {filename}
            </p>
          </div>
        </div>

        <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
          This document is protected with a password. Please enter the decryption password (e.g. date of birth, PAN, or account code) to unlock and extract data.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div role="alert" className="p-3 bg-[var(--color-danger-soft)] rounded-xl text-[13px] text-[var(--color-danger)] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="pdf-password-input" className="text-[13px] font-medium text-[var(--color-ink)]">
              Document Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                <KeyRound className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="pdf-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
                autoFocus
                disabled={isLoading}
                aria-invalid={errorMessage ? true : undefined}
                className="w-full h-11 pl-10 pr-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/20 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-ink)] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-brand-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="btn-brand-primary flex-1"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs" aria-hidden="true"></span>
                  <span>Decrypting...</span>
                </>
              ) : (
                <span>Unlock &amp; Extract</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
