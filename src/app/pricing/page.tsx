'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { PRICING_PLANS, PricingPlan, FREE_PAGE_LIMIT } from '@/types/pricing';
import CheckoutModal from '@/components/dashboard/CheckoutModal';
import AuthModal from '@/components/auth/AuthModal';

// Reads ?plan= in its own Suspense boundary so the rest of the page can be server-rendered.
function PlanQueryReader({ onPlan }: { onPlan: (planId: string | null) => void }) {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');
  useEffect(() => {
    onPlan(planId);
  }, [planId, onPlan]);
  return null;
}

function formatPerPage(plan: PricingPlan): string {
  return `$${(plan.price_usd / plan.pages).toFixed(3)}/page`;
}

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [queryPlanId, setQueryPlanId] = useState<string | null>(null);

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

    let targetPlanId = queryPlanId;
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
  }, [status, queryPlanId]);

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
      q: 'Is it really free for small statements?',
      a: `Yes. Any statement up to ${FREE_PAGE_LIMIT} pages converts and downloads for free in every format, with no card required.`,
    },
    {
      q: 'What does the $10 Document Pass cover?',
      a: 'One statement between 11 and 30 pages: full conversion plus download in all 6 export formats. Pay once, no subscription.',
    },
    {
      q: 'Do purchased page credits expire?',
      a: 'No. Purchased page credits are permanent and never expire.',
    },
    {
      q: 'What happens if a document fails to parse?',
      a: 'If a document fails validation or OCR extraction, no page credits are deducted from your balance.',
    },
  ];

  // `freePagesRemaining` is the total remaining balance (free + purchased − used).
  const totalBalance = quota.freePagesRemaining ?? 0;

  const comparisonRows: { label: string; values: string[] }[] = [
    { label: 'Page credits', values: PRICING_PLANS.map((p) => `${p.pages.toLocaleString()} pages`) },
    { label: 'Cost per page', values: PRICING_PLANS.map((p) => formatPerPage(p)) },
    { label: 'All 6 export formats', values: PRICING_PLANS.map(() => '✓') },
    { label: 'Encrypted PDF support', values: PRICING_PLANS.map(() => '✓') },
    { label: 'Multi-file batch queue', values: ['—', 'Up to 20 files', 'Up to 50 files', 'Unlimited'] },
    { label: 'Annual master P&L consolidation', values: ['—', '✓', '✓', '✓'] },
  ];

  const rules = [
    { range: `1–${FREE_PAGE_LIMIT} pages`, price: 'Free', note: 'Convert & download, no card needed', icon: CheckCircle2, highlight: true },
    { range: `${FREE_PAGE_LIMIT + 1}–30 pages`, price: '$10', note: 'One-time Document Pass per statement', icon: FileSpreadsheet, highlight: false },
    { range: '30+ pages or bulk', price: 'From $25', note: 'Page credit packs, never expire', icon: Layers, highlight: false },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-10 pb-16">
      <Suspense fallback={null}>
        <PlanQueryReader onPlan={setQueryPlanId} />
      </Suspense>

      {/* Header */}
      {isLoggedIn ? (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight">
              Pricing &amp; Credits
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              Top up page credits whenever you need them. No subscriptions, credits never expire.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto">
            <div className="p-3 sm:px-4 rounded-lg bg-[var(--color-brand-soft)] border border-[var(--color-brand)]/30 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-on-brand)]/70">Balance</p>
              <p className="text-lg sm:text-xl font-black font-mono text-[var(--color-on-brand)] whitespace-nowrap">
                {totalBalance.toLocaleString()} <span className="text-xs font-bold">pages</span>
              </p>
            </div>
            <div className="p-3 sm:px-4 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Used</p>
              <p className="text-lg sm:text-xl font-black font-mono text-[var(--color-ink)] whitespace-nowrap">
                {quota.totalPagesProcessed.toLocaleString()} <span className="text-xs font-bold">pages</span>
              </p>
            </div>
            <div className="p-3 sm:px-4 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Tier</p>
              <p className="text-lg sm:text-xl font-black text-[var(--color-ink)] uppercase truncate">{quota.tier}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="feature-badge">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay-As-You-Go Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] tracking-tight">
            Bank Statement Converter Pricing
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Free up to {FREE_PAGE_LIMIT} pages. Pay only when a statement is longer. No monthly lock-ins.
          </p>
        </div>
      )}

      {/* How pricing works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.range}
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                rule.highlight
                  ? 'bg-[var(--color-brand-soft)] border-[var(--color-brand)]/40'
                  : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)]'
              }`}
            >
              <span className="w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[var(--color-ink)]" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--color-text-secondary)]">{rule.range}</p>
                <p className="text-xl font-black text-[var(--color-ink)] leading-tight">{rule.price}</p>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{rule.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
        {PRICING_PLANS.map((plan) => {
          const isPopular = !!plan.popular;
          const isSelected = selectedPlan?.id === plan.id;
          const isPass = plan.id === 'guest_doc_unlock';
          const highlighted = isSelected || isPopular;

          return (
            <div
              key={plan.id}
              className={`relative p-5 sm:p-6 rounded-lg bg-[var(--color-surface)] flex flex-col transition-colors ${
                highlighted
                  ? 'border-2 border-[var(--color-brand)]'
                  : 'border border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
              }`}
            >
              {(plan.badge || isSelected) && (
                <span
                  className={`absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isSelected || isPopular
                      ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)]'
                      : 'bg-[var(--media-violet)] text-[var(--color-on-dark)]'
                  }`}
                >
                  {isSelected ? 'Selected' : plan.badge}
                </span>
              )}

              <div className="space-y-1">
                <h3 className="text-lg font-black text-[var(--color-ink)]">{plan.name}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed min-h-[36px]">
                  {plan.description}
                </p>
              </div>

              <div className="py-4 my-4 border-y border-[var(--color-border)]">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[var(--color-ink)] font-mono">${plan.price_usd}</span>
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                    {isPass ? 'per document' : 'one-time'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] mt-1.5">
                  <span className="font-bold text-[var(--color-ink)] font-mono">
                    {isPass ? 'Up to 30 pages' : `${plan.pages.toLocaleString()} pages`}
                  </span>
                  <span className="text-[var(--color-text-muted)] font-mono">{formatPerPage(plan)}</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-[var(--color-ink)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`mt-6 w-full !min-h-[42px] !h-[42px] text-xs font-bold whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 ${
                  highlighted ? 'btn-brand-primary' : 'btn-brand-dark'
                }`}
              >
                <span>
                  {isSelected && isLoggedIn
                    ? `Checkout $${plan.price_usd}`
                    : isPass
                    ? 'Get Document Pass'
                    : `Buy for $${plan.price_usd}`}
                </span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="space-y-4 pt-4">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-[var(--color-ink)]">Compare plans</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Every option includes the same AI extraction engine and all export formats.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="table w-full text-xs">
            <thead>
              <tr className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                <th className="font-bold py-3">Feature</th>
                {PRICING_PLANS.map((p) => (
                  <th key={p.id} className="font-bold text-center whitespace-nowrap">
                    {p.name} (${p.price_usd})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b border-[var(--color-border)] last:border-b-0">
                  <td className="font-semibold text-[var(--color-ink)] whitespace-nowrap">{row.label}</td>
                  {row.values.map((value, i) => (
                    <td
                      key={i}
                      className={`text-center font-mono whitespace-nowrap ${
                        value === '✓'
                          ? 'text-[var(--color-success)] font-bold'
                          : value === '—'
                          ? 'text-[var(--color-text-muted)]'
                          : 'text-[var(--color-ink)]'
                      }`}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4 pt-4 max-w-3xl mx-auto">
        <h2 className="text-xl font-black text-[var(--color-ink)] text-center">Frequently asked questions</h2>
        <div className="space-y-2">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] open:bg-[var(--color-surface-subtle)]"
            >
              <summary className="font-bold text-xs text-[var(--color-ink)] flex items-center gap-2 cursor-pointer list-none">
                <HelpCircle className="w-3.5 h-3.5 text-[var(--color-brand-dark)] shrink-0" />
                <span className="flex-1">{faq.q}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pl-5 pt-2">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--color-text-muted)]">
        <ShieldCheck className="w-4 h-4 text-[var(--color-success)]" />
        <span>256-bit encrypted checkout &bull; Failed extractions are never charged</span>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        plan={selectedPlan}
        userEmail={session?.user?.email || ''}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => fetchQuota()}
      />

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
