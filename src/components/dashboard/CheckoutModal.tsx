'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, ShieldCheck, Sparkles, ArrowRight, AlertCircle, Zap } from 'lucide-react';
import { PricingPlan } from '@/types/pricing';
import { useIsMounted } from '@/lib/useIsMounted';
import { formatUSD } from '@/lib/format';
import { openRazorpayCheckout, RazorpayCheckoutOptions } from '@/lib/razorpay-client';

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
  const [orderCompleted, setOrderCompleted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mounted = useIsMounted();
  const router = useRouter();

  // The modal stays mounted between opens, so clear the previous purchase's state on close;
  // otherwise reopening it for another plan shows "Credits Added" without any payment.
  const handleClose = React.useCallback(() => {
    setOrderCompleted(false);
    setErrorMessage(null);
    onClose();
  }, [onClose]);

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, handleClose]);

  if (!isOpen || !plan || !mounted) return null;

  const handleInitializePayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Create our order + the Razorpay order on the server
      const createRes = await fetch('/api/user/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: plan.id }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || 'Failed to initialize order');
      }

      const orderId = createData.order?.order_id;
      const checkout: RazorpayCheckoutOptions | undefined = createData.checkout;
      if (!orderId || !checkout) {
        throw new Error('Order creation failed to return payment details.');
      }

      // 2. Customer pays in Razorpay Checkout
      const payment = await openRazorpayCheckout(checkout);
      if (!payment) return; // closed the window without paying

      // 3. Server verifies the signature and credits pages (the webhook is the backstop)
      const completeRes = await fetch('/api/user/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, ...payment }),
      });

      if (!completeRes.ok) {
        const compData = await completeRes.json();
        throw new Error(
          `${compData.error || 'Failed to activate purchased credits'}. If you were charged, your credits will be added automatically within a few minutes.`
        );
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('finlyzer:quota_updated'));
      }

      setOrderCompleted(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMessage(e.message || 'Payment initialization failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/30 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          handleClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-[480px] surface-overlay p-6 sm:p-8 space-y-6 sm:my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isProcessing}
          className="absolute top-3 right-3 w-11 h-11 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pr-10">
          <span className="feature-badge !font-medium">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
            Credit Package Top-Up
          </span>
          <h2 id="checkout-modal-title" className="text-[22px] sm:text-2xl font-semibold text-[var(--color-ink)] tracking-tight leading-tight">
            Checkout — {plan.name}
          </h2>
          <p className="text-[15px] text-[var(--color-text-secondary)] leading-normal">
            {plan.description}
          </p>
        </div>

        {/* Plan Summary */}
        <div className="rounded-xl bg-[var(--color-surface-subtle)] px-4 sm:px-5 py-4 space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[var(--color-text-muted)]">Selected Package</p>
              <p className="text-[17px] font-semibold text-[var(--color-ink)] truncate">{plan.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[28px] leading-none font-semibold text-[var(--color-ink)] tabular-nums">{formatUSD(plan.price_usd)}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">USD one-time</p>
            </div>
          </div>

          <dl className="pt-3 border-t border-[var(--color-border)] space-y-2 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--color-text-secondary)]">Included credits</dt>
              <dd className="font-medium text-[var(--color-ink)] tabular-nums">+{plan.pages.toLocaleString()} pages</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--color-text-secondary)] shrink-0">Billing email</dt>
              <dd className="font-medium text-[var(--color-ink)] truncate">{userEmail || '—'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--color-text-secondary)] shrink-0">Payment</dt>
              <dd className="font-medium text-[var(--color-ink)] text-right">Instant 256-Bit SSL Checkout</dd>
            </div>
          </dl>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2.5">
          <p className="text-[13px] font-medium text-[var(--color-ink)]">Included in this pass</p>
          <ul className="space-y-2">
            {plan.features.map((feat, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
                <CheckCircle2 className="w-[18px] h-[18px] mt-px text-[var(--color-success)] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div role="alert" className="px-3.5 py-3 bg-[var(--color-danger-soft)] rounded-xl text-[13px] text-[var(--color-danger)] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Order Success Notice */}
        {orderCompleted ? (
          <div role="status" className="pt-2 space-y-4 text-center">
            <span className="mx-auto flex w-12 h-12 items-center justify-center rounded-full bg-[var(--color-success-soft)]">
              <CheckCircle2 className="w-6 h-6 text-[var(--color-success)]" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-semibold text-[17px] text-[var(--color-ink)]">Credits Added Successfully!</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                +{plan.pages.toLocaleString()} pages have been credited to your account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                handleClose();
                router.push('/workspace');
              }}
              className="btn-brand-primary w-full"
            >
              Continue to Workspace
            </button>
          </div>
        ) : (
          /* Action Buttons */
          <div className="space-y-3">
            <div className="flex flex-col-reverse sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessing}
                className="btn-brand-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInitializePayment}
                disabled={isProcessing}
                aria-busy={isProcessing}
                className="btn-brand-primary w-full sm:flex-1"
              >
                {isProcessing ? (
                  <>
                    <span className="loading loading-spinner loading-xs" aria-hidden="true"></span>
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                    <span>Pay {formatUSD(plan.price_usd)} USD</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                  </>
                )}
              </button>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>256-Bit Encrypted &bull; Instant Page Credits Activation</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
