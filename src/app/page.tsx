import React from 'react';
import type { Metadata } from 'next';
import HomeWorkspace from '@/components/home/HomeWorkspace';
import HomeEditorialContent, { faqs, steps } from '@/components/home/HomeEditorialContent';
import { SITE_URL } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: { absolute: 'Bank Statement Converter: PDF to Excel & CSV | Finlyzers' },
  description:
    'Convert PDF bank statements to Excel (XLSX), CSV, QuickBooks (QBO), and Xero (OFX). 99.8% precision with mathematical running balance check, OCR, and guest uploads auto-deleted after 24 hours.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'AI Bank Statement Converter to Excel, CSV & QuickBooks | Finlyzers',
    description:
      'Convert PDF bank statements and financial documents to Excel (XLSX), CSV, QuickBooks (QBO), and Xero with instant running-balance audit.',
    url: SITE_URL,
    siteName: 'Finlyzers',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og_image.webp',
        width: 1200,
        height: 630,
        alt: 'Finlyzers — Turn Bank Statements into Clean Data (Excel, CSV, QuickBooks)',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Bank Statement Converter to Excel, CSV & QuickBooks | Finlyzers',
    description:
      'Convert PDF bank statements and financial documents to Excel (XLSX), CSV, QuickBooks (QBO), and Xero with instant running-balance audit.',
    images: ['/og_image.webp'],
  },
};

const jsonLdGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Finlyzers',
      description: 'AI-Powered Bank Statement and Financial PDF Converter to Excel, CSV & QuickBooks',
      inLanguage: 'en-US',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Finlyzers',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: 'Automated financial document OCR and bank statement conversion platform.',
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#webapp`,
      name: 'Finlyzers Bank Statement Converter',
      url: SITE_URL,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free processing and multi-format download up to 10 pages per financial statement',
      },
      featureList: [
        'AI Table and Ledger Extraction',
        'Mathematical Running Balance Reconciliation',
        'Password-Protected PDF Decryption',
        'Scanned and Photo OCR',
        'Multi-Format Exports: Excel (.xlsx), CSV, QuickBooks (.qbo), Xero (.ofx), Quicken (.qif)',
        'Guest Uploads Auto-Deleted After 24 Hours',
      ],
    },
    {
      '@type': 'HowTo',
      '@id': `${SITE_URL}/#howto`,
      name: 'How to Convert a Bank Statement PDF to Excel in Seconds',
      description:
        'Step-by-step tutorial to convert digital or scanned bank statement PDFs into Excel spreadsheets or QuickBooks accounting files.',
      totalTime: 'PT1M',
      step: steps.map((s, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: s.title,
        text: s.body,
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />

      {/* Interactive Uploader Workspace */}
      <HomeWorkspace />

      {/* Rich Server-Rendered Editorial & SEO Content */}
      <HomeEditorialContent />
    </div>
  );
}
