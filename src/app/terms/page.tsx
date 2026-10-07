import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { pageMetadata } from '@/lib/seo-config';
import { GUEST_RETENTION_HOURS } from '@/lib/retention';
import { FREE_PAGE_LIMIT } from '@/types/pricing';

const title = 'Terms & Conditions';
const description =
  'The rules for using Finlyzers: acceptable use, usage limits, page credits and payments, refunds, and limitation of liability.';

export const metadata: Metadata = pageMetadata({ title: `${title} | Finlyzers`, description, path: '/terms' });

const sections: LegalSection[] = [
  {
    id: 'acceptance',
    heading: '1. Acceptance',
    body: (
      <p>
        By using Finlyzers you agree to these terms and to our <Link href="/privacy-policy">Privacy Policy</Link>. If you
        do not agree, do not use the service.
      </p>
    ),
  },
  {
    id: 'service',
    heading: '2. The service',
    body: (
      <p>
        Finlyzers converts bank statements and similar financial documents into structured formats such as Excel, CSV,
        QBO, OFX, QIF, and PDF. Output is generated automatically and may contain errors; see the{' '}
        <Link href="/disclaimer">Disclaimer</Link>.
      </p>
    ),
  },
  {
    id: 'acceptable-use',
    heading: '3. Acceptable use',
    body: (
      <>
        <p>You agree to:</p>
        <ul>
          <li>Upload only documents you own or are authorized to process.</li>
          <li>Not upload malware or content that is unlawful.</li>
          <li>Not attempt to access other users&apos; documents or accounts, or bypass usage limits or payments.</li>
          <li>Not overload, scrape, or reverse-engineer the service.</li>
        </ul>
        <p>We may suspend accounts that break these rules.</p>
      </>
    ),
  },
  {
    id: 'limits',
    heading: '4. Usage limits',
    body: (
      <table>
        <thead>
          <tr>
            <th>Use</th>
            <th>Limit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Free conversion</td>
            <td>Statements up to {FREE_PAGE_LIMIT} pages</td>
          </tr>
          <tr>
            <td>Guest conversion</td>
            <td>Up to 30 pages per statement; 11–30 pages require a $10 Document Pass to download</td>
          </tr>
          <tr>
            <td>Signed-in conversion</td>
            <td>Up to 200 pages per statement, deducted from your page credits</td>
          </tr>
          <tr>
            <td>Batch upload</td>
            <td>Up to 50 files per batch, depending on your plan</td>
          </tr>
          <tr>
            <td>File size</td>
            <td>Up to 50 MB per file</td>
          </tr>
          <tr>
            <td>Guest result availability</td>
            <td>{GUEST_RETENTION_HOURS} hours after upload</td>
          </tr>
        </tbody>
      </table>
    ),
  },
  {
    id: 'payments',
    heading: '5. Page credits and payments',
    body: (
      <ul>
        <li>Prices are shown in USD on the <Link href="/pricing">Pricing</Link> page and are charged once; there is no subscription.</li>
        <li>Purchased page credits are added to your account after payment is confirmed and do not expire.</li>
        <li>One page of a processed document uses one page credit.</li>
        <li>A Document Pass unlocks a single statement of 11–30 pages.</li>
        <li>Credits are tied to your account and cannot be transferred or exchanged for cash.</li>
      </ul>
    ),
  },
  {
    id: 'refunds',
    heading: '6. Refunds',
    body: (
      <ul>
        <li>If a document fails to process, no page credits are deducted.</li>
        <li>Duplicate or erroneous charges are refunded to the original payment method.</li>
        <li>Unused purchased credits are otherwise non-refundable, because they never expire.</li>
      </ul>
    ),
  },
  {
    id: 'your-content',
    heading: '7. Your content',
    body: (
      <p>
        You keep all rights to the documents you upload and the files you export. You give us permission to process
        them only to provide the service, as described in the <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: 'liability',
    heading: '8. Disclaimer and limitation of liability',
    body: (
      <>
        <p>
          The service is provided “as is”. Extraction is automated and we do not guarantee that output is complete or
          error-free. You are responsible for checking results before relying on them for accounting, tax, lending, or
          any other decision.
        </p>
        <p>
          To the extent permitted by law, Finlyzers is not liable for indirect or consequential losses, and our total
          liability for any claim is limited to the amount you paid us in the 12 months before the claim.
        </p>
      </>
    ),
  },
  {
    id: 'termination',
    heading: '9. Termination',
    body: (
      <p>
        You can stop using Finlyzers and delete your account at any time from the dashboard. We may suspend or end access
        for breach of these terms.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: '10. Changes',
    body: (
      <p>
        We may update these terms. The “Last updated” date above shows the current version. Continuing to use the
        service after a change means you accept the updated terms.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      path="/terms"
      title={title}
      description={description}
      intro={<p>These terms govern your use of Finlyzers’s website and bank statement conversion service.</p>}
      sections={sections}
    />
  );
}
