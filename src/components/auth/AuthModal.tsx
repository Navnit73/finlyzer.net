'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { signIn } from 'next-auth/react';
import { Sparkles, X, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import { PRICING_PLANS } from '@/types/pricing';
import { useIsMounted } from '@/lib/useIsMounted';
import BrandLogo from '../BrandLogo';
import { APP_HOME, APP_RECONCILIATIONS, APP_WORKSPACE, isPublicOnlyRoute } from '@/lib/routes';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'page_limit' | 'reconciliation' | 'batch_upload' | 'save_history' | 'dashboard' | 'pricing' | 'general';
  pageCount?: number;
  planId?: string;
  redirectUrl?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  reason = 'general',
  pageCount,
  planId,
  redirectUrl,
}: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useIsMounted();
  const googleButtonRef = useRef<HTMLButtonElement>(null);

  // Reset the spinner each time the modal opens: returning via the browser back button
  // (bfcache) would otherwise restore a stuck, disabled "Redirecting…" state.
  useEffect(() => {
    if (isOpen) setIsLoading(false);
  }, [isOpen]);

  // Escape to close, lock background scroll, and focus the primary action.
  useEffect(() => {
    if (!isOpen || !mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    googleButtonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, mounted, isLoading, onClose]);

  if (!isOpen || !mounted) return null;

  const selectedPlan = planId
    ? PRICING_PLANS.find((p) => p.id === planId || (planId === 'single_10' && p.id === 'guest_doc_unlock'))
    : undefined;
  const isPurchase = reason === 'pricing';

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      if (planId && typeof window !== 'undefined') {
        try {
          localStorage.setItem('finlyzer_pending_plan', planId);
          sessionStorage.setItem('finlyzer_pending_plan', planId);
        } catch {}
      }

      // Never send a freshly signed-in user back to a public marketing page:
      // conversion-related prompts land in the workspace, everything else in the dashboard
      // (or back on the app/shared page they were already on).
      let destination = redirectUrl;
      if (!destination) {
        const currentPath = window.location.pathname + window.location.search;
        if (reason === 'pricing') {
          destination = planId ? `/pricing?plan=${planId}&checkout=true` : '/pricing';
        } else if (reason === 'page_limit' || reason === 'batch_upload' || reason === 'save_history') {
          destination = APP_WORKSPACE;
        } else if (reason === 'reconciliation') {
          destination = APP_RECONCILIATIONS;
        } else if (reason === 'dashboard' || isPublicOnlyRoute(window.location.pathname)) {
          destination = APP_HOME;
        } else {
          destination = currentPath;
        }
      }

      await signIn('google', { callbackUrl: destination });
    } catch (e) {
      console.warn('Google sign-in error:', (e as Error)?.message || 'Sign in error');
      setIsLoading(false);
    }
  };

  const titles = {
    page_limit: pageCount ? `Sign in to convert this ${pageCount}-page statement` : 'Sign in to convert longer statements',
    reconciliation: pageCount ? `Sign in to reconcile these ${pageCount} pages` : 'Sign in to reconcile longer documents',
    batch_upload: 'Sign in to convert files in bulk',
    save_history: 'Sign in to save your conversions',
    dashboard: 'Sign in to your dashboard',
    pricing: selectedPlan ? `Sign in to buy ${selectedPlan.name}` : 'Sign in to buy page credits',
    general: 'Sign in to Finlyzers',
  };

  const descriptions = {
    page_limit: 'Guest conversions support statements up to 30 pages. Sign in with Google to process statements up to 200 pages.',
    reconciliation: 'Guests can reconcile up to 30 pages in total. Sign in with Google to reconcile longer statements and ledgers using your page credits.',
    batch_upload: 'Upload up to 50 statements or a .zip archive at once and merge their cash flows into one workbook.',
    save_history: 'Keep every converted statement, invoice, and receipt in your private vault, available on any device.',
    dashboard: 'View your credit balance, converted statements, and invoices in one place.',
    pricing: selectedPlan
      ? 'Sign in with Google and you will go straight back to checkout for this plan.'
      : 'Credits are added to your account and never expire. You will return to checkout right after signing in.',
    general: 'Convert bank statements to Excel, CSV, and QuickBooks, and keep every result in your private vault.',
  };

  const benefits: Record<NonNullable<AuthModalProps['reason']>, string[]> = {
    page_limit: ['10 free pages included with every account', 'Statements up to 200 pages', 'Results saved to your private vault'],
    reconciliation: ['10 free pages included with every account', 'Each file up to 200 pages', 'Reports don’t expire like guest runs'],
    batch_upload: ['Up to 50 files per batch', 'Merged cash flow across statements', 'Results saved to your private vault'],
    save_history: ['Unlimited conversion history', 'Re-download any format at any time', 'Delete your data whenever you want'],
    dashboard: ['Live credit balance', 'Converted statements history', 'Downloadable PDF invoices'],
    pricing: ['Credits never expire', 'All 6 export formats included', 'PDF invoice for every purchase'],
    general: ['10 free pages included', 'Excel, CSV, QBO, OFX, QIF & PDF exports', 'Private vault for every result'],
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/30 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[420px] surface-overlay p-6 sm:p-8 space-y-6 sm:my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-description"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-11 h-11 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Close sign-in dialog"
          disabled={isLoading}
        >
          <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        </button>

        {/* Header: logo + context pill */}
        <div className="flex items-center gap-3 pr-10">
          <BrandLogo size="sm" href={null} />
          {isPurchase ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] text-xs font-medium">
              <CreditCard className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
              <span>Secure checkout</span>
            </span>
          ) : (
            <span className="feature-badge !font-medium">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
              <span>Free account</span>
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2 id="auth-modal-title" className="text-[22px] sm:text-2xl font-semibold text-[var(--color-ink)] tracking-tight leading-tight">
            {titles[reason]}
          </h2>
          <p id="auth-modal-description" className="text-[15px] text-[var(--color-text-secondary)] leading-normal">
            {descriptions[reason]}
          </p>
        </div>

        {/* Selected plan summary (purchase flow only) */}
        {isPurchase && selectedPlan && (
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-[var(--color-surface-subtle)]">
            <div className="min-w-0">
              <p className="text-xs text-[var(--color-text-muted)]">Selected plan</p>
              <p className="text-[15px] font-semibold text-[var(--color-ink)] truncate">{selectedPlan.name}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)] tabular-nums">
                {selectedPlan.pages.toLocaleString()} pages
              </p>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-[var(--color-ink)] shrink-0">${selectedPlan.price_usd}</p>
          </div>
        )}

        {/* Benefits */}
        <ul className="space-y-2.5">
          {benefits[reason].map((benefit) => (
            <li key={benefit} className="flex items-center gap-2.5 text-sm text-[var(--color-ink)]">
              <CheckCircle2 className="w-[18px] h-[18px] text-[var(--color-success)] shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Google sign-in */}
        <button
          type="button"
          ref={googleButtonRef}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          aria-busy={isLoading}
          className="btn-brand-primary w-full !min-h-12 !h-12 !text-[15px] !gap-3 disabled:!opacity-70 disabled:!cursor-wait"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm" aria-hidden="true" />
          ) : (
            /* Official Google "G" mark — brand colors are part of the logo, not theme colors */
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-surface)]" aria-hidden="true">
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            </span>
          )}
          <span>{isLoading ? 'Redirecting to Google…' : 'Continue with Google'}</span>
        </button>

        {/* Footer */}
        <div className="space-y-2 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>
              {isPurchase
                ? 'Payment is taken only at checkout, after you sign in'
                : 'No credit card required • We never post or email on your behalf'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
