'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, ShieldCheck, Sparkles, CreditCard, ArrowRight, AlertCircle } from 'lucide-react';
import { PricingPlan } from '@/types/pricing';
import { useIsMounted } from '@/lib/useIsMounted';

interface CheckoutModalProps {
  isOpen: boolean;
  plan: PricingPlan | null;
  userEmail?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CheckoutModal({
  isOpen,
  plan,
  userEmail,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mounted = useIsMounted();

  if (!isOpen || !plan || !mounted) return null;

  const handleInitializePayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/user/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.id,
          gateway: 'razorpay',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to initialize order');
      }

      const data = await res.json();
      setOrderCreated(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMessage(e.message || 'Payment initialization failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6 sm:p-8 space-y-6 animate-scale-up my-auto shadow-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-brand-soft)] text-[var(--color-on-brand)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-ink)]" />
            Credit Package Top-Up
          </div>
          <h3 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">
            Checkout — {plan.name}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            {plan.description}
          </p>
        </div>

        {/* Plan Summary Card */}
        <div className="p-4 sm:p-5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-[var(--color-text-secondary)] tracking-wider">
                Selected Package
              </p>
              <p className="text-lg font-black text-[var(--color-ink)]">{plan.name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[var(--color-ink)]">${plan.price_usd}</p>
              <p className="text-[11px] font-mono text-[var(--color-text-muted)]">~₹{plan.price_inr.toLocaleString()}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--color-border)] space-y-1.5 text-xs text-[var(--color-text-secondary)]">
            <div className="flex justify-between">
              <span>Included Credits:</span>
              <span className="font-bold text-[var(--color-ink)] font-mono">{plan.pages.toLocaleString()} Pages</span>
            </div>
            <div className="flex justify-between">
              <span>Account Billing Email:</span>
              <span className="font-bold text-[var(--color-ink)] truncate max-w-[200px]">{userEmail || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Gateway:</span>
              <span className="font-bold text-[var(--color-ink)]">Razorpay Secure</span>
            </div>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2 text-xs">
          <p className="font-bold text-[var(--color-ink)] uppercase tracking-wider text-[11px]">Included in this pass:</p>
          <div className="space-y-1.5">
            {plan.features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-[var(--color-ink)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] rounded-lg text-xs text-[var(--color-danger)] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Order Success Notice */}
        {orderCreated ? (
          <div className="p-4 bg-[var(--color-success-soft)] border border-[var(--color-success-border)] rounded-lg text-xs text-[var(--color-success)] space-y-2 text-center">
            <CheckCircle2 className="w-8 h-8 text-[var(--color-success)] mx-auto" />
            <p className="font-bold text-sm">Order Registered in Database!</p>
            <p className="text-[var(--color-text-secondary)] text-[11px]">
              Razorpay integration is active on the database schema. When Razorpay API keys are configured, live checkout modal opens directly.
            </p>
            <button
              onClick={onClose}
              className="btn-brand-primary !min-h-[40px] !h-[40px] text-xs font-bold w-full mt-2"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          /* Action Buttons */
          <div className="space-y-3 pt-2">
            <button
              onClick={handleInitializePayment}
              disabled={isProcessing}
              className="w-full btn-brand-primary !min-h-[48px] !h-[48px] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  <span>Generating Order...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ${plan.price_usd} with Razorpay</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--color-text-muted)]">
              <ShieldCheck className="w-4 h-4 text-[var(--color-success)]" />
              <span>Razorpay 256-Bit Encrypted &bull; Instant Credit Activation</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
