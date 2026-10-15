import React from 'react';
import {
  ArrowLeftRight, CalendarClock, CheckCircle2, Copy, GitCompareArrows, Hash, ListChecks, Scale, ScanText, TableProperties,
  type LucideIcon,
} from 'lucide-react';
import { SectionHeading } from '@/components/converter/sections';
import { FREE_PAGE_LIMIT, GUEST_MAX_PAGES } from '@/types/pricing';
import type { SEOReconSampleRow } from '@/types/seo';

/* Marketing sections specific to the /reconcile pages. Product facts only, tied to code constants. */

export const reconciliationMetrics = [
  [`${FREE_PAGE_LIMIT} pages`, 'Free per reconciliation, no signup'],
  [`${GUEST_MAX_PAGES} pages`, 'As a guest, with a one-time unlock'],
  ['0–31 days', 'Adjustable date tolerance'],
  ['XLSX & CSV', 'Full report download'],
];

/** Icons for the `icon` key on a /reconcile page's features frontmatter. */
export const reconciliationFeatureIcons: Record<string, LucideIcon> = {
  scan: ScanText,
  rules: ListChecks,
  direction: ArrowLeftRight,
  balance: Scale,
  reference: Hash,
  dates: CalendarClock,
  duplicates: Copy,
  layout: TableProperties,
  compare: GitCompareArrows,
};

function ResultPill({ result }: { result: string }) {
  const matched = result.toLowerCase().startsWith('matched');
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
        matched
          ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
          : 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]'
      }`}
    >
      {matched && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
      {result}
    </span>
  );
}

/** Illustrative bank-vs-ledger rows with the outcome the matcher would report for each. */
export function SampleMatchSection({ title, subtitle, rows }: { title: string; subtitle: string; rows: SEOReconSampleRow[] }) {
  return (
    <section className="space-y-10 sm:space-y-12">
      <SectionHeading title={title} subtitle={subtitle} />

      {/* Phones: one card per line, so both sides and the result are visible without sideways scrolling. */}
      <ul className="sm:hidden space-y-3" aria-label="Example bank statement and ledger comparison">
        {rows.map((row) => (
          <li key={`${row.date}-${row.bankDesc}-${row.ledgerDesc}`} className="card-surface p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] tabular-nums text-[var(--color-text-muted)]">{row.date}</span>
              <ResultPill result={row.result} />
            </div>
            <dl className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2 text-sm">
              {[
                ['Bank', row.bankDesc, row.bankAmount],
                ['Ledger', row.ledgerDesc, row.ledgerAmount],
              ].map(([side, desc, amount]) => (
                <React.Fragment key={side}>
                  <dt className="text-[13px] text-[var(--color-text-muted)] pt-px">{side}</dt>
                  <dd className={`min-w-0 break-words ${desc ? 'text-[var(--color-ink)]' : 'text-[var(--color-text-muted)]'}`}>{desc || 'Not recorded'}</dd>
                  <dd className="tabular-nums text-right whitespace-nowrap text-[var(--color-ink)]">{amount || '—'}</dd>
                </React.Fragment>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden sm:block overflow-x-auto card-surface">
        <table className="w-full min-w-[720px] text-left text-sm" aria-label="Example bank statement and ledger comparison">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[13px] text-[var(--color-text-muted)]">
              <th scope="col" className="py-3.5 px-5 font-medium">Date</th>
              <th scope="col" className="py-3.5 px-5 font-medium">Bank statement</th>
              <th scope="col" className="py-3.5 px-5 font-medium text-right">Amount</th>
              <th scope="col" className="py-3.5 px-5 font-medium border-l border-[var(--color-border-subtle)]">Ledger</th>
              <th scope="col" className="py-3.5 px-5 font-medium text-right">Amount</th>
              <th scope="col" className="py-3.5 px-5 font-medium">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {rows.map((row) => (
              <tr key={`${row.date}-${row.bankDesc}-${row.ledgerDesc}`}>
                <td className="py-3.5 px-5 tabular-nums text-[var(--color-text-secondary)] whitespace-nowrap">{row.date}</td>
                <td className="py-3.5 px-5 text-[var(--color-ink)]">{row.bankDesc || '—'}</td>
                <td className="py-3.5 px-5 tabular-nums text-right whitespace-nowrap text-[var(--color-ink)]">{row.bankAmount || '—'}</td>
                <td className="py-3.5 px-5 text-[var(--color-ink)] border-l border-[var(--color-border-subtle)]">{row.ledgerDesc || '—'}</td>
                <td className="py-3.5 px-5 tabular-nums text-right whitespace-nowrap text-[var(--color-ink)]">{row.ledgerAmount || '—'}</td>
                <td className="py-3.5 px-5">
                  <ResultPill result={row.result} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** What every report contains, taken from the reconciliation service's report format. */
export function ReportContentsSection() {
  const items = [
    ['Matched pairs', 'Each bank line next to its ledger entry, with the date gap, what it matched on and a high, medium or low confidence.'],
    ['Only on the bank statement', 'Fees, interest, direct debits and anything else not yet in your books, each with a reason.'],
    ['Only in the ledger', 'Outstanding cheques, deposits in transit and entries that never reached the bank.'],
    ['Amount and direction mismatches', 'Entries clearly linked by reference or description but recorded with a different amount, or as money in instead of out.'],
    ['Possible duplicates', 'Entries repeated within one document with the same date, amount, direction, description and reference. Nothing is removed.'],
    ['Balance checks', 'Opening, closing and running balances for both documents, plus a book-to-bank check that the differences found explain the gap.'],
  ];
  return (
    <section className="space-y-10 sm:space-y-12">
      <SectionHeading title="What the Reconciliation Report Shows" subtitle="Six sections, on screen and in the Excel or CSV download." />
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 sm:gap-y-10">
        {items.map(([title, body], i) => (
          <li key={title} className="pt-5 border-t border-[var(--color-border)] space-y-2">
            <span className="block text-[13px] tabular-nums text-[var(--color-text-muted)]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="type-headline !text-[19px]">{title}</h3>
            <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
