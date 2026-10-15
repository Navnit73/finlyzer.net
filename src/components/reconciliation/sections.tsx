import React from 'react';
import { BrainCircuit, CheckCircle2, KeyRound, ShieldCheck, Trash2, Workflow } from 'lucide-react';
import { SectionHeading, type SecurityPoint } from '@/components/converter/sections';
import { FREE_PAGE_LIMIT, GUEST_MAX_PAGES } from '@/types/pricing';
import { RECONCILIATION_GUEST_RETENTION_DAYS } from '@/lib/retention';
import type { SEOReconSampleRow } from '@/types/seo';

/* Marketing sections specific to the /reconcile pages. Product facts only, tied to code constants. */

export const reconciliationMetrics = [
  [`${FREE_PAGE_LIMIT} pages`, 'Free per reconciliation, no signup'],
  [`${GUEST_MAX_PAGES} pages`, 'As a guest, with a one-time unlock'],
  ['0–31 days', 'Adjustable date tolerance'],
  ['XLSX & CSV', 'Full report download'],
];

export const reconciliationSecurityPoints: SecurityPoint[] = [
  { icon: ShieldCheck, title: 'Encrypted in transit', body: 'Both files are uploaded over HTTPS (TLS).' },
  {
    icon: KeyRound,
    title: 'Private report links',
    body: 'A guest report opens only with the access key kept in the browser that uploaded it. Signed-in reports open only for your account.',
  },
  {
    icon: Trash2,
    title: `Guest reports deleted after ${RECONCILIATION_GUEST_RETENTION_DAYS} days`,
    body: 'Guest reconciliations and their extracted data are deleted automatically. Download the report if you need to keep it.',
  },
  { icon: BrainCircuit, title: 'Never used for AI training', body: 'Your statements and ledgers are not shared or used to train models.' },
];

/** Illustrative bank-vs-ledger rows with the outcome the matcher would report for each. */
export function SampleMatchSection({ title, subtitle, rows }: { title: string; subtitle: string; rows: SEOReconSampleRow[] }) {
  return (
    <section className="space-y-8 sm:space-y-10">
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full min-w-[720px] text-left text-sm" aria-label="Example bank statement and ledger comparison">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
              <th scope="col" className="py-3 px-4 font-semibold">Date</th>
              <th scope="col" className="py-3 px-4 font-semibold">Bank statement</th>
              <th scope="col" className="py-3 px-4 font-semibold text-right">Amount</th>
              <th scope="col" className="py-3 px-4 font-semibold">Ledger</th>
              <th scope="col" className="py-3 px-4 font-semibold text-right">Amount</th>
              <th scope="col" className="py-3 px-4 font-semibold">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {rows.map((row) => {
              const matched = row.result.toLowerCase().startsWith('matched');
              return (
                <tr key={`${row.date}-${row.bankDesc}-${row.ledgerDesc}`}>
                  <td className="py-3 px-4 font-mono text-[var(--color-text-secondary)] whitespace-nowrap">{row.date}</td>
                  <td className="py-3 px-4 text-[var(--color-ink)]">{row.bankDesc || '—'}</td>
                  <td className="py-3 px-4 font-mono text-right whitespace-nowrap text-[var(--color-ink)]">{row.bankAmount || '—'}</td>
                  <td className="py-3 px-4 text-[var(--color-ink)]">{row.ledgerDesc || '—'}</td>
                  <td className="py-3 px-4 font-mono text-right whitespace-nowrap text-[var(--color-ink)]">{row.ledgerAmount || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        matched
                          ? 'bg-[var(--color-brand-soft)] text-[var(--color-on-brand)]'
                          : 'bg-[var(--color-warning-soft)] text-[var(--color-ink)] border border-[var(--color-warning-border)]'
                      }`}
                    >
                      {matched && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
                      {row.result}
                    </span>
                  </td>
                </tr>
              );
            })}
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
    <section className="space-y-8 sm:space-y-10">
      <SectionHeading title="What the Reconciliation Report Shows" subtitle="Six sections, on screen and in the Excel or CSV download." />
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {items.map(([title, body]) => (
          <li key={title} className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
            <Workflow className="w-5 h-5 text-[var(--color-brand-dark)]" aria-hidden="true" />
            <h3 className="text-base font-bold text-[var(--color-ink)]">{title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
