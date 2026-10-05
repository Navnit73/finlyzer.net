import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllLandingPages } from "@/lib/seo-markdown";
import {
  SITE_URL,
  SITE_NAME,
  getLanguageAlternates,
  getBreadcrumbJsonLd,
} from "@/lib/seo-config";
import { ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import ConverterDirectory, {
  type DirectoryEntry,
} from "@/components/converter/ConverterDirectory";
import { FinalCtaSection } from "@/components/converter/sections";

export const metadata: Metadata = {
  title: {
    absolute: "All Bank Statement Converters: Excel, CSV & QBO | Finlyzers",
  },
  description:
    "Browse our comprehensive catalog of bank statement converters. Convert Chase, Bank of America, Barclays, Wells Fargo, HDFC, SBI, and credit cards to Excel, CSV, and QuickBooks.",
  alternates: getLanguageAlternates("/convert"),
  openGraph: {
    title: "All Bank Statement Converters: Excel, CSV & QBO | Finlyzers",
    description:
      "Browse our comprehensive catalog of bank statement converters. Convert Chase, Bank of America, Barclays, Wells Fargo, and HDFC PDF statements to Excel and CSV.",
    url: `${SITE_URL}/convert`,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_GB", "en_IN", "en_CA", "en_AU"],
    images: [
      {
        url: "/og_image.webp",
        width: 1200,
        height: 630,
        alt: "Finlyzers Bank Converters Directory",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Bank Statement Converters: Excel, CSV & QBO | Finlyzers",
    description:
      "Browse our comprehensive catalog of bank statement converters. Convert Chase, Bank of America, Barclays, Wells Fargo, and HDFC PDF statements to Excel and CSV.",
    images: ["/og_image.webp"],
  },
};

export default function ConvertersDirectoryPage() {
  const pages = getAllLandingPages();

  // Only the fields the client-side directory needs (keeps the RSC payload small).
  const entries: DirectoryEntry[] = pages.map(
    ({
      slug,
      title,
      metaDescription,
      badgeText,
      category,
      country,
      bankName,
    }) => ({
      slug,
      title,
      metaDescription,
      badgeText,
      category,
      country,
      bankName,
    }),
  );

  // Directory Structured Data Schema (CollectionPage + ItemList + BreadcrumbList)
  const directoryJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      getBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Converters", path: "/convert" },
      ]),
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/convert#collection`,
        name: "Financial Document & Bank Statement Converters Directory",
        description:
          "Comprehensive directory of bank statement parsers and financial OCR tools.",
        url: `${SITE_URL}/convert`,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: pages.length,
          itemListElement: pages.map((p, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: p.title,
            url: `${SITE_URL}/convert/${p.slug}`,
          })),
        },
      },
    ],
  };

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(directoryJsonLd) }}
      />

      <nav
        aria-label="Breadcrumbs"
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]"
      >
        <Link
          href="/"
          className="hover:text-[var(--color-ink)] transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <span
          className="text-[var(--color-ink)] font-semibold"
          aria-current="page"
        >
          Converters
        </span>
      </nav>

      <div className="space-y-16 sm:space-y-24 pt-6 sm:pt-10 pb-8 sm:pb-16">
        {/* Hero */}
        <div className="space-y-8 sm:space-y-10">
          <header className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-5">
            <span className="feature-badge">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{pages.length} converters · Free up to 10 pages</span>
            </span>
            <h1 className="text-[2rem] leading-[1.08] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.04] font-extrabold tracking-tight text-[var(--color-ink)]">
              Bank Statement Converters for Every Bank &amp; Format
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-2xl mx-auto">
              Pick your bank or export format to open a converter tuned for it.
              Every converter splits debits and credits and checks balances
              before you download.
            </p>
          </header>

          <ConverterDirectory pages={entries} />
        </div>

        {/* Fallback for banks without a dedicated page */}
        <section className="intro-panel grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-center">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-ink)]">
              Don&apos;t See Your Bank?
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)]">
              The universal converter adapts to almost any bank statement layout
              worldwide, including scanned PDFs and photos.
            </p>
          </div>
          <Link
            href="/convert/bank-statement-to-excel"
            className="btn-brand-dark !min-h-[52px] w-full lg:w-auto lg:justify-self-end"
          >
            <span>Open Universal Converter</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        <FinalCtaSection href="/#upload" />
      </div>
    </div>
  );
}
