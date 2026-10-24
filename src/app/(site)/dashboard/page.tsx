'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import UserAvatar from '@/components/auth/UserAvatar';
import { useSession, signOut } from 'next-auth/react';
import {
  FileText,
  CreditCard,
  Download,
  Trash2,
  ExternalLink,
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
  Lock,
  UserCheck,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { StoredDocument, ExportFormat } from '@/types/ocr';
import { OrderRecord } from '@/types/pricing';
import AuthModal from '@/components/auth/LazyAuthModal';
import { formatUSD } from '@/lib/format';

interface UserStatsState {
  totalDocuments: number;
  totalPagesProcessed: number;
  creditsRemaining: number;
  totalAvailableCredits: number;
  purchasedCredits: number;
  freeCredits: number;
  tier: string;
}

export default function DashboardOverviewPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStatsState>({
    totalDocuments: 0,
    totalPagesProcessed: 0,
    creditsRemaining: 10,
    totalAvailableCredits: 10,
    purchasedCredits: 0,
    freeCredits: 10,
    tier: 'free',
  });
  const [recentDocs, setRecentDocs] = useState<StoredDocument[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<{ id: string; format: ExportFormat } | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const isLoggedIn = status === 'authenticated' && !!session?.user;

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'Are you sure you want to permanently delete your Finlyzers account and all stored documents/invoices? Type "DELETE" to confirm:'
    );
    if (confirmation !== 'DELETE') return;

    try {
      setIsDeletingAccount(true);
      const res = await fetch('/api/user/account', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      try {
        localStorage.removeItem('has_logged_in');
      } catch {}
      alert('Your account and all associated documents and personal data have been permanently deleted.');
      await signOut({ callbackUrl: '/' });
    } catch (e) {
      console.error(e);
      alert('Account deletion failed. Please try again.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [statsRes, docsRes, ordersRes] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/documents?page_size=5'),
        fetch('/api/user/orders'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.stats) setStats(data.stats);
      }

      if (docsRes.ok) {
        const data = await docsRes.json();
        setRecentDocs(data.items || []);
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setRecentOrders(((data.orders || []) as OrderRecord[]).filter((o) => o.status === 'completed').slice(0, 5));
      }
    } catch (err) {
      console.warn('Failed to load dashboard overview:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchDashboardData();

    const handleUpdate = () => {
      fetchDashboardData();
    };

    window.addEventListener('finlyzer:quota_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('finlyzer:quota_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [fetchDashboardData]);

  const handleDownload = async (e: React.MouseEvent, docId: string, format: ExportFormat = 'xlsx') => {
    e.stopPropagation();
    try {
      setDownloadingFormat({ id: docId, format });
      const res = await fetch(`/api/export/download/${docId}?format=${format}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `finlyzers_${docId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Download failed.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const pillBtn =
    'inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-medium bg-[var(--color-surface-muted)] text-[var(--color-ink)] hover:bg-[var(--color-border)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap';

  const shortcuts = [
    { href: '/workspace', label: 'Convert Document', icon: Sparkles },
    { href: '/documents', label: 'Document Vault', icon: FileText },
    { href: '/pricing', label: 'Credit Packages', icon: CreditCard },
    { href: '/invoices', label: 'Billing Invoices', icon: Receipt },
  ];

  const metricValue = (value: number) =>
    isLoading ? (
      <span className="skeleton-line block h-8 w-20 my-0.5" aria-hidden="true" />
    ) : (
      value.toLocaleString()
    );

  return (
    <div className="w-full space-y-10 sm:space-y-12 pb-16" aria-busy={isLoading}>
      {/* Guest Sign-In */}
      {!isLoggedIn && status !== 'loading' && (
        <div className="py-16 sm:py-24 text-center max-w-md mx-auto space-y-4">
          <span className="mx-auto flex w-10 h-10 items-center justify-center rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
            <Lock className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)]">
              Sign in to Access Your Dashboard
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              View your private account stats, credit balance, converted records, and billing history.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="btn-brand-primary"
          >
            <UserCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Sign In with Google</span>
          </button>
        </div>
      )}

      {isLoggedIn && (
        <>
          {/* Page header */}
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              <UserAvatar
                src={session.user?.image}
                name={session.user?.name}
                size={56}
                imageClassName="w-14 h-14 rounded-full object-cover ring-1 ring-[var(--color-border)] shrink-0"
                fallbackClassName="w-14 h-14 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink)] font-medium flex items-center justify-center text-xl shrink-0"
              />
              <div className="min-w-0 space-y-1">
                <h1 className="type-title truncate">
                  {session.user?.name || 'My Account'}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <span className="truncate">{session.user?.email}</span>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] text-xs font-medium capitalize">
                    {stats.tier} Tier
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => fetchDashboardData()}
                className="btn-brand-secondary !min-h-9 !h-9 !px-4 !text-sm"
                title="Refresh dashboard stats"
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

          {/* Key metrics — one hairline group, no icon tiles */}
          <section aria-label="Account summary">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)]">
              <div className="bg-[var(--color-surface)] p-5 sm:p-6 space-y-1.5">
                <dt className="text-[13px] text-[var(--color-text-muted)]">Available Credits</dt>
                <dd className="text-[32px] leading-tight font-semibold tracking-tight text-[var(--color-ink)] tabular-nums">
                  {metricValue(stats.creditsRemaining)}
                </dd>
                <dd className="text-xs text-[var(--color-text-secondary)] tabular-nums">
                  {stats.freeCredits} free + {stats.purchasedCredits} purchased pages
                </dd>
              </div>

              <div className="bg-[var(--color-surface)] p-5 sm:p-6 space-y-1.5">
                <dt className="text-[13px] text-[var(--color-text-muted)]">Pages Processed</dt>
                <dd className="text-[32px] leading-tight font-semibold tracking-tight text-[var(--color-ink)] tabular-nums">
                  {metricValue(stats.totalPagesProcessed)}
                </dd>
                <dd className="text-xs text-[var(--color-text-secondary)]">Lifetime extracted statements</dd>
              </div>

              <div className="bg-[var(--color-surface)] p-5 sm:p-6 space-y-1.5">
                <dt className="text-[13px] text-[var(--color-text-muted)]">Documents in Vault</dt>
                <dd className="text-[32px] leading-tight font-semibold tracking-tight text-[var(--color-ink)] tabular-nums">
                  {metricValue(stats.totalDocuments)}
                </dd>
                <dd className="text-xs text-[var(--color-text-secondary)]">Stored in MongoDB Cloud</dd>
              </div>

              <div className="bg-[var(--color-surface)] p-5 sm:p-6 space-y-1.5">
                <dt className="text-[13px] text-[var(--color-text-muted)]">AI Model SLA</dt>
                <dd className="text-[17px] leading-[2.5rem] font-semibold text-[var(--color-ink)]">
                  AI Financial Engine
                </dd>
                <dd className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" aria-hidden="true"></span>
                  99.8% Precision Rate
                </dd>
              </div>
            </dl>
          </section>

          {/* Quick Actions */}
          <section aria-labelledby="dashboard-shortcuts" className="space-y-3">
            <h2 id="dashboard-shortcuts" className="text-[17px] font-semibold text-[var(--color-ink)]">
              Quick Shortcuts
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {shortcuts.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-3 min-h-12 px-4 py-3 rounded-xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] transition-colors"
                  >
                    <Icon className="w-5 h-5 text-[var(--color-brand-dark)] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    <span className="flex-1 text-sm font-medium text-[var(--color-ink)]">{label}</span>
                    <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Recent Converted Documents Section */}
          <section aria-labelledby="dashboard-recent-docs" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-0.5">
                <h2 id="dashboard-recent-docs" className="type-headline">
                  Recent Converted Statements
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Latest files parsed with AI Financial OCR.
                </p>
              </div>

              <Link href="/documents" className="link text-sm font-medium inline-flex items-center gap-1 shrink-0 min-h-11 sm:min-h-0">
                <span>View All ({stats.totalDocuments})</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>

            {isLoading && recentDocs.length === 0 ? (
              <ul className="border-t border-[var(--color-border)]" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="py-4 border-b border-[var(--color-border-subtle)] space-y-2">
                    <span className="skeleton-line block h-4 w-56 max-w-full" />
                    <span className="skeleton-line block h-3 w-32" />
                  </li>
                ))}
              </ul>
            ) : recentDocs.length === 0 ? (
              <div className="py-12 text-center space-y-3 rounded-2xl bg-[var(--color-surface-subtle)]">
                <span className="mx-auto flex w-10 h-10 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
                  <FileText className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <p className="text-[17px] font-semibold text-[var(--color-ink)]">No documents converted yet</p>
                <Link href="/workspace" className="btn-brand-primary !min-h-9 !h-9 !px-4 !text-sm">
                  <Sparkles className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  <span>Start Extraction</span>
                </Link>
              </div>
            ) : (
              <ul className="border-t border-[var(--color-border)]">
                {recentDocs.map((doc) => (
                  <li
                    key={doc.id}
                    className="-mx-3 px-3 py-3.5 rounded-lg border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-subtle)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                        <span className="font-medium text-[var(--color-ink)] text-sm truncate">{doc.filename}</span>
                        <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                          {doc.document_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="pl-6 text-[13px] text-[var(--color-text-muted)] flex items-center gap-1.5 tabular-nums">
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{doc.pages || 1} pages</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-6 sm:pl-0 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDownload(e, doc.id, 'xlsx')}
                        disabled={downloadingFormat?.id === doc.id}
                        aria-label={`Download ${doc.filename} in Excel (.xlsx) format`}
                        className={pillBtn}
                      >
                        {downloadingFormat?.id === doc.id ? (
                          <span className="loading loading-spinner loading-xs" aria-hidden="true" />
                        ) : (
                          <Download className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                        )}
                        Excel (.xlsx)
                      </button>

                      <Link
                        href={`/document/${doc.id}`}
                        aria-label={`View details and extraction for ${doc.filename}`}
                        className={pillBtn}
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Recent Orders Section */}
          {recentOrders.length > 0 && (
            <section aria-labelledby="dashboard-recent-orders" className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div className="space-y-0.5">
                  <h2 id="dashboard-recent-orders" className="type-headline">
                    Recent Billing Invoices
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Latest page package purchases.
                  </p>
                </div>

                <Link href="/invoices" className="link text-sm font-medium inline-flex items-center gap-1 shrink-0 min-h-11 sm:min-h-0">
                  <span>All Invoices</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                </Link>
              </div>

              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[720px] text-sm border-collapse" aria-label="Recent billing invoices">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[13px] text-[var(--color-text-muted)] text-left">
                      <th scope="col" className="font-medium py-2.5 pr-4">Order ID</th>
                      <th scope="col" className="font-medium py-2.5 pr-4">Package</th>
                      <th scope="col" className="font-medium py-2.5 pr-4 text-right">Credits</th>
                      <th scope="col" className="font-medium py-2.5 pr-4 text-right">Amount</th>
                      <th scope="col" className="font-medium py-2.5 pr-4">Status</th>
                      <th scope="col" className="font-medium py-2.5 pr-4">Date</th>
                      <th scope="col" className="font-medium py-2.5 text-right">Invoice PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.order_id} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-subtle)] transition-colors">
                        <th scope="row" className="py-3 pr-4 font-mono text-[13px] font-normal text-[var(--color-text-secondary)] text-left">{order.order_id}</th>
                        <td className="py-3 pr-4 font-medium text-[var(--color-ink)]">{order.plan_name}</td>
                        <td className="py-3 pr-4 text-right tabular-nums text-[var(--color-ink)]">+{order.pages_credited.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-right tabular-nums text-[var(--color-ink)]">{formatUSD(order.amount_usd)} USD</td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize bg-[var(--color-success-soft)] text-[var(--color-success)]">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-[var(--color-text-secondary)] tabular-nums">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-3 text-right">
                          <a
                            href={`/api/user/orders/${order.order_id}/receipt`}
                            download={`Finlyzers_Invoice_${order.order_id}.pdf`}
                            aria-label={`Download PDF invoice for order ${order.order_id}`}
                            className={pillBtn}
                            title="Download PDF Invoice"
                          >
                            <Download className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                            <span>PDF</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Privacy & Account Data Deletion (GDPR / Right to be Forgotten) */}
          <section aria-labelledby="dashboard-erasure" className="pt-8 border-t border-[var(--color-border)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 id="dashboard-erasure" className="flex items-center gap-2 text-[17px] font-semibold text-[var(--color-ink)]">
                  <AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" strokeWidth={1.75} aria-hidden="true" />
                  Privacy &amp; Data Erasure (Right to be Forgotten)
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-xl">
                  Permanently wipe your account profile, all converted financial statements, OCR extractions, and order history from our servers.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="inline-flex items-center justify-center gap-1.5 min-h-11 sm:min-h-9 px-4 rounded-full text-sm font-medium bg-[var(--color-danger-soft)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-[var(--color-on-dark)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isDeletingAccount ? (
                  <span className="loading loading-spinner loading-xs" aria-hidden="true"></span>
                ) : (
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                )}
                <span>Delete Account &amp; All Data</span>
              </button>
            </div>
          </section>
        </>
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
