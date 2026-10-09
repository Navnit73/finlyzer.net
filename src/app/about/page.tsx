import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Phone, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { pageMetadata } from '@/lib/seo-config';

const title = 'About Us & Contact';
const description =
  'Learn about Finlyzers, our mission, legal entity details, proprietor NAVNIT RAI, contact email, phone number, and commitment to automated financial accuracy.';

export const metadata: Metadata = pageMetadata({
  title: 'About Us & Contact | Finlyzers',
  description,
  path: '/about',
});

const sections: LegalSection[] = [
  {
    id: 'mission',
    heading: '1. Our mission',
    body: (
      <>
        <p>
          Finlyzers was built to eliminate the tedious, error-prone manual data entry involved in processing bank statements,
          credit card summaries, and financial documents. Accounting professionals, small business owners, and individuals
          frequently receive financial records in locked or scanned PDF formats that cannot be directly imported into spreadsheet
          or accounting software.
        </p>
        <p>
          Our platform combines high-precision optical character recognition (OCR) and intelligent financial document parsing
          to convert bank statements into structured, clean formats—including Excel (.xlsx), CSV, QuickBooks (.qbo), Xero (.ofx),
          and Quicken (.qif).
        </p>
      </>
    ),
  },
  {
    id: 'legal-entity',
    heading: '2. Legal entity & business details',
    body: (
      <>
        <p>
          Finlyzers is an online financial software service developed and operated by <strong>NAVNIT RAI</strong> as a sole
          proprietorship enterprise.
        </p>
        <table>
          <thead>
            <tr>
              <th>Entity Attribute</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Legal Name / Proprietor</td>
              <td><strong>NAVNIT RAI</strong></td>
            </tr>
            <tr>
              <td>Operating Brand Name</td>
              <td>Finlyzers (finlyzers.com / finlyzer.net)</td>
            </tr>
            <tr>
              <td>Official Contact Email</td>
              <td>
                <a href="mailto:navnitrai5389@gmail.com" className="font-semibold text-[var(--color-ink)] underline">
                  navnitrai5389@gmail.com
                </a>
              </td>
            </tr>
            <tr>
              <td>Helpline / Phone Number</td>
              <td>
                <a href="tel:+917355087072" className="font-semibold text-[var(--color-ink)] underline">
                  +91 7355087072
                </a>
              </td>
            </tr>
            <tr>
              <td>Billing &amp; Invoice Inquiries</td>
              <td>
                <a href="mailto:billing@finlyzers.com" className="font-semibold text-[var(--color-ink)] underline">
                  billing@finlyzers.com
                </a>
              </td>
            </tr>
            <tr>
              <td>Operating Hours</td>
              <td>Monday to Saturday: 9:00 AM – 6:00 PM (IST)</td>
            </tr>
            <tr>
              <td>Country of Origin</td>
              <td>India</td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: 'contact-details',
    heading: '3. Contact us & customer support',
    body: (
      <>
        <p>
          We pride ourselves on prompt customer assistance. Whether you need technical support with a specific bank format,
          have questions about your page credits or billing, or wish to inquire about high-volume enterprise conversions, our team
          is ready to help.
        </p>
        <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Email Us</p>
                <a
                  href="mailto:navnitrai5389@gmail.com"
                  className="text-sm font-bold text-[var(--color-ink)] hover:underline"
                >
                  navnitrai5389@gmail.com
                </a>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              For general support, billing queries, refunds, and legal inquiries. Typical response within 24 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--media-blue-soft)] text-[var(--media-blue-text)] flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Call / WhatsApp</p>
                <a
                  href="tel:+917355087072"
                  className="text-sm font-bold text-[var(--color-ink)] hover:underline"
                >
                  +91 7355087072
                </a>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Direct line for urgent conversion issues and merchant support. Available Mon–Sat during business hours.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'accuracy-guarantee',
    heading: '4. Mathematical verification & accuracy',
    body: (
      <>
        <p>
          Unlike generic OCR tools that merely perform basic text extraction, Finlyzers incorporates a deterministic
          double-entry running-balance reconciliation algorithm:
        </p>
        <ul>
          <li>
            <strong>Row-by-Row Running Balance Checks:</strong> Every extracted row is verified mathematically against the statement’s
            printed balance column (<code className="text-xs bg-[var(--color-surface-subtle)] px-1 py-0.5 rounded">Previous Balance + Credits − Debits = Current Balance</code>).
          </li>
          <li>
            <strong>Discrepancy Highlighting:</strong> Any math mismatch or missing transaction is immediately flagged for user review
            before data export.
          </li>
          <li>
            <strong>Multi-Bank Layouts:</strong> Tailored parsing models handle statements from major global and regional financial institutions
            including Chase, Bank of America, Wells Fargo, Barclays, HDFC, State Bank of India (SBI), ICICI, and Axis Bank.
          </li>
        </ul>
        <p>
          Learn more in our detailed <Link href="/editorial-policy">Methodology &amp; Accuracy Guide</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'privacy-commitment',
    heading: '5. Privacy, security & data protection',
    body: (
      <>
        <p>
          We understand that financial statements contain sensitive personal and organizational data. We adhere to rigorous
          security protocols:
        </p>
        <ul>
          <li><strong>256-Bit TLS Encryption:</strong> All data transmissions between your browser and our servers are fully encrypted in transit.</li>
          <li><strong>Automatic 24-Hour Guest Purge:</strong> Uploads by unauthenticated guests and their extracted records are permanently deleted automatically after 24 hours.</li>
          <li><strong>Zero Data Monetization:</strong> We do not sell, rent, or share your financial data or uploaded documents with third-party advertisers.</li>
          <li><strong>Single-Click Data Erasure:</strong> Registered users can permanently delete individual documents or their entire account profile with one click directly from the dashboard.</li>
        </ul>
        <p>
          For comprehensive specifications, review our <Link href="/security">Security Policy</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'transparent-pricing',
    heading: '6. Fair and transparent pricing',
    body: (
      <>
        <p>
          Finlyzers operates on a straightforward, customer-friendly pricing model:
        </p>
        <ul>
          <li><strong>Free Tier:</strong> Convert and export statements up to 10 pages completely free of charge—no credit card or signup required.</li>
          <li><strong>No Hidden Subscriptions:</strong> Page credits and Document Passes are one-time purchases with zero recurring charges.</li>
          <li><strong>Credits Never Expire:</strong> Any purchased credits remain in your account indefinitely until consumed.</li>
          <li><strong>Failed Job Protection:</strong> If a document cannot be processed due to formatting errors or low scan quality, zero credits are deducted.</li>
        </ul>
        <p>
          View all plans on our <Link href="/pricing">Pricing Page</Link>.
        </p>
      </>
    ),
  },
];

export default function AboutPage() {
  return (
    <LegalPage
      path="/about"
      title={title}
      description={description}
      intro={
        <p>
          Finlyzers is an automated bank statement conversion and financial reconciliation tool operated by{' '}
          <strong>NAVNIT RAI</strong>. We empower businesses, accountants, and individuals to convert complex PDF statements
          into clean accounting spreadsheets in seconds.
        </p>
      }
      sections={sections}
    />
  );
}
