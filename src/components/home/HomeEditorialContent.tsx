import React from 'react';
import {
  MetricsStrip,
  HowItWorksSection,
  BeforeAfterSection,
  FeatureGridSection,
  ExportFormatsSection,
  SecuritySection,
  ConverterLinksSection,
  ComparisonSection,
  FaqSection,
  FinalCtaSection,
  defaultSteps,
} from '@/components/converter/sections';

/* ------------------------------------------------------------------
   SEO KEYWORD MAP (extracted from competitor pages)
   Primary:   bank statement converter, convert PDF bank statement to Excel,
              bank statement to CSV, PDF to Excel converter
   Formats:   QBO (QuickBooks), OFX (Xero), QIF (Quicken), XLSX, CSV
   Features:  scanned PDF OCR, password-protected PDF, any bank / any format,
              automatic categorization, multi-page, balance verification,
              source-link verification, free / no signup / no watermark
   Banks:     Chase, Bank of America, Wells Fargo, Barclays, HDFC, SBI,
              ICICI, Axis, Kotak, Amex, Citi
------------------------------------------------------------------- */

export const supportedBanks = [
  { name: 'Chase Bank Statement to Excel', slug: 'chase-bank-statement-to-excel', badge: 'US #1 Bank' },
  { name: 'Bank of America Statement to CSV', slug: 'bank-of-america-statement-to-csv', badge: 'US BofA Ready' },
  { name: 'Wells Fargo PDF to Excel', slug: 'wells-fargo-pdf-to-excel', badge: 'US Checking' },
  { name: 'Barclays Statement to Excel', slug: 'barclays-bank-statement-to-excel', badge: 'UK GBP & Sort Code' },
  { name: 'HDFC Bank Statement to Excel', slug: 'hdfc-bank-statement-to-excel', badge: 'India UPI & Password' },
  { name: 'SBI, ICICI, Axis & Kotak to Excel', slug: 'indian-bank-statement-to-excel', badge: 'India Banks' },
  { name: 'Credit Card Statement to Excel', slug: 'credit-card-statement-to-excel', badge: 'Amex, Citi, Multi-Card' },
  { name: 'Scanned PDF to Excel (OCR)', slug: 'scanned-pdf-ocr-to-excel', badge: 'Photo & Skew Fix' },
];

export const steps = defaultSteps;

export const faqs = [
  { q: 'What is a bank statement converter and how does it work?', a: 'A bank statement converter reads a PDF or scanned bank statement and turns the transactions into structured rows (date, description, debit, credit, balance) that you can open in Excel or import into accounting software. Finlyzer uses AI table extraction and then checks that opening balance plus credits minus debits equals the closing balance.' },
  { q: 'How do I convert a PDF bank statement to Excel?', a: 'Upload your PDF, enter the password if your bank protects it, and click convert. In a few seconds you can download an .xlsx file that opens in Excel, Google Sheets or LibreOffice.' },
  { q: 'How can I convert a PDF bank statement to CSV?', a: 'Upload the statement and choose CSV as the export format. Each transaction becomes one row with separate debit and credit columns, ready for any accounting or budgeting tool.' },
  { q: 'Can it convert statements from any bank or format?', a: 'Finlyzer handles major US, UK and Indian banks, credit card statements and scanned PDFs, and adapts to different layouts and multi-line descriptions. If a file does not convert as expected, contact us and we will fix it.' },
  { q: 'How do I import a converted bank statement into QuickBooks?', a: 'Export as a QuickBooks .qbo file, then in QuickBooks choose Banking > Upload transactions and select the file. Headers are formatted for a one-click import.' },
  { q: 'Can I use it for Xero reconciliation?', a: 'Yes. Export as OFX or CSV and import it into Xero as a bank statement, then reconcile as usual. Quicken (.qif) exports are also available.' },
  { q: 'How does the free tier work?', a: 'Any financial statement or invoice up to 10 pages is free to convert and download in all export formats. Documents of 11 to 30 pages can be previewed free and unlocked for a one-time $10 fee. Larger archives (30+ pages) require a free account.' },
  { q: 'Are my bank statements secure and private?', a: 'Yes. Uploads are encrypted with 256-bit SSL, files are processed in memory and deleted after your session, and we never train AI models on your statements.' },
  { q: 'What if my PDF statement is password-protected?', a: 'Enter the password when prompted. The file is unlocked and parsed in memory, and the password is never stored.' },
  { q: 'How accurate is the conversion?', a: 'Finlyzer reaches 99.8% ledger precision on complex statements, and every file is verified with a running-balance check so errors are flagged before you export.' },
];

export default function HomeEditorialContent() {
  return (
    <div className="w-full space-y-16 sm:space-y-24 pt-8 sm:pt-12 pb-8 sm:pb-16">
      <MetricsStrip />
      <HowItWorksSection />
      <BeforeAfterSection />
      <FeatureGridSection />
      <ExportFormatsSection />
      <SecuritySection />
      <ConverterLinksSection title="Converters for Chase, HDFC, Barclays & More" links={supportedBanks} />
      <ComparisonSection />
      <FaqSection faqs={faqs} />
      <FinalCtaSection />
    </div>
  );
}
