import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2, Lock, ArrowRight, XCircle, ShieldCheck, Trash2, KeyRound, BrainCircuit,
  TableProperties, Layers, Cpu, UploadCloud, FileSpreadsheet, Download, ChevronDown, Sparkles,
  type LucideIcon,
} from 'lucide-react';
import UploadCtaButton from './UploadCtaButton';

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
  { fmt: 'Excel (.xlsx)', use: 'Analysis, budgeting and bookkeeping in Excel or Google Sheets', slug: 'bank-statement-to-excel' },
  { fmt: 'CSV (.csv)', use: 'Convert PDF bank statement to CSV for any accounting tool', slug: 'bank-statement-to-csv' },
  { fmt: 'QuickBooks (.qbo)', use: 'Import bank statements into QuickBooks in one click', slug: 'bank-statement-to-qbo' },
  { fmt: 'Xero / OFX (.ofx)', use: 'Bank reconciliation in Xero and other OFX apps', slug: 'bank-statement-to-ofx' },
  { fmt: 'Quicken (.qif)', use: 'Load transactions into Quicken and legacy software', slug: 'bank-statement-to-qif' },
];

export const defaultSteps: Step[] = [
  { icon: UploadCloud, title: 'Upload your bank statement PDF', body: 'Drop a PDF, scanned statement or photo. Password-protected files are supported.' },
  { icon: Cpu, title: 'AI extracts every transaction', body: 'Dates, descriptions, debits, credits and balances are read and checked against your closing balance.' },
  { icon: Download, title: 'Download Excel, CSV, QBO or OFX', body: 'Get a clean spreadsheet or accounting file ready for analysis, reconciliation or tax filing.' },
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
  { title: 'Password-Protected PDFs', description: 'Unlock statements from HDFC, ICICI, Amex and more right in your browser.' },
  { title: 'Annual Statement Merge', description: 'Combine 12 monthly statements into one annual ledger with summaries.' },
];
const featureIcons: LucideIcon[] = [TableProperties, Cpu, Lock, Layers, Sparkles];

const metrics = [
  ['12.4M+', 'Transactions extracted'],
  ['99.8%', 'Ledger precision'],
  ['< 5 sec', 'Average conversion'],
  ['50+', 'Bank formats ready'],
];

const securityPoints = [
  { icon: ShieldCheck, title: 'Encrypted in transit', body: 'Every upload travels over 256-bit SSL/TLS.' },
  { icon: Trash2, title: 'Auto-deleted in 24 hours', body: 'Guest uploads and their results are deleted automatically 24 hours after upload.' },
  { icon: KeyRound, title: 'Passwords never stored', body: 'Protected PDFs are unlocked for processing only.' },
  { icon: BrainCircuit, title: 'Never used for AI training', body: 'Your statements are not shared or used to train models.' },
];

const comparisonRows = [
  ['Time for a 10-page statement', '< 5 seconds', '45–60 minutes', '2–3 minutes'],
  ['Debit & credit columns', 'Split automatically', 'Manual sorting', 'Merged / single column'],
  ['Balance check', 'Automatic', 'Calculator', 'None'],
  ['Password-protected PDFs', 'Supported', 'Manual unlock', 'Usually fails'],
  ['Scanned PDFs & photos', 'OCR included', 'Retype by hand', 'Limited'],
  ['Export formats', 'XLSX, CSV, QBO, OFX, QIF, PDF', 'Excel only', 'Basic CSV'],
];

const linkUnderline =
  'font-semibold text-[var(--color-ink)] underline underline-offset-4 decoration-[var(--color-brand)] decoration-2';

