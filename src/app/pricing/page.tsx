'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  CreditCard,
  CheckCircle2,
  Check,
  ShieldCheck,
  ChevronDown,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { PRICING_PLANS, PricingPlan, FREE_PAGE_LIMIT } from '@/types/pricing';
import CheckoutModal from '@/components/dashboard/CheckoutModal';
import Link from 'next/link';
import { PRICING_FAQS } from './faqs';
import AuthModal from '@/components/auth/LazyAuthModal';

// Reads ?plan= in its own Suspense boundary so the rest of the page can be server-rendered.
function PlanQueryReader({ onPlan }: { onPlan: (planId: string | null) => void }) {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');
  useEffect(() => {
    onPlan(planId);
  }, [planId, onPlan]);
  return null;
}

/** Plan badges are stored in capitals; show them in sentence case. */
function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
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
      const matchedPlan = PRICING_PLANS.find(
        (p) => p.id === targetPlanId || (targetPlanId === 'single_10' && p.id === 'guest_doc_unlock')
      );
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

  const faqs = PRICING_FAQS;

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
    <div className="max-w-6xl mx-auto w-full space-y-16 sm:space-y-24 pb-16">
      <Suspense fallback={null}>
        <PlanQueryReader onPlan={setQueryPlanId} />
      </Suspense>

      <div className="space-y-10 sm:space-y-14">
        {/* Header */}
        {isLoggedIn ? (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="type-title">Pricing &amp; Credits</h1>
              <p className="text-[15px] sm:text-[17px] text-[var(--color-text-secondary)]">
                Top up page credits whenever you need them. No subscriptions, credits never expire.
              </p>
            </div>

            <dl className="grid grid-cols-3 w-full md:w-auto card-surface divide-x divide-[var(--color-border)]">
              <div className="px-4 py-3 sm:px-5 min-w-0">
                <dt className="text-[13px] text-[var(--color-text-muted)]">Balance</dt>
                <dd className="mt-0.5 text-xl sm:text-2xl font-semibold tracking-tight tabular-nums text-[var(--color-ink)] whitespace-nowrap">
                  {totalBalance.toLocaleString()} <span className="text-xs font-normal text-[var(--color-text-secondary)]">pages</span>
                </dd>
              </div>
              <div className="px-4 py-3 sm:px-5 min-w-0">
                <dt className="text-[13px] text-[var(--color-text-muted)]">Used</dt>
                <dd className="mt-0.5 text-xl sm:text-2xl font-semibold tracking-tight tabular-nums text-[var(--color-ink)] whitespace-nowrap">
                  {quota.totalPagesProcessed.toLocaleString()} <span className="text-xs font-normal text-[var(--color-text-secondary)]">pages</span>
                </dd>
              </div>
              <div className="px-4 py-3 sm:px-5 min-w-0">
                <dt className="text-[13px] text-[var(--color-text-muted)]">Tier</dt>
                <dd className="mt-0.5 text-xl sm:text-2xl font-semibold tracking-tight text-[var(--color-ink)] truncate capitalize">{quota.tier}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="text-center space-y-4 max-w-3xl mx-auto pt-4 sm:pt-10">
            <p className="eyebrow inline-flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" aria-hidden="true" />
              <span>Pay-As-You-Go Pricing</span>
            </p>
            <h1 className="type-hero text-balance">Bank Statement Converter Pricing</h1>
            <p className="type-lead max-w-2xl mx-auto">
              Free up to {FREE_PAGE_LIMIT} pages. Pay only when a statement is longer. No monthly lock-ins.
            </p>
          </div>
        )}

        {/* How pricing works */}
        <ul className="grid grid-cols-1 sm:grid-cols-3 border-y border-[var(--color-border)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border)]">
          {rules.map((rule) => {
            const Icon = rule.icon;
            return (
              <li key={rule.range} className="flex items-start gap-3 py-5 sm:py-6 sm:px-6 first:sm:pl-0 last:sm:pr-0">
                <Icon className="w-5 h-5 mt-0.5 text-[var(--color-text-muted)] shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[13px] text-[var(--color-text-muted)]">{rule.range}</p>
                  <p className="mt-0.5 text-2xl font-semibold tracking-tight text-[var(--color-ink)] leading-tight">{rule.price}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{rule.note}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Plan columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)]">
          {PRICING_PLANS.map((plan) => {
            const isPopular = !!plan.popular;
            const isSelected = selectedPlan?.id === plan.id;
            const isPass = plan.id === 'guest_doc_unlock';
            const highlighted = isSelected || isPopular;
            const marker = isSelected ? 'Selected' : plan.badge ? sentenceCase(plan.badge) : null;

            return (
              <div
                key={plan.id}
                className={`flex flex-col p-6 sm:p-7 ${isPopular ? 'bg-[var(--color-surface-subtle)]' : 'bg-[var(--color-surface)]'}`}
              >
                <div className={`h-6 mb-3 ${marker ? '' : 'hidden sm:block'}`}>
                  {marker && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isSelected
                          ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]'
                          : 'bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)]'
                      }`}
                    >
                      {marker}
                    </span>
                  )}
                </div>

                <h3 className="type-headline">{plan.name}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed sm:min-h-[4.875rem]">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-5xl font-semibold tracking-tight tabular-nums text-[var(--color-ink)] leading-none">
                    ${plan.price_usd}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">{isPass ? 'per document' : 'one-time'}</span>
                </div>
                <p className="mt-2 text-[13px] text-[var(--color-text-muted)] tabular-nums">
                  <span className="text-[var(--color-ink)]">{isPass ? 'Up to 30 pages' : `${plan.pages.toLocaleString()} pages`}</span>
                  {' · '}
                  {formatPerPage(plan)}
                </p>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  aria-label={`Select ${plan.name} plan for $${plan.price_usd}`}
                  className={`mt-6 w-full ${highlighted ? 'btn-brand-primary' : 'btn-brand-ghost'}`}
                >
                  <span>
                    {isSelected && isLoggedIn
                      ? `Checkout $${plan.price_usd}`
                      : isPass
                      ? 'Get Document Pass'
                      : `Buy for $${plan.price_usd}`}
                  </span>
                </button>

                <ul className="mt-6 pt-6 border-t border-[var(--color-border)] space-y-2.5 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm leading-snug text-[var(--color-ink)]">
                      <Check className="w-4 h-4 text-[var(--color-text-muted)] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison table */}
      <section aria-labelledby="compare-title" className="space-y-6 sm:space-y-8">
        <div className="text-center space-y-3">
          <h2 id="compare-title" className="type-display">Compare plans</h2>
          <p className="type-lead">Every option includes the same AI extraction engine and all export formats.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm" aria-label="Plan feature comparison">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th scope="col" className="py-4 pr-4 text-left text-[13px] font-normal text-[var(--color-text-muted)]">Feature</th>
                {PRICING_PLANS.map((p) => (
                  <th scope="col" key={p.id} className="py-4 px-4 text-center whitespace-nowrap">
                    <span className="block text-[15px] font-semibold text-[var(--color-ink)]">{p.name}</span>
                    <span className="block text-[13px] font-normal text-[var(--color-text-muted)] tabular-nums">${p.price_usd}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="py-4 pr-4 font-normal text-[var(--color-ink)] whitespace-nowrap text-left">{row.label}</th>
                  {row.values.map((value, i) => (
                    <td key={i} className="py-4 px-4 text-center tabular-nums whitespace-nowrap text-[var(--color-ink)]">
                      {value === '✓' ? (
                        <>
                          <Check className="w-4 h-4 mx-auto text-[var(--color-ink)]" aria-hidden="true" />
                          <span className="sr-only">Included</span>
                        </>
                      ) : value === '—' ? (
                        <>
                          <span className="text-[var(--color-text-muted)]" aria-hidden="true">—</span>
                          <span className="sr-only">Not included</span>
                        </>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="pricing-faq-title" className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <h2 id="pricing-faq-title" className="type-display text-center">Frequently asked questions</h2>
        <div className="border-t border-[var(--color-border)]">
          {faqs.map((faq) => (
            <details key={faq.q} className="group border-b border-[var(--color-border)] [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center gap-3 min-h-[56px] py-4 cursor-pointer list-none text-[17px] font-medium text-[var(--color-ink)]">
                <span className="flex-1">{faq.q}</span>
                <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-5 pr-8 text-[15px] text-[var(--color-text-secondary)] leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="max-w-2xl mx-auto text-center text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
        Page credits work across every tool: the{' '}
        <Link href="/" className="link">bank statement converter</Link> (Excel, CSV, QBO, OFX and QIF), the{' '}
        <Link href="/reconcile/bank-reconciliation-tool" className="link">bank reconciliation tool</Link> and the{' '}
        <Link href="/analyzer/bank-statement-analyzer" className="link">bank statement analyzer</Link>. Browse{' '}
        <Link href="/convert" className="link">converters by bank and format</Link>.
      </p>

      <p className="flex items-center justify-center gap-1.5 text-[13px] text-[var(--color-text-muted)] text-center">
        <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>256-bit encrypted checkout &bull; Failed extractions are never charged</span>
      </p>

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
