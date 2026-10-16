import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight, ShieldCheck, UploadCloud, FileSpreadsheet } from 'lucide-react';
import BreadcrumbStrip from '@/components/layout/BreadcrumbStrip';
import AnalyzerUploader from '@/components/analyzer/AnalyzerUploader';
import { EditorialSection, FaqSection, SectionBand } from '@/components/converter/sections';
import MobileStickyCta from '@/components/converter/MobileStickyCta';
import { ANALYZERS, analyzerPath, getAnalyzer } from '@/lib/analyzers';
import { getAnalyzerPageBySlug } from '@/lib/seo-markdown';
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

const RELATED_TOOLS = [
  { href: '/convert/bank-statement-to-excel', label: 'Bank statement to Excel', body: 'Every transaction in a spreadsheet.' },
  { href: '/convert/bank-statement-to-csv', label: 'Bank statement to CSV', body: 'Plain rows for imports and scripts.' },
  { href: '/reconcile/bank-reconciliation-tool', label: 'Bank reconciliation', body: 'Match your statement to your books.' },
];

// Only analyzers that are registered and have content; mixed-case URLs are lowercased in src/proxy.ts.
export const dynamicParams = false;

export function generateStaticParams() {
  return ANALYZERS.filter((a) => getAnalyzerPageBySlug(a.slug)).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getAnalyzerPageBySlug(slug);
  if (!page) return { title: 'Page Not Found', robots: { index: false } };
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: analyzerPath(page.slug),
    // Uses the per-page card from ./opengraph-image.tsx.
    defaultShareImage: false,
  });
}

export default async function AnalyzerPage({ params }: PageProps) {
  const { slug } = await params;
  const analyzer = getAnalyzer(slug);
  const page = getAnalyzerPageBySlug(slug);
  if (!analyzer || !page) notFound();

  const path = analyzerPath(page.slug);
  const appId = `${SITE_URL}/#${page.slug}-app`;
  const faqs = page.faqs.map((f) => ({ q: f.question, a: f.answer }));

  const jsonLd = serializeJsonLd([
    {
      '@type': 'WebApplication',
      '@id': appId,
      name: `Finlyzers ${page.title}`,
      url: absoluteUrl(path),
      description: page.metaDescription,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any (web browser)',
      publisher: { '@id': ORGANIZATION_ID },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: `Free for statements up to ${FREE_PAGE_LIMIT} pages`,
      },
      featureList: page.highlights.map((h) => `${h.title}: ${h.body}`),
    },
    {
      ...getWebPageJsonLd({ path, name: page.title, description: page.metaDescription, dateModified: page.dateModified || undefined }),
      about: { '@id': appId },
    },
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: page.shortTitle, path },
    ]),
    ...(faqs.length > 0 ? [getFaqJsonLd(faqs)] : []),
  ]);

  const titleWords = page.title.split(' ');
  const titleLead = titleWords.slice(0, -1).join(' ');
  const titleAccent = titleWords[titleWords.length - 1];

  const facts = [
    { icon: UploadCloud, label: 'PDF, scans, CSV & Excel' },
    { icon: FileSpreadsheet, label: `Free up to ${FREE_PAGE_LIMIT} pages` },
    { icon: ShieldCheck, label: `Guest uploads deleted after ${GUEST_RETENTION_HOURS} hours` },
  ];

  return (
    <div className="w-full -mb-6 sm:-mb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <BreadcrumbStrip items={[{ label: 'Home', href: '/' }, { label: page.shortTitle }]} />

      <section
        id="upload"
        aria-labelledby="hero-title"
        className="w-full scroll-mt-24 pb-10 sm:pb-16 bg-[var(--color-surface-subtle)] shadow-[0_0_0_100vmax_var(--color-surface-subtle)] [clip-path:inset(0_-100vmax)]"
      >
        <div className="pt-6 sm:pt-12 lg:pt-16 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-soft)] border border-[var(--color-info-border)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-brand-dark)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
            {page.badgeText} · Free up to {FREE_PAGE_LIMIT} pages
          </p>
          <h1 id="hero-title" className="type-hero !text-[clamp(2rem,6.5vw,3.5rem)] max-w-4xl mx-auto text-balance">
            {titleLead} <span className="text-[var(--color-brand)]">{titleAccent}</span>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-[15px] sm:text-[17px] leading-relaxed text-[var(--color-text-secondary)]">
            {page.intro}
          </p>
          <div className="mt-7 sm:mt-10 max-w-3xl mx-auto text-left">
            <AnalyzerUploader analyzer={analyzer} />
          </div>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-[var(--color-text-secondary)]">
            {facts.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-[var(--color-text-muted)]" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {page.highlights.length > 0 && (
        <SectionBand tone="white">
          <section aria-labelledby="highlights-title" className="space-y-8 sm:space-y-10">
            <div className="text-center space-y-3">
              <h2 id="highlights-title" className="type-display">What your analysis shows</h2>
              <p className="type-lead max-w-2xl mx-auto">Six answers from one upload, in plain language.</p>
            </div>
            <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {page.highlights.map((h) => (
                <li key={h.title} className="space-y-2 border-t border-[var(--color-border)] pt-4">
                  <h3 className="type-headline">{h.title}</h3>
                  <p className="type-body">{h.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </SectionBand>
      )}

      {page.steps.length > 0 && (
        <SectionBand tone="parchment">
          <section aria-labelledby="steps-title" className="space-y-8 sm:space-y-10">
            <h2 id="steps-title" className="type-display text-center">How to analyze a bank statement</h2>
            <ol className="grid gap-8 md:grid-cols-3">
              {page.steps.map((s, i) => (
                <li key={s.title} className="space-y-2">
                  <span className="w-9 h-9 rounded-full bg-[var(--color-ink)] text-[var(--color-on-dark)] flex items-center justify-center text-[15px] font-semibold" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="type-headline">{s.title}</h3>
                  <p className="type-body">{s.body}</p>
                </li>
              ))}
            </ol>
            <div className="text-center">
              <a href="#upload" className="btn-brand-primary">
                Analyze your statement <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </section>
        </SectionBand>
      )}

      {page.contentHtml && (
        <SectionBand tone="white">
          <EditorialSection html={page.contentHtml} />
        </SectionBand>
      )}

      <SectionBand tone="parchment">
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
        <SectionBand tone="white">
          <FaqSection title={`${page.shortTitle} FAQ`} subtitle="Common questions about how the analysis works." faqs={faqs} />
        </SectionBand>
      )}

      <MobileStickyCta label="Analyze Free" note={`Free up to ${FREE_PAGE_LIMIT} pages · No signup`} />
    </div>
  );
}
