'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  FileText,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Lock,
  UserCheck,
  Layers,
  Building,
  Receipt,
  FileCheck2,
  CheckCircle2,
  Cpu,
  ArrowRight,
  X,
} from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import { StoredDocument, ExportFormat } from '@/types/ocr';
import { useActiveJobs } from '@/context/ActiveJobsContext';

export default function DocumentsVaultPage() {
  const { data: session, status } = useSession();
  const { activeJobs, removeJob } = useActiveJobs();
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'bank_statement' | 'invoice' | 'receipt'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<{ id: string; format: ExportFormat } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isLoggedIn = status === 'authenticated' && !!session?.user;

  const fetchDocuments = useCallback(async () => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.set('document_type', activeFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('page_size', '100');

      const res = await fetch(`/api/documents?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.items || []);
      }
    } catch (err) {
      console.warn('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, activeFilter, searchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Track completed job IDs to only re-fetch when a new job transitions to completed (prevents re-fetch storm during in-flight progress ticks)
  const completedJobIdsRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    let hasNewCompletion = false;
    activeJobs.forEach((j) => {
      if (j.status === 'completed' && !completedJobIdsRef.current.has(j.jobId)) {
        completedJobIdsRef.current.add(j.jobId);
        hasNewCompletion = true;
      }
    });

    if (hasNewCompletion) {
      fetchDocuments();
    }
  }, [activeJobs, fetchDocuments]);

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.warn('Document delete error:', (err as Error)?.message || 'Delete error');
      alert('Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (e: React.MouseEvent, docId: string, format: ExportFormat = 'xlsx') => {
    e.stopPropagation();
    let url: string | null = null;
    try {
      setDownloadingFormat({ id: docId, format });
      const res = await fetch(`/api/export/download/${docId}?format=${format}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `finlyzers_${docId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.warn('Document export error:', (err as Error)?.message || 'Export error');
      alert('Download failed. Document data could not be retrieved.');
    } finally {
      if (url) {
        window.URL.revokeObjectURL(url);
      }
      setDownloadingFormat(null);
    }
  };

  const totalBankStatements = documents.filter((d) => d.document_type === 'bank_statement').length;
  const totalInvoices = documents.filter((d) => d.document_type === 'invoice').length;
  const totalReceipts = documents.filter((d) => d.document_type === 'receipt').length;

  const pillBtn =
    'inline-flex items-center justify-center gap-1.5 h-9 sm:h-8 px-3 rounded-full text-[13px] font-medium bg-[var(--color-surface-muted)] text-[var(--color-ink)] hover:bg-[var(--color-border)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap';

  const metrics = [
    { label: 'Total Documents', value: documents.length },
    { label: 'Bank Statements', value: totalBankStatements },
    { label: 'Invoices', value: totalInvoices },
    { label: 'Receipts', value: totalReceipts },
  ];

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
            <FileCheck2 className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>MongoDB Document Vault</span>
          </p>
          <h1 className="type-title">Converted Documents & Audit History</h1>
          <p className="text-[15px] text-[var(--color-text-secondary)]">
            Review, search, export in 6 financial formats, or delete all statements processed through your account.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchDocuments()}
            className="btn-brand-secondary !min-h-9 !h-9 !px-4 !text-sm"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.75} aria-hidden="true" />
            <span>Refresh</span>
          </button>

          <Link href="/workspace" className="btn-brand-primary !min-h-9 !h-9 !px-4 !text-sm">
            <Sparkles className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Convert New File</span>
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
              Sign In to Access Your Document History
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Your parsed statements, invoices, and accounting exports are stored securely in your private cloud vault.
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
          {/* Active In-Flight Background Jobs Banner */}
          {activeJobs.length > 0 && (
            <section aria-labelledby="vault-active-jobs" className="rounded-2xl bg-[var(--color-surface-subtle)] p-4 sm:p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Cpu className="w-5 h-5 mt-0.5 text-[var(--color-brand-dark)] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <div className="min-w-0 space-y-0.5">
                  <h2 id="vault-active-jobs" className="text-[15px] font-semibold text-[var(--color-ink)] flex flex-wrap items-center gap-2">
                    <span>Active Background OCR Tasks</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] tabular-nums">
                      {activeJobs.length} In Progress
                    </span>
                  </h2>
                  <p className="text-[13px] text-[var(--color-text-secondary)]">
                    Large documents (100–200 pages) keep processing automatically even when you browse or switch tabs.
                  </p>
                </div>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {activeJobs.map((job) => {
                  const isDone = job.status === 'completed';
                  const isErr = job.status === 'failed';
                  const docTargetId = job.documentId || job.result?.id || job.jobId;

                  return (
                    <li
                      key={job.jobId}
                      className={`p-4 rounded-xl border ${
                        isErr
                          ? 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)]'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-ink)] truncate">{job.filename}</p>
                          <p className={`text-xs ${isErr ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}>
                            {job.message || `${job.processedPages}/${job.totalPages} pages processed`}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="tabular-nums text-[13px] font-medium text-[var(--color-ink)]">
                            {job.processingProgress}%
                          </span>
                          <button
                            type="button"
                            onClick={() => removeJob(job.jobId)}
                            className="-mr-2 -mt-1 w-8 h-8 inline-flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
                            title="Dismiss"
                            aria-label={`Dismiss background task for ${job.filename}`}
                          >
                            <X className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div
                        role="progressbar"
                        aria-valuenow={job.processingProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Processing progress for ${job.filename}`}
                        className="w-full bg-[var(--color-surface-muted)] h-1 rounded-full overflow-hidden"
                      >
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ${
                            isDone ? 'bg-[var(--color-success)]' : isErr ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-brand)]'
                          }`}
                          style={{ width: `${job.processingProgress}%` }}
                        />
                      </div>

                      {/* Completed Action */}
                      {isDone && (
                        <div className="flex items-center justify-between pt-3">
                          <span className="text-[13px] font-medium text-[var(--color-success)] flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" /> Ready in Vault
                          </span>
                          <Link href={`/document/${docTargetId}`} className="btn-brand-primary !min-h-8 !h-8 !px-3.5 !text-[13px] !gap-1">
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                          </Link>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Quick Metrics */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)]">
            {metrics.map((m) => (
              <div key={m.label} className="bg-[var(--color-surface)] px-4 py-4 sm:px-5 space-y-1">
                <dt className="text-[13px] text-[var(--color-text-muted)]">{m.label}</dt>
                <dd className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] tabular-nums">
                  {isLoading ? <span className="skeleton-line block h-7 w-10" aria-hidden="true" /> : m.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-1 md:pb-0" role="group" aria-label="Filter documents by type">
              {(['all', 'bank_statement', 'invoice', 'receipt'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  aria-pressed={activeFilter === type}
                  className={`h-11 md:h-9 px-3.5 rounded-full text-[13px] whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeFilter === type
                      ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] font-medium'
                      : 'bg-[var(--color-surface-subtle)] text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]'
                  }`}
                >
                  {type === 'bank_statement' && <Building className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />}
                  {type === 'invoice' && <Receipt className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />}
                  {type === 'receipt' && <FileCheck2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />}
                  {type === 'all' && <Layers className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />}
                  <span className="tabular-nums">
                    {type === 'all'
                      ? `All (${documents.length})`
                      : type === 'bank_statement'
                      ? `Bank Statements (${totalBankStatements})`
                      : type === 'invoice'
                      ? `Invoices (${totalInvoices})`
                      : `Receipts (${totalReceipts})`}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" strokeWidth={1.75} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search documents by name or bank..."
                aria-label="Search documents by name or bank"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full h-11 pl-10 pr-3 rounded-lg bg-[var(--color-surface)] border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          </div>

          {/* Documents Content */}
          {isLoading ? (
            <div role="status" aria-label="Loading your converted documents" className="border-t border-[var(--color-border)]">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="py-5 border-b border-[var(--color-border-subtle)] space-y-2.5">
                  <span className="skeleton-line block h-4 w-64 max-w-full" />
                  <span className="skeleton-line block h-3 w-40" />
                </div>
              ))}
              <span className="sr-only">Loading your converted documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="py-16 text-center space-y-3 rounded-2xl bg-[var(--color-surface-subtle)]">
              <span className="mx-auto flex w-10 h-10 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
                <FileText className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <p className="text-[17px] font-semibold text-[var(--color-ink)]">No Converted Documents Found</p>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto px-4">
                {searchQuery || activeFilter !== 'all'
                  ? 'No documents match your filter. Try adjusting your search keywords.'
                  : 'Start by uploading a bank statement or invoice in the OCR Converter.'}
              </p>
              <div className="pt-1">
                <Link href="/workspace" className="btn-brand-primary !min-h-9 !h-9 !px-4 !text-sm">
                  <Sparkles className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  <span>Go to Converter</span>
                </Link>
              </div>
            </div>
          ) : (
            <ul className="border-t border-[var(--color-border)]">
              {documents.map((doc) => {
                const isDeleting = deletingId === doc.id;
                const isBank = doc.document_type === 'bank_statement';
                const isInvoice = doc.document_type === 'invoice';

                return (
                  <li
                    key={doc.id}
                    className="-mx-3 px-3 py-4 rounded-lg border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-subtle)] transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Document Details */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-[15px] text-[var(--color-ink)] break-all">
                            {doc.filename}
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                            isBank
                              ? 'bg-[var(--media-blue-soft)] text-[var(--media-blue-text)]'
                              : isInvoice
                              ? 'bg-[var(--color-surface-muted)] text-[var(--color-ink)]'
                              : 'bg-[var(--media-pink-soft)] text-[var(--media-pink-text)]'
                          }`}>
                            {isBank && <Building className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />}
                            {isInvoice && <Receipt className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />}
                            {!isBank && !isInvoice && <FileCheck2 className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />}
                            <span>{doc.document_type.replace('_', ' ')}</span>
                          </span>
                          <span className="text-[13px] text-[var(--color-text-muted)] tabular-nums">
                            {doc.pages || 1} {doc.pages === 1 ? 'page' : 'pages'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-[var(--color-text-muted)]">
                          <span>Doc ID: <code className="font-mono text-xs text-[var(--color-text-secondary)]">{doc.id}</code></span>
                          <span aria-hidden="true">&middot;</span>
                          <span className="tabular-nums">{new Date(doc.created_at).toLocaleDateString()} at {new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/document/${doc.id}`}
                          aria-label={`View statement ${doc.filename}`}
                          className={pillBtn}
                        >
                          <span>View Statement</span>
                          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id, doc.filename)}
                          disabled={isDeleting}
                          className="w-9 h-9 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors cursor-pointer disabled:opacity-40"
                          title="Delete from database"
                          aria-label={`Delete ${doc.filename} from database`}
                        >
                          {isDeleting ? (
                            <span className="loading loading-spinner loading-xs" aria-hidden="true"></span>
                          ) : (
                            <Trash2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Multi-Format Export Bar */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]">
                        <Download className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                        <span>Download Financial Format:</span>
                      </span>

                      <div className="flex flex-wrap items-center gap-1">
                        {(['xlsx', 'csv', 'pdf', 'qbo', 'ofx', 'qif'] as const).map((fmt) => {
                          const isDown = downloadingFormat?.id === doc.id && downloadingFormat?.format === fmt;
                          return (
                            <button
                              type="button"
                              key={fmt}
                              onClick={(e) => handleDownload(e, doc.id, fmt)}
                              disabled={isDown}
                              className="min-w-11 h-9 sm:h-7 px-2.5 rounded-md text-xs font-medium font-mono bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors cursor-pointer inline-flex items-center justify-center disabled:opacity-60"
                              title={`Download as .${fmt}`}
                              aria-label={`Download ${doc.filename} as .${fmt}`}
                            >
                              {isDown ? (
                                <span className="loading loading-spinner loading-xs" aria-hidden="true"></span>
                              ) : (
                                <span>.{fmt}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
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
