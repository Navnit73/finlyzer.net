import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { getAllRatgeberPages } from '@/lib/ratgeber-markdown';
import {
  GERMAN_WEBSITE_ID,
  absoluteUrl,
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
  pageMetadata,
  serializeJsonLd,
} from '@/lib/seo-config';

const path = '/de/ratgeber';
const title = 'Ratgeber & Leitfäden für E-Rechnung, Steuern & Finanzen | Finlyzers';
const description =
  'Praxisnahe Ratgeber, Anleitungen und Fachwissen rund um E-Rechnung, ZUGFeRD, XRechnung und Buchhaltung für Selbstständige und kleine Unternehmen.';

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path,
  locale: 'de',
});

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default function RatgeberOverviewPage() {
  const articles = getAllRatgeberPages();

  const jsonLd = serializeJsonLd([
    {
      ...getWebPageJsonLd({
        path,
        name: title,
        description,
        locale: 'de',
      }),
      about: { '@id': GERMAN_WEBSITE_ID },
    },
    getBreadcrumbJsonLd([
      { name: 'Startseite', path: '/de' },
      { name: 'Ratgeber', path: '/de/ratgeber' },
    ]),
  ]);

  return (
    <div className="w-full max-w-5xl mx-auto pb-16 sm:pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* Header */}
      <header className="max-w-3xl mb-12 sm:mb-16">
        <span className="feature-badge">Wissen &amp; Leitfäden</span>
        <h1 className="type-hero !text-[clamp(2rem,4vw,3.25rem)] font-semibold text-[var(--color-ink)] mt-4 text-balance">
          Ratgeber für E-Rechnung &amp; Buchhaltung
        </h1>
        <p className="type-lead !text-[17px] sm:!text-[19px] mt-4 leading-relaxed text-[var(--color-text-secondary)]">
          Verständliche Erklärungen, gesetzliche Übergangsfristen und praxisnahe Anleitungen für Selbstständige,
          Freiberufler und kleine Unternehmen im digitalen Geschäftsverkehr.
        </p>
      </header>

      {/* Article Grid */}
      <section aria-label="Verfügbare Ratgeber" className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/de/ratgeber/${article.slug}`}
              className="group flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-all hover:bg-[var(--color-surface-subtle)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="feature-badge">{article.badgeText}</span>
                  <span className="text-[12px] text-[var(--color-text-muted)] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {article.readingTime}
                  </span>
                </div>
                <h2 className="type-headline text-[20px] sm:text-[22px] font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-brand-dark)] transition-colors leading-snug">
                  {article.title}
                </h2>
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-[var(--color-text-secondary)] mt-3 line-clamp-3">
                  {article.intro}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-[13px]">
                <span className="text-[var(--color-text-muted)] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  {formatDate(article.dateModified)}
                </span>
                <span className="text-[var(--color-brand-dark)] font-semibold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Ratgeber lesen <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Direct link to E-Invoice Tool */}
      <section className="mt-16 p-8 sm:p-10 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-[var(--color-brand-dark)] font-medium text-[14px]">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Praxistool zur E-Rechnung</span>
          </div>
          <h2 className="text-[20px] sm:text-[24px] font-semibold text-[var(--color-ink)]">
            PDF-Rechnung direkt in ZUGFeRD oder XRechnung umwandeln
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
            Nutzen Sie unseren kostenlosen Browser-Konverter. Keine Software-Installation, keine Registrierung nötig – nach EN 16931 geprüft.
          </p>
        </div>
        <Link href="/de/konverter/e-rechnung" className="btn-brand-primary shrink-0 !min-h-[46px] !px-6">
          <span>Zum E-Rechnung Konverter</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
