'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft,
  Layers,
  History,
  AlertCircle,
  Upload,
} from 'lucide-react';
import ExtractionViewer from '@/components/ocr/ExtractionViewer';
import BatchProcessingModal from '@/components/ocr/BatchProcessingModal';
import HistoryDrawer from '@/components/ocr/HistoryDrawer';
import { ExtractionResponse, ExtractionMetadata } from '@/types/ocr';

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const docId = resolvedParams.id;
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && !!session?.user;

  const [documentData, setDocumentData] = useState<ExtractionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDocument() {
      if (!docId) return;

      // 1. Try reading from instant sessionStorage cache first for instantaneous rendering
      if (typeof window !== 'undefined') {
        try {
          const cached = sessionStorage.getItem('doc_' + docId);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (isMounted) {
              setDocumentData(parsed);
              setIsLoading(false);
            }
          }
        } catch {
          // Fall through to network fetch
        }
      }

      // 2. Fetch fresh document from API / MongoDB database
      try {
        const res = await fetch(`/api/documents/${docId}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Document not found or session expired');
        }

        const doc = await res.json();
        const docPages = doc.pages || (doc.metadata?.pages) || 1;
        const isGuestDoc = doc.is_guest !== undefined ? doc.is_guest : (doc.user_email === 'guest' || !session?.user);
        const isPaidDoc = doc.is_paid !== undefined ? doc.is_paid : (docPages <= 10 || !isGuestDoc);

        const formatted: ExtractionResponse = {
          id: doc.id,
          status: doc.status || 'success',
          document_type: doc.document_type || 'bank_statement',
          filename: doc.filename || 'statement.pdf',
          extraction: doc.extraction || {},
          raw_text: doc.raw_text,
          cleaned_text: doc.cleaned_text,
          pages: (doc.extraction as { pages?: unknown[] })?.pages as ExtractionResponse['pages'],
          metadata: (doc.metadata || { pages: docPages }) as ExtractionMetadata,
          created_at: doc.created_at,
          is_paid: isPaidDoc,
          is_guest: isGuestDoc,
          guest_session_id: doc.guest_session_id,
        };

        if (isMounted) {
          setDocumentData(formatted);
          setIsLoading(false);
          setErrorMessage(null);
        }

        // Update sessionStorage
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('doc_' + docId, JSON.stringify(formatted));
          } catch {
            // Ignore quota
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const e = err as { message?: string };
          setErrorMessage(e.message || 'Failed to load document extraction.');
          setIsLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [docId]);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 pb-12">
      {/* Top Control Bar */}
      <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[var(--color-border)]">
        {/* Left: Back button + Document Name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Link
            href={isLoggedIn ? "/documents" : "/"}
            className="btn btn-sm btn-ghost rounded-lg border border-[var(--color-border)] text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] flex items-center gap-1.5 px-3 shrink-0 h-9 cursor-pointer"
            aria-label={isLoggedIn ? "Back to Documents Vault" : "Back to Free Converter"}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isLoggedIn ? "Vault" : "Back to Converter"}</span>
          </Link>

          <span className="w-px h-4 bg-[var(--color-border)] shrink-0 hidden sm:inline-block"></span>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] min-w-0 truncate">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand)] shrink-0 animate-pulse"></span>
            <span className="truncate text-[var(--color-ink)] font-bold text-xs">
              {documentData?.filename || `Doc #${docId.slice(0, 8)}`}
            </span>
          </div>
        </div>

        {/* Right: Actions (Authenticated Only) */}
        {isLoggedIn && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="btn btn-sm rounded-lg border border-[var(--media-violet)]/40 bg-[var(--media-violet-soft)] hover:bg-[var(--media-violet-hover)] text-[var(--media-violet)] text-xs font-bold flex items-center gap-1 px-2.5 sm:px-3.5 h-9 cursor-pointer"
              title="Bulk Batch Extraction"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bulk Batch</span>
              <span className="sm:hidden text-[11px]">Batch</span>
            </button>

            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="btn btn-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)] text-xs font-bold flex items-center gap-1 px-2.5 sm:px-3.5 h-9 cursor-pointer"
              title="Document History"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
            </button>
          </div>
        )}
      </div>



        {/* Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-brand)] animate-spin"></div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[var(--color-ink)]">
                Loading Extracted Statement...
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Retrieving reconciled data and financial metrics from database
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="max-w-lg mx-auto py-16 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-lg bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger-border)] flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[var(--color-ink)] tracking-tight">
                Document Not Found
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <Link
              href={isLoggedIn ? '/workspace' : '/'}
              className="btn-brand-primary inline-flex items-center gap-2 py-2.5 px-6 text-xs font-bold"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Document</span>
            </Link>
          </div>
        ) : documentData ? (
          /* Render Full Extraction Viewer Component */
          <div className="space-y-6">
            <ExtractionViewer
              data={documentData}
              onNewScan={() => router.push(isLoggedIn ? '/workspace' : '/')}
              onConsolidateClick={() => setIsBatchModalOpen(true)}
            />
          </div>
        ) : null}

      {/* Batch Processing Modal */}
      <BatchProcessingModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSelectExtraction={(selectedId) => router.push(`/document/${selectedId}`)}
      />

      {/* Document History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onSelectDocument={(selectedId) => {
          setIsHistoryDrawerOpen(false);
          router.push(`/document/${selectedId}`);
        }}
      />
    </div>
  );
}
