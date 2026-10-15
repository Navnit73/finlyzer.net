'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  AlertCircle,
  ChevronRight,
  Download,
  Lock,
  Printer,
  Receipt,
  RefreshCw,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';
import { OrderRecord } from '@/types/pricing';
import AuthModal from '@/components/auth/AuthModal';
import { formatUSD } from '@/lib/format';
import BrandLogo from '@/components/BrandLogo';

type Filter = 'paid' | 'all';

const badge = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap';

// 'created' is an abandoned checkout, so it reads as neutral rather than a warning.
const STATUS: Record<OrderRecord['status'], { label: string; className: string }> = {
  completed: { label: 'Paid', className: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
  pending: { label: 'Pending', className: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]' },
  created: { label: 'Not completed', className: 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]' },
  failed: { label: 'Failed', className: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]' },
};

function StatusBadge({ status }: { status: OrderRecord['status'] }) {
  const s = STATUS[status] ?? STATUS.created;
  return <span className={`${badge} ${s.className}`}>{s.label}</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function DownloadButton({
  order,
  downloadingId,
  onDownload,
  compact = false,
}: {
  order: OrderRecord;
  downloadingId: string | null;
  onDownload: (orderId: string) => void;
  compact?: boolean;
}) {
  const busy = downloadingId === order.order_id;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDownload(order.order_id);
      }}
      disabled={busy}
      aria-label={`Download PDF invoice for order ${order.order_id}`}
      className={`inline-flex items-center justify-center gap-1.5 h-8 rounded-full text-[13px] font-medium bg-[var(--color-surface-muted)] text-[var(--color-ink)] hover:bg-[var(--color-border)] disabled:opacity-60 disabled:cursor-wait transition-colors cursor-pointer whitespace-nowrap ${compact ? 'w-8' : 'px-3'}`}
    >
      {busy ? (
        <span className="loading loading-spinner w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <Download className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
      )}
      {!compact && <span>{busy ? 'Preparing' : 'PDF'}</span>}
    </button>
  );
}

