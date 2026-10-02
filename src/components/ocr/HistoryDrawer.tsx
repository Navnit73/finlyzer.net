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
} from 'lucide-react';
import { DocumentListResponse, StoredDocument, ExportFormat } from '@/types/ocr';
import { getBrowserHistory, removeFromBrowserHistory, BrowserHistoryItem } from '@/lib/browser-history';
import { useIsMounted } from '@/lib/useIsMounted';
import AuthModal from '../auth/AuthModal';

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
          console.error('History fetch failed:', err);
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
      console.error('Delete failed:', e);
    }
  };

  const handleDownload = async (e: React.MouseEvent, docId: string, format: ExportFormat = 'xlsx') => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/export/download/${docId}?format=${format}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document_${docId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Download failed. Document data could not be retrieved.');
    }
  };

  const drawerContent = (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 animate-fade-in">
        <div
          className="relative w-full max-w-xl h-full bg-[var(--color-surface)] border-l border-[var(--color-border)] p-6 sm:p-8 flex flex-col justify-between space-y-5 animate-slide-left overflow-y-auto shadow-none"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] flex items-center justify-center font-bold">
                  <History className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-ink)]">
                    Extraction History
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {session?.user
                      ? `${totalCount} Documents Saved in MongoDB`
                      : `${totalCount} Document${totalCount === 1 ? '' : 's'} Stored in Browser`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest Info Banner (Shows for non-logged in users) */}
            {!session?.user && (
              <div className="p-3.5 bg-[var(--color-surface-subtle)] rounded-lg border border-[var(--color-border)] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[var(--color-ink)] font-medium">
                  <Laptop className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                  <span>Free guest storage (Saved in browser &amp; DB)</span>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn btn-xs rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] font-bold border-none hover:bg-[var(--color-brand-hover)] shrink-0 px-3 cursor-pointer"
                >
                  Sign In to Sync
                </button>
              </div>
            )}

            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search past extractions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)]"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1 p-1 bg-[var(--color-surface-subtle)] rounded-lg border border-[var(--color-border)]">
                {['all', 'bank_statement', 'invoice', 'receipt'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setDocTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                      docTypeFilter === type
                        ? 'bg-[var(--color-ink)] text-white shadow-xs'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    {type === 'all' ? 'All' : type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[250px]">
            {session?.user ? (
              /* Authenticated User Documents */
              isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-xs text-[var(--color-text-secondary)] space-y-2">
                  <span className="loading loading-spinner loading-md text-[var(--color-brand)]"></span>
                  <span>Loading saved documents...</span>
                </div>
              ) : documents.length > 0 ? (
                documents.map((doc) => {
                  const bankName = (doc.extraction as { bank_name?: string })?.bank_name;
                  const vendorName = (doc.extraction as { vendor_name?: string })?.vendor_name;
                  const balance = (doc.extraction as { closing_balance?: number })?.closing_balance;
                  const total = (doc.extraction as { total_amount?: number })?.total_amount;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        onSelectDocument(doc.id);
                        onClose();
                      }}
                      className="p-4 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-brand)] cursor-pointer transition-all space-y-3 group shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 truncate">
                          <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink)] shrink-0">
                            <FileSpreadsheet className="w-4 h-4 text-[var(--color-brand-hover)]" />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-xs sm:text-sm text-[var(--color-ink)] truncate group-hover:text-[var(--color-brand-hover)] transition-colors">
                              {bankName || vendorName || doc.filename}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-2 mt-0.5">
                              <span className="capitalize">{doc.document_type.replace('_', ' ')}</span>
                              <span>&bull;</span>
                              <span>{doc.pages || 1} Page{doc.pages !== 1 ? 's' : ''}</span>
                            </p>
                          </div>
                        </div>

                        {(balance !== undefined || total !== undefined) && (
                          <span className="font-mono font-bold text-xs text-[var(--color-ink)] bg-[var(--color-surface)] px-2.5 py-1 rounded-lg border border-[var(--color-border)] shrink-0">
                            ${((balance ?? total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/60 text-[11px] text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recent'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDownload(e, doc.id, 'xlsx')}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                            title="Download Excel (.xlsx)"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, doc.id)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-danger-soft)] text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 space-y-2 text-[var(--color-text-secondary)]">
                  <p className="font-bold text-sm text-[var(--color-ink)]">No documents found</p>
                  <p className="text-xs">Upload your first bank statement or invoice to start building history.</p>
                </div>
              )
            ) : (
              /* Free Guest User Browser History */
              filteredGuestItems.length > 0 ? (
                filteredGuestItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectDocument(item.id);
                      onClose();
                    }}
                    className="p-4 rounded-lg bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-brand)] cursor-pointer transition-all space-y-3 group shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 truncate">
                        <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink)] shrink-0">
                          <FileSpreadsheet className="w-4 h-4 text-[var(--color-success)]" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-xs sm:text-sm text-[var(--color-ink)] truncate group-hover:text-[var(--color-brand-hover)] transition-colors">
                            {item.filename}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-2 mt-0.5">
                            <span className="capitalize">{item.document_type.replace('_', ' ')}</span>
                            <span>&bull;</span>
                            <span>{item.pages || 1} Page{item.pages !== 1 ? 's' : ''}</span>
                          </p>
                        </div>
                      </div>

                      {item.closing_balance !== undefined && item.closing_balance !== null && (
                        <span className="font-mono font-bold text-xs text-[var(--color-ink)] bg-[var(--color-surface)] px-2.5 py-1 rounded-lg border border-[var(--color-border)] shrink-0">
                          ₹{item.closing_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/60 text-[11px] text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDownload(e, item.id, 'xlsx')}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                          title="Download Excel (.xlsx)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, item.id)}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-danger-soft)] text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 space-y-3 text-[var(--color-text-secondary)]">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)]">
                    <History className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-[var(--color-ink)]">No documents in browser history</p>
                    <p className="text-xs max-w-xs mx-auto">
                      Any document you upload (up to 10 pages for free) will automatically be saved here so you can download or review it later.
                    </p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Drawer Footer */}
          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>Powered by PyMuPDF &amp; DeepSeek AI</span>
            <button
              onClick={onClose}
              className="font-bold text-[var(--color-ink)] hover:underline"
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
