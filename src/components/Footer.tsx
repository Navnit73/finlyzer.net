import Link from "next/link";
import { ShieldCheck, Sparkles, Lock } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { TRUST_PAGES } from "@/lib/trust-pages";

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border-t border-[var(--color-border)] py-12 mt-auto">
      <div className="site-container space-y-10">
        {/* Top Multi-Column Link Directory for SEO & Crawlers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <BrandLogo size="sm" textClassName="!text-lg" />
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Converts PDF and scanned bank statements into Excel, CSV, QBO, OFX and QIF, with every transaction checked against the statement balance.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] pt-1">
              <ShieldCheck className="w-4 h-4 text-[var(--color-brand-hover)]" />
              <span>Encrypted in transit &bull; Guest uploads auto-deleted in 24h</span>
            </div>
          </div>

          {/* Col 2: Export Format Converters */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--color-ink)]">
              Bank Statement to…
            </p>
            <ul className="space-y-2 text-xs">
              {[
                ['bank-statement-to-excel', 'Excel (.xlsx)'],
                ['bank-statement-to-csv', 'CSV'],
                ['bank-statement-to-qbo', 'QuickBooks (.qbo)'],
                ['bank-statement-to-ofx', 'OFX for Xero'],
                ['bank-statement-to-qif', 'Quicken (.qif)'],
              ].map(([slug, label]) => (
                <li key={slug}>
                  <Link
                    href={`/convert/${slug}`}
                    className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: US Bank Statement Converters */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--color-ink)]">
              US Banks &amp; Cards
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/convert/chase-bank-statement-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Chase
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/bank-of-america-statement-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Bank of America
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/wells-fargo-bank-statement-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Wells Fargo
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/credit-card-statement-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Credit card statements
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: UK & Global Bank Converters */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--color-ink)]">
              UK, India &amp; More
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/convert/barclays-bank-statement-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Barclays (UK)
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/hdfc-bank-statement-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  HDFC Bank (India)
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/indian-bank-statement-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  SBI, ICICI, Axis &amp; Kotak
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/pdf-to-excel-converter"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Invoices &amp; other financial PDFs
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/scanned-pdf-ocr-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Scanned statements (OCR)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Resources & Directory */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--color-ink)]">
              Product &amp; Directory
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/convert"
                  className="font-bold text-[var(--color-brand-hover)] hover:underline transition-colors flex items-center gap-1"
                >
                  <span>Browse All Converters</span>
                  <span>&rarr;</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Pricing &amp; Page Credits
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Bank Statement Converter
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[var(--color-ink)] hover:underline transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy" className="hover:text-[var(--color-ink)] hover:underline transition-colors">
                  Methodology &amp; Accuracy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <p>&copy; {new Date().getFullYear()} Finlyzers. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {['/security', '/privacy-policy', '/terms', '/disclaimer'].map((path) => {
              const page = TRUST_PAGES.find((p) => p.path === path)!;
              return (
                <Link key={path} href={path} className="hover:text-[var(--color-ink)] hover:underline transition-colors">
                  {page.shortTitle}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
