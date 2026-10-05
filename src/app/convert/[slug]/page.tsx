import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getAllLandingPages,
  getLandingPageBySlug,
  getRelatedLandingPages,
} from '@/lib/seo-markdown';
import { SITE_NAME, absoluteUrl, getBreadcrumbJsonLd } from '@/lib/seo-config';
import { ChevronRight, UploadCloud, Cpu, Download } from 'lucide-react';
import ConverterHero from '@/components/converter/ConverterHero';
import MobileStickyCta from '@/components/converter/MobileStickyCta';
import {
  MetricsStrip,
  HowItWorksSection,
  BeforeAfterSection,
  FeatureGridSection,
  ExportFormatsSection,
  EditorialSection,
  SecuritySection,
  ConverterLinksSection,
  ComparisonSection,
  FaqSection,
  FinalCtaSection,
  type LedgerRow,
  type Step,
  type FileOutputPreview,
} from '@/components/converter/sections';
import type { SEOConverterPage as SEOPageData } from '@/types/seo';

/** Splits a signed sample amount ("-$124.50") into the debit / credit columns. */
function toLedgerRows(page: SEOPageData): LedgerRow[] {
  return page.sampleData.map((row) => {
    const amount = row.amount.replace(/^[+-]/, '');
    const isCredit = row.type === 'Credit';
    return { date: row.date, desc: row.desc, debit: isCredit ? '' : amount, credit: isCredit ? amount : '', balance: row.balance };
  });
}

const EXPORT_FORMATS = ['Excel', 'CSV', 'QBO', 'OFX', 'QIF'];
const stepIcons = [UploadCloud, Cpu, Download];

