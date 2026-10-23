import Link from "next/link";
import { ShieldCheck, ChevronRight } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { TRUST_PAGES } from "@/lib/trust-pages";
import { GUEST_RETENTION_HOURS } from "@/lib/retention";

type FooterLink = { href: string; label: string };

const COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Bank Statement to…",
    links: [
      ["bank-statement-to-excel", "Excel (.xlsx)"],
      ["bank-statement-to-csv", "CSV"],
      ["bank-statement-to-qbo", "QuickBooks (.qbo)"],
      ["bank-statement-to-ofx", "OFX for Xero"],
      ["bank-statement-to-qif", "Quicken (.qif)"],
    ].map(([slug, label]) => ({ href: `/convert/${slug}`, label })),
  },
  {
    heading: "US Banks & Cards",
    links: [
      { href: "/convert/chase-bank-statement-to-excel", label: "Chase" },
      { href: "/convert/bank-of-america-statement-to-excel", label: "Bank of America" },
      { href: "/convert/wells-fargo-bank-statement-to-excel", label: "Wells Fargo" },
      { href: "/convert/citibank-statement-to-excel", label: "Citibank" },
      { href: "/convert/capital-one-statement-to-excel", label: "Capital One" },
      { href: "/convert/us-bank-statement-to-excel", label: "U.S. Bank" },
      { href: "/convert/pnc-bank-statement-to-excel", label: "PNC" },
      { href: "/convert/td-bank-statement-to-excel", label: "TD Bank" },
      { href: "/convert/credit-card-statement-to-excel", label: "Credit card statements" },
    ],
  },
  {
    heading: "UK, Ireland & Europe",
    links: [
      { href: "/convert/barclays-bank-statement-to-excel", label: "Barclays" },
      { href: "/convert/hsbc-bank-statement-to-excel", label: "HSBC" },
      { href: "/convert/lloyds-bank-statement-to-excel", label: "Lloyds" },
      { href: "/convert/natwest-bank-statement-to-excel", label: "NatWest" },
      { href: "/convert/santander-bank-statement-to-excel", label: "Santander UK" },
      { href: "/convert/aib-bank-statement-to-excel", label: "AIB (Ireland)" },
      { href: "/convert/bank-of-ireland-statement-to-excel", label: "Bank of Ireland" },
      { href: "/convert/revolut-statement-to-excel", label: "Revolut" },
    ],
  },
  {
    heading: "Australia",
    links: [
      { href: "/convert/commbank-statement-to-excel", label: "CommBank" },
      { href: "/convert/westpac-bank-statement-to-excel", label: "Westpac" },
      { href: "/convert/anz-bank-statement-to-excel", label: "ANZ" },
      { href: "/convert/nab-bank-statement-to-excel", label: "NAB" },
    ],
  },
  {
    heading: "India, Scans & More",
    links: [
      { href: "/convert/hdfc-bank-statement-to-excel", label: "HDFC Bank (India)" },
      { href: "/convert/indian-bank-statement-to-excel", label: "SBI, ICICI, Axis & Kotak" },
      { href: "/convert/financial-pdf-to-excel", label: "Invoices & other financial PDFs" },
      { href: "/convert/scanned-pdf-ocr-to-excel", label: "Scanned statements (OCR)" },
    ],
  },
  {
    heading: "Reconciliation",
    links: [
      ["bank-reconciliation-tool", "Bank reconciliation tool"],
      ["bank-statement-vs-ledger", "Bank statement vs ledger"],
      ["bank-statement-matching-tool", "Transaction matching"],
      ["bank-reconciliation-calculator", "Reconciliation calculator"],
    ].map(([slug, label]) => ({ href: `/reconcile/${slug}`, label })),
  },
  {
    heading: "Analyzers & Calculators",
    links: [
      { href: "/analyzer/bank-statement-analyzer", label: "Bank statement analyzer" },
      { href: "/calculators/cash-flow-calculator", label: "Cash flow calculator" },
    ],
  },
  {
    heading: "Product & Directory",
    links: [
      { href: "/pricing", label: "Pricing & Page Credits" },
      { href: "/", label: "Bank Statement Converter" },
      { href: "/convert/csv-to-qbo", label: "CSV & Excel to QBO" },
      { href: "/guides/import-excel-into-quickbooks", label: "Guide: Import Excel into QuickBooks" },
      { href: "/about", label: "About Us & Contact" },
      { href: "/faq", label: "FAQ" },
      { href: "/editorial-policy", label: "Methodology & Accuracy" },
    ],
  },
];

const linkClass =
  "inline-flex py-1.5 text-[14px] sm:text-[13px] leading-snug text-[var(--color-text-secondary)] hover:text-[var(--color-brand-dark)] transition-colors";

const legalLinkClass =
  "inline-flex items-center min-h-[32px] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-dark)] transition-colors";

export default function Footer() {
  return (
    <footer className="w-full section-parchment hairline-t mt-auto text-[13px] leading-[1.5] text-[var(--color-text-secondary)]">
      <div className="site-container pt-12 sm:pt-16 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,20rem)_1fr] gap-10 lg:gap-16">
          {/* Brand */}
          <div className="space-y-5 max-w-md">
            <BrandLogo size="sm" textClassName="!text-[17px]" />
            <p className="text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              Converts PDF and scanned bank statements into Excel, CSV, QBO, OFX and QIF, with every transaction checked against the statement balance.
            </p>
            <p className="inline-flex items-start gap-2 rounded-lg bg-[var(--color-success-soft)] border border-[var(--color-success-border)] px-3 py-2 text-[12px] text-[var(--color-text-secondary)]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
              <span>Encrypted in transit &bull; Guest uploads auto-deleted in {GUEST_RETENTION_HOURS}h</span>
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/convert" className="link inline-flex items-center gap-0.5 min-h-[44px] text-[14px] font-medium">
                <span>Browse All Converters</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a
                href="https://www.producthunt.com/products/finlyzers?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-finlyzers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-md hover:opacity-90 transition-opacity"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Finlyzers - Convert PDF and scanned bank statements into Exce | Product Hunt"
                  width="250"
                  height="54"
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1276722&theme=light&t=1791724223623"
                  className="w-[180px] h-auto max-w-full"
                />
              </a>
            </div>
          </div>

          {/* Link directory for visitors and crawlers */}
          <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-10">
            {COLUMNS.map((col) => (
              <div key={col.heading} className="min-w-0">
                <p className="text-[13px] font-semibold text-[var(--color-ink)]">{col.heading}</p>
                <ul className="mt-3 space-y-0.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Fine print */}
        <div className="mt-12 sm:mt-14 pt-6 hairline-t flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 text-[12px] text-[var(--color-text-muted)]">
          <p>&copy; {new Date().getFullYear()} Finlyzers (NAVNIT RAI). All rights reserved.</p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
              {["/about", "/security", "/privacy-policy", "/terms", "/disclaimer"].map((path) => {
                const page = TRUST_PAGES.find((p) => p.path === path)!;
                return (
                  <li key={path}>
                    <Link href={path} className={legalLinkClass}>
                      {page.shortTitle}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
