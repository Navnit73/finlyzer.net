'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, CheckCircle2, ShieldCheck, Lock, CreditCard, ArrowRight, Zap } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/65 animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6 sm:p-8 space-y-6 animate-scale-up my-auto shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-unlock-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
          aria-label="Close modal"
          disabled={isProcessing}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] text-xs font-bold">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>11–30 PAGE DOCUMENT UNLOCK</span>
        </div>

        {/* Title & Document Badge */}
        <div className="space-y-2">
          <h3 id="guest-unlock-title" className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight">
            Unlock Full Statement Export
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            This document contains <strong className="text-[var(--color-ink)] font-mono">{pageCount} pages</strong>. Free guest tier covers up to 10 pages. Unlock all 6 export formats for this document with a 1-time micro-pass.
          </p>
        </div>

        {/* File Information Card */}
        <div className="p-3.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-between text-xs">
          <div className="space-y-0.5 min-w-0 pr-2">
            <p className="font-bold text-[var(--color-ink)] truncate">{filename}</p>
            <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">{pageCount} pages parsed &bull; AI Reconciled</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-lg font-black text-[var(--color-ink)] font-mono">$10</span>
            <span className="text-[10px] text-[var(--color-text-secondary)] block">One-time fee</span>
          </div>
        </div>

        {/* Value Points */}
        <div className="space-y-2.5 bg-[var(--color-surface-subtle)] p-4 rounded-lg border border-[var(--color-border)]">
          <div className="flex items-center gap-2.5 text-xs text-[var(--color-ink)] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
            <span>Instant download in Excel (.xlsx), CSV, and PDF formats</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[var(--color-ink)] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
            <span>Accounting feeds for QuickBooks (.qbo), Xero (.ofx), and Quicken (.qif)</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[var(--color-ink)] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
            <span>Formulas, cash flow categorization, and reconciliation summary included</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-[var(--color-danger-soft)] text-[var(--color-danger)] text-xs font-semibold border border-[var(--color-danger-border)]">
            {errorMessage}
          </div>
        )}

        {/* Unlock Action Button */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleUnlockPayment}
            disabled={isProcessing}
            className="btn-brand-primary w-full !py-3.5 !px-6 !text-sm !font-black rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <span>Pay $10 &amp; Unlock All Formats</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--color-text-muted)] pt-1">
          <ShieldCheck className="w-4 h-4 text-[var(--color-brand)]" />
          <span>256-Bit SSL Encrypted &bull; Razorpay / Card Secure Checkout</span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
