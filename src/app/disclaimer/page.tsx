import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { absoluteUrl } from '@/lib/seo-config';

const title = 'Disclaimer';
const description =
  'Finlyzer converts financial documents automatically. It is not financial, tax, or legal advice, and users must verify converted figures before relying on them.';

export const metadata: Metadata = {
  title: { absolute: `${title} | Finlyzer` },
  description,
  alternates: { canonical: absoluteUrl('/disclaimer') },
  openGraph: { title: `${title} | Finlyzer`, description, url: absoluteUrl('/disclaimer'), type: 'website' },
};

const sections: LegalSection[] = [
  {
    id: 'not-advice',
    heading: 'Not financial, tax, or legal advice',
    body: (
      <p>
        Finlyzer is a document conversion tool. Nothing it produces, including summaries, cash flow figures, or
        categorized transactions, is financial, investment, tax, accounting, or legal advice. Consult a qualified
        professional before making decisions.
      </p>
    ),
  },
  {
    id: 'verify',
    heading: 'You must verify the output',
    body: (
      <>
        <p>
          Extraction is automated with OCR and AI. Even with balance checks, results can contain errors, especially with
          low-quality scans, handwriting, unusual layouts, or multi-currency statements.
        </p>
        <ul>
          <li>Compare opening and closing balances with the original statement.</li>
          <li>Re-check any figure used for tax filings, loan applications, audits, or legal matters.</li>
          <li>Review rows flagged by the balance check before exporting.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'no-liability',
    heading: 'No liability for decisions',
    body: (
      <p>
        Finlyzer is not responsible for losses or decisions based on converted data. See section 8 of the{' '}
        <Link href="/terms">Terms &amp; Conditions</Link> for the full limitation of liability.
      </p>
    ),
  },
  {
    id: 'accuracy-figures',
    heading: 'About accuracy figures',
    body: (
      <p>
        Accuracy figures on this site describe typical results and are not a guarantee for any individual document. See
        the <Link href="/editorial-policy">Methodology</Link> page for how extraction and verification work and their
        limitations.
      </p>
    ),
  },
  {
    id: 'third-party',
    heading: 'Third-party names',
    body: (
      <p>
        Bank and software names (such as Chase, HDFC, QuickBooks, or Xero) are used only to describe compatibility.
        Finlyzer is not affiliated with or endorsed by them.
      </p>
    ),
  },
];

export default function DisclaimerPage() {
  return (
    <LegalPage
      path="/disclaimer"
      title={title}
      intro={<p>Please read this before relying on any data converted with Finlyzer.</p>}
      sections={sections}
    />
  );
}
