'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Receipt,
  Download,
  RefreshCw,
  Lock,
  UserCheck,
  Zap,
  Printer,
  X,
} from 'lucide-react';
import { OrderRecord } from '@/types/pricing';
import AuthModal from '@/components/auth/AuthModal';
import { formatUSD } from '@/lib/format';
import BrandLogo from '@/components/BrandLogo';

export default function InvoicesBillingPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<OrderRecord | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isLoggedIn = status === 'authenticated' && !!session?.user;

  const fetchOrders = useCallback(async () => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/user/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.warn('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchOrders();

    const handleUpdate = () => {
      fetchOrders();
    };

    window.addEventListener('finlyzer:quota_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('finlyzer:quota_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [fetchOrders]);

  // Only completed (paid) orders count toward spend and credits; abandoned checkouts stay 'created'.
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalSpentUsd = completedOrders.reduce((sum, o) => sum + o.amount_usd, 0);
  const totalCreditsBought = completedOrders.reduce((sum, o) => sum + (o.pages_credited || 0), 0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedReceipt) {
        setSelectedReceipt(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedReceipt]);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadPdf = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
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
      alert('Failed to generate PDF receipt.');
    }
  };

  const pillBtn =
    'inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-medium bg-[var(--color-surface-muted)] text-[var(--color-ink)] hover:bg-[var(--color-border)] transition-colors cursor-pointer whitespace-nowrap';

  const summary = [
    { label: 'Total Orders Placed', value: orders.length.toLocaleString() },
    { label: 'Total Credits Purchased', value: `${totalCreditsBought.toLocaleString()} Pages` },
    { label: 'Total Amount Billed', value: `${formatUSD(totalSpentUsd)} USD` },
  ];

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
            <Receipt className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>Billing Records & Invoices</span>
          </p>
          <h1 className="type-title">Invoices & Credit Purchase History</h1>
          <p className="text-[15px] text-[var(--color-text-secondary)]">
            Track all purchased page packages, download official PDF tax invoices, and verify transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchOrders()}
            className="btn-brand-secondary !min-h-9 !h-9 !px-4 !text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.75} aria-hidden="true" />
            <span>Refresh</span>
          </button>

          <Link href="/pricing" className="btn-brand-primary !min-h-9 !h-9 !px-4 !text-sm">
            <Zap className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Top-Up Credits</span>
          </Link>
        </div>
      </header>

      {/* Guest Sign-In Notice */}
      {!isLoggedIn && status !== 'loading' && (
        <div className="py-16 sm:py-20 text-center max-w-md mx-auto space-y-4">
          <span className="mx-auto flex w-10 h-10 items-center justify-center rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
            <Lock className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)]">
              Sign In to View Billing History
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Your previous order invoices and transaction IDs are linked to your account.
            </p>
          </div>
          <button type="button" onClick={() => setIsAuthModalOpen(true)} className="btn-brand-primary">
            <UserCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Sign In with Google</span>
          </button>
        </div>
      )}

      {isLoggedIn && (
        <>
          {/* Summary */}
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)]">
            {summary.map((item) => (
              <div key={item.label} className="bg-[var(--color-surface)] p-5 sm:p-6 space-y-1">
                <dt className="text-[13px] text-[var(--color-text-muted)]">{item.label}</dt>
                <dd className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] tabular-nums">
                  {isLoading ? <span className="skeleton-line block h-7 w-28" aria-hidden="true" /> : item.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Orders Table */}
          {isLoading ? (
            <div role="status" aria-label="Loading billing records" className="border-t border-[var(--color-border)]">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="py-4 border-b border-[var(--color-border-subtle)] flex items-center gap-6">
                  <span className="skeleton-line block h-4 w-40" />
                  <span className="skeleton-line block h-4 w-28" />
                  <span className="skeleton-line block h-4 w-16 ml-auto" />
                </div>
              ))}
              <span className="sr-only">Loading billing records...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center space-y-3 rounded-2xl bg-[var(--color-surface-subtle)]">
              <span className="mx-auto flex w-10 h-10 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
                <Receipt className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <p className="text-[17px] font-semibold text-[var(--color-ink)]">No Billing Invoices Found</p>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto px-4">
                You haven&apos;t purchased any credit packages yet. Top up your account starting from $10.
              </p>
              <div className="pt-1">
                <Link href="/pricing" className="btn-brand-primary !min-h-9 !h-9 !px-4 !text-sm">
                  <Zap className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  <span>View Credit Packages</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[860px] text-sm border-collapse" aria-label="Billing orders and invoices">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[13px] text-[var(--color-text-muted)] text-left">
                    <th scope="col" className="font-medium py-2.5 pr-4">Order / Invoice ID</th>
                    <th scope="col" className="font-medium py-2.5 pr-4">Package Name</th>
                    <th scope="col" className="font-medium py-2.5 pr-4 text-right">Credits Added</th>
                    <th scope="col" className="font-medium py-2.5 pr-4 text-right">Amount (USD)</th>
                    <th scope="col" className="font-medium py-2.5 pr-4">Gateway</th>
                    <th scope="col" className="font-medium py-2.5 pr-4">Status</th>
                    <th scope="col" className="font-medium py-2.5 pr-4">Date</th>
                    <th scope="col" className="font-medium py-2.5 text-right">Receipt &amp; PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.order_id}
                      className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-subtle)] transition-colors"
                    >
                      <th scope="row" className="py-3 pr-4 font-mono text-[13px] font-normal text-[var(--color-text-secondary)] text-left">
                        {order.order_id}
                      </th>
                      <td className="py-3 pr-4 font-medium text-[var(--color-ink)]">
                        {order.plan_name}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-[var(--color-ink)]">
                        +{order.pages_credited.toLocaleString()} Pages
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-[var(--color-ink)]">
                        {formatUSD(order.amount_usd)} USD
                      </td>
                      <td className="py-3 pr-4 capitalize text-[var(--color-text-secondary)]">
                        {order.payment_gateway}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          order.status === 'completed'
                            ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
                            : 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-[var(--color-text-secondary)] tabular-nums">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        {order.status !== 'completed' ? (
                          <span className="text-[13px] text-[var(--color-text-muted)]">Unpaid</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleDownloadPdf(e, order.order_id)}
                              className={pillBtn}
                              title="Download Official PDF Invoice"
                              aria-label={`Download PDF invoice for order ${order.order_id}`}
                            >
                              <Download className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                              <span>PDF</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(order)}
                              aria-label={`View receipt for order ${order.order_id}`}
                              className="link inline-flex items-center h-8 px-2 text-[13px] font-medium cursor-pointer"
                            >
                              View
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-modal-title"
          onClick={() => setSelectedReceipt(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/30 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[480px] surface-overlay p-6 sm:p-8 space-y-6 sm:my-auto"
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              aria-label="Close receipt dialog"
              className="absolute top-3 right-3 w-11 h-11 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            </button>

            {/* Receipt Header */}
            <div className="flex items-start gap-3 pr-10">
              <BrandLogo size="sm" showText={false} href={null} />
              <div className="space-y-1 min-w-0">
                <p className="text-[13px] text-[var(--color-text-muted)]">Official Payment Receipt</p>
                <h2 id="receipt-modal-title" className="text-[22px] font-semibold tracking-tight leading-tight text-[var(--color-ink)]">
                  Payment Receipt
                </h2>
                <p className="text-[13px] text-[var(--color-text-secondary)] font-mono break-all">
                  Order Reference: {selectedReceipt.order_id}
                </p>
              </div>
            </div>

            {/* Receipt Body */}
            <dl className="rounded-xl bg-[var(--color-surface-subtle)] px-4 py-1 text-sm divide-y divide-[var(--color-border)]">
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-[var(--color-text-secondary)] shrink-0">Billed To</dt>
                <dd className="font-medium text-[var(--color-ink)] truncate">{selectedReceipt.user_email}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-[var(--color-text-secondary)]">Package Plan</dt>
                <dd className="font-medium text-[var(--color-ink)] text-right">{selectedReceipt.plan_name}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-[var(--color-text-secondary)]">Credits Credited</dt>
                <dd className="font-medium text-[var(--color-ink)] tabular-nums">+{selectedReceipt.pages_credited.toLocaleString()} Pages</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-[var(--color-text-secondary)]">Payment Gateway</dt>
                <dd className="font-medium text-[var(--color-ink)] capitalize">{selectedReceipt.payment_gateway}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-[var(--color-text-secondary)]">Payment Status</dt>
                <dd className="font-medium text-[var(--color-success)] capitalize">{selectedReceipt.status}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="font-semibold text-[var(--color-ink)]">Total Paid</dt>
                <dd className="font-semibold text-[var(--color-ink)] tabular-nums">{formatUSD(selectedReceipt.amount_usd)} USD</dd>
              </div>
            </dl>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="btn-brand-secondary w-full sm:w-auto"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handlePrintReceipt}
                className="btn-brand-secondary w-full sm:w-auto"
              >
                <Printer className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleDownloadPdf(e, selectedReceipt.order_id)}
                className="btn-brand-primary w-full sm:flex-1"
              >
                <Download className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                <span>Download PDF Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="general"
      />
    </div>
  );
}
