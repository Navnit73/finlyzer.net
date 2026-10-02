'use client';

import React, { useState, useMemo } from 'react';
import { Transaction } from '@/types/ocr';
import { Search, ArrowDownRight, ArrowUpRight, ArrowUpDown, Copy, Check } from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  currency?: string;
}

export default function TransactionsTable({
  transactions = [],
  currency = 'USD',
}: TransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.reference && t.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.date.includes(searchTerm);

      if (!matchesSearch) return false;

      if (filterType === 'credit') return t.credit !== null && t.credit !== undefined && t.credit > 0;
      if (filterType === 'debit') return t.debit !== null && t.debit !== undefined && t.debit > 0;
      return true;
    });
  }, [transactions, searchTerm, filterType]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortField === 'date') {
        return sortOrder === 'asc'
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      }
      if (sortField === 'description') {
        return sortOrder === 'asc'
          ? a.description.localeCompare(b.description)
          : b.description.localeCompare(a.description);
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
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
      <div className="p-8 text-center bg-[var(--color-surface-subtle)] rounded-2xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
        No transaction rows extracted for this document.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Quick Filter Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, reference..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs sm:text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)]"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--color-surface-subtle)] rounded-xl border border-[var(--color-border)] self-start sm:self-auto">
          <button
            onClick={() => {
              setFilterType('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-[var(--color-ink)] text-white shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => {
              setFilterType('credit');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'credit'
                ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)] shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            Credits / Inflow
          </button>
          <button
            onClick={() => {
              setFilterType('debit');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'debit'
                ? 'bg-[var(--media-pink)] text-white shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            Debits / Outflow
          </button>
        </div>
      </div>

      {/* Desktop Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
        <table className="table w-full text-xs sm:text-sm">
          <thead className="bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border-b border-[var(--color-border)] text-[11px] uppercase tracking-wider font-bold">
            <tr>
              <th
                onClick={() => toggleSort('date')}
                className="cursor-pointer hover:text-[var(--color-ink)] py-3.5 pl-5"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('description')}
                className="cursor-pointer hover:text-[var(--color-ink)] py-3.5"
              >
                <div className="flex items-center gap-1">
                  <span>Description &amp; Reference</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5">Category</th>
              <th
                onClick={() => toggleSort('amount')}
                className="cursor-pointer hover:text-[var(--color-ink)] py-3.5 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Debit (-)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 text-right">Credit (+)</th>
              <th className="py-3.5 text-right pr-5">Running Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((t, index) => {
                const isCredit = t.credit !== null && t.credit !== undefined && t.credit > 0;
                return (
                  <tr
                    key={`${t.date}-${index}`}
                    className="hover:bg-[var(--color-surface-subtle)] transition-colors"
                  >
                    {/* Date */}
                    <td className="font-mono text-xs font-medium text-[var(--color-text-secondary)] pl-5 whitespace-nowrap">
                      {t.date}
                    </td>

                    {/* Description & Reference */}
                    <td className="max-w-[280px]">
                      <p className="font-semibold text-[var(--color-ink)] leading-snug">
                        {t.description}
                      </p>
                      {t.reference && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          <span className="font-mono">{t.reference}</span>
                          <button
                            onClick={() => handleCopy(t.reference!)}
                            className="hover:text-[var(--color-ink)] transition-colors"
                            title="Copy reference number"
                          >
                            {copiedRef === t.reference ? (
                              <Check className="w-3 h-3 text-[var(--color-brand-hover)]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Category Chip */}
                    <td>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-ink)]">
                        {t.category || (isCredit ? 'Income' : 'Expense')}
                      </span>
                    </td>

                    {/* Debit */}
                    <td className="text-right font-mono font-bold whitespace-nowrap text-red-600">
                      {t.debit ? (
                        <span className="inline-flex items-center gap-0.5">
                          <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                          -{formatCurrency(t.debit)}
                        </span>
                      ) : (
                        <span className="text-[var(--color-text-muted)] font-normal">—</span>
                      )}
                    </td>

                    {/* Credit */}
                    <td className="text-right font-mono font-bold whitespace-nowrap text-emerald-600">
                      {t.credit ? (
                        <span className="inline-flex items-center gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                          +{formatCurrency(t.credit)}
                        </span>
                      ) : (
                        <span className="text-[var(--color-text-muted)] font-normal">—</span>
                      )}
                    </td>

                    {/* Balance */}
                    <td className="text-right font-mono font-bold text-[var(--color-ink)] pr-5 whitespace-nowrap">
                      {formatCurrency(t.balance)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-xs text-[var(--color-text-secondary)]">
                  No matching transactions found for &quot;{searchTerm}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-1 text-xs text-[var(--color-text-secondary)]">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedTransactions.length)} of{' '}
            {sortedTransactions.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] disabled:opacity-40 font-semibold"
            >
              Previous
            </button>
            <span className="px-2 font-bold text-[var(--color-ink)]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] disabled:opacity-40 font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
