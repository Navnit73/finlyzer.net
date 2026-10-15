import React from 'react';
import Link from 'next/link';
import { FileText, FileSpreadsheet, Users } from 'lucide-react';
import {
  MetricsStrip,
  HowItWorksSection,
  BeforeAfterSection,
  FeatureGridSection,
  ExportFormatsSection,
  SecuritySection,
  ConverterLinksSection,
  ComparisonSection,
  FaqSection,
  FinalCtaSection,
  SectionBand,
} from '@/components/converter/sections';
import { FREE_PAGE_LIMIT } from '@/types/pricing';
import { GUEST_RETENTION_HOURS } from '@/lib/retention';

/* ------------------------------------------------------------------
   Homepage owns the broad "bank statement converter" intent.
   Format-specific questions ("bank statement to Excel / CSV / QBO ...") and
   bank-specific ones live on their /convert/[slug] pages, which this page links to.
------------------------------------------------------------------- */

export const featuredBankConverters = [
  { name: 'Chase bank statements', slug: 'chase-bank-statement-to-excel', badge: 'United States' },
  { name: 'Bank of America statements', slug: 'bank-of-america-statement-to-excel', badge: 'United States' },
  { name: 'Wells Fargo statements', slug: 'wells-fargo-bank-statement-to-excel', badge: 'United States' },
  { name: 'Barclays statements', slug: 'barclays-bank-statement-to-excel', badge: 'United Kingdom' },
  { name: 'HDFC Bank statements', slug: 'hdfc-bank-statement-to-excel', badge: 'India' },
  { name: 'SBI, ICICI, Axis & Kotak statements', slug: 'indian-bank-statement-to-excel', badge: 'India' },
  { name: 'Credit card statements', slug: 'credit-card-statement-to-excel', badge: 'Any card issuer' },
  { name: 'Scanned statements & photos', slug: 'scanned-pdf-ocr-to-excel', badge: 'OCR' },
];

export const faqs = [
  {
    q: 'What is a bank statement converter?',
    a: 'A bank statement converter reads a PDF or scanned bank statement and turns its transactions into structured rows (date, description, debit, credit and balance) that you can open in a spreadsheet or import into accounting software. It replaces copying and retyping figures by hand.',
  },
  {
    q: 'Which output format should I choose?',
    a: 'Choose Excel to analyse or share the data as a spreadsheet, CSV for general imports and scripts, QBO for QuickBooks, OFX for Xero and other OFX-compatible apps, and QIF for Quicken and older desktop software. Every upload can be downloaded in all of them.',
  },
  {
    q: 'Does it work with scanned or photographed statements?',
    a: 'Yes. Scanned PDFs and photos (PNG, JPG, WEBP or TIFF) are read with OCR before the transaction table is rebuilt. Clear, flat, well-lit pages give the best results, and digital PDFs are the most reliable of all.',
  },
  {
    q: 'Which banks are supported?',
    a: 'The converter adapts to most bank statement layouts rather than relying on a fixed template per bank, so statements from banks in the US, UK, Canada, Australia, India and elsewhere can be converted. Some banks, such as Chase, Bank of America, Wells Fargo, Barclays and HDFC Bank, also have their own guides.',
  },
  {
    q: 'How accurate is the conversion, and how do I check it?',
    a: 'Accuracy is highest on digital PDFs and good-quality scans. When a statement prints a running balance, each row is recomputed against it and any mismatch is flagged, so you know which lines to review. Always confirm the opening and closing balances before using the data for tax, lending or audit work.',
  },
  {
    q: 'What happens to my statement after I upload it?',
    a: `Uploads travel over HTTPS. If you convert without an account, the file's extracted data is deleted automatically ${GUEST_RETENTION_HOURS} hours after upload. Signed-in users keep converted statements in a private vault until they delete them or their account. Statements are never sold or used for advertising.`,
  },
  {
    q: 'Can I convert a password-protected PDF?',
    a: 'Yes. Enter the password when prompted. It is used only to open the file for processing and is never stored.',
  },
  {
    q: 'How much does it cost?',
    a: `Statements up to ${FREE_PAGE_LIMIT} pages are free to convert and download in every format, with no signup. Documents of 11 to 30 pages can be previewed free and unlocked for a one-time $10 fee, and longer statements up to 200 pages need a free account and page credits.`,
  },
  {
    q: 'Can I convert several statements at once?',
    a: 'Yes. Signed-in users can batch upload up to 50 files and merge them into one workbook, which is useful for a full year of monthly statements.',
  },
];

const linkClass = 'link';

