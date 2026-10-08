import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllLandingPages } from "@/lib/seo-markdown";
import {
  absoluteUrl,
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
  pageMetadata,
  serializeJsonLd,
} from "@/lib/seo-config";
import { ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import ConverterDirectory, {
  type DirectoryEntry,
} from "@/components/converter/ConverterDirectory";
import { FinalCtaSection } from "@/components/converter/sections";

const title = "Bank Statement Converters by Bank & Format | Finlyzers";
const description =
  "Find the right converter: Excel, CSV, QBO, OFX and QIF formats, plus guides for Chase, Bank of America, Wells Fargo, Barclays, HDFC and other banks.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/convert" });

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

  // CollectionPage + ItemList of every converter, with BreadcrumbList.
  const directoryJsonLd = serializeJsonLd([
    getBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Converters", path: "/convert" },
    ]),
    {
      ...getWebPageJsonLd({ path: "/convert", name: title, description }),
      "@type": "CollectionPage",
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: pages.length,
        itemListElement: pages.map((p, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: p.title,
          url: absoluteUrl(`/convert/${p.slug}`),
        })),
      },
    },
  ]);

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: directoryJsonLd }}
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
              Converters by Bank &amp; Format
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-2xl mx-auto">
              Pick the export format you need, or your bank for a guide to its
              statement layout. Every converter splits debits and credits and
              checks balances before you download.
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
              The bank statement converter adapts to most statement layouts,
              including scanned PDFs and photos. No bank-specific page is needed.
            </p>
          </div>
          <Link
            href="/#upload"
            className="btn-brand-dark !min-h-[52px] w-full lg:w-auto lg:justify-self-end"
          >
            <span>Open the Bank Statement Converter</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* QuickBooks import help for visitors who already have a spreadsheet */}
        <section className="intro-panel grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-center">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-ink)]">
              Importing a Spreadsheet Into QuickBooks?
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)]">
              Upload a CSV or Excel file to the{" "}
              <Link
                href="/convert/csv-to-qbo"
                className="font-semibold text-[var(--color-ink)] underline underline-offset-4 decoration-[var(--color-brand)] decoration-2"
              >
                CSV and Excel to QBO converter
              </Link>
              , or follow the step-by-step guide for QuickBooks Online and Desktop.
            </p>
          </div>
          <Link
            href="/guides/import-excel-into-quickbooks"
            className="btn-brand-secondary !min-h-[52px] w-full lg:w-auto lg:justify-self-end"
          >
            <span>Read the QuickBooks Import Guide</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        <FinalCtaSection href="/#upload" />
      </div>
    </div>
  );
}
