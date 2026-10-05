import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { absoluteUrl } from '@/lib/seo-config';
import { GUEST_RETENTION_HOURS } from '@/lib/retention';
import { FREE_PAGE_LIMIT } from '@/types/pricing';

const title = 'Frequently Asked Questions';
const description =
  'Answers about Finlyzer: data safety and retention, conversion accuracy, supported files and export formats, pricing, and accounts.';

export const metadata: Metadata = {
  title: { absolute: `FAQ: Bank Statement Converter | Finlyzer` },
  description,
  alternates: { canonical: absoluteUrl('/faq') },
  openGraph: { title: `FAQ | Finlyzer`, description, url: absoluteUrl('/faq'), type: 'website' },
};

interface Faq {
  q: string;
  /** Plain text used for FAQPage structured data. */
  a: string;
  /** Optional rich version with links, shown on the page. */
  rich?: React.ReactNode;
}

const groups: { id: string; heading: string; faqs: Faq[] }[] = [
  {
    id: 'data-safety',
    heading: 'Data safety',
    faqs: [
      {
        q: 'Is my bank statement data safe?',
        a: 'Files are sent over encrypted HTTPS, saved documents are only accessible to the account that owns them, and we never store card details or PDF passwords.',
        rich: (
          <>
            Files are sent over encrypted HTTPS, saved documents are only accessible to the account that owns them, and
            we never store card details or PDF passwords. See <Link href="/security">Security &amp; Data Handling</Link>.
          </>
        ),
      },
      {
        q: 'How long do you keep my files?',
        a: `Guest uploads are deleted automatically ${GUEST_RETENTION_HOURS} hours after upload. If you are signed in, converted statements stay in your vault until you delete them or delete your account.`,
      },
      {
        q: 'Can I delete my data?',
        a: 'Yes. Delete any document from the Document Vault, or delete your whole account, including all documents and orders, from the dashboard.',
      },
      {
        q: 'Do you sell my data?',
        a: 'No. We do not sell personal data or documents, and we do not use them for advertising.',
      },
    ],
  },
  {
    id: 'accuracy',
    heading: 'Accuracy',
    faqs: [
      {
        q: 'How accurate is the conversion?',
        a: 'Accuracy is highest on digital PDFs and good-quality scans. When a statement prints a running balance, Finlyzer recomputes it row by row and flags any row that does not match, so you know exactly what to review.',
      },
      {
        q: 'Do I still need to check the output?',
        a: 'Yes. Always review flagged rows and confirm the opening and closing balances, especially for tax, lending, or audit use. Finlyzer is not financial advice.',
        rich: (
          <>
            Yes. Always review flagged rows and confirm the opening and closing balances, especially for tax, lending, or
            audit use. Finlyzer is not financial advice; see the <Link href="/disclaimer">Disclaimer</Link> and our{' '}
            <Link href="/editorial-policy">Methodology</Link>.
          </>
        ),
      },
    ],
  },
  {
    id: 'formats',
    heading: 'Files and formats',
    faqs: [
      {
        q: 'Which files can I upload?',
        a: 'Digital and scanned PDFs, and images (PNG, JPG, WEBP, TIFF), up to 50 MB per file. Password-protected PDFs are supported.',
      },
      {
        q: 'Which export formats are available?',
        a: 'Excel (.xlsx), CSV, QuickBooks (.qbo), Xero and other OFX-compatible software (.ofx), Quicken (.qif), and PDF.',
      },
      {
        q: 'Can I convert many statements at once?',
        a: 'Yes. Signed-in users can batch upload up to 50 files and merge their cash flows into one workbook.',
      },
    ],
  },
  {
    id: 'pricing',
    heading: 'Pricing',
    faqs: [
      {
        q: 'Is Finlyzer free?',
        a: `Statements up to ${FREE_PAGE_LIMIT} pages are free to convert and download in every format, with no card required.`,
      },
      {
        q: 'How much does a longer statement cost?',
        a: 'A statement of 11 to 30 pages needs a one-time $10 Document Pass. For larger or regular volumes, page credit packs start at $25 and never expire.',
        rich: (
          <>
            A statement of 11 to 30 pages needs a one-time $10 Document Pass. For larger or regular volumes, page credit
            packs start at $25 and never expire. See <Link href="/pricing">Pricing</Link>.
          </>
        ),
      },
      {
        q: 'Am I charged if a conversion fails?',
        a: 'No. Page credits are only used when a document is converted successfully.',
      },
    ],
  },
];

export default function FaqPage() {
  const sections: LegalSection[] = groups.map((g) => ({
    id: g.id,
    heading: g.heading,
    body: (
      <div className="space-y-2">
        {g.faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] open:bg-[var(--color-surface-subtle)]"
          >
            <summary className="flex items-center gap-3 p-4 cursor-pointer list-none font-bold text-sm text-[var(--color-ink)]">
              <span className="flex-1">{f.q}</span>
              <ChevronDown
                className="w-4 h-4 text-[var(--color-text-muted)] transition-transform group-open:rotate-180 shrink-0"
                aria-hidden="true"
              />
            </summary>
            <p className="px-4 pb-4 -mt-1">{f.rich ?? f.a}</p>
          </details>
        ))}
      </div>
    ),
  }));

  return (
    <LegalPage
      path="/faq"
      title={title}
      intro={<p>Quick answers about data safety, accuracy, supported formats, and pricing.</p>}
      sections={sections}
      jsonLd={[
        {
          '@type': 'FAQPage',
          mainEntity: groups.flatMap((g) =>
            g.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
          ),
        },
      ]}
    />
  );
}