export function SectionHeading({
  title,
  subtitle,
  dark = false,
}: {
  title: string;
  subtitle?: string;
  dark?: boolean;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto space-y-3">
      <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${dark ? 'text-[var(--color-on-dark)]' : 'text-[var(--color-ink)]'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-base sm:text-lg leading-relaxed ${dark ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-secondary)]'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function MetricsStrip() {
  return (
    <section aria-label="Finlyzers in numbers" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-6 sm:py-8">
      <p className="text-center text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
        Trusted by accountants, CAs, small businesses &amp; analysts
      </p>
      <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4">
        {metrics.map(([value, label]) => (
          <div key={label} className="text-center">
            <dt className="sr-only">{label}</dt>
            <dd className="text-2xl sm:text-4xl font-extrabold text-[var(--color-ink)] tabular-nums">{value}</dd>
            <dd className="mt-1 text-sm text-[var(--color-text-secondary)]">{label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function HowItWorksSection({
  title = 'How to Convert a Bank Statement to Excel',
  subtitle = 'Three steps, about a minute. Works with digital PDFs, scanned statements and phone photos.',
  steps = defaultSteps,
}: {
  title?: string;
  subtitle?: string;
  steps?: Step[];
}) {
  return (
    <section className="space-y-8 sm:space-y-10">
      <SectionHeading title={title} subtitle={subtitle} />
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {steps.map((s, i) => (
          <li key={s.title} className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] font-extrabold flex items-center justify-center">
                {i + 1}
              </span>
              <s.icon className="w-5 h-5 text-[var(--color-text-secondary)]" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-ink)]">{s.title}</h3>
            <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="flex justify-center">
        <UploadCtaButton label="Upload Your Statement" />
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
    <section className="space-y-8 sm:space-y-10">
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        <div className="min-w-0 p-5 sm:p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-danger-border)] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-danger-border)]">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--color-danger)]">
              <XCircle className="w-4 h-4" />
              Copy-paste from a PDF
            </h3>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">Before</span>
          </div>
          <div className="font-mono text-xs sm:text-[13px] text-[var(--color-text-secondary)] bg-[var(--color-surface-subtle)] p-4 rounded-lg leading-relaxed space-y-1 overflow-x-auto">
            {rawLines.map((line) => (
              <p key={line} className="whitespace-nowrap">{line}</p>
            ))}
          </div>
          <p className="text-sm text-[var(--color-danger)]">
            Amounts and balances merged into one line, no debit/credit split, nothing verified.
          </p>
        </div>

        <div className="min-w-0 p-5 sm:p-6 rounded-xl bg-[var(--color-surface)] border-2 border-[var(--color-brand)] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-brand-soft)]">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--color-ink)]">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-hover)]" />
              {fileOutput ? `Finlyzers ${fileOutput.label} output` : 'Finlyzers output'}
            </h3>
            <span className="feature-badge">Balances verified</span>
          </div>
          {fileOutput ? (
            <pre className="font-mono text-xs sm:text-[13px] text-[var(--color-ink)] bg-[var(--color-surface-subtle)] p-4 rounded-lg leading-relaxed overflow-x-auto">
              {fileOutput.lines.join('\n')}
            </pre>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] font-semibold text-[var(--color-text-secondary)]">
                    <th scope="col" className="py-2 px-2">Date</th>
                    <th scope="col" className="py-2 px-2">Description</th>
                    <th scope="col" className="py-2 px-2 text-right">Debit</th>
                    <th scope="col" className="py-2 px-2 text-right">Credit</th>
                    <th scope="col" className="hidden sm:table-cell py-2 px-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] font-mono">
                  {rows.map((row) => (
                    <tr key={`${row.date}-${row.desc}`}>
                      <td className="py-2 px-2 text-[var(--color-text-secondary)] whitespace-nowrap">{row.date}</td>
                      <td className="py-2 px-2 font-sans font-medium text-[var(--color-ink)]">{row.desc}</td>
                      <td className="py-2 px-2 text-right text-[var(--color-ink)] whitespace-nowrap">{row.debit || '—'}</td>
                      <td className="py-2 px-2 text-right font-semibold text-[var(--color-success)] whitespace-nowrap">{row.credit || '—'}</td>
                      <td className="hidden sm:table-cell py-2 px-2 text-right text-[var(--color-ink)] whitespace-nowrap">{row.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-sm text-[var(--color-text-secondary)]">
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
}: {
  title?: string;
  subtitle?: string;
  features?: { title: string; description: string }[];
}) {
  return (
    <section className="bg-[var(--color-dark-bg)] rounded-xl px-5 py-12 sm:px-10 sm:py-16 lg:px-14 space-y-10">
      <SectionHeading title={title} subtitle={subtitle} dark />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, i) => {
          const Icon = featureIcons[i % featureIcons.length];
          return (
            <div key={feature.title} className="p-6 rounded-xl bg-[var(--color-ink-soft)] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)] flex items-center justify-center">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-on-dark)]">{feature.title}</h3>
              <p className="text-base text-[var(--color-text-muted)] leading-relaxed">{feature.description}</p>
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
    <section className="space-y-8 sm:space-y-10">
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {exportFormats
          .filter((f) => f.slug !== excludeSlug)
          .map((f) => (
            <Link
              key={f.slug}
              href={`/convert/${f.slug}`}
              className="group p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors flex items-start gap-4"
            >
              <span className="w-10 h-10 rounded-lg bg-[var(--color-brand-soft)] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-[var(--color-ink)]" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-[var(--color-ink)]">{f.fmt}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{f.use}</p>
              </div>
              <ArrowRight className="w-4 h-4 mt-1 text-[var(--color-text-muted)] group-hover:text-[var(--color-ink)] group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
            </Link>
          ))}
      </div>
    </section>
  );
}

export function SecuritySection({ title = 'Your Bank Statements Stay Private' }: { title?: string }) {
  return (
    <section className="intro-panel grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 items-start">
      <div className="space-y-3">
        <ShieldCheck className="w-10 h-10 text-[var(--color-ink)]" aria-hidden="true" />
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight">{title}</h2>
        <p className="text-base sm:text-lg text-[var(--color-text-secondary)]">
          Financial documents deserve better than a generic file converter.
        </p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {securityPoints.map((p) => (
          <li key={p.title} className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
            <p.icon className="w-5 h-5 text-[var(--color-brand-hover)]" aria-hidden="true" />
            <h3 className="text-base font-bold text-[var(--color-ink)]">{p.title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{p.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ConverterLinksSection({ title, links }: { title: string; links: ConverterLink[] }) {
  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight max-w-2xl">{title}</h2>
        <Link href="/convert" className={`inline-flex items-center gap-1.5 text-base min-h-[44px] ${linkUnderline}`}>
          View all converters
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {links.map((b) => (
          <Link
            key={b.slug}
            href={`/convert/${b.slug}`}
            className="group p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors flex sm:flex-col items-center sm:items-start justify-between gap-3"
          >
            <div className="space-y-2">
              <span className="feature-badge">{b.badge}</span>
              <h3 className="text-base font-bold text-[var(--color-ink)]">{b.name}</h3>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-ink)] shrink-0 sm:hidden" aria-hidden="true" />
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
    <section className="space-y-6 sm:space-y-8">
      <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight max-w-3xl mx-auto">
        {title}
      </h2>
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-ink)]">
              <th scope="col" className="py-4 px-5 font-semibold">Feature</th>
              <th scope="col" className="py-4 px-5 font-extrabold bg-[var(--color-brand-soft)]">Finlyzers</th>
              <th scope="col" className="py-4 px-5 font-semibold text-[var(--color-text-secondary)]">Manual entry</th>
              <th scope="col" className="py-4 px-5 font-semibold text-[var(--color-text-secondary)]">Generic converter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {comparisonRows.map(([feature, ours, manual, generic]) => (
              <tr key={feature}>
                <th scope="row" className="py-3.5 px-5 font-semibold text-[var(--color-ink)]">{feature}</th>
                <td className="py-3.5 px-5 font-bold text-[var(--color-ink)] bg-[var(--color-brand-soft)]/50">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-hover)] shrink-0" aria-hidden="true" />
                    {ours}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-[var(--color-text-secondary)]">{manual}</td>
                <td className="py-3.5 px-5 text-[var(--color-text-secondary)]">{generic}</td>
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
    <section className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        {faqs.map((faq) => (
          <details key={faq.q} className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">{faq.q}</h3>
              <ChevronDown className="w-5 h-5 shrink-0 text-[var(--color-text-muted)] transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="pb-5 -mt-1 text-base text-[var(--color-text-secondary)] leading-relaxed">{faq.a}</p>
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
      className="max-w-3xl mx-auto text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed space-y-4 [&_h2]:text-3xl [&_h2]:sm:text-4xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-[var(--color-ink)] [&_h2]:pt-6 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[var(--color-ink)] [&_h3]:pt-4 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:mt-2 [&_strong]:text-[var(--color-ink)] [&_a]:font-semibold [&_a]:text-[var(--color-ink)] [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[var(--color-brand)] [&_a]:decoration-2 [&_code]:font-mono [&_code]:text-sm [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-[var(--color-surface-subtle)] [&_code]:border [&_code]:border-[var(--color-border)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function FinalCtaSection({
  title = 'Stop Retyping Bank Statements',
  subtitle = 'Convert your first statement free. No signup needed for statements up to 10 pages.',
  href,
}: {
  title?: string;
  subtitle?: string;
  /** Link target instead of opening the on-page upload picker (for pages without a hero uploader). */
  href?: string;
}) {
  const ctaClass = 'btn-brand-primary w-full sm:w-auto !min-h-[60px] !px-10';
  return (
    <section id="final-cta" className="rounded-xl bg-[var(--color-ink)] px-5 py-12 sm:py-16 text-center space-y-5">
      <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--color-on-dark)] tracking-tight max-w-2xl mx-auto">
        {title}
      </h2>
      <p className="text-base sm:text-lg text-[var(--color-text-muted)] max-w-xl mx-auto">{subtitle}</p>
      {href ? (
        <Link href={href} className={ctaClass}>
          <span>Convert a Statement Free</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      ) : (
        <UploadCtaButton className={ctaClass} />
      )}
      <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-1.5"><UploadCloud className="w-4 h-4" aria-hidden="true" /> PDF, scans &amp; photos</span>
        <span className="inline-flex items-center gap-1.5"><Download className="w-4 h-4" aria-hidden="true" /> Excel, CSV, QBO, OFX, QIF</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" aria-hidden="true" /> Auto-deleted in 24h</span>
      </p>
    </section>
  );
}
