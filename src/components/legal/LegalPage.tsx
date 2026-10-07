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
    <article className="max-w-6xl mx-auto w-full pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: graph }} />

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] mb-6">
        <Link href="/" className="hover:text-[var(--color-ink)]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
        <span className="font-bold text-[var(--color-ink)]">{title}</span>
      </nav>

      <header className="intro-panel space-y-3 mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] tracking-tight">{title}</h1>
        <div className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">{intro}</div>
        <p className="text-xs text-[var(--color-text-muted)]">
          Last updated: <time dateTime={POLICIES_LAST_UPDATED}>{updatedLabel}</time>
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-10">
        {/* Table of contents */}
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)] mb-2">On this page</p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] py-1 leading-snug"
              >
                {s.heading}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 space-y-3">
              <h2 className="text-xl font-black text-[var(--color-ink)] tracking-tight">{s.heading}</h2>
              <div className="legal-prose">{s.body}</div>
            </section>
          ))}

          <footer className="pt-8 border-t border-[var(--color-border)] space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Related</p>
            <div className="flex flex-wrap gap-2">
              {related.map((p) => (
                <Link
                  key={p.path}
                  href={p.path}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-ink)] hover:border-[var(--color-border-hover)]"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </footer>
        </div>
      </div>
    </article>
  );
}
