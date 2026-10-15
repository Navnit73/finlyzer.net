import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2, Lock, ArrowRight, XCircle, ShieldCheck, Trash2, KeyRound, BrainCircuit,
  TableProperties, Layers, Cpu, UploadCloud, FileSpreadsheet, Download, ChevronDown, ChevronRight, Sparkles,
  type LucideIcon,
} from 'lucide-react';
import UploadCtaButton from './UploadCtaButton';
import { FREE_PAGE_LIMIT } from '@/types/pricing';
import { GUEST_RETENTION_HOURS } from '@/lib/retention';

/* ------------------------------------------------------------------
   Shared marketing sections for the homepage and /convert/[slug] pages.
   Server components; each takes copy as props with homepage defaults.
------------------------------------------------------------------- */

export interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface LedgerRow {
  date: string;
  desc: string;
  debit: string;
  credit: string;
  balance: string;
}

/** Raw export-file snippet shown instead of the ledger table (OFX, QIF, CSV pages). */
export interface FileOutputPreview {
  label: string;
  lines: string[];
  caption: string;
}

export interface ConverterLink {
  name: string;
  slug: string;
  badge: string;
}

export const exportFormats = [
  { fmt: 'Excel (.xlsx)', use: 'Sort, filter and total transactions in Excel or Google Sheets', slug: 'bank-statement-to-excel' },
  { fmt: 'CSV (.csv)', use: 'Plain-text rows for accounting imports, budgeting apps and scripts', slug: 'bank-statement-to-csv' },
  { fmt: 'QuickBooks (.qbo)', use: 'Web Connect file for QuickBooks Online and Desktop', slug: 'bank-statement-to-qbo' },
  { fmt: 'OFX (.ofx)', use: 'Statement import for Xero, GnuCash and other OFX apps', slug: 'bank-statement-to-ofx' },
  { fmt: 'Quicken (.qif)', use: 'Records for Quicken, Moneydance and older desktop software', slug: 'bank-statement-to-qif' },
];

export const defaultSteps: Step[] = [
  { icon: UploadCloud, title: 'Upload your bank statement PDF', body: 'Drop a PDF, scanned statement or photo. Password-protected files are supported.' },
  { icon: Cpu, title: 'AI extracts every transaction', body: 'Dates, descriptions, debits, credits and balances are read and checked against your closing balance.' },
  { icon: Download, title: 'Download your format', body: 'Get Excel, CSV, QBO, OFX or QIF, ready for analysis, reconciliation or import into accounting software.' },
];

const defaultLedgerRows: LedgerRow[] = [
  { date: '09/12', desc: 'Tech Corp Payroll', debit: '', credit: '4,850.00', balance: '12,420.50' },
  { date: '09/14', desc: 'Amazon Retail', debit: '124.50', credit: '', balance: '12,296.00' },
  { date: '09/15', desc: 'Wire Outgoing Fee', debit: '25.00', credit: '', balance: '12,271.00' },
];

const defaultRawLines = [
  '09/12/2026 DIRECT DEP TECH CORP 4850.00 12420.50',
  '09/14/2026 AMAZON.COM*RETAIL -124.50 12296.00',
  '09/15/2026 WIRE TRANSFER OUTGOING FEE -25.00 12271.00',
];

const defaultFeatures = [
  { title: 'Multi-Page Table Stitching', description: 'Joins tables across pages without dropping rows or repeating headers.' },
  { title: 'Balance Verification', description: 'Opening balance plus credits minus debits is checked against the closing balance.' },
  { title: 'Password-Protected PDFs', description: 'Enter the PDF password when prompted. It is used only to open the file and is never stored.' },
  { title: 'Annual Statement Merge', description: 'Combine 12 monthly statements into one annual ledger with summaries.' },
];
const featureIcons: LucideIcon[] = [TableProperties, Cpu, Lock, Layers, Sparkles];

