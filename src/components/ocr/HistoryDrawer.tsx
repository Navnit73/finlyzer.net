'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import {
  X,
  History,
  Search,
  FileSpreadsheet,
  Download,
  Trash2,
  Calendar,
  Laptop,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { DocumentListResponse, StoredDocument, ExportFormat } from '@/types/ocr';
import { getBrowserHistory, removeFromBrowserHistory, BrowserHistoryItem } from '@/lib/browser-history';
import { useIsMounted } from '@/lib/useIsMounted';
import { useActiveJobs } from '@/context/ActiveJobsContext';
import AuthModal from '../auth/LazyAuthModal';
import { formatUSD } from '@/lib/format';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (docId: string) => void;
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  onSelectDocument,
}: HistoryDrawerProps) {
  const { data: session } = useSession();
  const { activeJobs, removeJob } = useActiveJobs();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [guestHistory, setGuestHistory] = useState<BrowserHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('all');
  const [totalCount, setTotalCount] = useState(0);
  const mounted = useIsMounted();

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;

    if (session?.user) {
      const params = new URLSearchParams({
        page: '1',
        page_size: '20',
      });
      if (docTypeFilter !== 'all') params.append('document_type', docTypeFilter);
      if (searchTerm) params.append('search', searchTerm);

      fetch(`/api/documents?${params.toString()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: DocumentListResponse | null) => {
          if (!ignore && data) {
            setDocuments(data.items || []);
            setTotalCount(data.total || 0);
          }
        })
        .catch((err) => {
          console.warn('History fetch failed:', (err as Error)?.message || 'Fetch error');
        })
        .finally(() => {
          if (!ignore) setIsLoading(false);
        });
    } else {
      setTimeout(() => {
        if (!ignore) {
          const items = getBrowserHistory();
          setGuestHistory(items);
          setTotalCount(items.length);
        }
      }, 0);
    }


    return () => {
      ignore = true;
    };
  }, [isOpen, session, docTypeFilter, searchTerm]);


  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !mounted) return null;

  // Filter guest items by search & type
  const filteredGuestItems = guestHistory.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      docTypeFilter === 'all' || item.document_type === docTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this document from history?')) return;

    if (!session?.user) {
      // Guest: remove from browser storage
      removeFromBrowserHistory(docId);
      setGuestHistory((prev) => prev.filter((d) => d.id !== docId));
      setTotalCount((c) => Math.max(0, c - 1));
      // Proactively notify backend to cleanup if possible
      try {
        await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      } catch {
        // Ignored
      }
      return;
    }

    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        setTotalCount((c) => Math.max(0, c - 1));
      }
    } catch (e) {
      console.warn('Delete failed:', (e as Error)?.message || 'Delete error');
    }
  };

  const handleDownload = async (e: React.MouseEvent, docId: string, format: ExportFormat = 'xlsx') => {
    e.stopPropagation();
    let url: string | null = null;
    try {
      const res = await fetch(`/api/export/download/${docId}?format=${format}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document_${docId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.warn('Download error:', (e as Error)?.message || 'Export error');
      alert('Download failed. Document data could not be retrieved.');
    } finally {
      if (url) {
        window.URL.revokeObjectURL(url);
      }
    }
  };

  // One hairline list row, shared by signed-in documents and guest browser history.
  const renderRow = (row: {
    id: string;
    title: string;
    filename: string;
    documentType: string;
    pages?: number;
    createdAt?: string;
    amount?: number | null;
    deleteTitle: string;
    deleteLabel: string;
  }) => {
    const open = () => {
      onSelectDocument(row.id);
      onClose();
    };
    return (
      <li key={row.id}>
        <div
          role="button"
          tabIndex={0}
          onClick={open}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              open();
            }
          }}
          className="group flex items-center gap-3 px-3 py-3 -mx-3 rounded-xl hover:bg-[var(--color-surface-subtle)] focus-visible:bg-[var(--color-surface-subtle)] cursor-pointer transition-colors"
        >
          <FileSpreadsheet className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[15px] text-[var(--color-ink)] truncate">
                {row.title}
              </p>
              {row.amount !== undefined && row.amount !== null && (
                <span className="text-sm font-medium tabular-nums text-[var(--color-ink)] shrink-0">
                  {formatUSD(row.amount)}
                </span>
              )}
            </div>
            <p className="text-[13px] text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5 tabular-nums">
              <span className="capitalize">{row.documentType.replace('_', ' ')}</span>
              <span aria-hidden="true">&middot;</span>
              <span>{row.pages || 1} Page{row.pages !== 1 ? 's' : ''}</span>
              <span aria-hidden="true">&middot;</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" aria-hidden="true" />
                {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </p>
          </div>
          <div className="flex items-center shrink-0 sm:opacity-60 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => handleDownload(e, row.id, 'xlsx')}
              className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors cursor-pointer hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
              title="Download Excel (.xlsx)"
              aria-label={`Download Excel for ${row.filename}`}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={(e) => handleDelete(e, row.id)}
              className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors cursor-pointer hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
              title={row.deleteTitle}
              aria-label={row.deleteLabel}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </li>
    );
  };

  const drawerContent = (
    <>
      <div
        className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="relative w-full max-w-lg h-full bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col animate-slide-left"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-drawer-title"
        >
          {/* Header */}
          <div className="shrink-0 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 space-y-4 border-b border-[var(--color-border)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 id="history-drawer-title" className="text-[21px] font-semibold tracking-tight text-[var(--color-ink)]">
                  Extraction History
                </h2>
                <p className="text-[13px] text-[var(--color-text-muted)] tabular-nums">
                  {session?.user
                    ? `${totalCount} Documents Saved in MongoDB`
                    : `${totalCount} Document${totalCount === 1 ? '' : 's'} Stored in Browser`}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Guest Info Banner (Shows for non-logged in users) */}
            {!session?.user && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-surface-subtle)]">
                <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)] min-w-0">
                  <Laptop className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" aria-hidden="true" />
                  <span>Free guest storage (Saved in browser &amp; DB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-brand-primary !min-h-[36px] !px-3.5 !text-[13px] shrink-0"
                >
                  Sign In to Sync
                </button>
              </div>
            )}

            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search past extractions..."
                  aria-label="Search past extractions"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--color-surface-subtle)] border border-transparent text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:bg-[var(--color-surface)] focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/20 transition-colors"
                />
              </div>

              {/* Filter segmented control */}
              <div className="overflow-x-auto no-scrollbar">
                <div className="inline-flex gap-1 p-1 bg-[var(--color-surface-subtle)] rounded-full" role="group" aria-label="Filter by document type">
                  {['all', 'bank_statement', 'invoice', 'receipt'].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setDocTypeFilter(type)}
                      aria-pressed={docTypeFilter === type}
                      className={`min-h-[32px] px-3.5 rounded-full text-[13px] font-medium capitalize whitespace-nowrap transition-colors cursor-pointer ${
                        docTypeFilter === type
                          ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
                      }`}
                    >
                      {type === 'all' ? 'All' : type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-3 min-h-[250px]">
            {/* Active In-Flight Background Jobs */}
            {activeJobs.length > 0 && (
              <div className="pb-3 mb-1 border-b border-[var(--color-border)]">
                <h3 className="py-2 text-[13px] font-medium text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>In-Flight Async Processing ({activeJobs.length})</span>
                </h3>
                <ul className="divide-y divide-[var(--color-border-subtle)]">
                  {activeJobs.map((job) => {
                    const isDone = job.status === 'completed';
                    const docTargetId = job.documentId || job.result?.id || job.jobId;
                    const openJob = () => {
                      if (isDone && docTargetId) {
                        onSelectDocument(docTargetId);
                        onClose();
                      }
                    };
                    return (
                      <li
                        key={job.jobId}
                        onClick={openJob}
                        onKeyDown={(e) => {
                          if (isDone && e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            openJob();
                          }
                        }}
                        role={isDone ? 'button' : undefined}
                        tabIndex={isDone ? 0 : undefined}
                        className={`py-3 space-y-2 ${isDone ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-[var(--color-ink)] truncate">
                            {job.filename}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[13px] tabular-nums text-[var(--color-text-secondary)]">
                              {job.processingProgress}%
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeJob(job.jobId);
                              }}
                              className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors cursor-pointer hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-ink)]"
                              aria-label={`Dismiss processing job for ${job.filename}`}
                            >
                              <X className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        <div
                          role="progressbar"
                          aria-valuenow={job.processingProgress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Processing progress for ${job.filename}`}
                          className="w-full bg-[var(--color-surface-muted)] h-1 rounded-full overflow-hidden"
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDone ? 'bg-[var(--color-success)]' : 'bg-[var(--color-brand)]'
                            }`}
                            style={{ width: `${job.processingProgress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
                          <span className="truncate">{job.message || `${job.processedPages}/${job.totalPages} pages`}</span>
                          {isDone && (
                            <span className="text-[var(--color-success)] flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Ready &middot; Click to open
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {session?.user ? (
              /* Authenticated User Documents */
              isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-[13px] text-[var(--color-text-muted)] gap-3">
                  <span className="loading loading-spinner loading-md text-[var(--color-text-muted)]" aria-hidden="true"></span>
                  <span>Loading saved documents...</span>
                </div>
              ) : documents.length > 0 ? (
                <ul className="divide-y divide-[var(--color-border-subtle)]">
                  {documents.map((doc) => {
                    const bankName = (doc.extraction as { bank_name?: string })?.bank_name;
                    const vendorName = (doc.extraction as { vendor_name?: string })?.vendor_name;
                    const balance = (doc.extraction as { closing_balance?: number })?.closing_balance;
                    const total = (doc.extraction as { total_amount?: number })?.total_amount;
                    return renderRow({
                      id: doc.id,
                      title: bankName || vendorName || doc.filename,
                      filename: doc.filename,
                      documentType: doc.document_type,
                      pages: doc.pages,
                      createdAt: doc.created_at,
                      amount: balance ?? total,
                      deleteTitle: 'Delete',
                      deleteLabel: `Delete ${doc.filename}`,
                    });
                  })}
                </ul>
              ) : (
                <div className="text-center py-16 space-y-1">
                  <p className="font-semibold text-[17px] text-[var(--color-ink)]">No documents found</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Upload your first bank statement or invoice to start building history.</p>
                </div>
              )
            ) : (
              /* Free Guest User Browser History */
              filteredGuestItems.length > 0 ? (
                <ul className="divide-y divide-[var(--color-border-subtle)]">
                  {filteredGuestItems.map((item) =>
                    renderRow({
                      id: item.id,
                      title: item.filename,
                      filename: item.filename,
                      documentType: item.document_type,
                      pages: item.pages,
                      createdAt: item.created_at,
                      amount: item.closing_balance,
                      deleteTitle: 'Remove from history',
                      deleteLabel: `Remove ${item.filename} from history`,
                    })
                  )}
                </ul>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[var(--color-surface-subtle)] flex items-center justify-center text-[var(--color-text-muted)]">
                    <History className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-[17px] text-[var(--color-ink)]">No documents in browser history</p>
                    <p className="text-sm text-[var(--color-text-secondary)] max-w-xs mx-auto">
                      Any document you upload (up to 10 pages for free) will automatically be saved here so you can download or review it later.
                    </p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Drawer Footer */}
          <div className="shrink-0 px-5 sm:px-6 py-3 border-t border-[var(--color-border)] flex items-center justify-between text-[13px] text-[var(--color-text-muted)]">
            <span>Powered by AI Financial Engine</span>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-2 font-medium text-[var(--color-brand-dark)] hover:underline underline-offset-4 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal for Guest Upgrades */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="general"
      />
    </>
  );

  return createPortal(drawerContent, document.body);
}
