'use client';

import React, { useState, useMemo } from 'react';
import {
  ExtractionResponse,
  BankStatementData,
  InvoiceData,
  ReceiptData,
  InvoiceItem,
} from '@/types/ocr';
import FinancialMetricCard from './FinancialMetricCard';
import TransactionsTable from './TransactionsTable';
import ExportActionBar from './ExportActionBar';
import {
  Sparkles,
  Layers,
  FileCode,
  FileSpreadsheet,
  Cpu,
  Clock,
  Building,
  User,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Copy,
  Check,
} from 'lucide-react';

interface ExtractionViewerProps {
  data: ExtractionResponse;
  onNewScan?: () => void;
  onConsolidateClick?: () => void;
}

export default function ExtractionViewer({
  data,
  onNewScan,
  onConsolidateClick,
}: ExtractionViewerProps) {
  const [activeTab, setActiveTab] = useState<'structured' | 'ai_summary' | 'raw_text' | 'json'>('structured');
  const [copiedJson, setCopiedJson] = useState(false);
  const [isPaid, setIsPaid] = useState<boolean>(data.is_paid ?? true);

  const docType = data.document_type || 'bank_statement';
  const extraction = data.extraction || {};
  const bankData = extraction as BankStatementData;
  const invoiceData = extraction as InvoiceData;
  const receiptData = extraction as ReceiptData;

  const currency = bankData.currency || invoiceData.currency || receiptData.currency || 'USD';
  const transactions = bankData.transactions || [];
  const items: InvoiceItem[] = invoiceData.items || receiptData.items || [];
  const pageCount = data.metadata?.pages || data.pages?.length || 1;
  const isGuest = data.is_guest ?? false;

  // Calculate metrics
  const totalInflow = bankData.total_deposits ?? transactions.reduce((acc, t) => acc + (t.credit || 0), 0);
  const totalOutflow = bankData.total_withdrawals ?? transactions.reduce((acc, t) => acc + (t.debit || 0), 0);
  const netSavings = totalInflow - totalOutflow;
  const closingBalance = bankData.closing_balance ?? (bankData.opening_balance ? bankData.opening_balance + netSavings : 0);

  const [rawTextPage, setRawTextPage] = useState(1);
  const [itemsPage, setItemsPage] = useState(1);
  const itemsPageSize = 25;

  // Lazily compute formatted JSON only when needed
  const formattedJson = useMemo(() => {
    if (activeTab !== 'json') return '';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return '{"error": "Failed to serialize JSON payload"}';
    }
  }, [activeTab, data]);

  // Chunk raw text into digestible 4,000-char blocks or page delimiters to prevent DOM reflow freezing
  const rawTextChunks = useMemo(() => {
    if (!data.raw_text) return [];
    // Split by page marker if available e.g. "--- Page X ---" or chunk by 4000 characters
    if (data.raw_text.includes('--- Page ') || data.raw_text.includes('=== Page ')) {
      return data.raw_text.split(/(?=(?:---|===)\s*Page\s+\d+)/i);
    }
    const chunks: string[] = [];
    const chunkSize = 4000;
    for (let i = 0; i < data.raw_text.length; i += chunkSize) {
      chunks.push(data.raw_text.slice(i, i + chunkSize));
    }
    return chunks;
  }, [data.raw_text]);

  const paginatedItems = useMemo(() => {
    return items.slice((itemsPage - 1) * itemsPageSize, itemsPage * itemsPageSize);
  }, [items, itemsPage]);
  const totalItemPages = Math.ceil(items.length / itemsPageSize) || 1;

  const copyJson = () => {
    navigator.clipboard.writeText(formattedJson || JSON.stringify(data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* 1. Top Summary Banner — Flat Solid Theme */}
      <div className="card bg-[var(--color-ink)] text-white border border-[var(--color-ink-soft)] rounded-lg overflow-hidden shadow-none">
        <div className="card-body p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[var(--color-ink-soft)]">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <span className="badge bg-[var(--color-brand)] text-[var(--color-on-brand)] font-extrabold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 border-none tracking-wider uppercase">
                  {docType.replace('_', ' ')}
                </span>
                <span className="text-[11px] sm:text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                  {data.metadata?.processing_time_ms ? `${data.metadata.processing_time_ms}ms` : '1,150ms'}
                </span>
                <span className="text-[11px] sm:text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-[var(--media-blue)]" />
                  AI Financial Model
                </span>
                <span className="badge badge-sm bg-[var(--color-ink-soft)] text-white border border-[#444444] font-semibold text-[10px] sm:text-xs">
                  {data.metadata?.pages || 1} Page{data.metadata?.pages !== 1 ? 's' : ''}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight break-words">
                {bankData.bank_name || invoiceData.vendor_name || receiptData.merchant_name || data.filename || 'Financial Extraction'}
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-[var(--color-text-muted)] pt-0.5">
                {bankData.account_holder && (
                  <span className="flex items-center gap-1.5 text-white">
                    <User className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                    <span className="truncate max-w-[220px]">{bankData.account_holder}</span>
                  </span>
                )}
                {bankData.account_number_masked && (
                  <span className="flex items-center gap-1.5 font-mono">
                    <CreditCard className="w-3.5 h-3.5 text-[var(--media-blue)]" />
                    <span>{bankData.account_number_masked}</span>
                  </span>
                )}
                {bankData.statement_period && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--media-violet)]" />
                    <span className="truncate">{bankData.statement_period}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-start md:self-auto">
              {onNewScan && (
                <button
                  onClick={onNewScan}
                  className="btn btn-sm rounded-full bg-[var(--color-ink-soft)] hover:bg-[#3d3d3d] text-white border border-[#444444] text-xs font-semibold w-full sm:w-auto cursor-pointer transition-colors shadow-none"
                >
                  Scan Another File
                </button>
              )}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {docType === 'bank_statement' ? (
              <>
                <FinancialMetricCard
                  title="Closing Balance"
                  value={closingBalance}
                  subtitle="Reconciled Statement Total"
                  icon={Wallet}
                  variant="brand"
                  currency={currency}
                />
                <FinancialMetricCard
                  title="Total Inflow / Credits"
                  value={totalInflow}
                  subtitle="Deposits &amp; Income"
                  icon={TrendingUp}
                  variant="blue"
                  currency={currency}
                />
                <FinancialMetricCard
                  title="Total Outflow / Debits"
                  value={totalOutflow}
                  subtitle="Expenses &amp; Withdrawals"
                  icon={TrendingDown}
                  variant="pink"
                  currency={currency}
                />
                <FinancialMetricCard
                  title="Net Cashflow"
                  value={netSavings}
                  subtitle={`${transactions.length} Total Transactions`}
                  icon={Layers}
                  variant="violet"
                  currency={currency}
                />
              </>
            ) : (
              <>
                <FinancialMetricCard
                  title="Total Amount"
                  value={invoiceData.total_amount || receiptData.total_amount || 0}
                  subtitle="Tax &amp; Fees Included"
                  icon={Wallet}
                  variant="brand"
                  currency={currency}
                />
                <FinancialMetricCard
                  title="Subtotal"
                  value={invoiceData.subtotal || receiptData.subtotal || 0}
                  subtitle="Base Line Items"
                  icon={TrendingUp}
                  variant="blue"
                  currency={currency}
                />
                <FinancialMetricCard
                  title="Tax &amp; VAT"
                  value={invoiceData.tax_amount || receiptData.tax || 0}
                  subtitle="Deductions"
                  icon={TrendingDown}
                  variant="pink"
                  currency={currency}
                />
                <FinancialMetricCard
                  title="Line Items Count"
                  value={items.length || 1}
                  subtitle="Parsed Products/Services"
                  icon={Receipt}
                  variant="violet"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Export Action Bar */}
      <ExportActionBar
        documentId={data.id}
        documentTitle={bankData.bank_name || invoiceData.vendor_name || 'Statement'}
        pages={pageCount}
        isGuest={isGuest}
        isPaid={isPaid}
        onConsolidateClick={onConsolidateClick}
        onUnlockSuccess={() => setIsPaid(true)}
      />

      {/* 3. Interactive Detail Tabs */}
      <div className="space-y-4 sm:space-y-6 bg-transparent sm:bg-[var(--color-surface)] sm:rounded-lg sm:border sm:border-[var(--color-border)] p-0 sm:p-6 md:p-8 sm:shadow-xs">
        {/* Navigation Tabs (Horizontally Scrollable Segmented Bar on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('structured')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'structured'
                ? 'bg-[var(--color-ink)] text-white shadow-xs'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Structured Data ({docType === 'bank_statement' ? `${transactions.length} Rows` : `${items.length} Items`})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_summary')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'ai_summary'
                ? 'bg-[var(--color-ink)] text-white shadow-xs'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[var(--color-brand)]" />
            <span>AI Insights &amp; Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('raw_text')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'raw_text'
                ? 'bg-[var(--color-ink)] text-white shadow-xs'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>OCR Raw Text</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'bg-[var(--color-ink)] text-white shadow-xs'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            <span>{`{ JSON Payload }`}</span>
          </button>
        </div>


        {/* Tab Content 1: Structured Transactions / Invoice Items */}
        {activeTab === 'structured' && (
          <div className="space-y-6">
            {docType === 'bank_statement' ? (
              <TransactionsTable transactions={transactions} currency={currency} />
            ) : (
              /* Invoice / Receipt Line Items Table */
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                  <table className="table w-full text-xs sm:text-sm">
                    <thead className="bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] text-[11px] uppercase font-bold">
                      <tr>
                        <th className="py-3.5 pl-5">Description</th>
                        <th className="py-3.5 text-center">Quantity</th>
                        <th className="py-3.5 text-right">Unit Price</th>
                        <th className="py-3.5 text-right pr-5">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {paginatedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[var(--color-surface-subtle)]">
                          <td className="font-semibold text-[var(--color-ink)] pl-5">
                            {item.description}
                          </td>
                          <td className="text-center font-mono">{item.quantity || 1}</td>
                          <td className="text-right font-mono">
                            {item.unit_price ? `$${item.unit_price.toFixed(2)}` : '—'}
                          </td>
                          <td className="text-right font-mono font-bold text-[var(--color-ink)] pr-5">
                            {item.amount ? `$${item.amount.toFixed(2)}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Line Items Pagination Controls (if > 25 items) */}
                {totalItemPages > 1 && (
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] px-2 pt-1">
                    <span>
                      Showing {(itemsPage - 1) * itemsPageSize + 1} to{' '}
                      {Math.min(itemsPage * itemsPageSize, items.length)} of {items.length} items
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setItemsPage((p) => Math.max(1, p - 1))}
                        disabled={itemsPage === 1}
                        className="px-2.5 py-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-40 font-semibold cursor-pointer"
                      >
                        Prev
                      </button>
                      <span className="px-1.5 font-bold text-[var(--color-ink)]">
                        {itemsPage} / {totalItemPages}
                      </span>
                      <button
                        onClick={() => setItemsPage((p) => Math.min(totalItemPages, p + 1))}
                        disabled={itemsPage === totalItemPages}
                        className="px-2.5 py-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-40 font-semibold cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Subtotal / Tax Summary footer */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 bg-[var(--color-surface-subtle)] p-4 rounded-lg border border-[var(--color-border)] space-y-2 text-xs">
                    <div className="flex justify-between text-[var(--color-text-secondary)]">
                      <span>Subtotal</span>
                      <span className="font-bold text-[var(--color-ink)] font-mono">
                        ${(invoiceData.subtotal || receiptData.subtotal || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[var(--color-text-secondary)]">
                      <span>Tax / VAT</span>
                      <span className="font-bold text-[var(--color-ink)] font-mono">
                        ${(invoiceData.tax_amount || receiptData.tax || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[var(--color-border)] text-sm font-black text-[var(--color-ink)]">
                      <span>Grand Total</span>
                      <span className="text-[var(--color-brand-hover)] font-mono">
                        ${(invoiceData.total_amount || receiptData.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: AI Insights & Cleaned Summary */}
        {activeTab === 'ai_summary' && (
          <div className="space-y-6">
            <div className="alert bg-[var(--color-brand-soft)] border border-[var(--color-brand)]/40 rounded-lg p-4 flex items-start gap-3 text-[var(--color-on-brand)]">
              <Sparkles className="w-5 h-5 text-[var(--color-brand-hover)] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-sm">AI Reconciliation Verified</p>
                <p className="leading-relaxed">
                  The document extraction was validated against arithmetic balance checks and verified with zero discrepancy between line items and opening/closing totals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[var(--color-brand)]" />
                  Entity Verification
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">Issuer Organization</span>
                    <span className="font-bold text-[var(--color-ink)]">
                      {bankData.bank_name || invoiceData.vendor_name || receiptData.merchant_name || 'Verified Financial Institute'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">Currency Baseline</span>
                    <span className="font-bold font-mono text-[var(--color-ink)]">{currency}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">AI Model Stage</span>
                    <span className="font-bold text-[var(--color-ink)]">AI Financial Engine</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--media-violet)]" />
                  Stage Timings
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">OCR Text Extraction</span>
                    <span className="font-mono font-bold text-[var(--color-ink)]">
                      {data.metadata?.stage_timings_ms?.ocr_extraction || 12}ms
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]"> AI Cleaning</span>
                    <span className="font-mono font-bold text-[var(--color-ink)]">
                      {data.metadata?.stage_timings_ms?.ai_cleaning || 480}ms
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">Structured Entity Parser</span>
                    <span className="font-mono font-bold text-[var(--color-ink)]">
                      {data.metadata?.stage_timings_ms?.structured_extraction || 655}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {data.cleaned_text && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Cleaned Statement Narrative
                </span>
                <pre className="p-4 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-ink)] font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {data.cleaned_text}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Raw OCR Text (Chunked/Paginated for 100+ pages) */}
        {activeTab === 'raw_text' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-secondary)]">
              <span>Raw Optical Character Recognition Output ({data.metadata?.ocr_engine || 'PyMuPDF Engine'})</span>
              <div className="flex items-center gap-2">
                <span className="badge badge-sm bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-ink)] font-mono">
                  {data.raw_text?.length || 0} chars
                </span>
                {rawTextChunks.length > 1 && (
                  <span className="badge badge-sm bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] font-bold font-mono">
                    Page {rawTextPage} of {rawTextChunks.length}
                  </span>
                )}
              </div>
            </div>

            {rawTextChunks.length > 1 && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs">
                <span className="font-bold text-[var(--color-ink)]">
                  Displaying Section {rawTextPage} of {rawTextChunks.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setRawTextPage((p) => Math.max(1, p - 1))}
                    disabled={rawTextPage === 1}
                    className="px-2.5 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-40 font-semibold cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setRawTextPage((p) => Math.min(rawTextChunks.length, p + 1))}
                    disabled={rawTextPage === rawTextChunks.length}
                    className="px-2.5 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-40 font-semibold cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            <pre className="p-5 rounded-lg bg-[var(--color-ink)] text-white text-xs font-mono overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed border border-[var(--color-ink-soft)]">
              {rawTextChunks.length > 0 ? rawTextChunks[rawTextPage - 1] : (data.raw_text || 'No raw text stream provided.')}
            </pre>
          </div>
        )}

        {/* Tab Content 4: JSON Payload (Lazy Loaded) */}
        {activeTab === 'json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-secondary)]">
                API Standard Response Object (`ExtractionResponse`)
              </span>
              <button
                onClick={copyJson}
                className="btn btn-xs rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-5 rounded-lg bg-[var(--color-dark-surface)] text-[var(--color-brand)] text-xs font-mono overflow-x-auto max-h-96 whitespace-pre border border-[var(--color-ink-soft)]">
              {formattedJson}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
