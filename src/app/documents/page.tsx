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
  FileSpreadsheet,
  Layers,
  Building,
  Receipt,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Cpu,
  ArrowRight,
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
      link.setAttribute('download', `finlyzer_${docId}.${format}`);
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

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[var(--color-surface-subtle)] text-[var(--color-ink)] border border-[var(--color-border)]">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>MongoDB Document Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight">
            Converted Documents & Audit History
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Review, search, export in 6 financial formats, or delete all statements processed through your account.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchDocuments()}
            className="btn-brand-secondary !min-h-[36px] !h-[36px] !px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer rounded-lg"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/"
            className="btn-brand-primary !min-h-[36px] !h-[36px] !px-4 text-xs font-bold flex items-center gap-1.5 rounded-lg shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Convert New File</span>
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
              Sign In to Access Your Document History
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Your parsed statements, invoices, and accounting exports are stored securely in your private cloud vault.
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
          {/* Active In-Flight Background Jobs Banner */}
          {activeJobs.length > 0 && (
            <div className="p-5 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-brand)] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-on-brand)] shrink-0">
                    <Cpu className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--color-ink)] flex items-center gap-2">
                      <span>Active Background OCR Tasks</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)] uppercase">
                        {activeJobs.length} In Progress
                      </span>
                    </h3>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      Large documents (100–200 pages) keep processing automatically even when you browse or switch tabs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {activeJobs.map((job) => {
                  const isDone = job.status === 'completed';
                  const isErr = job.status === 'failed';
                  const docTargetId = job.documentId || job.result?.id || job.jobId;

                  return (
                    <div
                      key={job.jobId}
                      className={`p-4 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-[var(--color-brand-soft)]/60 border-[var(--color-brand)]/50'
                          : isErr
                          ? 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)]'
                          : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[var(--color-ink)] truncate">
                            {job.filename}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-secondary)]">
                            {job.message || `${job.processedPages}/${job.totalPages} pages processed`}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-xs font-black text-[var(--color-ink)]">
                            {job.processingProgress}%
                          </span>
                          <button
                            onClick={() => removeJob(job.jobId)}
                            className="text-[10px] text-[var(--color-text-muted)] hover:text-red-600 px-1 py-0.5"
                            title="Dismiss"
                          >
                            &times;
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDone ? 'bg-emerald-500' : 'bg-[var(--color-brand)]'
                          }`}
                          style={{ width: `${job.processingProgress}%` }}
                        />
                      </div>

                      {/* Completed Action */}
                      {isDone && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready in Vault
                          </span>
                          <Link
                            href={`/document/${docTargetId}`}
                            className="btn btn-xs rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)] font-bold flex items-center gap-1 px-2.5"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Total Documents
              </span>
              <p className="text-2xl font-black text-[var(--color-ink)] font-mono">
                {documents.length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--media-blue)]">
                Bank Statements
              </span>
              <p className="text-2xl font-black text-[var(--color-ink)] font-mono">
                {totalBankStatements}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--media-violet)]">
                Invoices
              </span>
              <p className="text-2xl font-black text-[var(--color-ink)] font-mono">
                {totalInvoices}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--media-pink)]">
                Receipts
              </span>
              <p className="text-2xl font-black text-[var(--color-ink)] font-mono">
                {totalReceipts}
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {(['all', 'bank_statement', 'invoice', 'receipt'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilter === type
                      ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-border)] border border-[var(--color-border)]'
                  }`}
                >
                  {type === 'all'
                    ? `All (${documents.length})`
                    : type === 'bank_statement'
                    ? `Bank Statements (${totalBankStatements})`
                    : type === 'invoice'
                    ? `Invoices (${totalInvoices})`
                    : `Receipts (${totalReceipts})`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                placeholder="Search documents by name or bank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-sm w-full pl-9 pr-3 rounded-lg bg-[var(--color-surface)] border-[var(--color-border)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
              />
            </div>
          </div>

          {/* Documents Content */}
          {isLoading ? (
            <div className="p-16 text-center rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
              <span className="loading loading-spinner loading-md text-[var(--color-brand)]"></span>
              <p className="text-xs text-[var(--color-text-secondary)]">Loading your converted documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-16 text-center rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-3">
              <FileText className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto opacity-50" />
              <p className="font-bold text-sm text-[var(--color-ink)]">No Converted Documents Found</p>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                {searchQuery || activeFilter !== 'all'
                  ? 'No documents match your filter. Try adjusting your search keywords.'
                  : 'Start by uploading a bank statement or invoice in the OCR Converter.'}
              </p>
              <Link
                href="/"
                className="btn-brand-primary !min-h-[36px] !h-[36px] !px-4 text-xs font-bold inline-flex items-center gap-1.5 mt-2 rounded-lg"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Go to Converter</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const isDeleting = deletingId === doc.id;
                const isBank = doc.document_type === 'bank_statement';
                const isInvoice = doc.document_type === 'invoice';

                return (
                  <div
                    key={doc.id}
                    className="p-5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Document Details */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-sm text-[var(--color-ink)]">
                            {doc.filename}
                          </span>
                          <span className={`badge badge-sm font-bold uppercase text-[9px] rounded-lg border-none ${
                            isBank
                              ? 'bg-[var(--media-blue)]/20 text-[var(--color-ink)] border border-[var(--media-blue)]/40'
                              : isInvoice
                              ? 'bg-[var(--media-violet)]/20 text-[var(--color-ink)] border border-[var(--media-violet)]/40'
                              : 'bg-[var(--media-pink)]/20 text-[var(--color-ink)] border border-[var(--media-pink)]/40'
                          }`}>
                            {doc.document_type.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                            {doc.pages || 1} {doc.pages === 1 ? 'page' : 'pages'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                          <span>Doc ID: <code className="font-mono text-[11px] text-[var(--color-ink)]">{doc.id}</code></span>
                          <span>&bull;</span>
                          <span>{new Date(doc.created_at).toLocaleDateString()} at {new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Link
                          href={`/document/${doc.id}`}
                          className="btn btn-xs sm:btn-sm rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-border)] text-[var(--color-ink)] font-bold px-3 border border-[var(--color-border)] flex items-center gap-1.5"
                        >
                          <span>View Statement</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDelete(doc.id, doc.filename)}
                          disabled={isDeleting}
                          className="btn btn-xs sm:btn-sm rounded-lg bg-[var(--color-danger-soft)] hover:bg-[var(--color-danger-border)] text-[var(--color-danger)] font-bold px-2.5 border border-[var(--color-danger-border)] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Delete from database"
                        >
                          {isDeleting ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Multi-Format Export Bar */}
                    <div className="pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] font-bold">
                        <Download className="w-3.5 h-3.5 text-[var(--color-ink)]" />
                        <span>Download Financial Format:</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {(['xlsx', 'csv', 'pdf', 'qbo', 'ofx', 'qif'] as const).map((fmt) => {
                          const isDown = downloadingFormat?.id === doc.id && downloadingFormat?.format === fmt;
                          return (
                            <button
                              key={fmt}
                              onClick={(e) => handleDownload(e, doc.id, fmt)}
                              disabled={isDown}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase bg-[var(--color-surface-subtle)] hover:bg-[var(--color-brand)] hover:text-[var(--color-on-brand)] text-[var(--color-ink)] border border-[var(--color-border)] transition-colors cursor-pointer flex items-center gap-1"
                              title={`Download as .${fmt}`}
                            >
                              {isDown ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                <span>.{fmt}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
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
