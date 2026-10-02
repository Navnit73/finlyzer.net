'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  X,
  History,
  Search,
  FileSpreadsheet,
  Download,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DocumentListResponse, StoredDocument, ExportFormat } from '@/types/ocr';
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
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDocuments = async (pageNum = 1) => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        page_size: '10',
      });
      if (docTypeFilter !== 'all') params.append('document_type', docTypeFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/documents?${params.toString()}`);
      if (res.ok) {
        const data: DocumentListResponse = await res.json();
        setDocuments(data.items || []);
        setTotalPages(data.total_pages || 1);
        setTotalCount(data.total || 0);
        setPage(data.page || 1);
      }
    } catch (e) {
      console.error('History fetch failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && session?.user) {
      fetchDocuments(1);
    }
  }, [isOpen, session, docTypeFilter, searchTerm]);

  if (!isOpen) return null;

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document extraction?')) return;

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
      alert('Download failed');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
        <div
          className="relative w-full max-w-xl h-full bg-[var(--color-surface)] shadow-2xl border-l border-[var(--color-border)] p-6 sm:p-8 flex flex-col justify-between space-y-6 animate-slide-left overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] flex items-center justify-center font-bold">
                  <History className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-ink)]">
                    Extraction History
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {session?.user ? `${totalCount} Documents Saved in MongoDB` : 'Sign in to access saved documents'}
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

            {/* Non-Logged In State */}
            {!session?.user && (
              <div className="p-6 bg-[var(--color-surface-subtle)] rounded-2xl border border-[var(--color-border)] text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-sm text-[var(--color-ink)]">
                    Sign in to Sync &amp; Access Your History
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Log in with Google to automatically save all your OCR parsed statements, export spreadsheets, and access past audit reports.
                  </p>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-brand-primary !min-h-[44px] !py-0 !px-6 !text-xs font-bold w-full"
                >
                  Sign In with Google
                </button>
              </div>
            )}

            {/* Controls for Logged In User */}
            {session?.user && (
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search past extractions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)]"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-1 p-1 bg-[var(--color-surface-subtle)] rounded-xl border border-[var(--color-border)]">
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
            )}
          </div>

          {/* Documents List */}
          {session?.user && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[250px]">
              {isLoading ? (
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
                      className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-brand)] cursor-pointer transition-all space-y-3 group shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 truncate">
                          <div className="w-9 h-9 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink)] shrink-0">
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

                        {/* Amount Badge */}
                        {(balance !== undefined || total !== undefined) && (
                          <span className="font-mono font-bold text-xs text-[var(--color-ink)] bg-[var(--color-surface)] px-2.5 py-1 rounded-lg border border-[var(--color-border)] shrink-0">
                            ${((balance ?? total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>

                      {/* Footer Info & Quick Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/60 text-[11px] text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recent'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDownload(e, doc.id, 'xlsx')}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors"
                            title="Download Excel"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, doc.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-text-muted)] hover:text-red-600 transition-colors"
                            title="Delete extraction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-xs text-[var(--color-text-secondary)] space-y-2">
                  <Layers className="w-8 h-8 text-[var(--color-text-muted)] mx-auto opacity-50" />
                  <p>No document extractions found.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {session?.user && totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => fetchDocuments(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-lg border border-[var(--color-border)] disabled:opacity-40 font-semibold"
                >
                  Prev
                </button>
                <button
                  onClick={() => fetchDocuments(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-lg border border-[var(--color-border)] disabled:opacity-40 font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="save_history"
      />
    </>
  );
}