// Product facts only (limits and policies enforced in code). Usage or accuracy statistics belong here
// only with a published methodology on /editorial-policy.
const metrics = [
  [`${FREE_PAGE_LIMIT} pages`, 'Free per statement, no signup'],
  ['200 pages', 'Per statement with a free account'],
  ['6 formats', 'XLSX, CSV, QBO, OFX, QIF & PDF'],
  [`${GUEST_RETENTION_HOURS} hours`, 'Until guest uploads are deleted'],
];

const securityPoints = [
  { icon: ShieldCheck, title: 'Encrypted in transit', body: 'Every upload travels over HTTPS (TLS) to our servers and processing service.' },
  { icon: Trash2, title: `Auto-deleted in ${GUEST_RETENTION_HOURS} hours`, body: `Guest uploads and their results are deleted automatically ${GUEST_RETENTION_HOURS} hours after upload.` },
  { icon: KeyRound, title: 'Passwords never stored', body: 'Protected PDFs are unlocked for processing only.' },
  { icon: BrainCircuit, title: 'Never used for AI training', body: 'Your statements are not shared or used to train models.' },
];

const comparisonRows = [
  ['Time for a 10-page statement', 'Typically seconds', '45–60 minutes', 'Minutes, plus cleanup'],
  ['Debit & credit columns', 'Split automatically', 'Manual sorting', 'Merged / single column'],
  ['Balance check', 'Automatic', 'Calculator', 'None'],
  ['Password-protected PDFs', 'Supported', 'Manual unlock', 'Usually fails'],
  ['Scanned PDFs & photos', 'OCR included', 'Retype by hand', 'Limited'],
  ['Export formats', 'XLSX, CSV, QBO, OFX, QIF, PDF', 'Excel only', 'Basic CSV'],
];

const defaultCtaFacts = [
  { icon: UploadCloud, label: 'PDF, scans & photos' },
  { icon: Download, label: 'Excel, CSV, QBO, OFX, QIF' },
  { icon: ShieldCheck, label: `Auto-deleted in ${GUEST_RETENTION_HOURS}h` },
];

/* ------------------------------------------------------------------
   Page bands. Marketing pages alternate white / parchment / dark bands
   instead of drawing boxes. The page <main> is width-constrained, so the
   band colour is painted edge-to-edge with a spread shadow clipped to the
   band's height: it bleeds to the viewport without creating horizontal
   scroll, and the content stays on the container grid.
------------------------------------------------------------------- */

export type BandTone = 'white' | 'parchment' | 'brand' | 'dark';

const BAND_TONES: Record<BandTone, string> = {
  white: '',
  parchment:
    'bg-[var(--color-surface-subtle)] shadow-[0_0_0_100vmax_var(--color-surface-subtle)] [clip-path:inset(0_-100vmax)]',
  brand:
    'bg-[var(--color-brand-soft)] shadow-[0_0_0_100vmax_var(--color-brand-soft)] [clip-path:inset(0_-100vmax)]',
  // .surface-dark re-scopes --color-surface to the dark canvas.
  dark: 'surface-dark shadow-[0_0_0_100vmax_var(--color-surface)] [clip-path:inset(0_-100vmax)]',
};

export function SectionBand({
  tone = 'white',
  className = '',
  children,
}: {
  tone?: BandTone;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`section ${BAND_TONES[tone]} ${className}`}>{children}</div>;
}

