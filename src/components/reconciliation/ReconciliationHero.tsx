import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import ReconciliationUploader from './ReconciliationUploader';
import { FREE_PAGE_LIMIT, GUEST_MAX_PAGES, PRICING_PLANS } from '@/types/pricing';

const PASS_PRICE = PRICING_PLANS.find((p) => p.id === 'guest_doc_unlock')?.price_usd ?? 10;

const DEFAULT_BENEFITS = [
  'Matched, missing and duplicate transactions in one report',
  'Opening, closing and running balances checked on both sides',
  'Download the full report as Excel or CSV',
];

interface ReconciliationHeroProps {
  badge: string;
  title: string;
  description: string;
  benefits?: string[];
  /** Optional content rendered under the hero copy (e.g. the calculator page's jump link). */
  children?: React.ReactNode;
}

/** Hero for the /reconcile landing pages (guests only): copy on the left, upload card on the right. */
export default function ReconciliationHero({ badge, title, description, benefits = DEFAULT_BENEFITS, children }: ReconciliationHeroProps) {
  return (
    <section id="upload" aria-labelledby="hero-title" className="w-full scroll-mt-24 pb-4 sm:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-5 sm:gap-6 lg:gap-x-16 lg:gap-y-6 items-center pt-2 sm:pt-6 lg:pt-10">
        <div className="space-y-3 sm:space-y-5 text-center lg:text-left">
          <span className="feature-badge">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{badge}</span>
          </span>
          <h1
            id="hero-title"
            className="text-[2rem] leading-[1.08] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.04] font-extrabold tracking-tight text-[var(--color-ink)]"
          >
            {title}
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl mx-auto lg:mx-0">{description}</p>
        </div>

        <div className="lg:row-span-2">
          <ReconciliationUploader />
        </div>

        <div className="space-y-5 text-center lg:text-left">
          <ul className="hidden sm:grid gap-2.5 max-w-xl mx-auto lg:mx-0">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center justify-center lg:justify-start gap-2.5 text-base text-[var(--color-ink)]">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-dark)] shrink-0" aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Up to {FREE_PAGE_LIMIT} pages free · {FREE_PAGE_LIMIT + 1}–{GUEST_MAX_PAGES} pages: ${PASS_PRICE} one-time unlock · {GUEST_MAX_PAGES}+ pages: free account.{' '}
            <Link href="/pricing" className="font-semibold text-[var(--color-ink)] underline underline-offset-4 decoration-[var(--color-brand)] decoration-2">
              See pricing
            </Link>
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}
