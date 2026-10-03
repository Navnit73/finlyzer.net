import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllLandingPages } from '@/lib/seo-markdown';
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Globe2,
  FileSpreadsheet,
  Layers,
  Search,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Financial PDF & Bank Statement Converters Directory | Finlyzer',
  description:
    'Browse our comprehensive catalog of bank statement converters. Convert Chase, Bank of America, Barclays, Wells Fargo, and HDFC PDF statements to Excel and CSV.',
  alternates: {
    canonical: 'https://finlyzers.com/convert',
  },
  openGraph: {
    title: 'Financial PDF & Bank Statement Converters Directory | Finlyzer',
    description:
      'Browse our comprehensive catalog of bank statement converters. Convert Chase, Bank of America, Barclays, Wells Fargo, and HDFC PDF statements to Excel and CSV.',
    url: 'https://finlyzers.com/convert',
    siteName: 'Finlyzer',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og_image.webp',
        width: 1200,
        height: 630,
        alt: 'Finlyzer Bank Converters Directory',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Financial PDF & Bank Statement Converters Directory | Finlyzer',
    description:
      'Browse our comprehensive catalog of bank statement converters. Convert Chase, Bank of America, Barclays, Wells Fargo, and HDFC PDF statements to Excel and CSV.',
    images: ['/og_image.webp'],
  },
};

export default function ConvertersDirectoryPage() {
  const pages = getAllLandingPages();

  const usBanks = pages.filter((p) => p.category === 'us-banks');
  const ukBanks = pages.filter((p) => p.category === 'uk-banks');
  const indiaBanks = pages.filter((p) => p.category === 'india-banks');
  const tools = pages.filter((p) => p.category === 'tools');

  return (
    <div className="w-full bg-[var(--color-surface)] text-[var(--color-ink)] min-h-screen py-8 sm:py-12">
      <div className="site-container space-y-12 sm:space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="feature-badge">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-hover)]" />
            <span>Financial Document Converters Directory</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--color-ink)]">
            Convert Any Bank Statement into Excel &amp; CSV
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
            Choose your financial institution or document type below to use our dedicated AI-powered parser with 100% mathematical balance verification.
          </p>
        </div>

        {/* Categories Section */}
        <div className="space-y-12">
          {/* US Banks */}
          {usBanks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--color-border)]">
                <Building2 className="w-5 h-5 text-[var(--color-brand-hover)]" />
                <h2 className="text-xl font-black text-[var(--color-ink)]">
                  United States Bank Converters
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
                  {usBanks.length} Converters
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {usBanks.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/convert/${page.slug}`}
                    className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-all group shadow-xs hover:shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]">
                        {page.badgeText}
                      </span>
                      <span className="text-xs font-bold text-amber-500">★ {page.rating}</span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[var(--color-ink)] group-hover:text-[var(--color-brand-hover)] transition-colors">
                        {page.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-1">
                        {page.metaDescription}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-xs font-bold text-[var(--color-ink)] group-hover:text-[var(--color-brand-hover)]">
                      <span>Launch Converter</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* UK Banks */}
          {ukBanks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--color-border)]">
                <Globe2 className="w-5 h-5 text-[var(--color-brand-hover)]" />
                <h2 className="text-xl font-black text-[var(--color-ink)]">
                  United Kingdom Bank Converters
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
                  {ukBanks.length} Converters
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ukBanks.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/convert/${page.slug}`}
                    className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-all group shadow-xs hover:shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]">
                        {page.badgeText}
                      </span>
                      <span className="text-xs font-bold text-amber-500">★ {page.rating}</span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[var(--color-ink)] group-hover:text-[var(--color-brand-hover)] transition-colors">
                        {page.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-1">
                        {page.metaDescription}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-xs font-bold text-[var(--color-ink)] group-hover:text-[var(--color-brand-hover)]">
                      <span>Launch Converter</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Indian Banks */}
          {indiaBanks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--color-border)]">
                <Building2 className="w-5 h-5 text-[var(--color-brand-hover)]" />
                <h2 className="text-xl font-black text-[var(--color-ink)]">
                  Indian Bank Statement Converters
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
                  {indiaBanks.length} Converters
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {indiaBanks.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/convert/${page.slug}`}
                    className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-all group shadow-xs hover:shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]">
                        {page.badgeText}
                      </span>
                      <span className="text-xs font-bold text-amber-500">★ {page.rating}</span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[var(--color-ink)] group-hover:text-[var(--color-brand-hover)] transition-colors">
                        {page.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-1">
                        {page.metaDescription}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-xs font-bold text-[var(--color-ink)] group-hover:text-[var(--color-brand-hover)]">
                      <span>Launch Converter</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Universal & Specialist Tools */}
          {tools.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--color-border)]">
                <FileSpreadsheet className="w-5 h-5 text-[var(--color-brand-hover)]" />
                <h2 className="text-xl font-black text-[var(--color-ink)]">
                  Universal Financial OCR &amp; Table Extraction Tools
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
                  {tools.length} Tools
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/convert/${page.slug}`}
                    className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-all group shadow-xs hover:shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]">
                        {page.badgeText}
                      </span>
                      <span className="text-xs font-bold text-amber-500">★ {page.rating}</span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[var(--color-ink)] group-hover:text-[var(--color-brand-hover)] transition-colors">
                        {page.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-1">
                        {page.metaDescription}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-xs font-bold text-[var(--color-ink)] group-hover:text-[var(--color-brand-hover)]">
                      <span>Launch Tool</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
