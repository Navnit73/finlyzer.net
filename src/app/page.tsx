import React from 'react';
import type { Metadata } from 'next';
import HomeWorkspace from '@/components/home/HomeWorkspace';
import HomeEditorialContent, { faqs, steps } from '@/components/home/HomeEditorialContent';

export const metadata: Metadata = {
  title: 'AI Bank Statement Converter to Excel & CSV (Free) | Finlyzer',
  description:
    'Convert PDF bank statements to Excel (XLSX), CSV, QuickBooks (QBO), and Xero (OFX). 99.8% precision with mathematical running balance check, OCR, and zero data retention.',
  alternates: {
    canonical: 'https://finlyzer.net',
  },
  openGraph: {
    title: 'AI Bank Statement Converter to Excel, CSV & QuickBooks | Finlyzer',
    description:
      'Convert PDF bank statements and financial documents to Excel (XLSX), CSV, QuickBooks (QBO), and Xero with instant running-balance audit.',
    url: 'https://finlyzer.net',
    siteName: 'Finlyzer',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Bank Statement Converter to Excel, CSV & QuickBooks | Finlyzer',
    description:
      'Convert PDF bank statements and financial documents to Excel (XLSX), CSV, QuickBooks (QBO), and Xero with instant running-balance audit.',
  },
};

const jsonLdGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://finlyzer.net/#website',
      url: 'https://finlyzer.net',
      name: 'Finlyzer',
      description: 'AI-Powered Bank Statement and Financial PDF Converter to Excel, CSV & QuickBooks',
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://finlyzer.net/convert?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://finlyzer.net/#organization',
      name: 'Finlyzer',
      url: 'https://finlyzer.net',
      logo: 'https://finlyzer.net/favicon.ico',
      description: 'Automated financial document OCR and bank statement conversion platform.',
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://finlyzer.net/#webapp',
      name: 'Finlyzer Bank Statement Converter',
      url: 'https://finlyzer.net',
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
        'Multi-Format Exports: Excel (.xlsx), CSV, QuickBooks (.qbo), Xero (.ofx), Quicken (.qif), Tally (.xml)',
        'Zero Permanent Data Retention',
      ],
    },
    {
      '@type': 'HowTo',
      '@id': 'https://finlyzer.net/#howto',
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
      '@id': 'https://finlyzer.net/#faq',
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
