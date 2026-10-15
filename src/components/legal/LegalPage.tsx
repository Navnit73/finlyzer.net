import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getBreadcrumbJsonLd, getWebPageJsonLd, serializeJsonLd } from '@/lib/seo-config';
import { TRUST_PAGES, POLICIES_LAST_UPDATED } from '@/lib/trust-pages';

export interface LegalSection {
  id: string;
  heading: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  path: string;
  title: string;
  /** Meta description, reused for the WebPage JSON-LD node. */
  description: string;
  intro: React.ReactNode;
  sections: LegalSection[];
  /** Extra JSON-LD nodes (e.g. FAQPage) merged into the page graph. */
  jsonLd?: Record<string, unknown>[];
}

const updatedLabel = new Date(`${POLICIES_LAST_UPDATED}T00:00:00Z`).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

/** Shared layout for trust & legal pages: breadcrumb, title, table of contents, sections, related links. */
export default function LegalPage({ path, title, description, intro, sections, jsonLd = [] }: LegalPageProps) {
  const graph = serializeJsonLd([
    getWebPageJsonLd({ path, name: title, description, dateModified: POLICIES_LAST_UPDATED }),
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: title, path },
    ]),
    ...jsonLd,
  ]);

  const related = TRUST_PAGES.filter((p) => p.path !== path);

  return (
    <article className="max-w-6xl mx-auto w-full pb-16 sm:pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: graph }} />

      <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,720px)] lg:justify-center gap-x-16">
        <div className="lg:col-start-2 min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)] mb-8 sm:mb-10">
            <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-[var(--color-text-secondary)]">{title}</span>
          </nav>

          <header className="space-y-4 pb-10 sm:pb-12 mb-10 sm:mb-12 border-b border-[var(--color-border)]">
            <h1 className="type-display text-balance">{title}</h1>
            <div className="type-lead [&_strong]:font-semibold [&_strong]:text-[var(--color-ink)] [&_a]:text-[var(--color-brand-dark)]">{intro}</div>
            <p className="type-caption">
              Last updated: <time dateTime={POLICIES_LAST_UPDATED}>{updatedLabel}</time>
            </p>
          </header>
        </div>

        {/* Table of contents */}
        <aside className="hidden lg:block lg:col-start-1 lg:row-start-2">
          <nav aria-label="On this page" className="sticky top-24 border-l border-[var(--color-border)]">
            <p className="pl-4 mb-2 text-[13px] font-semibold text-[var(--color-ink)]">On this page</p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block -ml-px pl-4 py-1.5 border-l border-transparent text-[13px] leading-snug text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors"
              >
                {s.heading}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-12 sm:space-y-14 lg:col-start-2 lg:row-start-2">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl sm:text-[28px] leading-tight font-semibold text-[var(--color-ink)] tracking-tight">{s.heading}</h2>
              <div className="legal-prose text-[17px] leading-[1.6]">{s.body}</div>
            </section>
          ))}

          <footer className="pt-10 border-t border-[var(--color-border)] space-y-4">
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)]">Related</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {related.map((p) => (
                <li key={p.path} className="border-b border-[var(--color-border-subtle)]">
                  <Link href={p.path} className="link flex items-center justify-between gap-2 min-h-[44px] py-2 text-[15px]">
                    <span>{p.title}</span>
                    <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </footer>
        </div>
      </div>
    </article>
  );
}
