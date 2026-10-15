'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Search, X } from 'lucide-react';
import type { SEOConverterPage } from '@/types/seo';

export type DirectoryEntry = Pick<SEOConverterPage, 'slug' | 'title' | 'metaDescription' | 'badgeText' | 'category' | 'country' | 'bankName'>;

const CATEGORIES: { id: SEOConverterPage['category']; label: string; heading: string }[] = [
  { id: 'formats', label: 'By format', heading: 'Convert by Export Format' },
  { id: 'us-banks', label: 'US banks', heading: 'United States Banks' },
  { id: 'uk-banks', label: 'UK banks', heading: 'United Kingdom Banks' },
  { id: 'india-banks', label: 'Indian banks', heading: 'Indian Banks' },
  { id: 'tools', label: 'Cards & scans', heading: 'Credit Cards, Scans & Other Documents' },
];

function ConverterCard({ page }: { page: DirectoryEntry }) {
  return (
    <Link
      href={`/convert/${page.slug}`}
      className="card-surface group p-5 sm:p-6 hover:border-[var(--color-border-hover)] flex flex-col"
    >
      <span className="inline-flex w-fit rounded-full bg-[var(--color-brand-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-dark)]">{page.badgeText}</span>
      <div className="flex-1 mt-3">
        <h3 className="text-[17px] font-semibold leading-snug text-[var(--color-ink)]">{page.title}</h3>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">{page.metaDescription}</p>
      </div>
      <span className="mt-4 inline-flex items-center gap-0.5 text-sm text-[var(--color-brand-dark)] group-hover:underline underline-offset-[3px]">
        Open converter
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
      </span>
    </Link>
  );
}

/**
 * Searchable, filterable converter list. Every card is server-rendered on first
 * load (no filter applied), so crawlers still see the full directory.
 */
export default function ConverterDirectory({ pages }: { pages: DirectoryEntry[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SEOConverterPage['category'] | 'all'>('all');

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery !== '' || category !== 'all';

  const results = useMemo(
    () =>
      pages.filter((p) => {
        if (category !== 'all' && p.category !== category) return false;
        if (!normalizedQuery) return true;
        return [p.title, p.bankName, p.country, p.badgeText, p.metaDescription].join(' ').toLowerCase().includes(normalizedQuery);
      }),
    [pages, category, normalizedQuery]
  );

  const chipClass = (active: boolean) =>
    `shrink-0 min-h-[44px] sm:min-h-9 px-4 rounded-full text-sm font-medium transition-colors ${
      active
        ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)]'
        : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] hover:border-[var(--color-border-hover)]'
    }`;

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Search & filters */}
      <div className="max-w-3xl mx-auto w-full space-y-4">
        <label htmlFor="converter-search" className="sr-only">Search for your bank or format</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--color-text-muted)] pointer-events-none" aria-hidden="true" />
          <input
            id="converter-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your bank or format, e.g. Chase, CSV, HDFC"
            className="w-full h-12 sm:h-14 pl-11 pr-12 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[17px] text-[var(--color-ink)] placeholder:text-[var(--color-text-muted)] transition-[border-color,box-shadow] focus:outline-none focus:border-[var(--color-brand)] focus:shadow-[var(--focus-ring)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div role="group" aria-label="Filter converters" className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center [scrollbar-width:none]">
          <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')} className={chipClass(category === 'all')}>
            All ({pages.length})
          </button>
          {CATEGORIES.filter((c) => pages.some((p) => p.category === c.id)).map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={chipClass(category === c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {isFiltering ? (
        <section aria-live="polite" className="space-y-5">
          <p className="text-sm text-[var(--color-text-muted)]">
            {results.length} converter{results.length === 1 ? '' : 's'} found
          </p>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {results.map((page) => (
                <ConverterCard key={page.slug} page={page} />
              ))}
            </div>
          ) : (
            <div className="intro-panel text-center space-y-3">
              <h2 className="type-headline">No dedicated converter for “{query}” yet</h2>
              <p className="text-base text-[var(--color-text-secondary)]">
                The universal converter reads statements from almost any bank worldwide.
              </p>
              <Link href="/convert/bank-statement-to-excel" className="btn-brand-primary">
                <span>Use the Universal Converter</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>
      ) : (
        CATEGORIES.map((c) => {
          const group = pages.filter((p) => p.category === c.id);
          if (!group.length) return null;
          return (
            <section key={c.id} aria-labelledby={`cat-${c.id}`} className="space-y-6">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
                <h2 id={`cat-${c.id}`} className="type-title">
                  {c.heading}
                </h2>
                <span className="rounded-full bg-[var(--color-surface-subtle)] px-2.5 py-0.5 text-[13px] font-medium text-[var(--color-text-secondary)] tabular-nums shrink-0">{group.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {group.map((page) => (
                  <ConverterCard key={page.slug} page={page} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
