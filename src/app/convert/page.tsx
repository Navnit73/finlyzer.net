import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbStrip from "@/components/layout/BreadcrumbStrip";
import { FREE_PAGE_LIMIT } from "@/types/pricing";
import { getAllLandingPages } from "@/lib/seo-markdown";
import {
  absoluteUrl,
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
  pageMetadata,
  serializeJsonLd,
} from "@/lib/seo-config";
import { ArrowRight } from "lucide-react";
import ConverterDirectory, {
  type DirectoryEntry,
} from "@/components/converter/ConverterDirectory";
import { FinalCtaSection, SectionBand } from "@/components/converter/sections";

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
    <div className="w-full -mb-6 sm:-mb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: directoryJsonLd }}
      />

      <BreadcrumbStrip items={[{ label: "Home", href: "/" }, { label: "Converters" }]} />

      {/* Hero + directory: the hero sits on a parchment band, the search bar straddles its edge. */}
      <header className="text-center pt-10 sm:pt-16 pb-10 sm:pb-14 bg-[var(--color-surface-subtle)] shadow-[0_0_0_100vmax_var(--color-surface-subtle)] [clip-path:inset(0_-100vmax)]">
        <p className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-soft)] border border-[var(--color-info-border)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-brand-dark)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
          {pages.length} converters · Free up to {FREE_PAGE_LIMIT} pages
        </p>
        <h1 className="type-hero !text-[clamp(2rem,6.5vw,3.5rem)] mt-4 max-w-3xl mx-auto text-balance">
          Converters by Bank &amp; <span className="text-[var(--color-brand)]">Format</span>
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-[13px] sm:text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
          Pick the export format you need, or your bank for a guide to its
          statement layout. Every converter splits debits and credits and
          checks balances before you download.
        </p>
      </header>

      <div className="pt-8 sm:pt-12 pb-[var(--section-y)]">
        <ConverterDirectory pages={entries} />
      </div>

      {/* Fallback for banks without a dedicated page, and QuickBooks import help */}
      <SectionBand tone="parchment">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 lg:divide-x lg:divide-[var(--color-border)]">
          <section className="lg:pr-14 flex flex-col items-start">
            <h2 className="type-title">Don&apos;t See Your Bank?</h2>
            <p className="type-body mt-3">
              The bank statement converter adapts to most statement layouts,
              including scanned PDFs and photos. No bank-specific page is needed.
            </p>
            <Link href="/#upload" className="btn-brand-primary mt-6 w-full sm:w-auto">
              <span>Open the Bank Statement Converter</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </section>

          <section className="lg:pl-14 flex flex-col items-start">
            <h2 className="type-title">Importing a Spreadsheet Into QuickBooks?</h2>
            <p className="type-body mt-3">
              Upload a CSV or Excel file to the{" "}
              <Link href="/convert/csv-to-qbo" className="link">
                CSV and Excel to QBO converter
              </Link>
              , or follow the step-by-step guide for QuickBooks Online and Desktop.
            </p>
            <Link
              href="/guides/import-excel-into-quickbooks"
              className="btn-brand-ghost mt-6 w-full sm:w-auto"
            >
              <span>Read the QuickBooks Import Guide</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </SectionBand>

      <SectionBand>
        <FinalCtaSection href="/#upload" />
      </SectionBand>
    </div>
  );
}
