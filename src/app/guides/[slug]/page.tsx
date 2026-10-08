import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getAllGuides, getAllLandingPages, getGuideBySlug } from '@/lib/seo-markdown';
import {
  ORGANIZATION_ID,
  WEBAPP_ID,
  absoluteUrl,
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getWebPageJsonLd,
  pageMetadata,
  serializeJsonLd,
} from '@/lib/seo-config';
import ConverterHero from '@/components/converter/ConverterHero';
import MobileStickyCta from '@/components/converter/MobileStickyCta';
import { ConverterLinksSection, EditorialSection, FaqSection, FinalCtaSection } from '@/components/converter/sections';

const GUIDE_BENEFITS = [
  'Upload CSV, XLSX or XLS, or a PDF bank statement',
  'Download a QuickBooks Web Connect (.qbo) file',
  'Or follow the manual import steps below',
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Only the guides that exist in src/content/guides; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return { title: 'Guide Not Found', robots: { index: false } };
  }

  return pageMetadata({
    title: guide.metaTitle,
    description: guide.metaDescription,
    path: `/guides/${guide.slug}`,
  });
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const path = `/guides/${guide.slug}`;
  const converters = getAllLandingPages();
  const relatedPages = guide.related
    .map((relSlug) => converters.find((p) => p.slug === relSlug))
    .filter((p) => p !== undefined);
  const faqs = guide.faqs.map((faq) => ({ q: faq.question, a: faq.answer }));

  // Article + WebPage + BreadcrumbList, plus FAQPage for the FAQs rendered below.
  const jsonLd = serializeJsonLd([
    { ...getWebPageJsonLd({ path, name: guide.title, description: guide.metaDescription, dateModified: guide.dateModified }), about: { '@id': WEBAPP_ID } },
    {
      '@type': 'Article',
      '@id': `${absoluteUrl(path)}#article`,
      headline: guide.title,
      description: guide.metaDescription,
      mainEntityOfPage: { '@id': `${absoluteUrl(path)}#webpage` },
      datePublished: guide.datePublished,
      dateModified: guide.dateModified,
      author: { '@id': ORGANIZATION_ID },
      publisher: { '@id': ORGANIZATION_ID },
      inLanguage: 'en',
    },
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: guide.shortTitle, path },
    ]),
    ...(faqs.length > 0 ? [getFaqJsonLd(faqs)] : []),
  ]);

  return (
    <div className="w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] min-w-0">
        <Link href="/" className="hover:text-[var(--color-ink)] transition-colors shrink-0">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="text-[var(--color-ink)] font-semibold truncate" aria-current="page">{guide.shortTitle}</span>
      </nav>

      <ConverterHero
        badge={guide.badgeText}
        title={guide.title}
        description={guide.intro}
        benefits={guide.acceptsSpreadsheets ? GUIDE_BENEFITS : undefined}
        ctaLabel={guide.ctaLabel}
        documentType="bank_statement"
        acceptSpreadsheets={guide.acceptsSpreadsheets}
      />

      <div className="w-full space-y-16 sm:space-y-24 pt-8 sm:pt-12 pb-8 sm:pb-16">
        <div className="space-y-4">
          <p className="max-w-3xl mx-auto text-sm text-[var(--color-text-muted)]">
            Updated <time dateTime={guide.dateModified}>{formatDate(guide.dateModified)}</time>. QuickBooks menus
            change between releases; if a menu name differs, use the closest match in your version.
          </p>
          <EditorialSection html={guide.contentHtml} />
        </div>

        {relatedPages.length > 0 && (
          <ConverterLinksSection
            title="Converters for QuickBooks Imports"
            links={relatedPages.map((rel) => ({ name: rel.title, slug: rel.slug, badge: rel.badgeText }))}
          />
        )}

        {faqs.length > 0 && (
          <FaqSection
            title="Importing Into QuickBooks: FAQ"
            subtitle="Common questions about getting spreadsheet transactions into QuickBooks."
            faqs={faqs}
          />
        )}

        <FinalCtaSection
          title="Skip the Column Mapping"
          subtitle="Upload a CSV, Excel file or PDF statement and download a QBO file QuickBooks imports directly."
        />
      </div>

      <MobileStickyCta />
    </div>
  );
}
