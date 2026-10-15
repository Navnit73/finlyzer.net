'use client';

import React, { useState, useMemo, useDeferredValue } from 'react';
import { Transaction } from '@/types/ocr';
import { Search, ArrowUpDown, Copy, Check } from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  currency?: string;
}

export default function TransactionsTable({
  transactions = [],
  currency = 'USD',
}: TransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // One formatter per currency instead of one per cell render.
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: 2,
      }),
    [currency]
  );

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '—';
    return currencyFormatter.format(amount);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const filteredTransactions = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return transactions.filter((t) => {
      if (filterType === 'credit' && (!t.credit || t.credit <= 0)) return false;
      if (filterType === 'debit' && (!t.debit || t.debit <= 0)) return false;

      if (!query) return true;

      return (
        (t.description && t.description.toLowerCase().includes(query)) ||
        (t.reference && t.reference.toLowerCase().includes(query)) ||
        (t.date && t.date.includes(query)) ||
        (t.category && t.category.toLowerCase().includes(query))
      );
    });
  }, [transactions, deferredSearch, filterType]);

  const sortedTransactions = useMemo(() => {
    if (filteredTransactions.length <= 1) return filteredTransactions;

    return [...filteredTransactions].sort((a, b) => {
      if (sortField === 'date') {
        return sortOrder === 'asc'
          ? (a.date || '').localeCompare(b.date || '')
          : (b.date || '').localeCompare(a.date || '');
      }
      if (sortField === 'description') {
        return sortOrder === 'asc'
          ? (a.description || '').localeCompare(b.description || '')
          : (b.description || '').localeCompare(a.description || '');
      }
      if (sortField === 'amount') {
        const valA = (a.credit || 0) - (a.debit || 0);
        const valB = (b.credit || 0) - (b.debit || 0);
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredTransactions, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    return sortedTransactions.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [sortedTransactions, currentPage, pageSize]);

  const toggleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="py-12 px-6 text-center rounded-2xl bg-[var(--color-surface-subtle)] text-sm text-[var(--color-text-secondary)]">
        No transaction rows extracted for this document.
      </div>
    );
  }

  const ariaSort = (field: 'date' | 'amount' | 'description') =>
    sortField === field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none';

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Quick Filter Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search description, ref, date..."
            aria-label="Search transactions by description, reference, or date"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-11 sm:h-10 pl-10 pr-4 rounded-xl bg-[var(--color-surface-subtle)] border border-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:bg-[var(--color-surface)] focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/20 transition-colors"
          />
        </div>

        {/* Filter segmented control */}
        <div className="inline-flex items-center gap-1 p-1 self-start sm:self-auto bg-[var(--color-surface-subtle)] rounded-full overflow-x-auto no-scrollbar" role="group" aria-label="Filter transactions">
          <button
            type="button"
            onClick={() => {
              setFilterType('all');
              setCurrentPage(1);
            }}
            aria-pressed={filterType === 'all'}
            className={`min-h-[32px] px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterType('credit');
              setCurrentPage(1);
            }}
            aria-pressed={filterType === 'credit'}
            className={`min-h-[32px] px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'credit'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            Credits (+)
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterType('debit');
              setCurrentPage(1);
            }}
            aria-pressed={filterType === 'debit'}
            className={`min-h-[32px] px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'debit'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            Debits (-)
          </button>
        </div>
      </div>

      {/* Table: sticky header, vertical scroll for long pages, horizontal scroll on mobile */}
      <div className="overflow-auto max-h-[70vh] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overscroll-x-contain">
        <table className="w-full text-left text-sm min-w-[720px] border-separate border-spacing-0" aria-label="Extracted Transactions">
          <thead className="text-[13px] text-[var(--color-text-muted)] select-none">
            <tr>
              <th scope="col" aria-sort={ariaSort('date')} className="sticky top-0 z-10 bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] font-medium pl-4 sm:pl-5 pr-3 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => toggleSort('date')}
                  className="inline-flex items-center text-left gap-1 w-full min-h-[40px] font-medium hover:text-[var(--color-ink)] cursor-pointer"
                >
                  <span>Date</span>
                  <ArrowUpDown className={`w-3 h-3 ${sortField === 'date' ? 'text-[var(--color-ink)]' : 'opacity-50'}`} aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={ariaSort('description')} className="sticky top-0 z-10 bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] font-medium px-3 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => toggleSort('description')}
                  className="inline-flex items-center text-left gap-1 w-full min-h-[40px] font-medium hover:text-[var(--color-ink)] cursor-pointer"
                >
                  <span>Description &amp; Reference</span>
                  <ArrowUpDown className={`w-3 h-3 ${sortField === 'description' ? 'text-[var(--color-ink)]' : 'opacity-50'}`} aria-hidden="true" />
                </button>
              </th>
              <th scope="col" className="sticky top-0 z-10 bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] font-medium px-3 py-2.5 whitespace-nowrap">
                Category
              </th>
              <th scope="col" aria-sort={ariaSort('amount')} className="sticky top-0 z-10 bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] font-medium px-3 text-right whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => toggleSort('amount')}
                  className="inline-flex items-center justify-end text-right gap-1 w-full min-h-[40px] font-medium hover:text-[var(--color-ink)] cursor-pointer"
                >
                  <span>Debit (-)</span>
                  <ArrowUpDown className={`w-3 h-3 ${sortField === 'amount' ? 'text-[var(--color-ink)]' : 'opacity-50'}`} aria-hidden="true" />
                </button>
              </th>
              <th scope="col" className="sticky top-0 z-10 bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] font-medium px-3 py-2.5 text-right whitespace-nowrap">
                Credit (+)
              </th>
              <th scope="col" className="sticky top-0 z-10 bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] font-medium pl-3 pr-4 sm:pr-5 py-2.5 text-right whitespace-nowrap">
                Running Balance
              </th>
            </tr>
          </thead>
          <tbody className="[&>tr:not(:last-child)>td]:border-b [&>tr>td]:border-[var(--color-border-subtle)]">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((t, index) => {
                const isCredit = t.credit !== null && t.credit !== undefined && t.credit > 0;
                return (
                  <tr
                    key={`${t.date}-${index}`}
                    className="hover:bg-[var(--color-surface-subtle)] transition-colors"
                  >
                    {/* Date */}
                    <td className="tabular-nums text-[13px] text-[var(--color-text-secondary)] pl-4 sm:pl-5 pr-3 py-3 whitespace-nowrap align-top">
                      {t.date}
                    </td>

                    {/* Description & Reference */}
                    <td className="min-w-[220px] max-w-[360px] px-3 py-3 align-top">
                      <p className="text-[var(--color-ink)] leading-snug break-words">
                        {t.description}
                      </p>
                      {t.reference && (
                        <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mt-0.5">
                          <span className="tabular-nums truncate max-w-[220px]">
                            {t.reference}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(t.reference!)}
                            className="w-6 h-6 inline-flex items-center justify-center rounded-md hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                            title="Copy reference number"
                            aria-label="Copy reference number"
                          >
                            {copiedRef === t.reference ? (
                              <Check className="w-3 h-3 text-[var(--color-success)]" aria-hidden="true" />
                            ) : (
                              <Copy className="w-3 h-3" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Category Chip */}
                    <td className="px-3 py-3 whitespace-nowrap align-top">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
                        {t.category || (isCredit ? 'Income' : 'Expense')}
                      </span>
                    </td>

                    {/* Debit */}
                    <td className="text-right tabular-nums whitespace-nowrap text-[var(--color-ink)] px-3 py-3 align-top">
                      {t.debit ? (
                        <>-{formatCurrency(t.debit)}</>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>

                    {/* Credit */}
                    <td className="text-right tabular-nums whitespace-nowrap text-[var(--color-success)] px-3 py-3 align-top">
                      {t.credit ? (
                        <>+{formatCurrency(t.credit)}</>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>

                    {/* Balance */}
                    <td className="text-right tabular-nums font-medium text-[var(--color-ink)] pl-3 pr-4 sm:pr-5 py-3 whitespace-nowrap align-top">
                      {formatCurrency(t.balance)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-sm text-[var(--color-text-secondary)]">
                  No matching transactions found for &quot;{searchTerm}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[var(--color-text-muted)] tabular-nums">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedTransactions.length)} of{' '}
              {sortedTransactions.length} entries
            </span>
            <span aria-hidden="true">&middot;</span>
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-9 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2 text-[13px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/20 cursor-pointer"
            >
              <option value={15}>15 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="min-h-[36px] px-3.5 rounded-full text-[13px] font-medium bg-[var(--color-surface-subtle)] text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 text-[var(--color-ink)]">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="min-h-[36px] px-3.5 rounded-full text-[13px] font-medium bg-[var(--color-surface-subtle)] text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