export function SectionHeading({
  title,
  subtitle,
  // Kept for API compatibility: inside .surface-dark the tokens re-scope automatically.
  dark: _dark = false,
}: {
  title: string;
  subtitle?: string;
  dark?: boolean;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <h2 className="type-display">{title}</h2>
      {subtitle && <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-[var(--color-text-secondary)]">{subtitle}</p>}
    </div>
  );
}

export function MetricsStrip({ items = metrics }: { items?: string[][] } = {}) {
  return (
    <section aria-label="Finlyzers at a glance">
      <p className="text-sm font-medium text-[var(--color-text-muted)] text-center">
        Built for accountants, bookkeepers, small businesses &amp; analysts
      </p>
      <dl className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map(([value, label], i) => (
          <div
            key={label}
            className={`rounded-2xl border px-4 py-5 sm:py-6 text-center ${
              i % 2 === 0
                ? 'bg-[var(--color-brand-soft)] border-[var(--color-info-border)]'
                : 'bg-[var(--color-success-soft)] border-[var(--color-success-border)]'
            }`}
          >
            <dt className="sr-only">{label}</dt>
            <dd
              className={`type-title tabular-nums ${
                i % 2 === 0 ? '!text-[var(--color-brand-dark)]' : '!text-[var(--color-success)]'
              }`}
            >
              {value}
            </dd>
            <dd className="mt-1.5 text-[13px] sm:text-sm text-[var(--color-text-secondary)]">{label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function HowItWorksSection({
  title = 'How the Bank Statement Converter Works',
  subtitle = 'Three steps, about a minute. Works with digital PDFs, scanned statements and phone photos.',
  steps = defaultSteps,
  ctaLabel = 'Upload Your Statement',
}: {
  title?: string;
  subtitle?: string;
  steps?: Step[];
  ctaLabel?: string;
}) {
  return (
    <section className="space-y-8 sm:space-y-12 lg:space-y-14">
      <SectionHeading title={title} subtitle={subtitle} />
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {steps.map((s, i) => (
          <li key={s.title} className="card-surface p-6 sm:p-8 text-left">
            <div className="flex items-center justify-between gap-3">
              <span className="w-12 h-12 rounded-2xl bg-[var(--color-brand-soft)] flex items-center justify-center">
                <s.icon className="w-6 h-6 text-[var(--color-brand-dark)]" aria-hidden="true" />
              </span>
              <span className="rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] px-3 py-1 text-[13px] font-medium tabular-nums">Step {i + 1}</span>
            </div>
            <h3 className="type-headline mt-6">{s.title}</h3>
            <p className="mt-2 text-base text-[var(--color-text-secondary)] leading-relaxed">{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="flex justify-center">
        <UploadCtaButton label={ctaLabel} />
      </div>
    </section>
  );
}

export function BeforeAfterSection({
  title = 'From Messy PDF to Audit-Ready Spreadsheet',
  subtitle = 'Generic PDF to Excel tools merge columns and split descriptions. Finlyzers is built for bank statements and verifies every balance before you download.',
  rawLines = defaultRawLines,
  rows = defaultLedgerRows,
  fileOutput,
}: {
  title?: string;
  subtitle?: string;
  rawLines?: string[];
  rows?: LedgerRow[];
  fileOutput?: FileOutputPreview;
}) {
  return (
    <section className="space-y-8 sm:space-y-12 lg:space-y-14">
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        <div className="card-surface min-w-0 p-5 sm:p-8 flex flex-col gap-5 !border-[var(--color-danger-border)]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-[17px] font-semibold text-[var(--color-ink)]">
              <XCircle className="w-[18px] h-[18px] text-[var(--color-danger)]" aria-hidden="true" />
              Copy-paste from a PDF
            </h3>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)] text-xs font-medium">Before</span>
          </div>
          <div className="font-mono text-xs sm:text-[13px] text-[var(--color-text-secondary)] bg-[var(--color-danger-soft)] p-4 rounded-lg leading-relaxed space-y-1 overflow-x-auto">
            {rawLines.map((line) => (
              <p key={line} className="whitespace-nowrap">{line}</p>
            ))}
          </div>
          <p className="mt-auto text-sm text-[var(--color-text-secondary)]">
            Amounts and balances merged into one line, no debit/credit split, nothing verified.
          </p>
        </div>

        <div className="card-surface min-w-0 p-5 sm:p-8 flex flex-col gap-5 !border-[var(--color-success-border)]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-[17px] font-semibold text-[var(--color-ink)]">
              <CheckCircle2 className="w-[18px] h-[18px] text-[var(--color-success)]" aria-hidden="true" />
              {fileOutput ? `Finlyzers ${fileOutput.label} output` : 'Finlyzers output'}
            </h3>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)] text-xs font-medium whitespace-nowrap">
              Balances verified
            </span>
          </div>
          {fileOutput ? (
            <pre className="font-mono text-xs sm:text-[13px] text-[var(--color-ink)] bg-[var(--color-surface-subtle)] p-4 rounded-lg leading-relaxed overflow-x-auto">
              {fileOutput.lines.join('\n')}
            </pre>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-[13px]" aria-label="Extracted statement transactions preview">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                    <th scope="col" className="py-2 pr-2 font-medium">Date</th>
                    <th scope="col" className="py-2 px-2 font-medium">Description</th>
                    <th scope="col" className="py-2 px-2 font-medium text-right">Debit</th>
                    <th scope="col" className="py-2 px-2 font-medium text-right">Credit</th>
                    <th scope="col" className="hidden sm:table-cell py-2 pl-2 font-medium text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)] tabular-nums">
                  {rows.map((row) => (
                    <tr key={`${row.date}-${row.desc}`}>
                      <td className="py-2.5 pr-2 text-[var(--color-text-secondary)] whitespace-nowrap">{row.date}</td>
                      <td className="py-2.5 px-2 text-[var(--color-ink)]">{row.desc}</td>
                      <td className="py-2.5 px-2 text-right text-[var(--color-ink)] whitespace-nowrap">{row.debit || '—'}</td>
                      <td className="py-2.5 px-2 text-right font-medium text-[var(--color-success)] whitespace-nowrap">{row.credit || '—'}</td>
                      <td className="hidden sm:table-cell py-2.5 pl-2 text-right text-[var(--color-ink)] whitespace-nowrap">{row.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-auto text-sm text-[var(--color-text-secondary)]">
            {fileOutput?.caption ?? 'Separate debit and credit columns, clean descriptions, running balance reconciled.'}
          </p>
        </div>
      </div>
    </section>
  );
}

export function FeatureGridSection({
  title = 'Handles the Statements Other Tools Can’t',
  subtitle = 'Scanned, password-protected and multi-page statements, from one month to a 200-page archive.',
  features = defaultFeatures,
  bare = false,
}: {
  title?: string;
  subtitle?: string;
  /** A feature's own icon wins; otherwise icons are assigned by position. */
  features?: { title: string; description: string; icon?: LucideIcon }[];
  /** Render content only, for use inside a full-width <SectionBand tone="dark">. */
  bare?: boolean;
}) {
  return (
    <section
      className={
        bare
          ? 'space-y-8 sm:space-y-12 lg:space-y-14'
          : 'surface-dark rounded-2xl px-6 py-14 sm:px-10 sm:py-20 lg:px-14 space-y-8 sm:space-y-12 lg:space-y-14'
      }
    >
      <SectionHeading title={title} subtitle={subtitle} dark />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {features.map((feature, i) => {
          const Icon = feature.icon ?? featureIcons[i % featureIcons.length];
          return (
            <div key={feature.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-dark-surface)] p-6">
              <span className="w-11 h-11 rounded-xl bg-[var(--color-brand)] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[var(--color-on-brand)]" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-[17px] font-semibold text-[var(--color-ink)]">{feature.title}</h3>
              <p className="mt-2 text-base text-[var(--color-text-secondary)] leading-relaxed">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ExportFormatsSection({
  title = 'Export to Excel, CSV, QuickBooks, Xero & Quicken',
  subtitle = 'Each export uses the headers your software expects, so imports work the first time.',
  excludeSlug,
}: {
  title?: string;
  subtitle?: string;
  excludeSlug?: string;
}) {
  return (
    <section className="space-y-8 sm:space-y-12 lg:space-y-14">
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {exportFormats
          .filter((f) => f.slug !== excludeSlug)
          .map((f) => (
            <Link
              key={f.slug}
              href={`/convert/${f.slug}`}
              className="card-surface group p-5 sm:p-6 hover:border-[var(--color-border-hover)] flex items-start gap-4"
            >
              <span className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-[var(--color-brand-dark)]" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[17px] font-semibold text-[var(--color-ink)]">{f.fmt}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.use}</p>
              </div>
              <ChevronRight className="w-4 h-4 mt-1 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-dark)] group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
            </Link>
          ))}
      </div>
    </section>
  );
}

export interface SecurityPoint {
  icon: LucideIcon;
  title: string;
  body: string;
}

export function SecuritySection({
  title = 'Your Bank Statements Stay Private',
  points = securityPoints,
  bare = false,
}: {
  title?: string;
  points?: SecurityPoint[];
  /** Render content only, for use inside a <SectionBand>. */
  bare?: boolean;
}) {
  return (
    <section className={`${bare ? '' : 'intro-panel'} grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16 items-start`}>
      <div>
        <span className="w-12 h-12 rounded-2xl bg-[var(--color-success-soft)] flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-[var(--color-success)]" aria-hidden="true" />
        </span>
        <h2 className="type-display mt-5">{title}</h2>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-relaxed text-[var(--color-text-secondary)]">
          Financial documents deserve better than a generic file converter.
        </p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {points.map((p) => (
          <li key={p.title} className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 sm:p-6">
            <span className="w-10 h-10 rounded-xl bg-[var(--color-success-soft)] flex items-center justify-center">
              <p.icon className="w-5 h-5 text-[var(--color-success)]" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-[17px] font-semibold text-[var(--color-ink)]">{p.title}</h3>
            <p className="mt-1.5 text-base text-[var(--color-text-secondary)] leading-relaxed">{p.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ConverterLinksSection({
  title,
  links,
  basePath = '/convert',
  allLink = { href: '/convert', label: 'View all converters' },
}: {
  title: string;
  links: ConverterLink[];
  basePath?: string;
  allLink?: { href: string; label: string };
}) {
  return (
    <section className="space-y-6 sm:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-8">
        <h2 className="type-display max-w-2xl">{title}</h2>
        <Link href={allLink.href} className="link inline-flex items-center gap-1 text-[17px] min-h-[44px] shrink-0">
          {allLink.label}
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
      {/* Three links fill a 3-column row instead of leaving an empty fourth slot. */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${links.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3 sm:gap-4`}>
        {links.map((b) => (
          <Link
            key={b.slug}
            href={`${basePath}/${b.slug}`}
            className="card-surface group p-5 sm:p-6 hover:border-[var(--color-border-hover)] flex sm:flex-col items-center sm:items-start justify-between gap-3"
          >
            <div className="space-y-2 flex flex-col items-start">
              <span className="inline-flex w-fit rounded-full bg-[var(--color-brand-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-dark)]">{b.badge}</span>
              <h3 className="text-[17px] font-semibold text-[var(--color-ink)] leading-snug">{b.name}</h3>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-dark)] shrink-0 sm:hidden" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ComparisonSection({
  title = 'Finlyzers vs Manual Entry vs Generic PDF Converters',
}: {
  title?: string;
}) {
  return (
    <section className="space-y-8 sm:space-y-12">
      <h2 className="type-display text-center max-w-3xl mx-auto">{title}</h2>
      <div className="card-surface overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm" aria-label="Feature comparison between Finlyzers, manual entry, and generic converters">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th scope="col" className="py-4 px-5 sm:px-6 text-[13px] font-medium text-[var(--color-text-muted)]">Feature</th>
              <th scope="col" className="py-4 px-5 sm:px-6 font-semibold text-[var(--color-brand-dark)] bg-[var(--color-brand-soft)]">Finlyzers</th>
              <th scope="col" className="py-4 px-5 sm:px-6 font-medium text-[var(--color-text-secondary)]">Manual entry</th>
              <th scope="col" className="py-4 px-5 sm:px-6 font-medium text-[var(--color-text-secondary)]">Generic converter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {comparisonRows.map(([feature, ours, manual, generic]) => (
              <tr key={feature}>
                <th scope="row" className="py-4 px-5 sm:px-6 font-medium text-[var(--color-ink)]">{feature}</th>
                <td className="py-4 px-5 sm:px-6 font-medium text-[var(--color-ink)] bg-[var(--color-brand-soft)]">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" aria-hidden="true" />
                    {ours}
                  </span>
                </td>
                <td className="py-4 px-5 sm:px-6 text-[var(--color-text-secondary)]">{manual}</td>
                <td className="py-4 px-5 sm:px-6 text-[var(--color-text-secondary)]">{generic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function FaqSection({
  title = 'Bank Statement Converter FAQ',
  subtitle = 'Converting bank statements to Excel, CSV and QuickBooks, answered.',
  faqs,
}: {
  title?: string;
  subtitle?: string;
  faqs: { q: string; a: string }[];
}) {
  return (
    <section className="max-w-3xl mx-auto space-y-8 sm:space-y-10">
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        {faqs.map((faq) => (
          <details key={faq.q} className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between gap-6 py-5 min-h-[44px] cursor-pointer list-none rounded-md">
              <h3 className="text-[17px] sm:text-[19px] font-semibold text-[var(--color-ink)] leading-snug">{faq.q}</h3>
              <span className="w-8 h-8 rounded-full bg-[var(--color-surface-subtle)] group-open:bg-[var(--color-brand-soft)] flex items-center justify-center shrink-0 transition-colors">
                <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] group-open:text-[var(--color-brand-dark)] transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <p className="pb-6 -mt-1 pr-10 text-base sm:text-[17px] text-[var(--color-text-secondary)] leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** Long-form copy rendered from a converter's markdown body. */
export function EditorialSection({ html }: { html: string }) {
  return (
    <section
      className="max-w-3xl mx-auto type-body sm:text-[19px] sm:leading-[1.5] space-y-5 [&_h2]:font-semibold [&_h2]:tracking-[-0.022em] [&_h2]:leading-[1.12] [&_h2]:text-[28px] [&_h2]:sm:text-[36px] [&_h2]:text-[var(--color-ink)] [&_h2]:pt-8 [&_h2:first-child]:pt-0 [&_h3]:text-[21px] [&_h3]:font-semibold [&_h3]:text-[var(--color-ink)] [&_h3]:pt-4 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:mt-2 [&_li]:marker:text-[var(--color-text-muted)] [&_strong]:font-semibold [&_strong]:text-[var(--color-ink)] [&_a]:text-[var(--color-brand-dark)] [&_a]:no-underline [&_a:hover]:underline [&_a]:underline-offset-[3px] [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:bg-[var(--color-surface-muted)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function FinalCtaSection({
  title = 'Stop Retyping Bank Statements',
  subtitle = `Convert your first statement free. No signup needed for statements up to ${FREE_PAGE_LIMIT} pages.`,
  href,
  ctaLabel = 'Convert a Statement Free',
  facts = defaultCtaFacts,
}: {
  title?: string;
  subtitle?: string;
  /** Link target instead of opening the on-page upload picker (for pages without a hero uploader). */
  href?: string;
  ctaLabel?: string;
  facts?: { icon: LucideIcon; label: string }[];
}) {
  const ctaClass = 'btn-brand-primary w-full sm:w-auto !min-h-[50px] !px-8 !text-[17px]';
  return (
    <section id="final-cta" className="text-center rounded-2xl bg-[var(--color-brand-soft)] border border-[var(--color-info-border)] px-5 py-12 sm:px-10 sm:py-16">
      <h2 className="type-display max-w-3xl mx-auto">{title}</h2>
      <p className="mt-4 max-w-xl mx-auto text-base sm:text-lg leading-relaxed text-[var(--color-text-secondary)]">{subtitle}</p>
      <div className="mt-8 sm:mt-10">
        {href ? (
          <Link href={href} className={ctaClass}>
            <span>{ctaLabel}</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        ) : (
          <UploadCtaButton label={ctaLabel} className={ctaClass} />
        )}
      </div>
      <p className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-[var(--color-text-secondary)]">
        {facts.map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5"><Icon className="w-4 h-4 text-[var(--color-success)]" aria-hidden="true" /> {label}</span>
        ))}
      </p>
    </section>
  );
}
