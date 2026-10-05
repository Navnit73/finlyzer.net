'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { signIn } from 'next-auth/react';
import { Sparkles, X, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import { PRICING_PLANS } from '@/types/pricing';
import { useIsMounted } from '@/lib/useIsMounted';
import BrandLogo from '../BrandLogo';
import { APP_HOME, APP_WORKSPACE, isPublicOnlyRoute } from '@/lib/routes';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'page_limit' | 'batch_upload' | 'save_history' | 'dashboard' | 'pricing' | 'general';
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

  const selectedPlan = planId ? PRICING_PLANS.find((p) => p.id === planId) : undefined;
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
    batch_upload: 'Sign in to convert files in bulk',
    save_history: 'Sign in to save your conversions',
    dashboard: 'Sign in to your dashboard',
    pricing: selectedPlan ? `Sign in to buy ${selectedPlan.name}` : 'Sign in to buy page credits',
    general: 'Sign in to Finlyzer',
  };

  const descriptions = {
    page_limit: 'Guest conversions support statements up to 30 pages. Sign in with Google to process statements up to 200 pages.',
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
    batch_upload: ['Up to 50 files per batch', 'Merged cash flow across statements', 'Results saved to your private vault'],
    save_history: ['Unlimited conversion history', 'Re-download any format at any time', 'Delete your data whenever you want'],
    dashboard: ['Live credit balance', 'Converted statements history', 'Downloadable PDF invoices'],
    pricing: ['Credits never expire', 'All 6 export formats included', 'PDF invoice for every purchase'],
    general: ['10 free pages included', 'Excel, CSV, QBO, OFX, QIF & PDF exports', 'Private vault for every result'],
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 space-y-6 animate-scale-up my-auto shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-description"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Close sign-in dialog"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: logo + context pill */}
        <div className="flex items-center gap-3 pr-10">
          <BrandLogo size="sm" href={null} />
          {isPurchase ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--media-violet-soft)] text-[var(--media-violet-text)] text-[11px] font-bold">
              <CreditCard className="w-3 h-3" />
              <span>Secure checkout</span>
            </span>
          ) : (
            <span className="feature-badge !text-[11px] !px-2.5 !py-1">
              <Sparkles className="w-3 h-3" />
              <span>Free account</span>
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 id="auth-modal-title" className="text-2xl font-black text-[var(--color-ink)] tracking-tight leading-tight">
            {titles[reason]}
          </h3>
          <p id="auth-modal-description" className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {descriptions[reason]}
          </p>
        </div>

        {/* Selected plan summary (purchase flow only) */}
        {isPurchase && selectedPlan && (
          <div className="flex items-center justify-between gap-3 p-4 rounded-lg border-2 border-[var(--color-brand)] bg-[var(--color-surface)]">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Selected plan</p>
              <p className="text-sm font-black text-[var(--color-ink)] truncate">{selectedPlan.name}</p>
              <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                {selectedPlan.pages.toLocaleString()} pages
              </p>
            </div>
            <p className="text-2xl font-black font-mono text-[var(--color-ink)] shrink-0">${selectedPlan.price_usd}</p>
          </div>
        )}

        {/* Benefits */}
        <ul className="space-y-2.5 bg-[var(--color-surface-subtle)] p-4 rounded-lg border border-[var(--color-border)]">
          {benefits[reason].map((benefit) => (
            <li key={benefit} className="flex items-center gap-2.5 text-xs text-[var(--color-ink)] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Google sign-in */}
        <button
          ref={googleButtonRef}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          aria-busy={isLoading}
          className="btn-brand-dark w-full !min-h-[52px] !h-[52px] text-sm font-bold flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm" aria-hidden="true" />
          ) : (
            /* Official Google "G" mark — brand colors are part of the logo, not theme colors */
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>{isLoading ? 'Redirecting to Google…' : 'Continue with Google'}</span>
        </button>

        {/* Footer */}
        <div className="space-y-2 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-success)]" />
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
