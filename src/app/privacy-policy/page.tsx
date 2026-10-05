import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { absoluteUrl } from '@/lib/seo-config';
import { GUEST_RETENTION_HOURS } from '@/lib/retention';

const title = 'Privacy Policy';
const description =
  'What data Finlyzer collects when you convert bank statements, why, how long it is kept, which providers process it, and how to delete it.';

export const metadata: Metadata = {
  title: { absolute: `${title} | Finlyzer` },
  description,
  alternates: { canonical: absoluteUrl('/privacy-policy') },
  openGraph: { title: `${title} | Finlyzer`, description, url: absoluteUrl('/privacy-policy'), type: 'website' },
};

const sections: LegalSection[] = [
  {
    id: 'data-we-collect',
    heading: '1. Data we collect',
    body: (
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>What it includes</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account details</td>
            <td>Name, email address, and profile picture from your Google account.</td>
            <td>When you sign in with Google</td>
          </tr>
          <tr>
            <td>Uploaded documents</td>
            <td>
              File name, page count, extracted text, and the structured data we produce (transactions, balances,
              account details shown on the statement).
            </td>
            <td>When you convert a file</td>
          </tr>
          <tr>
            <td>Usage</td>
            <td>Pages processed, credit balance, and plan tier.</td>
            <td>Signed-in use</td>
          </tr>
          <tr>
            <td>Orders</td>
            <td>Plan purchased, amount, status, date, and the payment provider&apos;s order and payment references.</td>
            <td>When you buy credits</td>
          </tr>
        </tbody>
      </table>
    ),
  },
  {
    id: 'how-we-use',
    heading: '2. How we use it',
    body: (
      <ul>
        <li>To convert your documents and let you preview and download the results.</li>
        <li>To keep your vault, credit balance, and order history available when you sign in.</li>
        <li>To process payments, add purchased credits, and issue invoices.</li>
        <li>To prevent abuse, debug failures, and keep the service secure.</li>
      </ul>
    ),
  },
  {
    id: 'what-we-dont-do',
    heading: '3. What we don’t do',
    body: (
      <ul>
        <li>We do not sell your personal data or documents.</li>
        <li>We do not use your documents for advertising.</li>
        <li>We do not save the passwords of protected PDFs.</li>
        <li>We do not see or store card numbers; payments are handled by our payment provider.</li>
      </ul>
    ),
  },
  {
    id: 'providers',
    heading: '4. Service providers',
    body: (
      <>
        <p>We share data only with providers that help us run Finlyzer, and only as needed for their role:</p>
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Google</td>
              <td>Sign-in (OAuth). We receive your name, email, and profile picture.</td>
            </tr>
            <tr>
              <td>MongoDB (database hosting)</td>
              <td>Stores accounts, converted documents, and orders.</td>
            </tr>
            <tr>
              <td>Document processing service (OCR and AI vision model)</td>
              <td>Reads uploaded files and extracts transactions.</td>
            </tr>
            <tr>
              <td>Razorpay</td>
              <td>Processes payments and holds payment details.</td>
            </tr>
          </tbody>
        </table>
        <p>We may also disclose data if required by law or to protect the rights and safety of users and the service.</p>
      </>
    ),
  },
  {
    id: 'retention',
    heading: '5. Retention',
    body: (
      <ul>
        <li>
          <strong>Guest uploads</strong> and their extracted data are deleted automatically {GUEST_RETENTION_HOURS}{' '}
          hours after upload.
        </li>
        <li>
          <strong>Signed-in documents</strong> are kept until you delete them or delete your account.
        </li>
        <li>
          <strong>Account, usage, and order records</strong> are kept while your account exists and deleted when you
          delete your account.
        </li>
      </ul>
    ),
  },
  {
    id: 'cookies',
    heading: '6. Cookies and local storage',
    body: (
      <>
        <p>
          We use one essential cookie to keep you signed in (a signed, HTTP-only session cookie). We also store a few
          interface preferences in your browser&apos;s local storage, such as whether the sidebar is collapsed and a
          plan you selected before signing in.
        </p>
        <p>We do not use advertising cookies.</p>
      </>
    ),
  },
  {
    id: 'your-rights',
    heading: '7. Your choices and rights',
    body: (
      <ul>
        <li>
          <strong>Delete a document</strong> at any time from the Document Vault.
        </li>
        <li>
          <strong>Delete your account</strong> and all associated documents and orders from the dashboard. This is
          permanent.
        </li>
        <li>
          <strong>Use Finlyzer without an account</strong> for statements up to 30 pages.
        </li>
        <li>
          Depending on where you live, you may have additional rights to access, correct, or export your data, or to
          object to certain processing.
        </li>
      </ul>
    ),
  },
  {
    id: 'security',
    heading: '8. Security',
    body: (
      <p>
        Data is encrypted in transit and access to saved documents is restricted to the account that owns them. See{' '}
        <Link href="/security">Security &amp; Data Handling</Link> for details.
      </p>
    ),
  },
  {
    id: 'children',
    heading: '9. Children',
    body: <p>Finlyzer is not intended for anyone under 18, and we do not knowingly collect their data.</p>,
  },
  {
    id: 'changes',
    heading: '10. Changes to this policy',
    body: (
      <p>
        If we change how we handle your data, we will update this page and the “Last updated” date above. Material
        changes will be highlighted in the product.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      path="/privacy-policy"
      title={title}
      intro={
        <p>
          This policy explains what Finlyzer (“we”, “us”) collects when you use our bank statement converter, why we
          collect it, and how you stay in control of it.
        </p>
      }
      sections={sections}
    />
  );
}
