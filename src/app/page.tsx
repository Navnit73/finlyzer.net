import React from 'react';
import HomeWorkspace from '@/components/home/HomeWorkspace';
import HomeEditorialContent, { faqs } from '@/components/home/HomeEditorialContent';
import {
  ORGANIZATION_ID,
  SITE_NAME,
  SITE_URL,
  WEBAPP_ID,
  WEBSITE_ID,
  absoluteUrl,
  getFaqJsonLd,
  getWebPageJsonLd,
  pageMetadata,
  serializeJsonLd,
} from '@/lib/seo-config';
import { FREE_PAGE_LIMIT } from '@/types/pricing';
import { GUEST_RETENTION_HOURS } from '@/lib/retention';

const title = 'Bank Statement Converter: PDF to Excel, CSV & QBO | Finlyzers';
const description =
  'Convert PDF and scanned bank statements to Excel, CSV, QBO, OFX or QIF. OCR extracts every transaction and checks it against the balance. Free up to 10 pages.';

export const metadata = pageMetadata({
  title,
  description,
  path: '/',
  socialTitle: 'Finlyzers: Bank Statement Converter for Excel, CSV & QuickBooks',
});

// Site-wide entities live on the homepage; other pages reference them by @id.
// Only verifiable facts: no ratings, reviews, addresses or social profiles.
const jsonLd = serializeJsonLd([
  {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: 'NAVNIT RAI',
    url: SITE_URL,
    logo: absoluteUrl('/logo.png'),
    email: 'navnitrai5389@gmail.com',
    telephone: '+91-7355087072',
  },
  {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: 'en',
    publisher: { '@id': ORGANIZATION_ID },
  },
  {
    '@type': 'WebApplication',
    '@id': WEBAPP_ID,
    name: 'Finlyzers Bank Statement Converter',
    url: SITE_URL,
    description: 'Converts PDF and scanned bank statements into Excel, CSV, QBO, OFX and QIF files.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any (web browser)',
    publisher: { '@id': ORGANIZATION_ID },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: `Free for statements up to ${FREE_PAGE_LIMIT} pages`,
    },
    featureList: [
      'Transaction extraction from digital and scanned PDF bank statements',
      'OCR for scanned statements and photos',
      'Running-balance verification',
      'Password-protected PDF support',
      'Export to Excel (.xlsx), CSV, QuickBooks (.qbo), OFX, Quicken (.qif) and PDF',
      `Guest uploads deleted after ${GUEST_RETENTION_HOURS} hours`,
    ],
  },
  { ...getWebPageJsonLd({ path: '/', name: title, description }), about: { '@id': WEBAPP_ID } },
  getFaqJsonLd(faqs),
]);

export default function HomePage() {
  return (
    <div className="w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* Interactive Uploader Workspace */}
      <HomeWorkspace />

      {/* Rich Server-Rendered Editorial & SEO Content */}
      <HomeEditorialContent />
    </div>
  );
}
