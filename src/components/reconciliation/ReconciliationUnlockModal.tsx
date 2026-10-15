'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, CheckCircle2, Lock, ShieldCheck, X } from 'lucide-react';
import { useIsMounted } from '@/lib/useIsMounted';
import { openRazorpayCheckout, RazorpayCheckoutOptions } from '@/lib/razorpay-client';
import { reconciliationHeaders } from '@/lib/reconciliation-client';
import { FREE_PAGE_LIMIT, PRICING_PLANS } from '@/types/pricing';

const PASS_PRICE = PRICING_PLANS.find((p) => p.id === 'guest_doc_unlock')?.price_usd ?? 10;

interface ReconciliationUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  reconciliationId: string;
  pages: number;
  onUnlocked: () => void;
}

/** One-time Document Pass checkout for a guest reconciliation of 11-30 pages. */
export default function ReconciliationUnlockModal({ isOpen, onClose, reconciliationId, pages, onUnlocked }: ReconciliationUnlockModalProps) {
  const mounted = useIsMounted();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen || !mounted) return null;

  const pay = async () => {
    setIsProcessing(true);
    setError(null);
    const headers = { 'Content-Type': 'application/json', ...reconciliationHeaders(reconciliationId) };
    try {
      const res = await fetch(`/api/reconciliation/${reconciliationId}/unlock`, { method: 'POST', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start checkout.');
      if (data.already_unlocked) {
        onUnlocked();
        return;
      }

      const checkout: RazorpayCheckoutOptions | undefined = data.checkout;
      const orderId: string | undefined = data.order?.order_id;
      if (!checkout || !orderId) throw new Error('Checkout details are missing. Please try again.');

      const payment = await openRazorpayCheckout({ ...checkout, description: `Unlock ${pages}-page bank reconciliation` });
      if (!payment) {
        setIsProcessing(false);
        return;
      }

      const verify = await fetch(`/api/reconciliation/${reconciliationId}/unlock`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ order_id: orderId, ...payment }),
      });
      const verified = await verify.json();
      if (!verify.ok || !verified.success) {
        throw new Error(
          `${verified.error || 'Payment verification failed'}. If you were charged, the report unlocks automatically within a few minutes.`
        );
      }
      onUnlocked();
    } catch (e) {
      setError((e as Error).message || 'Checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recon-unlock-title"
        className="relative w-full max-w-md surface-overlay p-6 sm:p-8 space-y-6 my-auto"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-3 right-3 w-11 h-11 inline-flex items-center justify-center rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors disabled:opacity-40"
          aria-label="Close"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="space-y-2 pr-10">
          <p className="eyebrow">One-time unlock</p>
          <h2 id="recon-unlock-title" className="type-title !text-2xl">
            Unlock the full reconciliation
          </h2>
          <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
            Your two files have <strong className="font-semibold text-[var(--color-ink)]">{pages} pages</strong> in total. Guest reconciliations are free up to {FREE_PAGE_LIMIT}{' '}
            pages; this one needs a one-time pass.
          </p>
        </div>

        <ul className="divide-y divide-[var(--color-border-subtle)] border-y border-[var(--color-border)]">
          {[
            'Every matched, unmatched, duplicate and mismatched transaction',
            'Full report download in Excel (.xlsx) and CSV',
            'Balance and book-to-bank checks for both documents',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 py-3 text-sm text-[var(--color-ink)]">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-[var(--color-brand-dark)] shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {error && (
          <p role="alert" className="px-4 py-3 rounded-lg bg-[var(--color-danger-soft)] text-[var(--color-danger)] text-sm">
            {error}
          </p>
        )}

        <button type="button" onClick={pay} disabled={isProcessing} className="btn-brand-primary w-full !min-h-[52px] !text-[17px]">
          {isProcessing ? <span className="loading loading-spinner loading-sm" aria-hidden="true" /> : <Lock className="w-4 h-4" aria-hidden="true" />}
          <span>Pay ${PASS_PRICE} &amp; Unlock</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>

        <p className="-mt-2 flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Secure checkout by Razorpay</span>
        </p>
      </div>
    </div>,
    document.body
  );
}
