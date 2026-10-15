import React from 'react';
import Link from 'next/link';
import { GitCompareArrows, Scale, FileSpreadsheet } from 'lucide-react';
import ReconciliationUploader from './ReconciliationUploader';
import { FREE_PAGE_LIMIT, GUEST_MAX_PAGES, PRICING_PLANS } from '@/types/pricing';

const PASS_PRICE = PRICING_PLANS.find((p) => p.id === 'guest_doc_unlock')?.price_usd ?? 10;

const DEFAULT_BENEFITS = [
  'Matched, missing and duplicate transactions in one report',
  'Opening, closing and running balances checked on both sides',
  'Download the full report as Excel or CSV',
];
const benefitIcons = [GitCompareArrows, Scale, FileSpreadsheet];

// Tinted from the design tokens like the homepage "Export to" chips.
const INPUT_FORMATS: { name: string; tone: string }[] = [
  { name: 'PDF', tone: 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)] text-[var(--color-danger)]' },
  { name: 'Scans & photos', tone: 'bg-[var(--color-brand-soft)] border-[var(--color-info-border)] text-[var(--color-brand-dark)]' },
  { name: 'CSV', tone: 'bg-[var(--color-brand-soft)] border-[var(--color-info-border)] text-[var(--color-brand-dark)]' },
  { name: 'Excel (.xlsx)', tone: 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)]' },
];

interface ReconciliationHeroProps {
  badge: string;
  title: string;
  description: string;
  benefits?: string[];
  /** Optional content rendered under the pricing note (e.g. the calculator page's jump link). */
  children?: React.ReactNode;
}

/**
 * Hero for the /reconcile landing pages (guests only), laid out like the homepage ConverterHero:
 * parchment band, centered badge → H1 → lead → two-file upload card → benefit cards → formats & pricing.
 */
export default function ReconciliationHero({ badge, title, description, benefits = DEFAULT_BENEFITS, children }: ReconciliationHeroProps) {
  const titleWords = title.split(' ');
  const titleLead = titleWords.slice(0, -1).join(' ');
  const titleAccent = titleWords[titleWords.length - 1];

  return (
    <section
      id="upload"
      aria-labelledby="hero-title"
      className="w-full scroll-mt-24 pb-10 sm:pb-16 bg-[var(--color-surface-subtle)] shadow-[0_0_0_100vmax_var(--color-surface-subtle)] [clip-path:inset(0_-100vmax)]"
    >
      <div className="pt-6 sm:pt-12 lg:pt-16 text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-soft)] border border-[var(--color-info-border)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-brand-dark)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
          {badge}
        </p>
        <h1 id="hero-title" className="type-hero !text-[clamp(2rem,6.5vw,3.5rem)] max-w-4xl mx-auto text-balance">
          {titleLead}{' '}
          <span className="text-[var(--color-brand)]">{titleAccent}</span>
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-[13px] sm:text-[15px] leading-relaxed text-[var(--color-text-secondary)]">{description}</p>

        <div className="mt-7 sm:mt-10 max-w-3xl mx-auto text-left">
          <ReconciliationUploader variant="hero" />
        </div>

        <ul className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-left">
          {benefits.map((benefit, i) => {
            const BenefitIcon = benefitIcons[i % benefitIcons.length];
            return (
              <li key={benefit} className="card-surface flex items-start gap-3.5 p-4 sm:p-5">
                <span className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] flex items-center justify-center shrink-0">
                  <BenefitIcon className="w-5 h-5 text-[var(--color-brand-dark)]" aria-hidden="true" />
                </span>
                <span className="text-base font-medium text-[var(--color-ink)] leading-snug pt-1.5">{benefit}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-4">
          <div>
            <p className="text-[13px] font-medium text-[var(--color-text-muted)]">Works with</p>
            <ul className="mt-2.5 flex flex-wrap justify-center gap-2">
              {INPUT_FORMATS.map((fmt) => (
                <li key={fmt.name} className={`px-3 py-1 rounded-full border text-[13px] font-medium ${fmt.tone}`}>
                  {fmt.name}
                </li>
              ))}
            </ul>
          </div>

          <p className="rounded-lg bg-[var(--color-info-soft)] border border-[var(--color-info-border)] px-3 py-2 text-[13px] text-[var(--color-text-secondary)]">
            Up to {FREE_PAGE_LIMIT} pages free · {FREE_PAGE_LIMIT + 1}–{GUEST_MAX_PAGES} pages: ${PASS_PRICE} one-time unlock · {GUEST_MAX_PAGES}+ pages: free account.{' '}
            <Link href="/pricing" className="link">
              See pricing
            </Link>
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}
