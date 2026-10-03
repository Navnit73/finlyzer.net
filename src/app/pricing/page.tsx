'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Clock,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { PRICING_PLANS, PricingPlan } from '@/types/pricing';
import CheckoutModal from '@/components/dashboard/CheckoutModal';
import AuthModal from '@/components/auth/AuthModal';

function PricingContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [quota, setQuota] = useState<{
    tier: string;
    freePagesRemaining: number;
    purchasedPages: number;
    totalAvailablePages: number;
    totalPagesProcessed: number;
  }>({
    tier: 'free',
    freePagesRemaining: 10,
    purchasedPages: 0,
    totalAvailablePages: 10,
    totalPagesProcessed: 0,
  });

  const isLoggedIn = status === 'authenticated' && !!session?.user;

  const fetchQuota = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch('/api/user/quota');
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
      }
    } catch (e) {
      console.warn('Failed to load quota:', e);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchQuota();

    const handleUpdate = () => {
      fetchQuota();
    };

    window.addEventListener('finlyzer:quota_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('finlyzer:quota_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [fetchQuota]);

  // Handle plan restoration after login redirect or search param
  useEffect(() => {
    if (status !== 'authenticated') return;

    let targetPlanId = searchParams.get('plan');
    if (!targetPlanId && typeof window !== 'undefined') {
      targetPlanId =
        localStorage.getItem('finlyzer_pending_plan') ||
        sessionStorage.getItem('finlyzer_pending_plan');
    }

    if (targetPlanId) {
      const matchedPlan = PRICING_PLANS.find((p) => p.id === targetPlanId);
      if (matchedPlan) {
        setSelectedPlan(matchedPlan);
        setIsCheckoutOpen(true);
      }

      // Clear pending plan after successful recovery
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('finlyzer_pending_plan');
          sessionStorage.removeItem('finlyzer_pending_plan');
          const url = new URL(window.location.href);
          url.searchParams.delete('plan');
          url.searchParams.delete('checkout');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        } catch {}
      }
    }
  }, [status, searchParams]);

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    if (!isLoggedIn) {
      // Persist chosen plan so it restores seamlessly right after Google OAuth login
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('finlyzer_pending_plan', plan.id);
          sessionStorage.setItem('finlyzer_pending_plan', plan.id);
        } catch {}
      }
      setIsAuthModalOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const faqs = [
    {
      q: 'Do purchased page credits expire?',
      a: 'No! All purchased page credits are permanent and never expire. You can use them whenever you need to process financial statements.',
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'We accept all major Credit/Debit Cards (Visa, Mastercard, American Express), international cards, and secure online checkout methods with 256-bit encryption.',
    },
    {
      q: 'What happens if a document fails to parse?',
      a: 'If a document fails validation or OCR extraction, no page credits will be deducted from your balance.',
    },
    {
      q: 'Can I export to QuickBooks (.qbo) and Xero (.ofx)?',
      a: 'Yes! Every tier includes full access to all 6 formats: Excel (.xlsx), CSV (.csv), PDF (.pdf), QuickBooks (.qbo), Xero (.ofx), and Quicken (.qif).',
    },
  ];

  const totalBalance = quota.tier === 'enterprise' ? 99999 : (quota.freePagesRemaining ?? 10);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-12 pb-16">
      {/* Header Section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[var(--color-brand-soft)] text-[var(--color-on-brand)]">
          <CreditCard className="w-3.5 h-3.5 text-[var(--color-ink)]" />
          <span>Pay-As-You-Go Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] tracking-tight">
          Flexible Credit Packages For Any Volume
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
          No monthly lock-ins or recurring commitments. Buy page credits when you need them, processed with high-accuracy AI financial parsing.
        </p>

        {/* Live Active Balance Strip if Logged In */}
        {isLoggedIn && (
          <div className="pt-2">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2.5 px-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-ink)]">
              <span className="flex items-center gap-1.5 font-bold">
                <Zap className="w-4 h-4 text-[var(--color-brand-dark)]" />
                <span>Current Balance:</span>
              </span>
              <span className="font-mono font-black text-sm text-[var(--color-ink)] bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] px-2 py-0.5 rounded-md">
                {totalBalance === 99999 ? 'Unlimited' : `${totalBalance.toLocaleString()} Pages`}
              </span>
              <span className="text-[var(--color-text-muted)]">&bull;</span>
              <span className="font-semibold text-[var(--color-text-secondary)]">
                Tier: <span className="font-bold text-[var(--color-ink)] uppercase">{quota.tier}</span>
              </span>
              <span className="text-[var(--color-text-muted)]">&bull;</span>
              <span className="text-[var(--color-text-secondary)] font-mono">
                {quota.totalPagesProcessed} pages processed lifetime
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan) => {
          const isPopular = plan.popular;
          const isEnterprise = plan.id === 'pack_100';
          const isCurrentlySelected = selectedPlan?.id === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative p-6 rounded-lg bg-[var(--color-surface)] border flex flex-col justify-between transition-all duration-200 shadow-none ${
                isCurrentlySelected
                  ? 'border-2 border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/50 bg-[var(--color-brand-soft)]/20'
                  : isPopular
                  ? 'border-2 border-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/30'
                  : isEnterprise
                  ? 'border-[var(--media-violet)]/40 bg-[var(--color-surface)]'
                  : 'border-[var(--color-border)]'
              }`}
            >
              {/* Badge */}
              {(plan.badge || isCurrentlySelected) && (
                <div className="absolute -top-3 left-6">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    isCurrentlySelected
                      ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)]'
                      : isPopular
                      ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)]'
                      : 'bg-[var(--media-violet)] text-white'
                  }`}>
                    {isCurrentlySelected ? 'SELECTED' : plan.badge}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                {/* Header */}
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-[var(--color-ink)]">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] min-h-[32px]">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="pt-2 pb-2 border-y border-[var(--color-border)]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] font-mono">
                      ${plan.price_usd}
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                      USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] mt-1">
                    <span className="font-bold text-[var(--color-brand-dark)] uppercase text-[10px]">One-Time Pass</span>
                    <span className="font-bold text-[var(--color-ink)] font-mono">
                      {plan.pages === 1 ? '1 Single File' : `${plan.pages.toLocaleString()} Pages`}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 text-xs">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-[var(--color-ink)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTA */}
              <div className="pt-6 mt-auto">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full !min-h-[42px] !h-[42px] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 rounded-lg ${
                    isCurrentlySelected || isPopular
                      ? 'btn-brand-primary'
                      : 'btn-brand-dark'
                  }`}
                >
                  <span>
                    {isCurrentlySelected && isLoggedIn
                      ? `Proceed to Checkout ($${plan.price_usd})`
                      : plan.id === 'single_10'
                      ? 'Get Single Pass ($10)'
                      : `Get ${plan.pages.toLocaleString()} Pages ($${plan.price_usd})`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Comparison Table */}
      <div className="space-y-4 pt-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-[var(--color-ink)]">
            Detailed Feature Comparison
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Compare features and technical capabilities included with every tier.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="table w-full text-xs">
            <thead>
              <tr className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                <th className="font-bold py-3">Feature</th>
                <th className="font-bold text-center">Single ($10)</th>
                <th className="font-bold text-center">Starter 600 ($25)</th>
                <th className="font-bold text-center">Pro 1000 ($50)</th>
                <th className="font-bold text-center">Enterprise 5000 ($100)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--color-border)]">
                <td className="font-semibold text-[var(--color-ink)]">Page Credits</td>
                <td className="text-center font-mono font-bold">1 Page</td>
                <td className="text-center font-mono font-bold">600 Pages</td>
                <td className="text-center font-mono font-bold">1,000 Pages</td>
                <td className="text-center font-mono font-bold text-[var(--media-violet)]">5,000 Pages</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="font-semibold text-[var(--color-ink)]">Cost per Page</td>
                <td className="text-center font-mono">$10.00</td>
                <td className="text-center font-mono">$0.041</td>
                <td className="text-center font-mono">$0.050</td>
                <td className="text-center font-mono font-bold text-[var(--color-success)]">$0.020 (Best)</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="font-semibold text-[var(--color-ink)]">All 6 Export Formats</td>
                <td className="text-center text-[var(--color-success)] font-bold">&#10003;</td>
                <td className="text-center text-[var(--color-success)] font-bold">&#10003;</td>
                <td className="text-center text-[var(--color-success)] font-bold">&#10003;</td>
                <td className="text-center text-[var(--color-success)] font-bold">&#10003;</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="font-semibold text-[var(--color-ink)]">Multi-File Batch Queue</td>
                <td className="text-center text-[var(--color-text-muted)]">—</td>
                <td className="text-center font-semibold">Up to 20 Files</td>
                <td className="text-center font-semibold">Up to 50 Files</td>
                <td className="text-center font-semibold text-[var(--media-violet)]">Unlimited Queue</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="font-semibold text-[var(--color-ink)]">Annual Master P&L Consolidation</td>
                <td className="text-center text-[var(--color-text-muted)]">—</td>
                <td className="text-center text-[var(--color-success)] font-bold">&#10003;</td>
                <td className="text-center text-[var(--color-success)] font-bold">&#10003;</td>
                <td className="text-center text-[var(--color-success)] font-bold">&#10003;</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="font-semibold text-[var(--color-ink)]">Encrypted PDF Support</td>
                <td className="text-center text-[var(--color-success)] font-bold">&#10003;</td>
                <td className="text-center text-[var(--color-success)] font-bold">&#10003;</td>
                <td className="text-center text-[var(--color-success)] font-bold">&#10003;</td>
                <td className="text-center text-[var(--color-success)] font-bold">&#10003;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4 pt-6 max-w-3xl mx-auto">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-[var(--color-ink)]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Everything you need to know about Finlyzer page credits and billing.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1.5"
            >
              <p className="font-bold text-xs text-[var(--color-ink)] flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-[var(--color-brand-dark)] shrink-0" />
                <span>{faq.q}</span>
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pl-5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        plan={selectedPlan}
        userEmail={session?.user?.email || ''}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => fetchQuota()}
      />

      {/* Auth Modal with Plan Recovery */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="pricing"
        planId={selectedPlan?.id}
        redirectUrl={selectedPlan ? `/pricing?plan=${selectedPlan.id}&checkout=true` : '/pricing'}
      />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto w-full py-16 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-[var(--color-ink)]"></span>
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
