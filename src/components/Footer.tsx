import Link from "next/link";
import { ShieldCheck, Sparkles, Lock } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border-t border-[var(--color-border)] py-12 mt-auto">
      <div className="site-container space-y-10">
        {/* Top Multi-Column Link Directory for SEO & Crawlers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <BrandLogo size="sm" textClassName="!text-lg" />
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              AI-powered financial statement extraction, bank statement OCR, and balance reconciliation engine. Built for accountants, SMBs, and financial analysts.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] pt-1">
              <ShieldCheck className="w-4 h-4 text-[var(--color-brand-hover)]" />
              <span>256-Bit SSL Encrypted &bull; ISO-27001 Pattern</span>
            </div>
          </div>

          {/* Col 2: US Bank Statement Converters */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--color-ink)]">
              US Bank Converters
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/convert/chase-bank-statement-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Chase Bank to Excel / CSV
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/bank-of-america-statement-to-csv"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Bank of America to CSV / XLSX
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/wells-fargo-pdf-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Wells Fargo Statement to Excel
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/credit-card-statement-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Credit Card Statement Parser
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: UK & Global Bank Converters */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--color-ink)]">
              UK &amp; Global Banks
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/convert/barclays-bank-statement-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Barclays UK Statement Converter
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/hdfc-bank-statement-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  HDFC Bank Statement to Excel (India)
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/pdf-to-excel-converter"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Universal PDF to Excel Converter
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/scanned-pdf-ocr-to-excel"
                  className="hover:text-[var(--color-ink)] hover:underline transition-colors"
                >
                  Scanned PDF &amp; Photo OCR
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Resources & Directory */}
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
                  Free Online PDF Extractor
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <p>&copy; {new Date().getFullYear()} Finlyzer. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Enterprise 256-Bit SSL</span>
            <span>&bull;</span>
            <span>GDPR &amp; CCPA Compliant</span>
            <span>&bull;</span>
            <span>DeepSeek AI Vision</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
