import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowDown, ArrowRight, CheckCircle2, FileSpreadsheet, ShieldCheck, UploadCloud } from 'lucide-react';
import BreadcrumbStrip from '@/components/layout/BreadcrumbStrip';
import CashFlowCalculator from '@/components/calculators/CashFlowCalculator';
import { EditorialSection, FaqSection, FinalCtaSection, SectionBand } from '@/components/converter/sections';
import { getAllCalculatorPages, getCalculatorPageBySlug } from '@/lib/seo-markdown';
import {
  ORGANIZATION_ID,
  SITE_URL,
  absoluteUrl,
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getWebPageJsonLd,
  pageMetadata,
  serializeJsonLd,
} from '@/lib/seo-config';
import { GUEST_RETENTION_HOURS } from '@/lib/retention';
import { FREE_PAGE_LIMIT } from '@/types/pricing';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** The interactive tool for each calculator page; a markdown file without an entry here is not served. */
const CALCULATORS: Record<string, React.ComponentType> = {
  'cash-flow-calculator': CashFlowCalculator,
};

const RELATED_TOOLS = [
  { href: '/analyzer/bank-statement-analyzer', label: 'Bank statement analyzer', body: 'Money in, money out and where it went.' },
  { href: '/convert/bank-statement-to-excel', label: 'Bank statement to Excel', body: 'Every transaction in a spreadsheet.' },
  { href: '/reconcile/bank-reconciliation-calculator', label: 'Bank reconciliation calculator', body: 'Adjusted bank and book balances.' },
];

const ctaFacts = [
  { icon: UploadCloud, label: 'PDF, scans, CSV & Excel' },
  { icon: FileSpreadsheet, label: `Free up to ${FREE_PAGE_LIMIT} pages` },
  { icon: ShieldCheck, label: `Guest uploads deleted after ${GUEST_RETENTION_HOURS} hours` },
];

// Only calculators that have both content and a registered tool; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCalculatorPages()
    .filter((page) => CALCULATORS[page.slug])
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getCalculatorPageBySlug(slug);
  if (!page) return { title: 'Page Not Found', robots: { index: false } };
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/calculators/${page.slug}`,
    // Uses the per-page card from ./opengraph-image.tsx.
    defaultShareImage: false,
  });
}

export default async function CalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getCalculatorPageBySlug(slug);
  const Calculator = CALCULATORS[slug];
  if (!page || !Calculator) notFound();

  const path = `/calculators/${page.slug}`;
  const appId = `${SITE_URL}/#${page.slug}`;
  const faqs = page.faqs.map((f) => ({ q: f.question, a: f.answer }));

  const jsonLd = serializeJsonLd([
    {
      '@type': 'WebApplication',
      '@id': appId,
      name: `Finlyzers ${page.shortTitle}`,
      url: absoluteUrl(path),
      description: page.metaDescription,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any (web browser)',
      publisher: { '@id': ORGANIZATION_ID },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: page.benefits,
    },
    {
      ...getWebPageJsonLd({ path, name: page.title, description: page.metaDescription, dateModified: page.dateModified || undefined }),
      ...(page.datePublished ? { datePublished: page.datePublished } : {}),
      about: { '@id': appId },
    },
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: page.shortTitle, path },
    ]),
    ...(faqs.length > 0 ? [getFaqJsonLd(faqs)] : []),
  ]);

  // "Cash Flow Calculator: Find Net Cash Flow…" → accent the tool name, keep the rest as the subhead.
  const [titleLead, ...titleRest] = page.title.split(':');
  const titleTail = titleRest.join(':').trim();

  return (
    <div className="w-full -mb-6 sm:-mb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <BreadcrumbStrip items={[{ label: 'Home', href: '/' }, { label: page.shortTitle }]} />

      <section
        aria-labelledby="hero-title"
        className="w-full pb-10 sm:pb-16 bg-[var(--color-surface-subtle)] shadow-[0_0_0_100vmax_var(--color-surface-subtle)] [clip-path:inset(0_-100vmax)]"
      >
        <div className="pt-6 sm:pt-12 lg:pt-16 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-soft)] border border-[var(--color-info-border)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-brand-dark)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
            {page.badgeText} · No signup
          </p>
          <h1 id="hero-title" className="type-hero !text-[clamp(2rem,6.5vw,3.5rem)] max-w-4xl mx-auto text-balance">
            <span className="text-[var(--color-brand)]">{titleLead}</span>
            {titleTail && <span className="sr-only">: </span>}
            {titleTail && (
              <span className="block mt-2 !text-[clamp(1.375rem,3.6vw,2.25rem)] leading-tight">{titleTail}</span>
            )}
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-[15px] sm:text-[17px] leading-relaxed text-[var(--color-text-secondary)]">
            {page.intro}
          </p>
          {page.benefits.length > 0 && (
            <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px] text-[var(--color-text-secondary)]">
              {page.benefits.map((b) => (
                <li key={b} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#calculator" className="btn-brand-primary">
              Calculate cash flow <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </a>
            <Link href="/analyzer/bank-statement-analyzer" className="btn-brand-secondary">
              Analyze a bank statement instead
            </Link>
          </div>
        </div>
      </section>

      <div className="pt-10 sm:pt-16 pb-[var(--section-y)]">
        <Calculator />
      </div>

      {page.contentHtml && (
        <SectionBand tone="parchment">
          <EditorialSection html={page.contentHtml} />
        </SectionBand>
      )}

      <SectionBand tone="white">
        <section aria-labelledby="related-title" className="space-y-6">
          <h2 id="related-title" className="type-title text-center">Related tools</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {RELATED_TOOLS.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="card-surface group flex h-full items-center justify-between gap-3 p-5">
                  <span className="space-y-1">
                    <span className="block text-[17px] font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-brand-dark)]">{t.label}</span>
                    <span className="block type-caption !text-[14px]">{t.body}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </SectionBand>

      {faqs.length > 0 && (
        <SectionBand tone="parchment">
          <FaqSection title={`${page.shortTitle} FAQ`} subtitle="Net cash flow, operating cash flow and the cash flow statement, answered." faqs={faqs} />
        </SectionBand>
      )}

      <SectionBand tone="white">
        <FinalCtaSection
          title="Get Your Cash Flow From a Bank Statement"
          subtitle={`Upload a statement to see total money in, money out and where it went. Statements up to ${FREE_PAGE_LIMIT} pages are free, with no signup.`}
          href="/analyzer/bank-statement-analyzer"
          ctaLabel="Analyze a Statement Free"
          facts={ctaFacts}
        />
      </SectionBand>
    </div>
  );
}