function listWithOr(items: string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}` : items.join('');
}

/** Page-specific steps from frontmatter, or the template steps worded for this page. */
function getSteps(page: SEOPageData): Omit<Step, 'icon'>[] {
  if (page.steps.length > 0) return page.steps;
  const otherFormats = EXPORT_FORMATS.filter((fmt) => !page.outputFormat.includes(fmt));
  return [
    { title: `Upload your ${page.statementLabel}`, body: 'Drop a digital PDF, a scanned copy or a phone photo. Password-protected files are supported.' },
    { title: 'AI extracts & reconciles', body: 'Dates, descriptions, debits, credits and balances are extracted and checked against the statement totals.' },
    { title: `Download ${page.outputFormat}`, body: `Get a clean ${page.outputFormat} file, or switch to ${listWithOr(otherFormats)} for your accounting software.` },
  ];
}

function parseAmount(amount: string): number {
  return Number(amount.replace(/[^0-9.-]/g, ''));
}

/** Accepts MM/DD/YYYY or YYYY-MM-DD sample dates and returns [yyyy, mm, dd]. */
function dateParts(date: string): [string, string, string] {
  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return [iso[1], iso[2], iso[3]];
  const [mm, dd, yyyy] = date.split('/');
  return [yyyy, mm, dd];
}

/** Shows the actual export file for import formats, so each format page previews what it produces. */
function toFileOutput(page: SEOPageData): FileOutputPreview | undefined {
  const rows = page.sampleData;
  const fmt = page.outputFormat;

  if (fmt.includes('OFX') || fmt.includes('QBO')) {
    const label = fmt.includes('QBO') ? 'QBO' : 'OFX';
    return {
      label,
      lines: [
        '<BANKTRANLIST>',
        ...rows.flatMap((row) => {
          const [y, m, d] = dateParts(row.date);
          const amount = parseAmount(row.amount);
          return [
            '  <STMTTRN>',
            `    <TRNTYPE>${amount < 0 ? 'DEBIT' : 'CREDIT'}`,
            `    <DTPOSTED>${y}${m}${d}`,
            `    <TRNAMT>${amount.toFixed(2)}`,
            `    <NAME>${row.desc.slice(0, 32)}`,
            '  </STMTTRN>',
          ];
        }),
        '</BANKTRANLIST>',
      ],
      caption: label === 'QBO'
        ? 'Signed amounts, posting dates and payee names in the Web Connect format QuickBooks imports directly.'
        : 'Signed amounts, posting dates and payee names in standard OFX, ready for Xero bank reconciliation.',
    };
  }

  if (fmt.includes('QIF')) {
    return {
      label: 'QIF',
      lines: [
        '!Type:Bank',
        ...rows.flatMap((row) => {
          const [y, m, d] = dateParts(row.date);
          return [`D${m}/${d}/${y}`, `T${parseAmount(row.amount).toFixed(2)}`, `P${row.desc}`, '^'];
        }),
      ],
      caption: 'One record per transaction with date, signed amount and payee, the layout Quicken expects.',
    };
  }

  if (fmt.includes('CSV')) {
    return {
      label: 'CSV',
      lines: [
        'Date,Description,Debit,Credit,Balance',
        ...rows.map((row) => {
          const [y, m, d] = dateParts(row.date);
          const amount = parseAmount(row.amount);
          const desc = row.desc.includes(',') ? `"${row.desc}"` : row.desc;
          const debit = amount < 0 ? Math.abs(amount).toFixed(2) : '';
          const credit = amount >= 0 ? amount.toFixed(2) : '';
          return `${y}-${m}-${d},${desc},${debit},${credit},${parseAmount(row.balance).toFixed(2)}`;
        }),
      ],
      caption: 'ISO dates, plain numbers and separate debit and credit columns, so it imports cleanly anywhere.',
    };
  }

  return undefined;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = getAllLandingPages();
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPageBySlug(slug);

  if (!page) {
    return {
      title: 'Converter Not Found',
      robots: { index: false },
    };
  }

  const canonicalUrl = absoluteUrl(`/convert/${page.slug}`);

  return {
    // metaTitle already carries the brand, so skip the root layout's "%s | Finlyzers" template.
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'website',
      images: [
        {
          url: '/og_image.webp',
          width: 1200,
          height: 630,
          alt: page.title,
          type: 'image/webp',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.metaTitle,
      description: page.metaDescription,
      images: ['/og_image.webp'],
    },
  };
}

export default async function SEOConverterPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getLandingPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const relatedPages = getRelatedLandingPages(slug, 4);
  const pageUrl = absoluteUrl(`/convert/${page.slug}`);

  const steps = getSteps(page);
  const statementPlural = `${page.statementLabel}s`;

  // JSON-LD Structured Data Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${pageUrl}#app`,
        name: page.title,
        url: pageUrl,
        description: page.metaDescription,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All (Web Browser)',
        publisher: { '@id': `${absoluteUrl('/')}/#organization` },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free for 1–10 pages per document',
        },
      },
      {
        '@type': 'HowTo',
        name: `How to convert ${statementPlural} to ${page.outputFormat}`,
        step: steps.map((step, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: step.title,
          text: step.body,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      getBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Converters', path: '/convert' },
        { name: page.title, path: `/convert/${page.slug}` },
      ]),
    ],
  };

  return (
    <div className="w-full">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] min-w-0">
        <Link href="/" className="hover:text-[var(--color-ink)] transition-colors shrink-0">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <Link href="/convert" className="hover:text-[var(--color-ink)] transition-colors shrink-0">Converters</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="text-[var(--color-ink)] font-semibold truncate" aria-current="page">{page.title}</span>
      </nav>

      <ConverterHero
        badge={`${page.badgeText} · Free up to 10 pages`}
        title={page.title}
        description={page.metaDescription}
        ctaLabel={`Choose ${page.statementLabel}`}
        documentType="bank_statement"
      />

      <div className="w-full space-y-16 sm:space-y-24 pt-8 sm:pt-12 pb-8 sm:pb-16">
        <MetricsStrip />

        <HowItWorksSection
          title={`How to Convert ${statementPlural} to ${page.outputFormat}`}
          steps={steps.map((step, i) => ({ ...step, icon: stepIcons[i % stepIcons.length] }))}
        />

        {page.sampleData.length > 0 && (
          <BeforeAfterSection
            title={`Before & After: Your ${page.statementLabel} Data`}
            subtitle={`Messy ${page.statementLabel} text becomes clean, verified ${page.outputFormat} output.`}
            rawLines={page.sampleData.map((row) => `${row.date} ${row.desc} ${row.amount.replace(/[$₹£,+]/g, '')} ${row.balance.replace(/[$₹£,]/g, '')}`)}
            rows={toLedgerRows(page)}
            fileOutput={toFileOutput(page)}
          />
        )}

        {page.features.length > 0 && (
          <FeatureGridSection
            title={`Built for ${statementPlural}`}
            subtitle="Understands real statement layouts, not just generic PDF tables."
            features={page.features}
          />
        )}

        <ExportFormatsSection excludeSlug={page.slug} />

        {page.contentHtml && <EditorialSection html={page.contentHtml} />}

        <SecuritySection title={`Is It Safe to Upload My ${page.statementLabel}?`} />

        {relatedPages.length > 0 && (
          <ConverterLinksSection
            title="More Bank Statement Converters"
            links={relatedPages.map((rel) => ({ name: rel.title, slug: rel.slug, badge: rel.badgeText }))}
          />
        )}

        <ComparisonSection />

        {page.faqs.length > 0 && (
          <FaqSection
            title="Frequently Asked Questions"
            subtitle={`Everything you need to know about converting ${statementPlural}.`}
            faqs={page.faqs.map((faq) => ({ q: faq.question, a: faq.answer }))}
          />
        )}

        <FinalCtaSection
          title={`Ready to Convert Your ${page.statementLabel}?`}
          subtitle="Upload a PDF and download clean transactions in seconds. Statements up to 10 pages are free."
        />
      </div>

      <MobileStickyCta />
    </div>
  );
}
