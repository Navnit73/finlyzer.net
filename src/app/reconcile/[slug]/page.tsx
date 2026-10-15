import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, UploadCloud, GitCompareArrows, Download, FileSpreadsheet, ShieldCheck, ArrowDown } from 'lucide-react';
import { getAllReconciliationPages, getReconciliationPageBySlug } from '@/lib/seo-markdown';
import {
  WEBAPP_ID,
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getWebPageJsonLd,
  pageMetadata,
  serializeJsonLd,
} from '@/lib/seo-config';
import ReconciliationHero from '@/components/reconciliation/ReconciliationHero';
import ReconciliationCalculator from '@/components/reconciliation/ReconciliationCalculator';
import MobileStickyCta from '@/components/converter/MobileStickyCta';
import {
  MetricsStrip,
  HowItWorksSection,
  FeatureGridSection,
  EditorialSection,
  SecuritySection,
  ConverterLinksSection,
  FaqSection,
  FinalCtaSection,
} from '@/components/converter/sections';
import {
  ReportContentsSection,
  SampleMatchSection,
  reconciliationMetrics,
  reconciliationSecurityPoints,
} from '@/components/reconciliation/sections';
import { RECONCILIATION_GUEST_RETENTION_DAYS } from '@/lib/retention';
import { FREE_PAGE_LIMIT } from '@/types/pricing';

const stepIcons = [UploadCloud, GitCompareArrows, Download];

const ctaFacts = [
  { icon: UploadCloud, label: 'PDF, scans, CSV & XLSX' },
  { icon: FileSpreadsheet, label: 'Excel & CSV report' },
  { icon: ShieldCheck, label: `Guest reports deleted after ${RECONCILIATION_GUEST_RETENTION_DAYS} days` },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Only the pages that exist in src/content/reconciliation; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllReconciliationPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getReconciliationPageBySlug(slug);
  if (!page) return { title: 'Page Not Found', robots: { index: false } };

  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/reconcile/${page.slug}`,
    // Uses the per-page card from ./opengraph-image.tsx.
    defaultShareImage: false,
  });
}

export default async function ReconciliationLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getReconciliationPageBySlug(slug);
  if (!page) notFound();

  const allPages = getAllReconciliationPages();
  const others = allPages.filter((p) => p.slug !== page.slug);
  const related = [
    ...page.related.map((s) => others.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => Boolean(p)),
    ...others.filter((p) => !page.related.includes(p.slug)),
  ];

  const path = `/reconcile/${page.slug}`;
  const faqs = page.faqs.map((faq) => ({ q: faq.question, a: faq.answer }));

  const jsonLd = serializeJsonLd([
    {
      ...getWebPageJsonLd({ path, name: page.title, description: page.metaDescription, dateModified: page.dateModified || undefined }),
      about: { '@id': WEBAPP_ID },
    },
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: page.shortTitle, path },
    ]),
    ...(faqs.length > 0 ? [getFaqJsonLd(faqs)] : []),
  ]);

  return (
    <div className="w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] min-w-0">
        <Link href="/" className="hover:text-[var(--color-ink)] transition-colors shrink-0">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="text-[var(--color-ink)] font-semibold truncate" aria-current="page">{page.shortTitle}</span>
      </nav>

      <ReconciliationHero
        badge={`${page.badgeText} · Free up to ${FREE_PAGE_LIMIT} pages`}
        title={page.title}
        description={page.intro}
        benefits={page.benefits.length > 0 ? page.benefits : undefined}
      >
        {page.showCalculator && (
          <a
            href="#calculator"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)] underline underline-offset-4 decoration-[var(--color-brand)] decoration-2 min-h-[44px]"
          >
            Only need the calculation? Use the calculator below
            <ArrowDown className="w-4 h-4" aria-hidden="true" />
          </a>
        )}
      </ReconciliationHero>

      <div className="w-full space-y-16 sm:space-y-24 pt-8 sm:pt-12 pb-8 sm:pb-16">
        {page.showCalculator ? <ReconciliationCalculator /> : <MetricsStrip items={reconciliationMetrics} />}

        {page.steps.length > 0 && (
          <HowItWorksSection
            title="How It Works"
            subtitle="Two files in, one reconciliation report out. Spreadsheets finish in seconds; long scanned PDFs take a few minutes."
            steps={page.steps.map((step, i) => ({ ...step, icon: stepIcons[i % stepIcons.length] }))}
            ctaLabel="Upload Your Files"
          />
        )}

        {page.sampleRows.length > 0 && (
          <SampleMatchSection
            title="Example: Bank Statement vs Ledger"
            subtitle="How individual lines come out of the comparison (illustrative data)."
            rows={page.sampleRows}
          />
        )}

        <ReportContentsSection />

        {page.features.length > 0 && (
          <FeatureGridSection
            title="Built for Real Statements and Ledgers"
            subtitle="Handles the formats and bookkeeping conventions that break manual matching."
            features={page.features}
          />
        )}

        {page.contentHtml && <EditorialSection html={page.contentHtml} />}

        <SecuritySection title="Is It Safe to Upload My Bank Statement and Ledger?" points={reconciliationSecurityPoints} />

        {related.length > 0 && (
          <ConverterLinksSection
            title="More Reconciliation Tools"
            basePath="/reconcile"
            allLink={{ href: '/convert', label: 'Bank statement converters' }}
            links={related.slice(0, 4).map((p) => ({ name: p.title, slug: p.slug, badge: p.badgeText }))}
          />
        )}

        {faqs.length > 0 && (
          <FaqSection title={`${page.shortTitle} FAQ`} subtitle="Common questions about reconciling bank statements with your books." faqs={faqs} />
        )}

        <FinalCtaSection
          title="Reconcile Your Bank Statement Now"
          subtitle={`Upload a bank statement and your ledger. Reconciliations up to ${FREE_PAGE_LIMIT} pages are free, with no signup.`}
          ctaLabel="Choose Your Files"
          facts={ctaFacts}
        />
      </div>

      <MobileStickyCta label="Reconcile Free" note={`Free up to ${FREE_PAGE_LIMIT} pages · No signup`} />
    </div>
  );
}
