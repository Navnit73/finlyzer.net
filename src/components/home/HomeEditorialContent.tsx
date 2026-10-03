import React from 'react';
import Link from 'next/link';
import {
  Sparkles, CheckCircle2, Lock, ArrowRight, XCircle,
  TableProperties, Layers, Cpu, UploadCloud, FileSpreadsheet, Download,
} from 'lucide-react';

/* ------------------------------------------------------------------
   SEO KEYWORD MAP (extracted from competitor pages)
   Primary:   bank statement converter, convert PDF bank statement to Excel,
              bank statement to CSV, PDF to Excel converter
   Formats:   QBO (QuickBooks), OFX (Xero), QIF (Quicken), XLSX, CSV, Tally XML
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

export const exportFormats = [
  { fmt: 'Excel (.xlsx)', use: 'Analysis, budgeting and bookkeeping in Excel or Google Sheets', slug: 'bank-statement-to-excel' },
  { fmt: 'CSV (.csv)', use: 'Convert PDF bank statement to CSV for any accounting tool', slug: 'bank-statement-to-csv' },
  { fmt: 'QuickBooks (.qbo)', use: 'Import bank statements into QuickBooks in one click', slug: 'bank-statement-to-qbo' },
  { fmt: 'Xero / OFX (.ofx)', use: 'Bank reconciliation in Xero and other OFX apps', slug: 'bank-statement-to-ofx' },
  { fmt: 'Quicken (.qif)', use: 'Load transactions into Quicken and legacy software', slug: 'bank-statement-to-qif' },
  { fmt: 'Tally (.xml)', use: 'Bank statement to Tally import for Indian accountants', slug: 'bank-statement-to-tally' },
];

export const steps = [
  { icon: UploadCloud, title: 'Upload your bank statement PDF', body: 'Drop a PDF, scanned statement or photo. Password-protected files are supported.' },
  { icon: Cpu, title: 'AI extracts every transaction', body: 'Dates, descriptions, debits, credits and balances are read and checked against your closing balance.' },
  { icon: Download, title: 'Download Excel, CSV, QBO or OFX', body: 'Get a clean spreadsheet or accounting file ready for analysis, reconciliation or tax filing.' },
];

export const faqs = [
  { q: 'What is a bank statement converter and how does it work?', a: 'A bank statement converter reads a PDF or scanned bank statement and turns the transactions into structured rows (date, description, debit, credit, balance) that you can open in Excel or import into accounting software. Finlyzer uses AI table extraction and then checks that opening balance plus credits minus debits equals the closing balance.' },
  { q: 'How do I convert a PDF bank statement to Excel?', a: 'Upload your PDF, enter the password if your bank protects it, and click convert. In a few seconds you can download an .xlsx file that opens in Excel, Google Sheets or LibreOffice.' },
  { q: 'How can I convert a PDF bank statement to CSV?', a: 'Upload the statement and choose CSV as the export format. Each transaction becomes one row with separate debit and credit columns, ready for any accounting or budgeting tool.' },
  { q: 'Can it convert statements from any bank or format?', a: 'Finlyzer handles major US, UK and Indian banks, credit card statements and scanned PDFs, and adapts to different layouts and multi-line descriptions. If a file does not convert as expected, contact us and we will fix it.' },
  { q: 'How do I import a converted bank statement into QuickBooks?', a: 'Export as a QuickBooks .qbo file, then in QuickBooks choose Banking > Upload transactions and select the file. Headers are formatted for a one-click import.' },
  { q: 'Can I use it for Xero reconciliation?', a: 'Yes. Export as OFX or CSV and import it into Xero as a bank statement, then reconcile as usual. Quicken (.qif) and Tally (.xml) exports are also available.' },
  { q: 'How does the free tier work?', a: 'Any financial statement or invoice up to 10 pages is free to convert and download in all export formats. Documents of 11 to 30 pages can be previewed free and unlocked for a one-time $10 fee. Larger archives (30+ pages) require a free account.' },
  { q: 'Are my bank statements secure and private?', a: 'Yes. Uploads are encrypted with 256-bit SSL, files are processed in memory and deleted after your session, and we never train AI models on your statements.' },
  { q: 'What if my PDF statement is password-protected?', a: 'Enter the password when prompted. The file is unlocked and parsed in memory, and the password is never stored.' },
  { q: 'How accurate is the conversion?', a: 'Finlyzer reaches 99.8% ledger precision on complex statements, and every file is verified with a running-balance check so errors are flagged before you export.' },
];

export default function HomeEditorialContent() {
  return (
    <div className="w-full space-y-16 sm:space-y-24 pt-12 pb-16">

      {/* 1. Trust & Metrics */}
      <section className="border-y border-[var(--color-border)] py-8 bg-[var(--color-surface-subtle)]/50">
        <div className="site-container text-center space-y-6">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
            Trusted by accountants, CAs, small businesses &amp; financial analysts worldwide
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              ['12.4M+', 'Transactions Extracted'],
              ['99.8%', 'Ledger Precision'],
              ['< 5 sec', 'Average Conversion Time'],
              ['50+ Banks', 'Global Formats Ready'],
            ].map(([n, l]) => (
              <div key={l} className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] font-mono">{n}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Intro */}
      <section className="site-container">
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <span className="feature-badge">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-hover)]" />
              <span>AI Bank Statement Converter</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[var(--color-ink)] tracking-tight leading-[1.15]">
              Convert PDF Bank Statements to Excel, CSV, QBO &amp; OFX
            </h2>
          </div>
          <div className="lg:col-span-6 space-y-4 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            <p>
              Stop typing transactions by hand. Generic PDF to Excel converters split descriptions across lines, merge debit and credit columns, and fail on scanned or password-protected statements.
            </p>
            <p>
              <strong className="text-[var(--color-ink)] font-bold">Finlyzer is built for bank statements.</strong> It reconstructs multi-column tables, cleans UPI and wire narratives, categorizes transactions, and verifies that <code className="bg-[var(--color-surface)] px-1.5 py-0.5 rounded text-[11px] font-mono text-[var(--color-ink)] border border-[var(--color-border)]">Starting Balance + Credits - Debits = Closing Balance</code> before you download.
            </p>
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="site-container space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--color-ink)] tracking-tight">
            How to Convert a Bank Statement to Excel in Seconds
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Free for statements up to 10 pages. Works with digital PDFs, scanned statements and photos.
          </p>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)] flex items-center justify-center">
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[var(--color-text-muted)]">Step {i + 1}</span>
              </div>
              <h3 className="text-base font-black text-[var(--color-ink)]">{s.title}</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. Before / After */}
      <section className="site-container space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--color-ink)] tracking-tight">
            From Messy PDF Rows to an Audit-Ready Spreadsheet
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            See how scrambled multi-column bank statements become clean transactions with separate debit and credit columns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="p-6 rounded-2xl bg-white border border-red-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-red-100">
                <div className="flex items-center gap-2 text-xs font-bold text-red-600">
                  <XCircle className="w-4 h-4" />
                  <h3 className="text-xs font-bold text-red-600">Unstructured Raw Bank PDF</h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-400">Hard to parse</span>
              </div>
              <div className="font-mono text-[11px] text-zinc-500 bg-zinc-50 p-4 rounded-xl leading-relaxed space-y-1 select-none opacity-85">
                <p>09/12/2026 DIRECT DEP TECH CORP 4850.00 12420.50</p>
                <p>09/14/2026 AMAZON.COM*RETAIL -124.50 12296.00</p>
                <p>09/15/2026 WIRE TRANSFER OUTGOING FEE -25.00 12271.00</p>
                <p>09/18/2026 POS CHECKOUT STORE #812 -89.20 12181.80</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-red-50 text-[11px] text-red-700 space-y-1">
              <p className="font-bold">&times; Problems with copy/paste from PDF:</p>
              <p className="text-[10px] opacity-90">
                Negative signs in wrong columns &bull; Unseparated descriptions &bull; No balance verification.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border-2 border-[var(--color-brand)] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-brand-soft)]">
                <div className="flex items-center gap-2 text-xs font-black text-[var(--color-ink)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-hover)]" />
                  <h3 className="text-xs font-black text-[var(--color-ink)]">Finlyzer Verified Ledger</h3>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]">
                  Audit-ready
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold text-zinc-600">
                      <th className="py-1.5 px-2">Date</th>
                      <th className="py-1.5 px-2">Description</th>
                      <th className="py-1.5 px-2">Debit (-)</th>
                      <th className="py-1.5 px-2">Credit (+)</th>
                      <th className="py-1.5 px-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                    <tr>
                      <td className="py-1.5 px-2 text-zinc-600">09/12/2026</td>
                      <td className="py-1.5 px-2 font-sans font-medium text-zinc-800">Tech Corp Payroll</td>
                      <td className="py-1.5 px-2 text-zinc-400">—</td>
                      <td className="py-1.5 px-2 font-bold text-emerald-600">+$4,850.00</td>
                      <td className="py-1.5 px-2 font-bold text-zinc-800">$12,420.50</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-zinc-600">09/14/2026</td>
                      <td className="py-1.5 px-2 font-sans font-medium text-zinc-800">Amazon Retail</td>
                      <td className="py-1.5 px-2 font-bold text-zinc-800">-$124.50</td>
                      <td className="py-1.5 px-2 text-zinc-400">—</td>
                      <td className="py-1.5 px-2 text-zinc-600">$12,296.00</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-zinc-600">09/15/2026</td>
                      <td className="py-1.5 px-2 font-sans font-medium text-zinc-800">Wire Outgoing Fee</td>
                      <td className="py-1.5 px-2 font-bold text-zinc-800">-$25.00</td>
                      <td className="py-1.5 px-2 text-zinc-400">—</td>
                      <td className="py-1.5 px-2 text-zinc-600">$12,271.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-brand-soft)]/50 text-[11px] space-y-1">
              <p className="font-bold text-[var(--color-brand-hover)]">&check; What Finlyzer does:</p>
              <p className="text-[10px] text-[var(--color-text-secondary)]">
                Separated debit and credit columns &bull; Automatic categorization &bull; Reconciled running balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features (dark) */}
      <section className="bg-[var(--color-dark-bg)] text-white py-16 sm:py-20 rounded-3xl mx-3 sm:mx-6 lg:mx-8">
        <div className="site-container space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Built for Scanned, Password-Protected &amp; Multi-Page Statements
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              From a single monthly statement to a 200-page archive, with private, in-memory processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TableProperties, bg: 'bg-[var(--color-brand)] text-[var(--color-on-brand)]', t: 'Multi-Page Table Stitching', d: 'Joins ledger tables across pages without dropping rows or repeating header rows.' },
              { icon: Cpu, bg: 'bg-[var(--media-violet)] text-white', t: 'Balance Verification', d: 'Checks opening balance plus credits minus debits equals the closing balance before export.' },
              { icon: Lock, bg: 'bg-[var(--media-blue)] text-[var(--color-ink)]', t: 'Password-Protected PDFs', d: 'Unlock statements from HDFC, ICICI, Amex and more with an in-browser password prompt.' },
              { icon: Layers, bg: 'bg-[var(--media-pink)] text-white', t: 'Annual Statement Merge', d: 'Combine 12 monthly statements into one annual ledger with cash flow and category summaries.' },
            ].map((c) => (
              <div key={c.t} className="p-6 rounded-2xl bg-[var(--color-ink-soft)] border border-zinc-700/60 space-y-3 hover:border-[var(--color-brand)] transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg}`}>
                  <c.icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-base font-black text-white">{c.t}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Export formats */}
      <section className="site-container space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)]">
            Export Bank Statements to QuickBooks, Xero, Quicken, Tally &amp; Excel
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Every export is formatted with exact transaction headers for a one-click import.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportFormats.map((f) => (
            <Link
              key={f.slug}
              href={`/convert/${f.slug}`}
              className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--color-ink)]">
                <FileSpreadsheet className="w-4 h-4 text-[var(--color-brand-hover)]" />
                <h3 className="text-sm font-extrabold text-[var(--color-ink)]">{f.fmt}</h3>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)]">{f.use}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Bank directory */}
      <section className="site-container space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)]">
            Bank Statement Converters for Chase, HDFC, Barclays &amp; More
          </h2>
          <Link
            href="/convert"
            className="text-xs font-bold text-[var(--color-ink)] hover:text-[var(--color-brand-hover)] flex items-center gap-1 group"
          >
            <span>View all converters</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {supportedBanks.map((b) => (
            <Link
              key={b.slug}
              href={`/convert/${b.slug}`}
              className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors group space-y-2.5"
            >
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]">
                {b.badge}
              </span>
              <h3 className="font-extrabold text-sm text-[var(--color-ink)] group-hover:text-[var(--color-brand-hover)] transition-colors">
                {b.name}
              </h3>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                AI table extraction, debit/credit splitting and multi-format download.
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. Comparison */}
      <section className="site-container space-y-8">
        <h2 className="text-center text-2xl sm:text-3xl font-black text-[var(--color-ink)]">
          Finlyzer vs Manual Entry vs Generic PDF to Excel Converters
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-ink)] font-bold">
                <th className="py-4 px-5">Feature</th>
                <th className="py-4 px-5 bg-[var(--color-brand-soft)]/60 font-black">Finlyzer</th>
                <th className="py-4 px-5 text-zinc-500">Manual Entry</th>
                <th className="py-4 px-5 text-zinc-500">Generic PDF Converter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {[
                ['Speed per 10-page file', '< 5 seconds', '45–60 minutes', '2–3 minutes'],
                ['Debit & credit column splitting', 'Automatic', 'Manual sorting', 'Merged / single column'],
                ['Balance check', 'Yes, instant audit', 'Manual calculator', 'No'],
                ['Password-protected PDFs', 'Browser decryption', 'Manual decrypt', 'Fails / unsupported'],
                ['Scanned PDF & photo OCR', 'Yes', 'N/A', 'Limited'],
                ['Export formats', 'XLSX, CSV, QBO, OFX, QIF, PDF', 'Excel only', 'Basic TXT / CSV'],
              ].map(([f, a, b, c]) => (
                <tr key={f}>
                  <td className="py-3.5 px-5 font-bold">{f}</td>
                  <td className="py-3.5 px-5 font-black text-[var(--color-brand-hover)] bg-[var(--color-brand-soft)]/30">{a}</td>
                  <td className="py-3.5 px-5 text-zinc-500">{b}</td>
                  <td className="py-3.5 px-5 text-zinc-500">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="site-container max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)]">
            Bank Statement Converter FAQ
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Everything you need to know about converting bank statements to Excel, CSV and QuickBooks.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] [&_summary::-webkit-details-marker]:hidden cursor-pointer"
            >
              <summary className="flex items-center justify-between font-bold text-sm text-[var(--color-ink)]">
                <h3 className="text-sm font-bold">{faq.q}</h3>
                <span className="transition group-open:rotate-180 text-[var(--color-text-muted)] text-base">&darr;</span>
              </summary>
              <p className="mt-3 text-xs text-[var(--color-text-secondary)] leading-relaxed pt-3 border-t border-[var(--color-border)]">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}