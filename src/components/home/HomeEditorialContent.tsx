import React from 'react';
import Link from 'next/link';
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
  SectionHeading,
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

const linkClass =
  'font-semibold text-[var(--color-ink)] underline underline-offset-4 decoration-[var(--color-brand)] decoration-2';

/** Server-rendered introduction that frames the broad intent and links to the specific converters. */
function HomeIntroSection() {
  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <SectionHeading title="Turn Bank Statements Into Usable Data" />
      <div className="space-y-4 text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
        <p>
          Banks, lenders and accountants still exchange statements as PDFs. They are easy to read but hard to work
          with: copying a statement into a spreadsheet merges columns, splits descriptions across rows and turns
          amounts into text. Finlyzers reads the statement, extracts each transaction with its date, description,
          debit, credit and balance, and checks the result against the statement&apos;s own running balance.
        </p>
        <p>
          Digital PDFs are read from their text layer, while scanned statements and phone photos go through OCR first.
          Once the transactions are extracted, you can download them as a{' '}
          <Link href="/convert/bank-statement-to-excel" className={linkClass}>spreadsheet in Excel</Link>, a{' '}
          <Link href="/convert/bank-statement-to-csv" className={linkClass}>CSV file</Link> for imports, a{' '}
          <Link href="/convert/bank-statement-to-qbo" className={linkClass}>QBO file for QuickBooks</Link>, an{' '}
          <Link href="/convert/bank-statement-to-ofx" className={linkClass}>OFX file for Xero</Link> or a{' '}
          <Link href="/convert/bank-statement-to-qif" className={linkClass}>QIF file for Quicken</Link>.
        </p>
        <p>
          Bookkeepers use it to backfill accounting software when a bank feed is missing history, small businesses use
          it to prepare tax figures, and lenders and analysts use it to review transaction histories. Read how
          extraction and verification work on the{' '}
          <Link href="/editorial-policy" className={linkClass}>methodology page</Link>, and how uploads are handled on
          the <Link href="/security" className={linkClass}>security page</Link>.
        </p>
      </div>
    </section>
  );
}

export default function HomeEditorialContent() {
  return (
    <div className="w-full space-y-16 sm:space-y-24 pt-8 sm:pt-12 pb-8 sm:pb-16">
      <MetricsStrip />
      <HomeIntroSection />
      <HowItWorksSection />
      <BeforeAfterSection />
      <FeatureGridSection />
      <ExportFormatsSection
        title="Choose an Output Format"
        subtitle="Every upload can be downloaded in any of these formats. Each guide explains how to use the file."
      />
      <SecuritySection />
      <ConverterLinksSection title="Guides for Popular Banks & Statement Types" links={featuredBankConverters} />
      <ComparisonSection />
      <FaqSection faqs={faqs} />
      <FinalCtaSection />
    </div>
  );
}
