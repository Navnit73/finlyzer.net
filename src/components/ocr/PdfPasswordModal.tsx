'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, X, AlertCircle } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onSubmitPassword(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] p-6 sm:p-8 space-y-6 animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors"
          aria-label="Close dialog"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-soft)] flex items-center justify-center text-[var(--color-on-brand)] shrink-0">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 id="password-modal-title" className="text-xl font-bold text-[var(--color-ink)]">
              Encrypted PDF File
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] truncate max-w-[240px]">
              {filename}
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          This document is protected with a password. Please enter the decryption password (e.g. date of birth, PAN, or account code) to unlock and extract data.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider">
              Document Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
                autoFocus
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-soft)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-ink)]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="flex-1 py-3 px-4 rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] text-sm font-bold hover:bg-[var(--color-brand-hover)] transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
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
}
