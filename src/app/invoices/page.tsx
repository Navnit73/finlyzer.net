'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  CreditCard,
  Receipt,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  UserCheck,
  Zap,
  Printer,
  X,
  ShieldCheck,
} from 'lucide-react';
import { OrderRecord } from '@/types/pricing';
import AuthModal from '@/components/auth/AuthModal';
import { formatUSD } from '@/lib/format';

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

  const totalSpentUsd = orders.reduce((sum, o) => sum + (o.status === 'completed' || o.status === 'created' ? o.amount_usd : 0), 0);
  const totalCreditsBought = orders.reduce((sum, o) => sum + (o.pages_credited || 0), 0);

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
      link.setAttribute('download', `Finlyzer_Invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('PDF receipt download error:', (err as Error)?.message || 'Receipt error');
      alert('Failed to generate PDF receipt.');
    }
  };

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[var(--color-surface-subtle)] text-[var(--color-ink)] border border-[var(--color-border)]">
            <Receipt className="w-3.5 h-3.5" />
            <span>Billing Records & Invoices</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight">
            Invoices & Credit Purchase History
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Track all purchased page packages, download official PDF tax invoices, and verify transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchOrders()}
            className="btn-brand-secondary !min-h-[36px] !h-[36px] !px-3 text-xs font-bold flex items-center gap-1.5 rounded-lg cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/pricing"
            className="btn-brand-primary !min-h-[36px] !h-[36px] !px-4 text-xs font-bold flex items-center gap-1.5 rounded-lg shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Top-Up Credits</span>
          </Link>
        </div>
      </div>

      {/* Guest Sign-In Notice */}
      {!isLoggedIn && status !== 'loading' && (
        <div className="p-8 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-center space-y-4 max-w-xl mx-auto shadow-none my-8">
          <div className="w-12 h-12 rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)] flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-[var(--color-ink)]">
              Sign In to View Billing History
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Your previous order invoices and transaction IDs are linked to your account.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="btn-brand-dark !min-h-[40px] !h-[40px] !px-6 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs rounded-lg"
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In with Google</span>
          </button>
        </div>
      )}

      {isLoggedIn && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Total Orders Placed
              </span>
              <p className="text-2xl font-black text-[var(--color-ink)] font-mono">
                {orders.length}
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Total Credits Purchased
              </span>
              <p className="text-2xl font-black text-[var(--color-ink)] font-mono">
                {totalCreditsBought.toLocaleString()} Pages
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Total Amount Billed
              </span>
              <p className="text-2xl font-black text-[var(--color-ink)] font-mono">
                {formatUSD(totalSpentUsd)} USD
              </p>
            </div>
          </div>

          {/* Orders Table */}
          {isLoading ? (
            <div className="p-16 text-center rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
              <span className="loading loading-spinner loading-md text-[var(--color-brand)]"></span>
              <p className="text-xs text-[var(--color-text-secondary)]">Loading billing records...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-3">
              <Receipt className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto opacity-50" />
              <p className="font-bold text-sm text-[var(--color-ink)]">No Billing Invoices Found</p>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                You haven&apos;t purchased any credit packages yet. Top up your account starting from $10.
              </p>
              <Link
                href="/pricing"
                className="btn-brand-primary !min-h-[36px] !h-[36px] !px-4 text-xs font-bold inline-flex items-center gap-1.5 mt-2 rounded-lg shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>View Credit Packages</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-none">
              <table className="table w-full text-xs">
                <thead>
                  <tr className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                    <th className="font-bold py-3">Order / Invoice ID</th>
                    <th className="font-bold">Package Name</th>
                    <th className="font-bold">Credits Added</th>
                    <th className="font-bold">Amount (USD)</th>
                    <th className="font-bold">Gateway</th>
                    <th className="font-bold">Status</th>
                    <th className="font-bold">Date</th>
                    <th className="font-bold text-right">Receipt &amp; PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.order_id}
                      className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] transition-colors"
                    >
                      <td className="font-mono font-bold text-[var(--color-ink)]">
                        {order.order_id}
                      </td>
                      <td className="font-semibold text-[var(--color-ink)]">
                        {order.plan_name}
                      </td>
                      <td className="font-mono font-bold text-[var(--color-brand-dark)]">
                        +{order.pages_credited.toLocaleString()} Pages
                      </td>
                      <td className="font-bold text-[var(--color-ink)] font-mono">
                        {formatUSD(order.amount_usd)} USD
                      </td>
                      <td className="capitalize font-medium">
                        {order.payment_gateway}
                      </td>
                      <td>
                        <span className={`badge badge-xs font-bold uppercase rounded-lg px-2 py-0.5 border-none ${
                          order.status === 'completed'
                            ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
                            : 'bg-[var(--color-brand-soft)] text-[var(--color-on-brand)]'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-[var(--color-text-secondary)] font-mono">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => handleDownloadPdf(e, order.order_id)}
                            className="btn btn-xs rounded-lg bg-[var(--color-brand-soft)] hover:bg-[var(--color-brand)] text-[var(--color-on-brand)] font-bold px-2.5 border border-[var(--color-brand)]/30 flex items-center gap-1 cursor-pointer"
                            title="Download Official PDF Invoice"
                          >
                            <Download className="w-3 h-3" />
                            <span>PDF</span>
                          </button>

                          <button
                            onClick={() => setSelectedReceipt(order)}
                            className="btn btn-xs rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-border)] text-[var(--color-ink)] font-bold px-2.5 border border-[var(--color-border)] cursor-pointer"
                          >
                            View
                          </button>
                        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6 sm:p-8 space-y-6 animate-scale-up my-auto shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="space-y-1">
              <span className="badge badge-sm bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] font-black text-[10px] rounded-lg">
                Official Payment Receipt
              </span>
              <h3 className="text-xl font-black text-[var(--color-ink)]">
                Finlyzer Invoice Summary
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                Order Reference: {selectedReceipt.order_id}
              </p>
            </div>

            {/* Receipt Body */}
            <div className="p-4 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-3 text-xs">
              <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                <span className="text-[var(--color-text-secondary)]">Billed To:</span>
                <span className="font-bold text-[var(--color-ink)] font-mono">{selectedReceipt.user_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Package Plan:</span>
                <span className="font-bold text-[var(--color-ink)]">{selectedReceipt.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Credits Credited:</span>
                <span className="font-bold text-[var(--color-brand-dark)] font-mono">+{selectedReceipt.pages_credited.toLocaleString()} Pages</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Payment Gateway:</span>
                <span className="font-bold text-[var(--color-ink)] capitalize">{selectedReceipt.payment_gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Payment Status:</span>
                <span className="font-bold uppercase text-[var(--color-success)]">{selectedReceipt.status}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-sm">
                <span className="font-bold text-[var(--color-ink)]">Total Paid:</span>
                <span className="font-black text-[var(--color-ink)] font-mono">{formatUSD(selectedReceipt.amount_usd)} USD</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2.5 pt-2">
              <button
                onClick={(e) => handleDownloadPdf(e, selectedReceipt.order_id)}
                className="btn-brand-primary !min-h-[40px] !h-[40px] !px-4 text-xs font-bold flex items-center gap-2 rounded-lg cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Invoice</span>
              </button>

              <button
                onClick={handlePrintReceipt}
                className="btn-brand-dark !min-h-[40px] !h-[40px] !px-4 text-xs font-bold flex items-center gap-2 rounded-lg cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="btn-brand-secondary !min-h-[40px] !h-[40px] !px-3 text-xs font-bold rounded-lg cursor-pointer"
              >
                Close
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