export default function InvoicesBillingPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('paid');
  const [selectedReceipt, setSelectedReceipt] = useState<OrderRecord | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isLoggedIn = status === 'authenticated' && !!session?.user;
  // Skeletons only on first load; later refetches (focus, quota events) update in place.
  const isInitialLoading = status === 'loading' || (isLoggedIn && !hasLoaded);

  const fetchOrders = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/user/orders');
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setOrders(data.orders || []);
      setLoadError(null);
    } catch (err) {
      console.warn('Failed to load orders:', err);
      setLoadError('We couldn’t load your billing history.');
    } finally {
      setIsRefreshing(false);
      setHasLoaded(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchOrders();
    window.addEventListener('finlyzer:quota_updated', fetchOrders);
    window.addEventListener('focus', fetchOrders);
    return () => {
      window.removeEventListener('finlyzer:quota_updated', fetchOrders);
      window.removeEventListener('focus', fetchOrders);
    };
  }, [fetchOrders]);

  // Receipt dialog: Escape to close, lock page scroll, move focus into the dialog.
  useEffect(() => {
    if (!selectedReceipt) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedReceipt(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedReceipt]);

  // Only completed (paid) orders count toward spend and credits; abandoned checkouts stay 'created'.
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const unpaidCount = orders.length - completedOrders.length;
  const totalSpentUsd = completedOrders.reduce((sum, o) => sum + o.amount_usd, 0);
  const totalCreditsBought = completedOrders.reduce((sum, o) => sum + (o.pages_credited || 0), 0);
  const visibleOrders = filter === 'paid' ? completedOrders : orders;

  const handleDownloadPdf = async (orderId: string) => {
    setDownloadError(null);
    setDownloadingId(orderId);
    try {
      const res = await fetch(`/api/user/orders/${orderId}/receipt`);
      if (!res.ok) throw new Error('Failed to download invoice PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Finlyzers_Invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('PDF receipt download error:', (err as Error)?.message || 'Receipt error');
      setDownloadError(`We couldn’t generate the PDF for order ${orderId}. Please try again.`);
    } finally {
      setDownloadingId(null);
    }
  };

  const summary = [
    { label: 'Paid orders', value: completedOrders.length.toLocaleString() },
    { label: 'Pages purchased', value: totalCreditsBought.toLocaleString() },
    { label: 'Total spent', value: formatUSD(totalSpentUsd) },
  ];

  const openReceipt = (order: OrderRecord) => {
    if (order.status === 'completed') setSelectedReceipt(order);
  };

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <h1 className="type-title">Invoices</h1>
          <p className="text-[15px] text-[var(--color-text-secondary)]">
            Your credit purchases, with a PDF invoice for every paid order.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn && (
            <button
              type="button"
              onClick={fetchOrders}
              disabled={isRefreshing}
              aria-label="Refresh billing history"
              title="Refresh"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink)] hover:bg-[var(--color-border)] disabled:cursor-wait transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
          <Link href="/pricing" className="btn-brand-primary !min-h-9 !h-9 !px-4 !text-sm">
            <Zap className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Buy credits</span>
          </Link>
        </div>
      </header>

      {/* Guest sign-in notice */}
      {!isLoggedIn && status !== 'loading' && (
        <div className="py-16 sm:py-20 text-center max-w-md mx-auto space-y-4">
          <span className="mx-auto flex w-10 h-10 items-center justify-center rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
            <Lock className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)]">Sign in to see your invoices</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Orders and invoices are linked to the account you paid with.
            </p>
          </div>
          <button type="button" onClick={() => setIsAuthModalOpen(true)} className="btn-brand-primary">
            <UserCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Sign in with Google</span>
          </button>
        </div>
      )}

      {(isLoggedIn || status === 'loading') && (
        <>
          {/* Summary */}
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)]">
            {summary.map((item) => (
              <div key={item.label} className="bg-[var(--color-surface)] p-4 sm:p-6 space-y-1 min-w-0">
                <dt className="text-xs sm:text-[13px] text-[var(--color-text-muted)] truncate">{item.label}</dt>
                <dd className="text-lg sm:text-2xl font-semibold tracking-tight text-[var(--color-ink)] tabular-nums truncate">
                  {isInitialLoading ? <span className="skeleton-line block h-7 w-16 sm:w-28" aria-hidden="true" /> : item.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Errors */}
          {loadError && hasLoaded && (
            <div role="alert" className="flex items-center gap-3 rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="flex-1">{loadError}</span>
              <button type="button" onClick={fetchOrders} className="font-medium underline underline-offset-2 cursor-pointer">
                Try again
              </button>
            </div>
          )}
          {downloadError && (
            <div role="alert" className="flex items-center gap-3 rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="flex-1">{downloadError}</span>
              <button
                type="button"
                onClick={() => setDownloadError(null)}
                aria-label="Dismiss"
                className="inline-flex w-7 h-7 items-center justify-center rounded-full hover:bg-[var(--color-surface)] cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Orders */}
          <section aria-labelledby="orders-heading" className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 id="orders-heading" className="text-[17px] font-semibold text-[var(--color-ink)]">
                Order history
              </h2>
              {unpaidCount > 0 && (
                <div role="tablist" aria-label="Filter orders" className="inline-flex rounded-full bg-[var(--color-surface-muted)] p-0.5 text-[13px]">
                  {(['paid', 'all'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      role="tab"
                      aria-selected={filter === f}
                      onClick={() => setFilter(f)}
                      className={`h-7 px-3 rounded-full font-medium transition-colors cursor-pointer ${
                        filter === f
                          ? 'bg-[var(--color-surface)] text-[var(--color-ink)]'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
                      }`}
                    >
                      {f === 'paid' ? `Paid (${completedOrders.length})` : `All (${orders.length})`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isInitialLoading ? (
              <div role="status" aria-label="Loading billing records" className="border-t border-[var(--color-border)]">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="py-4 border-b border-[var(--color-border-subtle)] flex items-center gap-6">
                    <span className="skeleton-line block h-4 w-24" />
                    <span className="skeleton-line block h-4 w-40" />
                    <span className="skeleton-line block h-4 w-16 ml-auto" />
                  </div>
                ))}
                <span className="sr-only">Loading billing records...</span>
              </div>
            ) : visibleOrders.length === 0 ? (
              <div className="py-14 text-center space-y-3 rounded-2xl bg-[var(--color-surface-subtle)]">
                <span className="mx-auto flex w-10 h-10 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
                  <Receipt className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <p className="text-[17px] font-semibold text-[var(--color-ink)]">No paid orders yet</p>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto px-4">
                  {unpaidCount > 0
                    ? 'You started a checkout but it wasn’t completed, so you weren’t charged.'
                    : 'Invoices appear here as soon as you buy a credit pack.'}
                </p>
                <div className="pt-1">
                  <Link href="/pricing" className="btn-brand-primary !min-h-9 !h-9 !px-4 !text-sm">
                    <Zap className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                    <span>See credit packs</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <table className="hidden md:table w-full text-sm border-collapse" aria-label="Billing orders and invoices">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[13px] text-[var(--color-text-muted)] text-left">
                      <th scope="col" className="font-medium py-2.5 pr-4">Date</th>
                      <th scope="col" className="font-medium py-2.5 pr-4">Package</th>
                      <th scope="col" className="font-medium py-2.5 pr-4 text-right">Pages</th>
                      <th scope="col" className="font-medium py-2.5 pr-4 text-right">Amount</th>
                      <th scope="col" className="font-medium py-2.5 pr-4">Status</th>
                      <th scope="col" className="py-2.5"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map((order) => {
                      const paid = order.status === 'completed';
                      return (
                        <tr
                          key={order.order_id}
                          onClick={() => openReceipt(order)}
                          className={`border-b border-[var(--color-border-subtle)] transition-colors ${
                            paid ? 'hover:bg-[var(--color-surface-subtle)] cursor-pointer' : ''
                          }`}
                        >
                          <td className="py-3.5 pr-4 whitespace-nowrap text-[var(--color-text-secondary)] tabular-nums">
                            {formatDate(order.created_at)}
                          </td>
                          <th scope="row" className="py-3.5 pr-4 text-left font-normal">
                            <span className={`block font-medium ${paid ? 'text-[var(--color-ink)]' : 'text-[var(--color-text-secondary)]'}`}>
                              {order.plan_name}
                            </span>
                            <span className="block font-mono text-xs text-[var(--color-text-muted)] break-all">{order.order_id}</span>
                          </th>
                          <td className={`py-3.5 pr-4 text-right tabular-nums ${paid ? 'text-[var(--color-ink)]' : 'text-[var(--color-text-muted)]'}`}>
                            {paid ? '+' : ''}{order.pages_credited.toLocaleString()}
                          </td>
                          <td className={`py-3.5 pr-4 text-right tabular-nums ${paid ? 'text-[var(--color-ink)]' : 'text-[var(--color-text-muted)]'}`}>
                            {formatUSD(order.amount_usd)}
                          </td>
                          <td className="py-3.5 pr-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="py-3.5 text-right">
                            {paid && (
                              <div className="flex items-center justify-end gap-1">
                                <DownloadButton order={order} downloadingId={downloadingId} onDownload={handleDownloadPdf} />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openReceipt(order);
                                  }}
                                  aria-label={`View receipt for order ${order.order_id}`}
                                  className="link inline-flex items-center h-8 px-2 text-[13px] font-medium cursor-pointer"
                                >
                                  Receipt
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Mobile list */}
                <ul className="md:hidden border-t border-[var(--color-border)]" aria-label="Billing orders and invoices">
                  {visibleOrders.map((order) => {
                    const paid = order.status === 'completed';
                    return (
                      <li key={order.order_id} className="flex items-center gap-3 py-3.5 border-b border-[var(--color-border-subtle)]">
                        <button
                          type="button"
                          onClick={() => openReceipt(order)}
                          disabled={!paid}
                          className="flex-1 min-w-0 text-left space-y-1 cursor-pointer disabled:cursor-default"
                        >
                          <span className="flex items-baseline justify-between gap-3">
                            <span className={`font-medium truncate ${paid ? 'text-[var(--color-ink)]' : 'text-[var(--color-text-secondary)]'}`}>
                              {order.plan_name}
                            </span>
                            <span className={`tabular-nums shrink-0 ${paid ? 'font-medium text-[var(--color-ink)]' : 'text-[var(--color-text-muted)]'}`}>
                              {formatUSD(order.amount_usd)}
                            </span>
                          </span>
                          <span className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
                            <span className="tabular-nums">{formatDate(order.created_at)}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{order.pages_credited.toLocaleString()} pages</span>
                            {!paid && <StatusBadge status={order.status} />}
                          </span>
                        </button>
                        {paid && (
                          <>
                            <DownloadButton order={order} downloadingId={downloadingId} onDownload={handleDownloadPdf} compact />
                            <ChevronRight className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" strokeWidth={1.75} aria-hidden="true" />
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {filter === 'paid' && unpaidCount > 0 && !isInitialLoading && (
              <p className="text-[13px] text-[var(--color-text-muted)]">
                {unpaidCount === 1 ? '1 checkout wasn’t' : `${unpaidCount} checkouts weren’t`} completed and{' '}
                {unpaidCount === 1 ? 'is' : 'are'} hidden. You were not charged for {unpaidCount === 1 ? 'it' : 'them'}.
              </p>
            )}
          </section>
        </>
      )}

      {/* Receipt dialog (portaled so print can hide the rest of the app) */}
      {selectedReceipt &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-modal-title"
            onClick={() => setSelectedReceipt(null)}
            className="receipt-print-root fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/30 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[480px] surface-overlay p-6 sm:p-8 space-y-6 sm:my-auto"
            >
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setSelectedReceipt(null)}
                aria-label="Close receipt"
                className="print:hidden absolute top-3 right-3 w-11 h-11 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </button>

              <div className="flex items-start gap-3 pr-10">
                <BrandLogo size="sm" showText={false} href={null} />
                <div className="space-y-1 min-w-0">
                  <h2 id="receipt-modal-title" className="text-[22px] font-semibold tracking-tight leading-tight text-[var(--color-ink)]">
                    Payment receipt
                  </h2>
                  <p className="text-[13px] text-[var(--color-text-secondary)]">{formatDateTime(selectedReceipt.created_at)}</p>
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-[34px] font-semibold tracking-tight text-[var(--color-ink)] tabular-nums">
                  {formatUSD(selectedReceipt.amount_usd)}
                </p>
                <StatusBadge status={selectedReceipt.status} />
              </div>

              <dl className="rounded-xl bg-[var(--color-surface-subtle)] px-4 py-1 text-sm divide-y divide-[var(--color-border)]">
                {[
                  ['Package', selectedReceipt.plan_name],
                  ['Pages added', `+${selectedReceipt.pages_credited.toLocaleString()}`],
                  ['Billed to', selectedReceipt.payer_name ? `${selectedReceipt.payer_name} (${selectedReceipt.user_email})` : selectedReceipt.user_email],
                  ['Paid with', selectedReceipt.payment_method_label],
                  ['Order ID', selectedReceipt.order_id, true],
                  ['Payment ID', selectedReceipt.razorpay_payment_id, true],
                ]
                  .filter(([, value]) => !!value)
                  .map(([label, value, mono]) => (
                    <div key={label as string} className="flex justify-between gap-4 py-2.5">
                      <dt className="text-[var(--color-text-secondary)] shrink-0">{label}</dt>
                      <dd className={`text-[var(--color-ink)] text-right min-w-0 break-all ${mono ? 'font-mono text-[13px]' : 'font-medium'}`}>
                        {value}
                      </dd>
                    </div>
                  ))}
              </dl>

              <div className="print:hidden flex flex-col-reverse sm:flex-row sm:items-center gap-2.5">
                <button type="button" onClick={() => window.print()} className="btn-brand-secondary w-full sm:w-auto">
                  <Printer className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedReceipt.order_id)}
                  disabled={downloadingId === selectedReceipt.order_id}
                  className="btn-brand-primary w-full sm:flex-1"
                >
                  {downloadingId === selectedReceipt.order_id ? (
                    <span className="loading loading-spinner w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Download className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  )}
                  <span>Download PDF invoice</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} reason="general" />
    </div>
  );
}
