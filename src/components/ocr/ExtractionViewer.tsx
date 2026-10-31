'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ExtractionResponse,
  BankStatementData,
  InvoiceData,
  ReceiptData,
  InvoiceItem,
} from '@/types/ocr';
import TransactionsTable from './TransactionsTable';
import ExportActionBar from './ExportActionBar';
import { EXPORT_FORMATS, useExportDownload } from './useExportDownload';
import GuestUnlockModal from '@/components/guest/GuestUnlockModal';
import LazyAuthModal from '@/components/auth/LazyAuthModal';
import { FREE_PAGE_LIMIT } from '@/types/pricing';
import { GUEST_RETENTION_HOURS } from '@/lib/retention';
import { TRANSACTION_KIND_META, TransactionKind, transactionKind } from '@/lib/transaction-kind';
import { checkRunningBalance } from '@/lib/balance-check';
import {
  AlertTriangle,
  Info,
  Clock,
  Building,
  Copy,
  Check,
  CheckCircle2,
  Download,
  Upload,
  Table,
  FileText,
  Braces,
  Lock,
  ShieldCheck,
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

  const isBank = docType === 'bank_statement';
  const entityName = bankData.bank_name || invoiceData.vendor_name || receiptData.merchant_name;

  const exportState = useExportDownload({
    documentId: data.id,
    documentTitle: bankData.bank_name || invoiceData.vendor_name || 'Statement',
    pages: pageCount,
    isGuest,
    isPaid,
  });
  const { downloadingFormat, downloadSuccess, requiresUnlock, download } = exportState;
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Show the sticky download bar once the hero button has scrolled out of view.
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const node = heroCtaRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const moneyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: 2,
      }),
    [currency]
  );
  const money = (value: number) => moneyFormatter.format(value || 0);

  const rowCount = isBank ? transactions.length : items.length;
  const rowNoun = isBank ? 'transaction' : 'line item';
  const detailLine = [entityName, bankData.account_holder, bankData.statement_period].filter(Boolean);

  // The balance equation that lets people check the result against their own statement.
  const hasOpening = bankData.opening_balance !== undefined && bankData.opening_balance !== null;
  const equation: { label: string; value: string; op?: string; total?: boolean; dot?: string }[] = isBank
    ? [
        ...(hasOpening ? [{ label: 'Opening balance', value: money(bankData.opening_balance as number) }] : []),
        { label: 'Money in', value: money(totalInflow), op: hasOpening ? '+' : undefined, dot: TRANSACTION_KIND_META.income.fill },
        { label: 'Money out', value: money(totalOutflow), op: '−', dot: TRANSACTION_KIND_META.expense.fill },
        hasOpening
          ? { label: 'Closing balance', value: money(closingBalance), op: '=', total: true }
          : { label: 'Net cash flow', value: money(netSavings), op: '=', total: true },
      ]
    : [
        { label: 'Subtotal', value: money(invoiceData.subtotal || receiptData.subtotal || 0) },
        { label: 'Tax & VAT', value: money(invoiceData.tax_amount || receiptData.tax || 0), op: '+' },
        { label: 'Total', value: money(invoiceData.total_amount || receiptData.total_amount || 0), op: '=', total: true },
      ];

  // Where the money went: income vs. spending vs. money put into investments.
  const kindTotals = useMemo(() => {
    const totals: Record<TransactionKind, number> = { income: 0, expense: 0, investment: 0 };
    transactions.forEach((t) => {
      totals[transactionKind(t)] += (t.credit || 0) + (t.debit || 0);
    });
    return totals;
  }, [transactions]);
  const kindSum = kindTotals.income + kindTotals.expense + kindTotals.investment;
  const kindOrder: TransactionKind[] = ['income', 'expense', 'investment'];

  const isVerified = isBank && transactions.length > 0 && balanceCheck.status === 'verified';
  const isExcelDownloading = downloadingFormat === 'xlsx';
  const isExcelDone = downloadSuccess === 'xlsx';
  const otherFormats = EXPORT_FORMATS.filter((opt) => opt.format !== 'xlsx');

  const primaryLabel = requiresUnlock
    ? 'Unlock and download'
    : isExcelDone
      ? 'Downloaded'
      : 'Download Excel';

  const tabs = [
    { id: 'structured' as const, label: isBank ? 'Transactions' : 'Line items', icon: Table },
    { id: 'ai_summary' as const, label: 'Checks', icon: ShieldCheck },
    { id: 'raw_text' as const, label: 'Raw text', icon: FileText },
    { id: 'json' as const, label: 'JSON', icon: Braces },
  ];

  const openChecks = () => {
    setActiveTab('ai_summary');
    document.getElementById('details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-16 sm:space-y-24 animate-fade-in">
      {/* 1. Ready: one obvious next step */}
      <section aria-label="Your file is ready" className="text-center space-y-5 pt-4 sm:pt-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success-soft)] px-3 py-1 text-[13px] font-medium text-[var(--color-success)] tabular-nums">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          {rowCount} {rowNoun}
          {rowCount === 1 ? '' : 's'} found
        </span>

        <h1 className="type-hero max-w-3xl mx-auto">
          Your {isBank ? 'statement' : 'document'} is ready.
        </h1>

        <p className="type-lead max-w-2xl mx-auto break-words">
          {detailLine.length > 0
            ? detailLine.map((part, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-[var(--color-text-muted)]" aria-hidden="true"> · </span>}
                  {part}
                </React.Fragment>
              ))
            : <span className="break-all">{data.filename}</span>}
        </p>

        <div ref={heroCtaRef} className="space-y-4 pt-3">
          <button
            type="button"
            onClick={() => download('xlsx')}
            disabled={downloadingFormat !== null}
            className="btn-brand-primary !min-h-[52px] !px-8 !text-[17px] w-full sm:w-auto"
          >
            {isExcelDownloading ? (
              <span className="loading loading-spinner loading-sm" aria-label="Downloading"></span>
            ) : isExcelDone ? (
              <Check className="w-5 h-5" aria-hidden="true" />
            ) : requiresUnlock ? (
              <Lock className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Download className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            )}
            <span>{primaryLabel}</span>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm text-[var(--color-text-secondary)]">
            <span className="mr-1">Or download as</span>
            {otherFormats.map((opt) => (
              <button
                key={opt.format}
                type="button"
                onClick={() => download(opt.format)}
                disabled={downloadingFormat !== null}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-[var(--color-surface-subtle)] px-3 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] cursor-pointer disabled:opacity-50"
              >
                {downloadingFormat === opt.format ? (
                  <span className="loading loading-spinner loading-xs" aria-label="Downloading"></span>
                ) : downloadSuccess === opt.format ? (
                  <Check className="w-3.5 h-3.5 text-[var(--color-success)]" aria-hidden="true" />
                ) : null}
                {opt.ext.slice(1).toUpperCase()}
              </button>
            ))}
            <a href="#export" className="link ml-1 text-[13px]">
              Not sure?
            </a>
          </div>
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 text-[13px] text-[var(--color-text-muted)]">
          {isVerified && (
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--color-success)]" aria-hidden="true" />
              Balance verified
            </li>
          )}
          <li className="tabular-nums">
            {pageCount} page{pageCount === 1 ? '' : 's'} · {currency}
          </li>
          {isGuest && (
            <li className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Deleted after {GUEST_RETENTION_HOURS} hours
            </li>
          )}
        </ul>

        {isGuest && exportState.hasDownloaded && (
          <p role="status" className="mx-auto max-w-lg rounded-2xl bg-[var(--color-surface-subtle)] px-5 py-3 text-sm text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--color-ink)]">Downloaded.</span> Want your next statements kept for you?{' '}
            <button type="button" onClick={() => setIsAuthOpen(true)} className="link cursor-pointer">
              Create a free account
            </button>
          </p>
        )}
      </section>

      {/* 2. Check the numbers */}
      <section aria-label="Check the numbers" className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="type-title">Check it matches your statement.</h2>
          <p className="text-[17px] text-[var(--color-text-secondary)] max-w-xl mx-auto">
            {isBank
              ? 'We add up every row and compare the result with the balance printed on your statement.'
              : 'The totals we read from your document.'}
          </p>
        </div>

        <div className="max-w-5xl mx-auto rounded-2xl bg-[var(--color-surface-subtle)] p-3 sm:p-4 space-y-3">
          <dl className="flex flex-col md:flex-row md:items-stretch gap-2">
            {equation.map((term) => (
              <React.Fragment key={term.label}>
                {term.op && (
                  <span className="self-center text-lg md:text-xl text-[var(--color-text-muted)] md:w-6 text-center leading-none -my-1 md:my-0" aria-hidden="true">
                    {term.op}
                  </span>
                )}
                <div
                  className={`flex-1 min-w-0 flex items-baseline justify-between gap-3 md:block rounded-xl px-4 py-3 md:py-4 sm:px-5 ${
                    term.total ? 'bg-[var(--color-surface)] ring-1 ring-[var(--color-border)]' : 'bg-[var(--color-surface)]'
                  }`}
                >
                  <dt className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
                    {term.dot && <span className={`w-2 h-2 rounded-full ${term.dot}`} aria-hidden="true" />}
                    {term.label}
                  </dt>
                  <dd
                    className={`md:mt-1 truncate font-semibold tracking-tight tabular-nums text-[var(--color-ink)] ${
                      term.total ? 'text-xl md:text-[26px]' : 'text-[17px] md:text-[22px]'
                    }`}
                    title={term.value}
                  >
                    {term.value}
                  </dd>
                </div>
              </React.Fragment>
            ))}
          </dl>

          {isBank && kindSum > 0 && (
            <div className="rounded-xl bg-[var(--color-surface)] px-4 py-4 sm:px-5 space-y-3">
              <p className="text-[13px] text-[var(--color-text-muted)]">Where the money went</p>
              <div
                className="flex h-3 w-full gap-[3px] overflow-hidden rounded-full"
                role="img"
                aria-label={kindOrder.map((k) => `${TRANSACTION_KIND_META[k].plural} ${money(kindTotals[k])}`).join(', ')}
              >
                {kindOrder.map((k) =>
                  kindTotals[k] > 0 ? (
                    <span
                      key={k}
                      className={`h-full ${TRANSACTION_KIND_META[k].fill}`}
                      style={{ width: `${(kindTotals[k] / kindSum) * 100}%` }}
                    />
                  ) : null
                )}
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                {kindOrder.map((k) => (
                  <div key={k} className="flex items-baseline justify-between gap-3 sm:block">
                    <dt className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                      <span className={`w-2 h-2 rounded-full ${TRANSACTION_KIND_META[k].fill}`} aria-hidden="true" />
                      {TRANSACTION_KIND_META[k].plural}
                    </dt>
                    <dd className={`sm:mt-0.5 text-[17px] font-semibold tabular-nums ${TRANSACTION_KIND_META[k].text}`}>
                      {money(kindTotals[k])}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {isBank && transactions.length > 0 && (
            <div className="flex items-start gap-2.5 px-2 pb-1 text-sm text-[var(--color-text-secondary)]">
              {balanceCheck.status === 'verified' ? (
                <>
                  <CheckCircle2 className="w-[18px] h-[18px] shrink-0 mt-px text-[var(--color-success)]" aria-hidden="true" />
                  <p>
                    <span className="font-semibold text-[var(--color-ink)]">Matches your statement.</span>{' '}
                    {balanceCheck.checkedRows > 0
                      ? `All ${balanceCheck.checkedRows} rows agree with the printed running balance.`
                      : 'The totals agree with the printed balance.'}
                  </p>
                </>
              ) : balanceCheck.status === 'mismatch' ? (
                <>
                  <AlertTriangle className="w-[18px] h-[18px] shrink-0 mt-px text-[var(--color-warning)]" aria-hidden="true" />
                  <p>
                    <span className="font-semibold text-[var(--color-ink)]">A few rows need a look.</span>{' '}
                    Some amounts don&apos;t match the printed balance. Compare them with your PDF before you import.{' '}
                    <button type="button" onClick={openChecks} className="link cursor-pointer">
                      Show rows
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <Info className="w-[18px] h-[18px] shrink-0 mt-px text-[var(--color-text-muted)]" aria-hidden="true" />
                  <p>Your statement has no printed balance to compare with, so check these totals against your PDF.</p>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. Which file do I need? */}
      <ExportActionBar exportState={exportState} onConsolidateClick={onConsolidateClick} />

      {/* 4. Every row */}
      <section id="details" aria-label="Extraction details" className="scroll-mt-24 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="type-title">See every row.</h2>
          <p className="text-[17px] text-[var(--color-text-secondary)]">
            Search, sort and filter before you download.
          </p>
        </div>

        <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
          <div
            role="tablist"
            aria-label="Extraction view options"
            className="mx-auto flex w-fit items-stretch gap-1 rounded-2xl bg-[var(--color-surface-subtle)] p-1.5"
          >
            {tabs.map(({ id, label, icon: Icon }) => {
              const selected = activeTab === id;
              return (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  id={`tab-${id}`}
                  aria-selected={selected}
                  aria-controls={`tabpanel-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={`flex min-w-[80px] sm:min-w-[112px] shrink-0 flex-col items-center gap-1.5 rounded-xl px-3 sm:px-5 py-3 text-[13px] sm:text-sm font-medium transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[var(--color-surface)] text-[var(--color-brand-dark)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              );
            })}
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
                      {data.metadata?.stage_timings_ms?.ocr_extraction != null ? `${data.metadata.stage_timings_ms.ocr_extraction}ms` : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--color-border-subtle)] last:border-b-0">
                    <dt className="text-[var(--color-text-secondary)]">AI Cleaning</dt>
                    <dd className="tabular-nums text-[var(--color-ink)]">
                      {data.metadata?.stage_timings_ms?.ai_cleaning != null ? `${data.metadata.stage_timings_ms.ai_cleaning}ms` : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2.5 border-b border-[var(--color-border-subtle)] last:border-b-0">
                    <dt className="text-[var(--color-text-secondary)]">Structured Entity Parser</dt>
                    <dd className="tabular-nums text-[var(--color-ink)]">
                      {data.metadata?.stage_timings_ms?.structured_extraction != null ? `${data.metadata.stage_timings_ms.structured_extraction}ms` : '—'}
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

      {/* 5. What's next */}
      <section aria-label="What's next" className="rounded-2xl bg-[var(--color-surface-subtle)] px-6 py-10 sm:px-12 sm:py-14 text-center space-y-5">
        {isGuest ? (
          <>
            <h2 className="type-title">Convert statements often?</h2>
            <p className="text-[17px] text-[var(--color-text-secondary)] max-w-xl mx-auto">
              A free account comes with {FREE_PAGE_LIMIT} free pages and a private vault that keeps every result.
              Guest files are deleted after {GUEST_RETENTION_HOURS} hours.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
              <button type="button" onClick={() => setIsAuthOpen(true)} className="btn-brand-primary">
                Create a free account
              </button>
              {onNewScan && (
                <button type="button" onClick={onNewScan} className="btn-brand-secondary">
                  <Upload className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  Convert another statement
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="type-title">Got another one?</h2>
            <p className="text-[17px] text-[var(--color-text-secondary)] max-w-xl mx-auto">
              Every conversion is saved to your vault, so you can come back and download it again.
            </p>
            {onNewScan && (
              <div className="pt-2">
                <button type="button" onClick={onNewScan} className="btn-brand-primary">
                  <Upload className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  Convert another statement
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Sticky download bar */}
      <div
        aria-hidden={!showStickyBar}
        className={`fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition-[opacity,transform] duration-300 ${
          showStickyBar ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-4'
        }`}
      >
        <div className="surface-frosted flex w-full max-w-xl min-w-0 items-center gap-3 rounded-full border border-[var(--color-border)] py-2 pl-4 sm:pl-5 pr-2">
          <p className="min-w-0 flex-1 truncate text-sm text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--color-ink)]">{entityName || data.filename}</span>
            <span className="hidden sm:inline tabular-nums"> · {rowCount} rows</span>
          </p>
          <button
            type="button"
            tabIndex={showStickyBar ? 0 : -1}
            onClick={() => download('xlsx')}
            disabled={downloadingFormat !== null}
            className="btn-brand-primary !min-h-[40px] !px-5 !text-sm shrink-0"
          >
            {isExcelDownloading ? (
              <span className="loading loading-spinner loading-xs" aria-label="Downloading"></span>
            ) : requiresUnlock ? (
              <Lock className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Download className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            )}
            <span className="sm:hidden">{requiresUnlock ? 'Unlock' : 'Download'}</span>
            <span className="hidden sm:inline">{primaryLabel}</span>
          </button>
        </div>
      </div>

      <GuestUnlockModal
        isOpen={exportState.isUnlockModalOpen}
        onClose={exportState.closeUnlockModal}
        documentId={data.id}
        filename={bankData.bank_name || invoiceData.vendor_name || 'Statement'}
        pageCount={pageCount}
        onUnlockSuccess={handleUnlockSuccess}
      />

      <LazyAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} reason="save_history" />
    </div>
  );
}
