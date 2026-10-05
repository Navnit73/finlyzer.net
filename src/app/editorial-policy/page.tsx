import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { absoluteUrl } from '@/lib/seo-config';

const title = 'Editorial Policy & Methodology';
const description =
  'How Finlyzer extracts transactions from bank statements with OCR and AI, how running-balance checks verify the result, known limitations, and how our guides are written.';

export const metadata: Metadata = {
  title: { absolute: `${title} | Finlyzer` },
  description,
  alternates: { canonical: absoluteUrl('/editorial-policy') },
  openGraph: { title: `${title} | Finlyzer`, description, url: absoluteUrl('/editorial-policy'), type: 'website' },
};

const steps = [
  {
    name: 'Read the document',
    text: 'Digital PDFs are read from their text layer. Scanned PDFs and photos are read with OCR. Password-protected PDFs are opened with the password you enter.',
  },
  {
    name: 'Identify the structure',
    text: 'An AI vision model locates the transaction table and the statement details: account holder, account number, statement period, and opening and closing balances.',
  },
  {
    name: 'Extract transactions',
    text: 'Each row becomes a transaction with date, description, debit, credit, and running balance, normalized to one date and number format.',
  },
  {
    name: 'Verify with the running balance',
    text: 'Starting from the opening balance, each transaction is applied and compared with the balance printed on the statement. Mismatches are flagged instead of silently corrected.',
  },
  {
    name: 'Export',
    text: 'The verified ledger is written to Excel, CSV, QBO, OFX, QIF, or PDF, using each format’s standard fields.',
  },
];

const sections: LegalSection[] = [
  {
    id: 'how-it-works',
    heading: 'How extraction works',
    body: (
      <ol className="space-y-3 list-decimal pl-5">
        {steps.map((s) => (
          <li key={s.name}>
            <strong>{s.name}.</strong> {s.text}
          </li>
        ))}
      </ol>
    ),
  },
  {
    id: 'verification',
    heading: 'Why the balance check matters',
    body: (
      <p>
        A bank statement is self-checking: every running balance must equal the previous balance plus credits minus
        debits. Recomputing that chain catches the most common extraction errors, such as a missed row, a debit read as
        a credit, or a misread digit, and shows you exactly where they are.
      </p>
    ),
  },
  {
    id: 'limitations',
    heading: 'Known limitations',
    body: (
      <ul>
        <li>Low-resolution, skewed, or heavily compressed scans reduce OCR accuracy.</li>
        <li>Handwritten notes and stamps over the transaction table may be misread.</li>
        <li>Statements without printed running balances cannot be fully verified with the balance check.</li>
        <li>Unusual layouts, merged cells, or multiple currencies in one table may need manual review.</li>
      </ul>
    ),
  },
  {
    id: 'accuracy',
    heading: 'How we talk about accuracy',
    body: (
      <p>
        Accuracy figures describe typical results on clean statements and are not a guarantee for any single document.
        We always recommend reviewing flagged rows. See the <Link href="/disclaimer">Disclaimer</Link>.
      </p>
    ),
  },
  {
    id: 'content',
    heading: 'How our guides are written',
    body: (
      <ul>
        <li>Converter guides describe features that exist in the product today.</li>
        <li>Bank-specific pages describe statement layouts we support; bank names are used only for compatibility.</li>
        <li>Pages are reviewed when the product or a supported format changes, and dated when updated.</li>
        <li>We do not accept payment to feature or rank any bank or software.</li>
      </ul>
    ),
  },
];

export default function EditorialPolicyPage() {
  return (
    <LegalPage
      path="/editorial-policy"
      title={title}
      intro={
        <p>
          How Finlyzer turns a bank statement into clean data, how the result is verified, where it can go wrong, and
          the standards we follow when writing guides.
        </p>
      }
      sections={sections}
      jsonLd={[
        {
          '@type': 'HowTo',
          name: 'How Finlyzer converts a bank statement',
          step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
        },
      ]}
    />
  );
}
