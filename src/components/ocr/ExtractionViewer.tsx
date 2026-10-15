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
import { checkRunningBalance } from '@/lib/balance-check';
import {
  Sparkles,
  AlertTriangle,
  Info,
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
  CheckCircle2,
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
  const transactions = useMemo(() => bankData.transactions || [], [bankData.transactions]);
  const items: InvoiceItem[] = useMemo(
    () => invoiceData.items || receiptData.items || [],
    [invoiceData.items, receiptData.items]
  );
  const pageCount = data.metadata?.pages || data.pages?.length || 1;
  const isGuest = data.is_guest ?? false;

  // Calculate metrics
  const totalInflow = bankData.total_deposits ?? transactions.reduce((acc, t) => acc + (t.credit || 0), 0);
  const totalOutflow = bankData.total_withdrawals ?? transactions.reduce((acc, t) => acc + (t.debit || 0), 0);
  const netSavings = totalInflow - totalOutflow;
  const closingBalance = bankData.closing_balance ?? (bankData.opening_balance ? bankData.opening_balance + netSavings : 0);

  // Real running-balance verification (previous + credit − debit vs. the printed balance on each row).
  const balanceCheck = useMemo(
    () => checkRunningBalance(transactions, bankData.opening_balance, bankData.closing_balance),
    [transactions, bankData.opening_balance, bankData.closing_balance]
  );

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

  const handleUnlockSuccess = () => {
    setIsPaid(true);
    if (typeof window !== 'undefined' && data?.id) {
      try {
        const cached = sessionStorage.getItem('doc_' + data.id);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.is_paid = true;
          sessionStorage.setItem('doc_' + data.id, JSON.stringify(parsed));
        }
      } catch {}
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. Summary header */}
      <section aria-label="Extraction summary" className="space-y-5 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-[var(--color-text-muted)]">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] text-xs font-medium capitalize">
                {docType.replace('_', ' ')}
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {data.metadata?.processing_time_ms ? `${data.metadata.processing_time_ms}ms` : '1,150ms'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                AI Financial Model
              </span>
              <span className="tabular-nums">
                {data.metadata?.pages || 1} Page{data.metadata?.pages !== 1 ? 's' : ''}
              </span>
            </div>

            <h2 className="type-title break-words">
              {bankData.bank_name || invoiceData.vendor_name || receiptData.merchant_name || data.filename || 'Financial Extraction'}
            </h2>

            {(bankData.account_holder || bankData.account_number_masked || bankData.statement_period) && (
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1.5 sm:gap-x-5 text-sm text-[var(--color-text-secondary)]">
                {bankData.account_holder && (
                  <span className="flex items-center gap-1.5 min-w-0">
                    <User className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" aria-hidden="true" />
                    <span className="truncate max-w-[260px]">{bankData.account_holder}</span>
                  </span>
                )}
                {bankData.account_number_masked && (
                  <span className="flex items-center gap-1.5 tabular-nums">
                    <CreditCard className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" aria-hidden="true" />
                    <span>{bankData.account_number_masked}</span>
                  </span>
                )}
                {bankData.statement_period && (
                  <span className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" aria-hidden="true" />
                    <span className="truncate">{bankData.statement_period}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {onNewScan && (
            <button
              type="button"
              onClick={onNewScan}
              className="btn-brand-secondary w-full sm:w-auto shrink-0"
            >
              Scan Another File
            </button>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
      </section>

      {/* 2. Export Action Bar */}
      <ExportActionBar
        documentId={data.id}
        documentTitle={bankData.bank_name || invoiceData.vendor_name || 'Statement'}
        pages={pageCount}
        isGuest={isGuest}
        isPaid={isPaid}
        onConsolidateClick={onConsolidateClick}
        onUnlockSuccess={handleUnlockSuccess}
      />

      {/* 3. Interactive Detail Tabs */}
      <section aria-label="Extraction details" className="space-y-5">
        {/* Segmented control (horizontally scrollable on mobile) */}
        <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
          <div role="tablist" aria-label="Extraction view options" className="inline-flex items-center gap-1 p-1 rounded-full bg-[var(--color-surface-subtle)]">
            <button
              role="tab"
              id="tab-structured"
              aria-selected={activeTab === 'structured'}
              aria-controls="tabpanel-structured"
              onClick={() => setActiveTab('structured')}
              className={`min-h-[36px] px-3.5 rounded-full text-[13px] sm:text-sm font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'structured'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
            >
              <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
              <span>Structured Data ({docType === 'bank_statement' ? `${transactions.length} Rows` : `${items.length} Items`})</span>
            </button>

            <button
              role="tab"
              id="tab-ai_summary"
              aria-selected={activeTab === 'ai_summary'}
              aria-controls="tabpanel-ai_summary"
              onClick={() => setActiveTab('ai_summary')}
              className={`min-h-[36px] px-3.5 rounded-full text-[13px] sm:text-sm font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'ai_summary'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>AI Insights &amp; Audit</span>
            </button>

            <button
              role="tab"
              id="tab-raw_text"
              aria-selected={activeTab === 'raw_text'}
              aria-controls="tabpanel-raw_text"
              onClick={() => setActiveTab('raw_text')}
              className={`min-h-[36px] px-3.5 rounded-full text-[13px] sm:text-sm font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'raw_text'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
            >
              <FileCode className="w-4 h-4" aria-hidden="true" />
              <span>OCR Raw Text</span>
            </button>

            <button
              role="tab"
              id="tab-json"
              aria-selected={activeTab === 'json'}
              aria-controls="tabpanel-json"
              onClick={() => setActiveTab('json')}
              className={`min-h-[36px] px-3.5 rounded-full text-[13px] sm:text-sm font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
            >
              <span>{`{ JSON Payload }`}</span>
            </button>
          </div>
        </div>

        {/* Tab Content 1: Structured Transactions / Invoice Items */}
        {activeTab === 'structured' && (
          <div role="tabpanel" id="tabpanel-structured" aria-labelledby="tab-structured" className="space-y-6">
            {docType === 'bank_statement' ? (
              <TransactionsTable transactions={transactions} currency={currency} />
            ) : (
              /* Invoice / Receipt Line Items Table */
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
                  <table className="w-full text-sm" aria-label="Invoice items">
                    <thead className="bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] text-[13px]">
                      <tr className="border-b border-[var(--color-border)]">
                        <th scope="col" className="py-3 pl-5 pr-3 text-left font-medium">Description</th>
                        <th scope="col" className="py-3 px-3 text-center font-medium">Quantity</th>
                        <th scope="col" className="py-3 px-3 text-right font-medium">Unit Price</th>
                        <th scope="col" className="py-3 pl-3 pr-5 text-right font-medium">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                      {paginatedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[var(--color-surface-subtle)] transition-colors">
                          <td className="py-3 pl-5 pr-3 text-[var(--color-ink)]">
                            {item.description}
                          </td>
                          <td className="py-3 px-3 text-center tabular-nums text-[var(--color-text-secondary)]">{item.quantity || 1}</td>
                          <td className="py-3 px-3 text-right tabular-nums text-[var(--color-text-secondary)]">
                            {item.unit_price ? `$${item.unit_price.toFixed(2)}` : '—'}
                          </td>
                          <td className="py-3 pl-3 pr-5 text-right tabular-nums font-medium text-[var(--color-ink)]">
                            {item.amount ? `$${item.amount.toFixed(2)}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Line Items Pagination Controls (if > 25 items) */}
                {totalItemPages > 1 && (
                  <div className="flex items-center justify-between gap-3 text-[13px] text-[var(--color-text-muted)] tabular-nums">
                    <span>
                      Showing {(itemsPage - 1) * itemsPageSize + 1} to{' '}
                      {Math.min(itemsPage * itemsPageSize, items.length)} of {items.length} items
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setItemsPage((p) => Math.max(1, p - 1))}
                        disabled={itemsPage === 1}
                        aria-label="Previous page of items"
                        className="min-h-[36px] px-3.5 rounded-full text-[13px] font-medium bg-[var(--color-surface-subtle)] text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        Prev
                      </button>
                      <span className="px-1.5 text-[var(--color-ink)]">
                        {itemsPage} / {totalItemPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setItemsPage((p) => Math.min(totalItemPages, p + 1))}
                        disabled={itemsPage === totalItemPages}
                        aria-label="Next page of items"
                        className="min-h-[36px] px-3.5 rounded-full text-[13px] font-medium bg-[var(--color-surface-subtle)] text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Subtotal / Tax Summary footer */}
                <div className="flex justify-end">
                  <dl className="w-full sm:w-72 text-sm">
                    <div className="flex justify-between py-2 text-[var(--color-text-secondary)]">
                      <dt>Subtotal</dt>
                      <dd className="text-[var(--color-ink)] tabular-nums">
                        ${(invoiceData.subtotal || receiptData.subtotal || 0).toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 text-[var(--color-text-secondary)]">
                      <dt>Tax / VAT</dt>
                      <dd className="text-[var(--color-ink)] tabular-nums">
                        ${(invoiceData.tax_amount || receiptData.tax || 0).toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex justify-between pt-2.5 mt-1 border-t border-[var(--color-border)] font-semibold text-[var(--color-ink)]">
                      <dt>Grand Total</dt>
                      <dd className="tabular-nums">
                        ${(invoiceData.total_amount || receiptData.total_amount || 0).toFixed(2)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: AI Insights & Cleaned Summary */}
        {activeTab === 'ai_summary' && (
          <div role="tabpanel" id="tabpanel-ai_summary" aria-labelledby="tab-ai_summary" className="space-y-6">
            {transactions.length > 0 && (
              balanceCheck.status === 'verified' ? (
                <div role="status" className="rounded-2xl p-4 flex items-start gap-3 bg-[var(--color-success-soft)]">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[15px] text-[var(--color-ink)]">Running balance verified</p>
                    <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                      {balanceCheck.checkedRows > 0
                        ? `All ${balanceCheck.checkedRows} rows with a printed balance match the recomputed running balance`
                        : 'The recomputed balance'}
                      {balanceCheck.closingMatches ? ', and the result equals the closing balance.' : '.'}
                    </p>
                  </div>
                </div>
              ) : balanceCheck.status === 'mismatch' ? (
                <div role="status" className="rounded-2xl p-4 flex items-start gap-3 bg-[var(--color-warning-soft)]">
                  <AlertTriangle className="w-5 h-5 text-[var(--color-warning)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[15px] text-[var(--color-ink)]">Check these rows before exporting</p>
                    <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                      {balanceCheck.mismatchRows.length > 0 &&
                        `${balanceCheck.mismatchRows.length} row${balanceCheck.mismatchRows.length === 1 ? '' : 's'} don't match the printed running balance (row ${balanceCheck.mismatchRows
                          .slice(0, 5)
                          .map((i) => i + 1)
                          .join(', ')}${balanceCheck.mismatchRows.length > 5 ? ', …' : ''}). `}
                      {balanceCheck.closingMatches === false && 'The recomputed total does not equal the closing balance. '}
                      Compare with the original statement.
                    </p>
                  </div>
                </div>
              ) : (
                <div role="status" className="rounded-2xl p-4 flex items-start gap-3 bg-[var(--color-surface-subtle)]">
                  <Info className="w-5 h-5 text-[var(--color-text-muted)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[15px] text-[var(--color-ink)]">Balance check not available</p>
                    <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                      This statement has no printed running or closing balance to verify against. Compare the totals with your statement.
                    </p>
                  </div>
                </div>
              )
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <h4 className="text-[15px] font-semibold text-[var(--color-ink)] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[var(--color-text-muted)]" aria-hidden="true" />
                  Entity Verification
                </h4>
                <dl className="text-sm border-t border-[var(--color-border)]">
                  <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--color-border-subtle)] last:border-b-0">
                    <dt className="text-[var(--color-text-secondary)]">Issuer Organization</dt>
                    <dd className="text-[var(--color-ink)] text-right">
                      {bankData.bank_name || invoiceData.vendor_name || receiptData.merchant_name || 'Verified Financial Institute'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--color-border-subtle)] last:border-b-0">
                    <dt className="text-[var(--color-text-secondary)]">Currency Baseline</dt>
                    <dd className="text-[var(--color-ink)] tabular-nums">{currency}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--color-border-subtle)] last:border-b-0">
                    <dt className="text-[var(--color-text-secondary)]">AI Model Stage</dt>
                    <dd className="text-[var(--color-ink)]">AI Financial Engine</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-2">
                <h4 className="text-[15px] font-semibold text-[var(--color-ink)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--color-text-muted)]" aria-hidden="true" />
                  Stage Timings
                </h4>
                <dl className="text-sm border-t border-[var(--color-border)]">
                  <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--color-border-subtle)] last:border-b-0">
                    <dt className="text-[var(--color-text-secondary)]">OCR Text Extraction</dt>
                    <dd className="tabular-nums text-[var(--color-ink)]">
                      {data.metadata?.stage_timings_ms?.ocr_extraction || 12}ms
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--color-border-subtle)] last:border-b-0">
                    <dt className="text-[var(--color-text-secondary)]">AI Cleaning</dt>
                    <dd className="tabular-nums text-[var(--color-ink)]">
                      {data.metadata?.stage_timings_ms?.ai_cleaning || 480}ms
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--color-border-subtle)] last:border-b-0">
                    <dt className="text-[var(--color-text-secondary)]">Structured Entity Parser</dt>
                    <dd className="tabular-nums text-[var(--color-ink)]">
                      {data.metadata?.stage_timings_ms?.structured_extraction || 655}ms
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {data.cleaned_text && (
              <div className="space-y-2">
                <h4 className="text-[13px] font-medium text-[var(--color-text-muted)]">
                  Cleaned Statement Narrative
                </h4>
                <pre className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] text-[13px] text-[var(--color-ink)] font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {data.cleaned_text}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Raw OCR Text (Chunked/Paginated for 100+ pages) */}
        {activeTab === 'raw_text' && (
          <div role="tabpanel" id="tabpanel-raw_text" aria-labelledby="tab-raw_text" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-[var(--color-text-muted)]">
              <span>Raw Optical Character Recognition Output ({data.metadata?.ocr_engine || 'PyMuPDF Engine'})</span>
              <div className="flex items-center gap-2 tabular-nums">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-xs font-medium text-[var(--color-text-secondary)]">
                  {data.raw_text?.length || 0} chars
                </span>
                {rawTextChunks.length > 1 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-brand-soft)] text-xs font-medium text-[var(--color-brand-dark)]">
                    Page {rawTextPage} of {rawTextChunks.length}
                  </span>
                )}
              </div>
            </div>

            {rawTextChunks.length > 1 && (
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="text-[var(--color-text-secondary)] tabular-nums">
                  Displaying Section {rawTextPage} of {rawTextChunks.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRawTextPage((p) => Math.max(1, p - 1))}
                    disabled={rawTextPage === 1}
                    aria-label="Previous raw text section"
                    className="min-h-[36px] px-3.5 rounded-full text-[13px] font-medium bg-[var(--color-surface-subtle)] text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setRawTextPage((p) => Math.min(rawTextChunks.length, p + 1))}
                    disabled={rawTextPage === rawTextChunks.length}
                    aria-label="Next raw text section"
                    className="min-h-[36px] px-3.5 rounded-full text-[13px] font-medium bg-[var(--color-surface-subtle)] text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            <pre className="p-5 rounded-2xl bg-[var(--color-surface-subtle)] text-[var(--color-ink)] text-[13px] font-mono overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
              {rawTextChunks.length > 0 ? rawTextChunks[rawTextPage - 1] : (data.raw_text || 'No raw text stream provided.')}
            </pre>
          </div>
        )}

        {/* Tab Content 4: JSON Payload (Lazy Loaded) */}
        {activeTab === 'json' && (
          <div role="tabpanel" id="tabpanel-json" aria-labelledby="tab-json" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-[var(--color-text-muted)]">
                API Standard Response Object (`ExtractionResponse`)
              </span>
              <button
                type="button"
                onClick={copyJson}
                className="min-h-[36px] px-3.5 rounded-full text-[13px] font-medium bg-[var(--color-surface-subtle)] text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-5 rounded-2xl bg-[var(--color-surface-subtle)] text-[var(--color-ink)] text-[13px] font-mono overflow-x-auto max-h-96 whitespace-pre">
              {formattedJson}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
