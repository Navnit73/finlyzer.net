import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Calendar, Clock, User, ArrowRight, CheckCircle2, ListOrdered, BookOpen } from 'lucide-react';
import { getAllRatgeberPages, getAllRatgeberSlugs, getRatgeberPageBySlug } from '@/lib/ratgeber-markdown';
import { MiniConvertFlow } from '@/components/de/einvoice/Illustrations';
import {
  GERMAN_PUBLISHER,
  GERMAN_WEBSITE_ID,
  absoluteUrl,
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getWebPageJsonLd,
  pageMetadata,
  serializeJsonLd,
} from '@/lib/seo-config';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllRatgeberSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getRatgeberPageBySlug(slug);

  if (!page) {
    return { title: 'Ratgeber nicht gefunden', robots: { index: false } };
  }

  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/de/ratgeber/${page.slug}`,
    locale: 'de',
  });
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default async function RatgeberSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getRatgeberPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const path = `/de/ratgeber/${page.slug}`;
  const allArticles = getAllRatgeberPages();
  const otherArticles = allArticles.filter((a) => a.slug !== page.slug).slice(0, 3);

  // Schema.org Graph: WebPage + Article + BreadcrumbList + (optional) FAQPage
  const faqs = page.faqs.map((f) => ({ q: f.question, a: f.answer }));
  const jsonLd = serializeJsonLd([
    {
      ...getWebPageJsonLd({
        path,
        name: page.title,
        description: page.metaDescription,
        dateModified: page.dateModified,
        locale: 'de',
      }),
      about: { '@id': GERMAN_WEBSITE_ID },
    },
    {
      '@type': 'Article',
      '@id': `${absoluteUrl(path)}#article`,
      headline: page.title,
      description: page.metaDescription,
      mainEntityOfPage: { '@id': `${absoluteUrl(path)}#webpage` },
      datePublished: page.datePublished,
      dateModified: page.dateModified,
      author: GERMAN_PUBLISHER,
      publisher: GERMAN_PUBLISHER,
      inLanguage: 'de-DE',
    },
    getBreadcrumbJsonLd([
      { name: 'Startseite', path: '/de' },
      { name: 'Ratgeber', path: '/de/ratgeber' },
      { name: page.shortTitle, path },
    ]),
    ...(faqs.length > 0 ? [getFaqJsonLd(faqs)] : []),
  ]);

  return (
    <article className="w-full max-w-6xl mx-auto pb-16 sm:pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* Breadcrumbs */}
      <nav aria-label="Brotkrumennavigation" className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)] min-w-0 mb-6">
        <Link href="/de" className="hover:text-[var(--color-ink)] transition-colors shrink-0">
          Startseite
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" aria-hidden="true" />
        <Link href="/de/ratgeber" className="hover:text-[var(--color-ink)] transition-colors shrink-0">
          Ratgeber
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" aria-hidden="true" />
        <span className="text-[var(--color-text-secondary)] truncate" aria-current="page">
          {page.shortTitle}
        </span>
      </nav>

      {/* Article Header, with the converter CTA as a sidebar card on wide screens */}
      <header className="grid lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] gap-8 lg:gap-10 items-start border-b border-[var(--color-border)] pb-8">
        <div className="space-y-4 min-w-0">
          <span className="feature-badge">{page.badgeText}</span>
          <h1 className="type-hero !text-[clamp(1.875rem,3.8vw,3rem)] font-semibold text-[var(--color-ink)] text-balance">
            {page.title}
          </h1>
          <p className="type-lead !text-[17px] sm:!text-[19px] leading-relaxed text-[var(--color-text-secondary)]">
            {page.intro}
          </p>

          {/* Metadata bar */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-[13px] text-[var(--color-text-muted)] pt-3">
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{page.author}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Aktualisiert am <time dateTime={page.dateModified}>{formatDate(page.dateModified)}</time></span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{page.readingTime}</span>
            </span>
          </div>
        </div>

        {/* Sidebar CTA card: ZUGFeRD illustration + jump straight to the converter */}
        <div className="lg:sticky lg:top-24">
          <div className="relative card-surface overflow-hidden text-center border-[var(--color-success-border)]">
            <div className="h-1 bg-[var(--color-success)]" aria-hidden="true" />
            <div className="p-5 sm:p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success-soft)] border border-[var(--color-success-border)] px-2.5 py-1 text-[12px] font-medium text-[var(--color-success)]">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                In 60 Sekunden fertig
              </span>

              <div className="mt-5 mb-1">
                <MiniConvertFlow />
              </div>

              <h2 className="type-headline !text-[19px] font-semibold text-[var(--color-ink)] mt-2 text-balance">
                ZUGFeRD-Rechnung jetzt erstellen
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                Laden Sie Ihr Rechnungs-PDF hoch – Sie erhalten eine fertige ZUGFeRD-Datei mit eingebetteter XML.
              </p>

              <ul className="mt-4 space-y-1.5 text-left">
                {['PDF/A-3 mit eingebetteter XML', 'Nach EN 16931 geprüft', 'Kostenlos & ohne Registrierung'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href={page.mainCta.href}
                className="btn-brand-primary w-full justify-center mt-5 !min-h-[50px] !text-[16px]"
              >
                <span>Jetzt kostenlos erstellen</span>
                <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Table of Contents (Inhaltsverzeichnis) */}
        {page.toc && page.toc.length > 0 && (
          <section aria-labelledby="toc-heading" className="my-8 sm:my-10 p-5 sm:p-6 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-3">
              <ListOrdered className="w-4 h-4 text-[var(--color-brand-dark)]" aria-hidden="true" />
              <h2 id="toc-heading" className="text-[15px] font-semibold text-[var(--color-ink)] uppercase tracking-wide">
                Inhaltsverzeichnis
              </h2>
            </div>
            <nav>
              <ul className="space-y-1.5 text-[14px]">
                {page.toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? 'pl-4 text-[13px]' : 'font-medium'}>
                    <a
                      href={`#${item.id}`}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-dark)] hover:underline underline-offset-[3px] transition-colors inline-block py-0.5"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </section>
        )}

        {/* Main Editorial Content */}
        <div
          className="type-body sm:text-[18px] sm:leading-[1.6] space-y-6 pt-2"
          dangerouslySetInnerHTML={{ __html: page.contentHtml }}
        />

        {/* Highlighted Main CTA Box */}
        <section
          id="cta-zugferd"
          aria-labelledby="cta-heading"
          className="my-14 sm:my-18 text-center rounded-2xl bg-[var(--color-brand-soft)] border border-[var(--color-info-border)] px-6 py-10 sm:px-12 sm:py-14"
        >
          <span className="feature-badge mb-3 inline-block">Online Konverter</span>
          <h2 id="cta-heading" className="type-title !text-[24px] sm:!text-[32px] max-w-2xl mx-auto font-semibold text-[var(--color-ink)]">
            {page.mainCta.title || page.mainCta.label}
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-[15px] sm:text-[17px] leading-relaxed text-[var(--color-text-secondary)]">
            {page.mainCta.description}
          </p>
          <div className="mt-8 flex justify-center">
            <Link href={page.mainCta.href} className="btn-brand-primary !min-h-[50px] !px-8 !text-[16px]">
              <span>{page.mainCta.label}</span>
              <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-[var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" aria-hidden="true" />
              PDF/A-3 mit Factur-X XML
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" aria-hidden="true" />
              Nach EN 16931 validiert
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" aria-hidden="true" />
              Kostenlos &amp; ohne Registrierung
            </span>
          </div>
        </section>

        {/* More Ratgeber Guides */}
        {otherArticles.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="type-headline font-semibold text-[var(--color-ink)] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--color-brand-dark)]" aria-hidden="true" />
                Weitere Ratgeber
              </h2>
              <Link href="/de/ratgeber" className="text-[14px] text-[var(--color-brand-dark)] hover:underline inline-flex items-center gap-1 font-medium">
                Alle Artikel ansehen <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherArticles.map((item) => (
                <Link
                  key={item.slug}
                  href={`/de/ratgeber/${item.slug}`}
                  className="group block p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors"
                >
                  <span className="text-[12px] text-[var(--color-brand-dark)] font-medium">{item.badgeText}</span>
                  <h3 className="text-[16px] font-semibold text-[var(--color-ink)] mt-2 group-hover:text-[var(--color-brand-dark)] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-[var(--color-text-secondary)] mt-2 line-clamp-2">
                    {item.intro}
                  </p>
                  <div className="mt-4 text-[12px] text-[var(--color-text-muted)] flex items-center justify-between">
                    <span>{item.readingTime}</span>
                    <span className="text-[var(--color-brand-dark)] font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Lesen &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
