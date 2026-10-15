'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, ShieldCheck, Lock, ArrowRight, Zap } from 'lucide-react';
import { useIsMounted } from '@/lib/useIsMounted';
import { openRazorpayCheckout, RazorpayCheckoutOptions } from '@/lib/razorpay-client';

interface GuestUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  filename?: string;
  pageCount?: number;
  onUnlockSuccess: () => void;
}

export default function GuestUnlockModal({
  isOpen,
  onClose,
  documentId,
  filename = 'statement.pdf',
  pageCount = 15,
  onUnlockSuccess,
}: GuestUnlockModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mounted = useIsMounted();

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, onClose]);

  if (!isOpen || !mounted) return null;

  const handleUnlockPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Create guest unlock order on backend
      const res = await fetch('/api/guest/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: documentId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create unlock order');
      }

      if (data.already_unlocked) {
        onUnlockSuccess();
        onClose();
        return;
      }

      const checkout: RazorpayCheckoutOptions | undefined = data.checkout;
      const orderId = data.order?.order_id;
      if (!checkout || !orderId) {
        throw new Error('Order creation failed to return payment details.');
      }

      const payment = await openRazorpayCheckout({
        ...checkout,
        description: `Unlock ${pageCount}-Page Statement Export (${filename})`,
      });
      if (!payment) {
        setIsProcessing(false); // closed the window without paying
        return;
      }

      const verifyRes = await fetch('/api/guest/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, document_id: documentId, ...payment }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(
          `${verifyData.error || 'Payment verification failed'}. If you were charged, your document will unlock automatically within a few minutes.`
        );
      }
      onUnlockSuccess();
      onClose();
    } catch (e) {
      setErrorMessage((e as Error).message || 'Unlock checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/30 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-[480px] surface-overlay p-6 sm:p-8 space-y-6 sm:my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-unlock-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-11 h-11 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Close modal"
          disabled={isProcessing}
        >
          <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        </button>

        {/* Title & Document Badge */}
        <div className="space-y-2 pr-10">
          <span className="feature-badge !font-medium">
            <Zap className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>11–30 page document unlock</span>
          </span>
          <h2 id="guest-unlock-title" className="text-[22px] sm:text-2xl font-semibold text-[var(--color-ink)] tracking-tight leading-tight">
            Unlock Full Statement Export
          </h2>
          <p className="text-[15px] text-[var(--color-text-secondary)] leading-normal">
            This document contains <strong className="text-[var(--color-ink)] font-medium tabular-nums">{pageCount} pages</strong>. Free guest tier covers up to 10 pages. Unlock all 6 export formats for this document with a 1-time micro-pass.
          </p>
        </div>

        {/* File Information */}
        <div className="px-4 py-3.5 rounded-xl bg-[var(--color-surface-subtle)] flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-medium text-[var(--color-ink)] truncate">{filename}</p>
            <p className="text-xs text-[var(--color-text-muted)] tabular-nums">{pageCount} pages parsed &bull; AI Reconciled</p>
          </div>
          <div className="text-right shrink-0">
            <span className="block text-xl leading-none font-semibold text-[var(--color-ink)] tabular-nums">$10</span>
            <span className="mt-1 block text-xs text-[var(--color-text-muted)]">One-time fee</span>
          </div>
        </div>

        {/* Value Points */}
        <ul className="space-y-2">
              <li className="flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
                <CheckCircle2 className="w-[18px] h-[18px] mt-px text-[var(--color-success)] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Instant download in Excel (.xlsx), CSV, and PDF formats</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
                <CheckCircle2 className="w-[18px] h-[18px] mt-px text-[var(--color-success)] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Accounting feeds for QuickBooks (.qbo), Xero (.ofx), and Quicken (.qif)</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
                <CheckCircle2 className="w-[18px] h-[18px] mt-px text-[var(--color-success)] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Formulas, cash flow categorization, and reconciliation summary included</span>
              </li>
        </ul>

        {errorMessage && (
          <div role="alert" className="px-3.5 py-3 rounded-xl bg-[var(--color-danger-soft)] text-[var(--color-danger)] text-[13px]">
            {errorMessage}
          </div>
        )}

        {/* Unlock Action Button */}
        <div className="space-y-3">
          <div className="flex flex-col-reverse sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="btn-brand-secondary w-full sm:w-auto"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={handleUnlockPayment}
              disabled={isProcessing}
              aria-busy={isProcessing}
              className="btn-brand-primary w-full sm:flex-1"
            >
              {isProcessing ? (
                <span className="loading loading-spinner loading-sm" aria-hidden="true"></span>
              ) : (
                <Lock className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              )}
              <span>Pay $10 &amp; Unlock All Formats</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          {/* Security badge */}
          <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)] text-center">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>256-Bit SSL Encrypted &bull; Razorpay / Card Secure Checkout</span>
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
