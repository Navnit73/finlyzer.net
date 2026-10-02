'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  FileText,
  CreditCard,
  Download,
  Trash2,
  ExternalLink,
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRight,
  RefreshCw,
  Lock,
  UserCheck,
  FileCheck2,
  Receipt,
  BarChart3,
  Clock,
} from 'lucide-react';
import { StoredDocument, ExportFormat } from '@/types/ocr';
import { OrderRecord } from '@/types/pricing';
import AuthModal from '@/components/auth/AuthModal';

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

  const isLoggedIn = status === 'authenticated' && !!session?.user;

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
        setRecentOrders((data.orders || []).slice(0, 5));
      }
    } catch (err) {
      console.warn('Failed to load dashboard overview:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchDashboardData();
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
      link.setAttribute('download', `finlyzer_${docId}.${format}`);
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

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Guest Sign-In */}
      {!isLoggedIn && status !== 'loading' && (
        <div className="p-8 sm:p-10 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-center space-y-4 max-w-2xl mx-auto shadow-none my-8">
          <div className="w-14 h-14 rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)] flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">
              Sign in to Access Admin Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
              View your private account stats, credit balance, converted records, and billing history.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="btn-brand-dark !min-h-[44px] !h-[44px] !px-6 text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs rounded-lg"
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In with Google</span>
          </button>
        </div>
      )}

      {isLoggedIn && (
        <>
          {/* User Profile Overview Banner */}
          <div className="p-6 sm:p-7 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-none">
            <div className="flex items-center gap-4">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={56}
                  height={56}
                  unoptimized
                  className="w-14 h-14 rounded-lg object-cover ring-2 ring-[var(--color-brand)]"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)] font-black flex items-center justify-center text-lg shadow-xs">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[var(--color-ink)] tracking-tight">
                    {session.user?.name || 'My Account'}
                  </h1>
                  <span className="badge badge-sm bg-[var(--color-brand)] text-[var(--color-on-brand)] font-black uppercase text-[10px] px-2 py-0.5 rounded-lg border-none">
                    {stats.tier} Tier
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                  {session.user?.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => fetchDashboardData()}
                className="btn-brand-secondary !min-h-[38px] !h-[38px] !px-3 text-xs font-bold flex items-center gap-1.5 rounded-lg cursor-pointer"
                title="Refresh dashboard stats"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <Link
                href="/pricing"
                className="btn-brand-primary !min-h-[38px] !h-[38px] !px-4 text-xs font-bold flex items-center gap-1.5 rounded-lg shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Top-Up Credits</span>
              </Link>
            </div>
          </div>

          {/* 4 Key Stat Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Remaining Credits */}
            <div className="p-5 rounded-lg bg-[var(--color-surface)] border-2 border-[var(--color-brand)] shadow-none flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Available Credits
                </span>
                <span className="w-8 h-8 rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[var(--color-ink)]" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-black text-[var(--color-ink)] font-mono">
                  {isLoading ? '...' : stats.creditsRemaining.toLocaleString()}
                </p>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                  {stats.freeCredits} free + {stats.purchasedCredits} purchased pages
                </p>
              </div>
            </div>

            {/* Metric 2: Pages Processed */}
            <div className="p-5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-none flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Pages Processed
                </span>
                <span className="w-8 h-8 rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-ink)] flex items-center justify-center border border-[var(--color-border)]">
                  <Layers className="w-4 h-4" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-black text-[var(--color-ink)] font-mono">
                  {isLoading ? '...' : stats.totalPagesProcessed.toLocaleString()}
                </p>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                  Lifetime extracted statements
                </p>
              </div>
            </div>

            {/* Metric 3: Total Saved Documents */}
            <div className="p-5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-none flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Documents in Vault
                </span>
                <span className="w-8 h-8 rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-ink)] flex items-center justify-center border border-[var(--color-border)]">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-black text-[var(--color-ink)] font-mono">
                  {isLoading ? '...' : stats.totalDocuments.toLocaleString()}
                </p>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                  Stored in MongoDB Cloud
                </p>
              </div>
            </div>

            {/* Metric 4: AI Model SLA */}
            <div className="p-5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-none flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  AI Model SLA
                </span>
                <span className="w-8 h-8 rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-success)] flex items-center justify-center border border-[var(--color-border)]">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div>
                <p className="text-xl font-black text-[var(--color-ink)]">
                  DeepSeek AI
                </p>
                <p className="text-[11px] text-[var(--color-success)] font-bold mt-0.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-success)]"></span>
                  99.8% Financial Precision
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="p-5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
            <h3 className="font-black text-sm text-[var(--color-ink)] uppercase tracking-wider text-[11px]">
              Quick Admin Shortcuts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/"
                className="p-3.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-brand-soft)] border border-[var(--color-border)] transition-colors flex flex-col items-center text-center gap-2 group"
              >
                <Sparkles className="w-5 h-5 text-[var(--color-brand-dark)] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[var(--color-ink)]">Convert Document</span>
              </Link>

              <Link
                href="/documents"
                className="p-3.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors flex flex-col items-center text-center gap-2 group"
              >
                <FileText className="w-5 h-5 text-[var(--media-blue)] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[var(--color-ink)]">Document Vault</span>
              </Link>

              <Link
                href="/pricing"
                className="p-3.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors flex flex-col items-center text-center gap-2 group"
              >
                <CreditCard className="w-5 h-5 text-[var(--media-violet)] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[var(--color-ink)]">Credit Packages</span>
              </Link>

              <Link
                href="/invoices"
                className="p-3.5 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors flex flex-col items-center text-center gap-2 group"
              >
                <Receipt className="w-5 h-5 text-[var(--media-pink)] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[var(--color-ink)]">Billing Invoices</span>
              </Link>
            </div>
          </div>

          {/* Recent Converted Documents Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-lg font-black text-[var(--color-ink)] tracking-tight">
                  Recent Converted Statements
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Latest files parsed with DeepSeek AI OCR.
                </p>
              </div>

              <Link
                href="/documents"
                className="btn btn-xs sm:btn-sm rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-border)] text-[var(--color-ink)] font-bold px-3 border border-[var(--color-border)] flex items-center gap-1"
              >
                <span>View All ({stats.totalDocuments})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentDocs.length === 0 ? (
              <div className="p-8 text-center rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2">
                <FileText className="w-8 h-8 text-[var(--color-text-secondary)] mx-auto opacity-50" />
                <p className="text-xs font-bold text-[var(--color-ink)]">No documents converted yet</p>
                <Link
                  href="/"
                  className="btn-brand-primary !min-h-[32px] !h-[32px] !px-3 text-xs font-bold inline-flex items-center gap-1 rounded-lg shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Extraction</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-ink)] text-sm truncate max-w-xs">{doc.filename}</span>
                        <span className="badge badge-sm font-bold uppercase text-[9px] rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] border-none">
                          {doc.document_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-2 font-mono">
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span>{doc.pages || 1} pages</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={(e) => handleDownload(e, doc.id, 'xlsx')}
                        className="btn btn-xs rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-brand)] hover:text-[var(--color-on-brand)] text-[var(--color-ink)] font-bold px-2.5 border border-[var(--color-border)]"
                      >
                        Excel (.xlsx)
                      </button>

                      <Link
                        href={`/document/${doc.id}`}
                        className="btn btn-xs rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-border)] text-[var(--color-ink)] font-bold px-2.5 border border-[var(--color-border)] flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders Section */}
          {recentOrders.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-black text-[var(--color-ink)] tracking-tight">
                    Recent Billing Invoices
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Latest page package purchases.
                  </p>
                </div>

                <Link
                  href="/invoices"
                  className="btn btn-xs sm:btn-sm rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-border)] text-[var(--color-ink)] font-bold px-3 border border-[var(--color-border)] flex items-center gap-1"
                >
                  <span>All Invoices</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                <table className="table w-full text-xs">
                  <thead>
                    <tr className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                      <th className="font-bold py-2.5">Order ID</th>
                      <th className="font-bold">Package</th>
                      <th className="font-bold">Credits</th>
                      <th className="font-bold">Amount</th>
                      <th className="font-bold">Status</th>
                      <th className="font-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.order_id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)]">
                        <td className="font-mono font-bold text-[var(--color-ink)]">{order.order_id}</td>
                        <td className="font-semibold text-[var(--color-ink)]">{order.plan_name}</td>
                        <td className="font-mono font-bold text-[var(--color-brand-dark)]">+{order.pages_credited.toLocaleString()}</td>
                        <td className="font-bold text-[var(--color-ink)]">${order.amount_usd} (₹{order.amount_inr})</td>
                        <td>
                          <span className="badge badge-xs font-bold uppercase rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] border-none">
                            {order.status}
                          </span>
                        </td>
                        <td className="text-[var(--color-text-secondary)] font-mono">{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
