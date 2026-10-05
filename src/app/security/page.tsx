import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { absoluteUrl } from '@/lib/seo-config';
import { GUEST_RETENTION_HOURS } from '@/lib/retention';

const title = 'Security & Data Handling';
const description = `How Finlyzers protects bank statements: encrypted transfer, guest uploads deleted after ${GUEST_RETENTION_HOURS} hours, account-scoped access, and one-click account deletion.`;

export const metadata: Metadata = {
  title: { absolute: `${title} | Finlyzers` },
  description,
  alternates: { canonical: absoluteUrl('/security') },
  openGraph: { title: `${title} | Finlyzers`, description, url: absoluteUrl('/security'), type: 'website' },
};

const sections: LegalSection[] = [
  {
    id: 'at-a-glance',
    heading: 'At a glance',
    body: (
      <table>
        <thead>
          <tr>
            <th>What</th>
            <th>How we handle it</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Uploads in transit</td>
            <td>Sent over HTTPS (TLS) between your browser, our servers, and our processing service.</td>
          </tr>
          <tr>
            <td>Guest uploads</td>
            <td>Deleted automatically {GUEST_RETENTION_HOURS} hours after upload, including extracted transactions.</td>
          </tr>
          <tr>
            <td>Signed-in documents</td>
            <td>Kept in your private vault until you delete them or delete your account.</td>
          </tr>
          <tr>
            <td>PDF passwords</td>
            <td>Used only to open the file for processing. Never saved to our database.</td>
          </tr>
          <tr>
            <td>Card details</td>
            <td>Handled entirely by our payment provider. We never see or store card numbers.</td>
          </tr>
          <tr>
            <td>Account deletion</td>
            <td>One click from your dashboard permanently removes your profile, documents, and order history.</td>
          </tr>
        </tbody>
      </table>
    ),
  },
  {
    id: 'retention',
    heading: 'Data retention',
    body: (
      <>
        <p>
          <strong>Guests.</strong> When you convert without signing in, the extracted data is stored only so you can
          preview and download it. It carries an expiry time and is removed automatically{' '}
          {GUEST_RETENTION_HOURS} hours after upload. Download your files before then.
        </p>
        <p>
          <strong>Signed-in users.</strong> Converted statements are saved to your vault so you can re-download them in
          any format. They stay there until you delete a document from the vault or delete your account from the
          dashboard.
        </p>
      </>
    ),
  },
  {
    id: 'access-control',
    heading: 'Access control',
    body: (
      <ul>
        <li>Sign-in uses Google OAuth. We never see or store your Google password.</li>
        <li>Sessions use a signed, HTTP-only cookie that page scripts cannot read.</li>
        <li>
          Every request for a saved document, export, invoice, or order is checked against the signed-in account that
          owns it.
        </li>
        <li>Administrative tools are restricted to an explicit allow-list of staff accounts.</li>
        <li>
          Guest results are reachable only through the private link created for that upload, and only until they
          expire.
        </li>
      </ul>
    ),
  },
  {
    id: 'payments',
    heading: 'Payments',
    body: (
      <p>
        Purchases are processed by Razorpay. Card and bank details are entered with and stored by Razorpay, not
        Finlyzers. We keep only the order record (plan, amount, status, and the payment reference) so we can credit your
        pages and issue invoices. Payment confirmations are verified with a cryptographic signature before credits are
        added.
      </p>
    ),
  },
  {
    id: 'processing',
    heading: 'How documents are processed',
    body: (
      <>
        <p>
          Uploaded files are sent to our document processing service, which reads text with OCR and an AI vision model
          to identify dates, descriptions, amounts, and balances. The result is returned to Finlyzers and stored as
          described above.
        </p>
        <p>
          We do not sell your documents or use them for advertising. See the{' '}
          <Link href="/privacy-policy">Privacy Policy</Link> for the full list of service providers, and the{' '}
          <Link href="/editorial-policy">Methodology</Link> page for how extraction and verification work.
        </p>
      </>
    ),
  },
  {
    id: 'your-controls',
    heading: 'Your controls',
    body: (
      <ul>
        <li>Delete any single document from the Document Vault.</li>
        <li>Delete your whole account and all associated data from the dashboard.</li>
        <li>Use Finlyzers without an account for statements up to 30 pages, so nothing is kept beyond the guest window.</li>
      </ul>
    ),
  },
  {
    id: 'reporting',
    heading: 'Reporting a security issue',
    body: (
      <p>
        If you believe you have found a vulnerability, please report it to us privately before disclosing it publicly.
        Do not access or modify other users&apos; data while testing.
      </p>
    ),
  },
];

export default function SecurityPage() {
  return (
    <LegalPage
      path="/security"
      title={title}
      intro={
        <p>
          Bank statements are sensitive. This page explains, in plain terms, what happens to a file after you upload
          it, how long we keep it, and who can access it.
        </p>
      }
      sections={sections}
    />
  );
}
