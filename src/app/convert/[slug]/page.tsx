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
        name: `How to convert ${page.bankName} statements to ${page.outputFormat}`,
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Upload Statement',
            text: `Drag and drop your ${page.bankName} PDF bank statement into the Finlyzers converter.`,
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'AI Extraction & Balance Reconciliation',
            text: 'Our financial entity parser detects debit, credit, balance, and transaction line items.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: `Download ${page.outputFormat}`,
            text: `Download a clean ${page.outputFormat} file, or switch to Excel, CSV, QBO, OFX, or QIF.`,
          },
        ],
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

  const statementName = `${page.bankName} statement`;

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
        ctaLabel={page.category === 'formats' || page.category === 'tools' ? 'Choose Bank Statement' : `Choose ${page.bankName} Statement`}
        documentType="bank_statement"
      />

      <div className="w-full space-y-16 sm:space-y-24 pt-8 sm:pt-12 pb-8 sm:pb-16">
        <MetricsStrip />

        <HowItWorksSection
          title={`How to Convert ${page.bankName} Statements to ${page.outputFormat}`}
          steps={[
            { icon: UploadCloud, title: `Upload your ${statementName}`, body: `Drop your ${page.bankName} PDF, a scanned copy or a phone photo. Password-protected files are supported.` },
            { icon: Cpu, title: 'AI extracts & reconciles', body: 'Dates, descriptions, debits, credits and balances are extracted and checked against the statement totals.' },
            { icon: Download, title: `Download ${page.outputFormat}`, body: `Get a clean ${page.outputFormat} file, or switch to Excel, CSV, QBO, OFX or QIF for your accounting software.` },
          ]}
        />

        {page.sampleData.length > 0 && (
          <BeforeAfterSection
            title={`Before & After: Your ${page.bankName} Data`}
            subtitle={`Messy ${page.bankName} PDF text becomes clean rows with separate debit and credit columns.`}
            rawLines={page.sampleData.map((row) => `${row.date} ${row.desc} ${row.amount.replace(/[$₹£,+]/g, '')} ${row.balance.replace(/[$₹£,]/g, '')}`)}
            rows={toLedgerRows(page)}
          />
        )}

        {page.features.length > 0 && (
          <FeatureGridSection
            title={`Built for ${page.bankName} Statements`}
            subtitle="Understands real statement layouts, not just generic PDF tables."
            features={page.features}
          />
        )}

        <ExportFormatsSection excludeSlug={page.slug} />

        {page.contentHtml && <EditorialSection html={page.contentHtml} />}

        <SecuritySection title={`Is It Safe to Upload My ${page.bankName} Statement?`} />

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
            subtitle={`Everything you need to know about converting ${page.bankName} statements.`}
            faqs={page.faqs.map((faq) => ({ q: faq.question, a: faq.answer }))}
          />
        )}

        <FinalCtaSection
          title={`Ready to Convert Your ${page.bankName} Statement?`}
          subtitle="Upload a PDF and download clean transactions in seconds. Statements up to 10 pages are free."
        />
      </div>

      <MobileStickyCta />
    </div>
  );
}
