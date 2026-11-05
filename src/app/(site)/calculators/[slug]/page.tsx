import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowDown, ArrowRight, CheckCircle2, ExternalLink, FileSpreadsheet, ShieldCheck, UploadCloud } from 'lucide-react';
import BreadcrumbStrip from '@/components/layout/BreadcrumbStrip';
import CalculatorLoader from '@/components/calculators/CalculatorLoader';
import { CALCULATOR_SLUGS } from '@/components/calculators/registry';
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
import type { SEOCalculatorLink, SEOCalculatorPage } from '@/types/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const ctaFacts = [
  { icon: UploadCloud, label: 'PDF, scans, CSV & Excel' },
  { icon: FileSpreadsheet, label: `Free up to ${FREE_PAGE_LIMIT} pages` },
  { icon: ShieldCheck, label: `Guest uploads deleted after ${GUEST_RETENTION_HOURS} hours` },
];

/** Live calculator pages: content and a registered tool. */
function livePages(): SEOCalculatorPage[] {
  return getAllCalculatorPages().filter((page) => CALCULATOR_SLUGS.has(page.slug));
}

/** Hand-picked related calculators first, then other live calculators in the same group, then extra links. */
function relatedFor(page: SEOCalculatorPage, limit = 6): SEOCalculatorLink[] {
  const others = livePages().filter((p) => p.slug !== page.slug);
  const picked = page.related.map((slug) => others.find((p) => p.slug === slug)).filter((p): p is SEOCalculatorPage => Boolean(p));
  const sameGroup = others.filter((p) => !picked.includes(p) && p.group === page.group);
  const calculators = [...picked, ...sameGroup].map((p) => ({ href: `/calculators/${p.slug}`, label: p.shortTitle, body: p.summary }));
  return [...calculators, ...page.relatedLinks].slice(0, limit);
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

// Only calculators that have both content and a registered tool; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return livePages().map((page) => ({ slug: page.slug }));
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
  if (!page || !CALCULATOR_SLUGS.has(slug)) notFound();

  const path = `/calculators/${page.slug}`;
  const appId = `${SITE_URL}/#${page.slug}`;
  const faqs = page.faqs.map((f) => ({ q: f.question, a: f.answer }));
  const related = relatedFor(page);

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
      { name: 'Calculators', path: '/calculators' },
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
      <BreadcrumbStrip items={[{ label: 'Home', href: '/' }, { label: 'Calculators', href: '/calculators' }, { label: page.shortTitle }]} />

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
            {titleTail && <span className="block mt-2 !text-[clamp(1.375rem,3.6vw,2.25rem)] leading-tight">{titleTail}</span>}
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-[15px] sm:text-[17px] leading-relaxed text-[var(--color-text-secondary)]">{page.intro}</p>
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
              {page.ctaLabel} <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </a>
            {page.secondaryHref && page.secondaryLabel && (
              <Link href={page.secondaryHref} className="btn-brand-secondary">
                {page.secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="pt-10 sm:pt-16 pb-[var(--section-y)]">
        <CalculatorLoader slug={page.slug} />
      </div>

      {page.contentHtml && (
        <SectionBand tone="parchment">
          <EditorialSection html={page.contentHtml} />
          <p className="max-w-3xl mx-auto mt-10 pt-6 border-t border-[var(--color-border)] type-caption">
            {page.dateModified && (
              <>
                Updated <time dateTime={page.dateModified}>{formatDate(page.dateModified)}</time>.{' '}
              </>
            )}
            <Link href="/editorial-policy#calculators" className="link">
              How we check our tools and content
            </Link>
            .
          </p>
          {(page.sources.length > 0 || page.lastVerified) && (
            <aside aria-labelledby="sources-title" className="max-w-3xl mx-auto mt-6 space-y-3">
              <h2 id="sources-title" className="type-headline">
                Sources
              </h2>
              {page.lastVerified && <p className="type-caption">Rates and rules last checked against these sources on {page.lastVerified}.</p>}
              <ul className="space-y-2 text-[15px]">
                {page.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
                      {s.label}
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </SectionBand>
      )}

      {related.length > 0 && (
        <SectionBand tone="white">
          <section aria-labelledby="related-title" className="space-y-6">
            <h2 id="related-title" className="type-title text-center">
              Related tools
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
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
            <p className="text-center">
              <Link href="/calculators" className="link text-[15px]">
                All finance calculators
              </Link>
            </p>
          </section>
        </SectionBand>
      )}

      {faqs.length > 0 && (
        <SectionBand tone="parchment">
          <FaqSection title={`${page.shortTitle} FAQ`} subtitle={page.faqSubtitle} faqs={faqs} />
        </SectionBand>
      )}

      {page.finalCtaHref && (
        <SectionBand tone="white">
          <FinalCtaSection title={page.finalCtaTitle} subtitle={page.finalCtaBody} href={page.finalCtaHref} ctaLabel={page.finalCtaLabel} facts={ctaFacts} />
        </SectionBand>
      )}
    </div>
  );
}
