'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { signIn } from 'next-auth/react';
import { Sparkles, X, CheckCircle2, ShieldCheck } from 'lucide-react';
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

  if (!isOpen || !mounted) return null;

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
    page_limit: `Unlock ${pageCount || 30}+ Page Processing`,
    batch_upload: 'Unlock Bulk Multi-File Processing',
    save_history: 'Sync & Save Extraction History',
    dashboard: 'Sign In to Access Admin Dashboard',
    pricing: 'Sign In to Purchase Page Credits',
    general: 'Sign in to Finlyzer Hub',
  };

  const descriptions = {
    page_limit: `This document contains ${pageCount || 'over 30'} pages. Free guest sessions support documents up to 30 pages. Sign in with Google to process long statements up to 200 pages.`,
    batch_upload: 'Batch processing allows you to concurrently extract up to 50 statements or .zip archives and merge their financial cash flows.',
    save_history: 'Create a free account to securely store all your parsed bank statements, invoices, and receipts in MongoDB across devices.',
    dashboard: 'Sign in with Google to view your account overview, processed statements history, credit balance, and official invoices.',
    pricing: 'Sign in with Google to choose a flexible page credit package ($10 to $100) and top up your account balance.',
    general: 'Get instant access to automated AI financial extraction, cloud statement vault, and multi-format financial exports.',
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 space-y-6 animate-scale-up my-auto shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
          aria-label="Close modal"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header: Brand Logo & Pill */}
        <div className="flex items-center justify-between gap-3 pr-8">
          <BrandLogo size="sm" href={null} />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] text-[11px] font-bold">
            <Sparkles className="w-3 h-3" />
            <span>FREE ACCESS</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 id="auth-modal-title" className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight">
            {titles[reason]}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {descriptions[reason]}
          </p>
        </div>

        {/* Value Points */}
        <div className="space-y-2.5 bg-[var(--color-surface-subtle)] p-4 rounded-lg border border-[var(--color-border)]">
          <div className="flex items-center gap-2.5 text-xs text-[var(--color-ink)] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
            <span>Process up to 200 pages per statement with AI cleaning</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[var(--color-ink)] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
            <span>Automatic MongoDB persistence and full export download history</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[var(--color-ink)] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
            <span>One-click exports to Excel (.xlsx), QuickBooks (.qbo), and Xero (.ofx)</span>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-3 pt-2">
          {/* Primary Google Login Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-full bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-soft)] font-bold text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Footer Guarantee */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--color-text-muted)] pt-1">
          <ShieldCheck className="w-4 h-4 text-[var(--color-brand)]" />
          <span>256-Bit SSL Encrypted &bull; No Credit Card Required</span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