/** Server-rendered introduction that frames the broad intent and links to the specific converters. */
function HomeIntroSection() {
  const paragraphClass = 'text-base sm:text-[17px] leading-[1.65] text-[var(--color-text-secondary)]';
  const rowClass = 'flex gap-4 sm:gap-5 py-6 sm:py-7 first:pt-0 last:pb-0';
  const iconClass = 'w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] flex items-center justify-center shrink-0';

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-8 sm:gap-10 lg:gap-16 items-start">
      <div className="lg:sticky lg:top-[calc(var(--nav-height)+32px)]">
        <h2 className="type-display max-w-md">Turn Bank Statements Into Usable Data</h2>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        <div className={rowClass}>
          <span className={iconClass}>
            <FileText className="w-5 h-5 text-[var(--color-brand-dark)]" aria-hidden="true" />
          </span>
          <p className={paragraphClass}>
            Banks, lenders and accountants still exchange statements as PDFs. They are easy to read but hard to work
            with: copying a statement into a spreadsheet merges columns, splits descriptions across rows and turns
            amounts into text. Finlyzers reads the statement, extracts each transaction with its date, description,
            debit, credit and balance, and checks the result against the statement&apos;s own running balance.
          </p>
        </div>

        <div className={rowClass}>
          <span className={iconClass}>
            <FileSpreadsheet className="w-5 h-5 text-[var(--color-brand-dark)]" aria-hidden="true" />
          </span>
          <p className={paragraphClass}>
            Digital PDFs are read from their text layer, while scanned statements and phone photos go through OCR first.
            Once the transactions are extracted, you can download them as a{' '}
            <Link href="/convert/bank-statement-to-excel" className={linkClass}>spreadsheet in Excel</Link>, a{' '}
            <Link href="/convert/bank-statement-to-csv" className={linkClass}>CSV file</Link> for imports, a{' '}
            <Link href="/convert/bank-statement-to-qbo" className={linkClass}>QBO file for QuickBooks</Link>, an{' '}
            <Link href="/convert/bank-statement-to-ofx" className={linkClass}>OFX file for Xero</Link> or a{' '}
            <Link href="/convert/bank-statement-to-qif" className={linkClass}>QIF file for Quicken</Link>. If your
            transactions are already in a spreadsheet, the{' '}
            <Link href="/convert/csv-to-qbo" className={linkClass}>CSV and Excel to QBO converter</Link> prepares them for
            QuickBooks, and the{' '}
            <Link href="/guides/import-excel-into-quickbooks" className={linkClass}>QuickBooks import guide</Link> covers
            both import methods.
          </p>
        </div>

        <div className={rowClass}>
          <span className={iconClass}>
            <Users className="w-5 h-5 text-[var(--color-brand-dark)]" aria-hidden="true" />
          </span>
          <p className={paragraphClass}>
            Bookkeepers use it to backfill accounting software when a bank feed is missing history, small businesses use
            it to prepare tax figures, and lenders and analysts use it to review transaction histories. Read how
            extraction and verification work on the{' '}
            <Link href="/editorial-policy" className={linkClass}>methodology page</Link>, and how uploads are handled on
            the <Link href="/security" className={linkClass}>security page</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function HomeEditorialContent() {
  // Bands alternate white / parchment; the feature grid is the one dark band.
  // The negative bottom margin lets the last band meet the footer edge-to-edge.
  return (
    <div className="w-full -mb-6 sm:-mb-10">
      <div className="pt-10 sm:pt-16 pb-[var(--section-y)]">
        <MetricsStrip />
      </div>
      <SectionBand tone="parchment">
        <HomeIntroSection />
      </SectionBand>
      <SectionBand>
        <HowItWorksSection />
      </SectionBand>
      <SectionBand tone="parchment">
        <BeforeAfterSection />
      </SectionBand>
      <SectionBand tone="dark">
        <FeatureGridSection bare />
      </SectionBand>
      <SectionBand>
        <ExportFormatsSection
          title="Choose an Output Format"
          subtitle="Every upload can be downloaded in any of these formats. Each guide explains how to use the file."
        />
      </SectionBand>
      <SectionBand tone="parchment">
        <SecuritySection bare />
      </SectionBand>
      <SectionBand>
        <ConverterLinksSection title="Guides for Popular Banks & Statement Types" links={featuredBankConverters} />
      </SectionBand>
      <SectionBand tone="parchment">
        <ComparisonSection />
      </SectionBand>
      <SectionBand>
        <FaqSection faqs={faqs} />
      </SectionBand>
      <SectionBand tone="parchment">
        <FinalCtaSection />
      </SectionBand>
    </div>
  );
}
