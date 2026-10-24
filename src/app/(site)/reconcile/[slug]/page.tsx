import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BreadcrumbStrip from '@/components/layout/BreadcrumbStrip';
import { UploadCloud, GitCompareArrows, Download, FileSpreadsheet, ShieldCheck, ArrowDown } from 'lucide-react';
import { getAllReconciliationPages, getReconciliationPageBySlug } from '@/lib/seo-markdown';
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
import ReconciliationHero from '@/components/reconciliation/ReconciliationHero';
import ReconciliationCalculator from '@/components/reconciliation/ReconciliationCalculator';
import MobileStickyCta from '@/components/converter/MobileStickyCta';
import {
  MetricsStrip,
  HowItWorksSection,
  FeatureGridSection,
  EditorialSection,
  ConverterLinksSection,
  FaqSection,
  FinalCtaSection,
  SectionBand,
  type BandTone,
} from '@/components/converter/sections';
import {
  ReportContentsSection,
  SampleMatchSection,
  reconciliationFeatureIcons,
  reconciliationMetrics,
} from '@/components/reconciliation/sections';
import { RECONCILIATION_GUEST_RETENTION_DAYS } from '@/lib/retention';
import { FREE_PAGE_LIMIT } from '@/types/pricing';

const stepIcons = [UploadCloud, GitCompareArrows, Download];

const ctaFacts = [
  { icon: UploadCloud, label: 'PDF, scans, CSV & XLSX' },
  { icon: FileSpreadsheet, label: 'Excel & CSV report' },
  { icon: ShieldCheck, label: `Guest reports deleted after ${RECONCILIATION_GUEST_RETENTION_DAYS} days` },
];

// The reconciliation tool is its own app entity; the site-wide #webapp node describes the converter.
const RECONCILIATION_APP_ID = `${SITE_URL}/#reconciliation-app`;

const reconciliationAppJsonLd = {
  '@type': 'WebApplication',
  '@id': RECONCILIATION_APP_ID,
  name: 'Finlyzers Bank Reconciliation Tool',
  url: absoluteUrl('/reconcile/bank-reconciliation-tool'),
  description:
    'Matches bank statement transactions against a ledger or cash book and reports matched, missing, mismatched and duplicate entries with balance checks.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any (web browser)',
  publisher: { '@id': ORGANIZATION_ID },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: `Free for reconciliations up to ${FREE_PAGE_LIMIT} pages`,
  },
  featureList: [
    'Reads PDF, scanned, CSV and Excel (.xlsx) bank statements and ledgers',
    'Rule-based matching by amount, direction, date, reference and description',
    'Matched, missing, mismatched and duplicate transactions in one report',
    'Opening, closing and running balance checks for both documents',
    'Excel and CSV report download',
    `Guest reconciliations deleted after ${RECONCILIATION_GUEST_RETENTION_DAYS} days`,
  ],
};

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
    reconciliationAppJsonLd,
    {
      ...getWebPageJsonLd({ path, name: page.title, description: page.metaDescription, dateModified: page.dateModified || undefined }),
      about: { '@id': RECONCILIATION_APP_ID },
    },
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: page.shortTitle, path },
    ]),
    ...(faqs.length > 0 ? [getFaqJsonLd(faqs)] : []),
  ]);

  // Content bands in page order. White and parchment alternate automatically (skipping
  // sections this page doesn't have); the feature grid is always the dark band.
  const bands: { key: string; tone?: 'dark'; node: React.ReactNode }[] = [
    ...(page.steps.length > 0
      ? [{
          key: 'how',
          node: (
            <HowItWorksSection
              title="How It Works"
              subtitle="Two files in, one reconciliation report out. Spreadsheets finish in seconds; long scanned PDFs take a few minutes."
              steps={page.steps.map((step, i) => ({ ...step, icon: stepIcons[i % stepIcons.length] }))}
              ctaLabel="Upload Your Files"
            />
          ),
        }]
      : []),
    ...(page.sampleRows.length > 0
      ? [{
          key: 'sample',
          node: (
            <SampleMatchSection
              title="Example: Bank Statement vs Ledger"
              subtitle="How individual lines come out of the comparison (illustrative data)."
              rows={page.sampleRows}
            />
          ),
        }]
      : []),
    { key: 'report', node: <ReportContentsSection /> },
    ...(page.features.length > 0
      ? [{
          key: 'features',
          tone: 'dark' as const,
          node: (
            <FeatureGridSection
              title="Built for Real Statements and Ledgers"
              subtitle="Handles the formats and bookkeeping conventions that break manual matching."
              features={page.features.map((f) => ({ ...f, icon: f.icon ? reconciliationFeatureIcons[f.icon] : undefined }))}
              bare
            />
          ),
        }]
      : []),
    ...(page.contentHtml ? [{ key: 'editorial', node: <EditorialSection html={page.contentHtml} /> }] : []),
    ...(related.length > 0
      ? [{
          key: 'related',
          node: (
            <ConverterLinksSection
              title="More Reconciliation Tools"
              basePath="/reconcile"
              allLink={{ href: '/convert', label: 'Bank statement converters' }}
              links={related.slice(0, 4).map((p) => ({ name: p.title, slug: p.slug, badge: p.badgeText }))}
            />
          ),
        }]
      : []),
    ...(faqs.length > 0
      ? [{
          key: 'faq',
          node: (
            <FaqSection title={`${page.shortTitle} FAQ`} subtitle="Common questions about reconciling bank statements with your books." faqs={faqs} />
          ),
        }]
      : []),
    {
      key: 'final-cta',
      node: (
        <FinalCtaSection
          title="Reconcile Your Bank Statement Now"
          subtitle={`Upload a bank statement and your ledger. Reconciliations up to ${FREE_PAGE_LIMIT} pages are free, with no signup.`}
          ctaLabel="Choose Your Files"
          facts={ctaFacts}
        />
      ),
    },
  ];

  let lightIndex = 0;
  const bandTones: BandTone[] = bands.map((band) => {
    if (band.tone === 'dark') {
      lightIndex = 1; // the band after a dark band starts white again
      return 'dark';
    }
    return lightIndex++ % 2 === 0 ? 'parchment' : 'white';
  });

  return (
    <div className="w-full -mb-6 sm:-mb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <BreadcrumbStrip items={[{ label: 'Home', href: '/' }, { label: page.shortTitle }]} />

      <ReconciliationHero
        badge={`${page.badgeText} · Free up to ${FREE_PAGE_LIMIT} pages`}
        title={page.title}
        description={page.intro}
        benefits={page.benefits.length > 0 ? page.benefits : undefined}
      >
        {page.showCalculator && (
          <a
            href="#calculator"
            className="link inline-flex items-center gap-1 text-[15px] min-h-[44px]"
          >
            Only need the calculation? Use the calculator below
            <ArrowDown className="w-4 h-4" aria-hidden="true" />
          </a>
        )}
      </ReconciliationHero>

      <div className="pt-10 sm:pt-16 pb-[var(--section-y)]">
        {page.showCalculator ? <ReconciliationCalculator /> : <MetricsStrip items={reconciliationMetrics} />}
      </div>

      {bands.map((band, i) => (
        <SectionBand key={band.key} tone={bandTones[i]}>
          {band.node}
        </SectionBand>
      ))}

      <MobileStickyCta label="Reconcile Free" note={`Free up to ${FREE_PAGE_LIMIT} pages · No signup`} />
    </div>
  );
}
