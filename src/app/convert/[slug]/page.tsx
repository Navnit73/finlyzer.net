import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getAllLandingPages,
  getLandingPageBySlug,
  getRelatedLandingPages,
} from '@/lib/seo-markdown';
import LandingPageProcessor from '@/components/seo/LandingPageProcessor';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  Lock,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  TrendingUp,
  TableProperties,
  XCircle,
  HelpCircle,
} from 'lucide-react';

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
      title: 'Converter Not Found | Finlyzer',
    };
  }

  const canonicalUrl = `https://finlyzer.net/convert/${page.slug}`;

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: canonicalUrl,
      siteName: 'Finlyzer',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.metaTitle,
      description: page.metaDescription,
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

  // JSON-LD Structured Data Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `https://finlyzer.net/convert/${page.slug}#app`,
        name: page.title,
        url: `https://finlyzer.net/convert/${page.slug}`,
        description: page.metaDescription,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All (Web Browser)',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: page.rating.toString(),
          reviewCount: page.reviewCount.toString(),
          bestRating: '5',
          worstRating: '1',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free for 1–10 pages per document',
        },
      },
      {
        '@type': 'HowTo',
        name: `How to convert ${page.bankName} statement to Excel`,
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Upload Statement',
            text: `Drag and drop your ${page.bankName} PDF bank statement into the Finlyzer converter.`,
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
            name: 'Export Structured Excel / CSV',
            text: 'Download clean Excel (XLSX) or CSV files ready for QuickBooks, Xero, or financial analysis.',
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
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://finlyzer.net',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Converters',
            item: 'https://finlyzer.net/convert',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: page.title,
            item: `https://finlyzer.net/convert/${page.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full bg-[var(--color-surface)] text-[var(--color-ink)] min-h-screen">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="site-container py-6 sm:py-10 space-y-12 sm:space-y-16">
        {/* Breadcrumb Header */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/convert" className="hover:text-[var(--color-ink)] transition-colors">
            Converters
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[var(--color-ink)] truncate font-bold">{page.bankName}</span>
        </nav>

        {/* 1. Hero Section with Live Embedded Converter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Value Prop & Badges */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="feature-badge">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-hover)]" />
                <span>{page.badgeText}</span>
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-ink)]">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span>{page.rating}</span>
                <span className="text-[var(--color-text-muted)] font-normal">
                  ({page.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--color-ink)] leading-[1.15]">
              {page.title}
            </h1>

            <p className="text-base text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
              {page.metaDescription} Extract structured ledger tables, dates, and balance reconciliation in seconds without manual entry.
            </p>

            {/* Feature Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-ink)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-hover)] shrink-0" />
                <span>100% Debit / Credit Separation</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-ink)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-hover)] shrink-0" />
                <span>Math Ledger Balance Check</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-ink)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-hover)] shrink-0" />
                <span>QuickBooks &amp; Xero Ready</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-ink)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-hover)] shrink-0" />
                <span>Encrypted &amp; Auto-Purged</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Embedded Processor Dropzone */}
          <div className="lg:col-span-6">
            <LandingPageProcessor pageData={page} />
          </div>
        </div>

        {/* 2. Before & After Visual Data Transformation Preview */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--color-ink)]">
              Before &amp; After: How Finlyzer Structures {page.bankName} Data
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              Messy PDF text and unaligned columns are converted into standardized, audit-ready spreadsheet rows.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Before: Raw PDF Table Preview */}
            <div className="p-5 rounded-xl bg-white border border-red-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-red-100">
                <div className="flex items-center gap-2 text-xs font-bold text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span>Unstructured Raw {page.bankName} PDF</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-zinc-400">Hard to Copy</span>
              </div>
              <div className="font-mono text-[11px] text-zinc-500 bg-zinc-50 p-3 rounded-lg leading-relaxed overflow-x-auto select-none opacity-85">
                <p>09/12/2026 DIRECT DEP TECH CORP 4850.00 12420.50</p>
                <p>09/14/2026 AMAZON.COM*RETAIL -124.50 12296.00</p>
                <p>09/15/2026 WIRE TRANSFER FEE -25.00 12271.00</p>
              </div>
              <p className="text-[11px] text-zinc-400 italic">
                * Merged columns, negative sign discrepancies, and unparsed merchant names.
              </p>
            </div>

            {/* After: Clean Structured Excel Preview */}
            <div className="p-5 rounded-xl bg-white border border-[var(--color-brand)] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-brand-soft)]">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-ink)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-hover)]" />
                  <span>Finlyzer Verified Excel / CSV Output</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]">
                  Audit Ready
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold text-zinc-600">
                      <th className="py-1.5 px-2">Date</th>
                      <th className="py-1.5 px-2">Description</th>
                      <th className="py-1.5 px-2">Amount</th>
                      <th className="py-1.5 px-2">Type</th>
                      <th className="py-1.5 px-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                    {page.sampleData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="py-1.5 px-2 font-medium">{row.date}</td>
                        <td className="py-1.5 px-2 text-zinc-700 font-sans">{row.desc}</td>
                        <td className={`py-1.5 px-2 font-bold ${row.type === 'Credit' ? 'text-emerald-600' : 'text-zinc-800'}`}>
                          {row.amount}
                        </td>
                        <td className="py-1.5 px-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${row.type === 'Credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-700'}`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-zinc-600">{row.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Bank-Specific Features Grid */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)]">
              Tailored Specifically for {page.bankName} Formats
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              Engineered to understand complex table geometries, multi-account hierarchies, and nested summaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {page.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs hover:border-[var(--color-brand)] transition-all space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] border border-[var(--color-brand)]/40 flex items-center justify-center text-[var(--color-brand-hover)]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[var(--color-ink)]">{feat.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 3-Step Visual How It Works */}
        <section className="p-8 sm:p-10 rounded-3xl bg-[var(--color-ink)] text-white space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--color-brand)]">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              How to Convert {page.bankName} PDF to Excel
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] font-black flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-extrabold text-base text-white">Upload Your PDF Statement</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Drag and drop your {page.bankName} bank statement or scanned document into the dropzone.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] font-black flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-extrabold text-base text-white">AI Extracts &amp; Reconciles</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Our vision model detects transaction headers, dates, debit/credit fields, and performs balance checks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] font-black flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-extrabold text-base text-white">Download Structured Excel</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Download your clean XLSX spreadsheet or CSV, perfectly formatted for your accounting software.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Comparison Matrix */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)]">
              Why Finlyzer Outperforms Manual Typing &amp; Basic Tools
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-ink)] font-bold text-xs">
                  <th className="py-3.5 px-4">Feature / Capability</th>
                  <th className="py-3.5 px-4 bg-[var(--color-brand-soft)]/50 text-[var(--color-ink)] font-black">
                    Finlyzer AI Hub
                  </th>
                  <th className="py-3.5 px-4 text-zinc-500">Manual Data Entry</th>
                  <th className="py-3.5 px-4 text-zinc-500">Generic PDF Converters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                <tr>
                  <td className="py-3 px-4 font-bold">Speed per 10-Page Statement</td>
                  <td className="py-3 px-4 font-extrabold text-[var(--color-brand-hover)] bg-[var(--color-brand-soft)]/30">
                    &lt; 5 Seconds
                  </td>
                  <td className="py-3 px-4 text-zinc-500">45–60 Minutes</td>
                  <td className="py-3 px-4 text-zinc-500">2–3 Minutes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">Mathematical Balance Verification</td>
                  <td className="py-3 px-4 font-extrabold text-[var(--color-brand-hover)] bg-[var(--color-brand-soft)]/30">
                    Automated 100%
                  </td>
                  <td className="py-3 px-4 text-zinc-500">Human prone to errors</td>
                  <td className="py-3 px-4 text-zinc-500">None (Merged Text)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">Password-Protected Statement Support</td>
                  <td className="py-3 px-4 font-extrabold text-[var(--color-brand-hover)] bg-[var(--color-brand-soft)]/30">
                    Native Browser Decryption
                  </td>
                  <td className="py-3 px-4 text-zinc-500">Manual Unlock</td>
                  <td className="py-3 px-4 text-zinc-500">Fails / Unsupported</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold">Scanned &amp; Skewed Photo OCR</td>
                  <td className="py-3 px-4 font-extrabold text-[var(--color-brand-hover)] bg-[var(--color-brand-soft)]/30">
                    DeepSeek AI Vision
                  </td>
                  <td className="py-3 px-4 text-zinc-500">Manual Reading</td>
                  <td className="py-3 px-4 text-zinc-500">Broken / Missing Rows</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Interactive FAQ Accordion */}
        <section className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              Everything you need to know about converting {page.bankName} statements.
            </p>
          </div>

          <div className="space-y-3">
            {page.faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] [&_summary::-webkit-details-marker]:hidden cursor-pointer"
              >
                <summary className="flex items-center justify-between font-bold text-sm text-[var(--color-ink)]">
                  <span>{faq.question}</span>
                  <span className="transition group-open:rotate-180 text-[var(--color-text-muted)]">
                    &darr;
                  </span>
                </summary>
                <p className="mt-3 text-xs text-[var(--color-text-secondary)] leading-relaxed pt-2 border-t border-[var(--color-border)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 7. Deep Internal Linking & Related Converters */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--color-ink)]">
            Explore Other Popular Financial Statement Converters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedPages.map((rel) => (
              <Link
                key={rel.slug}
                href={`/convert/${rel.slug}`}
                className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-all group flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-xs text-[var(--color-ink)] group-hover:text-[var(--color-brand-hover)] truncate transition-colors">
                    {rel.title}
                  </p>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase">
                    {rel.country} &bull; {rel.badgeText}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-hover)] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
