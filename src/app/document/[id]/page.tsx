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
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-[var(--color-border)]">
        {/* Left: Back button + Document Name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link
            href={isLoggedIn ? "/documents" : "/"}
            className="link inline-flex items-center gap-1 text-sm font-medium shrink-0 min-h-11 sm:min-h-9 pr-1"
            aria-label={isLoggedIn ? "Back to Documents Vault" : "Back to Free Converter"}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            <span>{isLoggedIn ? "Vault" : "Back to Converter"}</span>
          </Link>

          <span className="w-px h-4 bg-[var(--color-border)] shrink-0 hidden sm:inline-block" aria-hidden="true"></span>

          <p className="min-w-0 truncate text-sm font-medium text-[var(--color-ink)]">
            {documentData?.filename || `Doc #${docId.slice(0, 8)}`}
          </p>
        </div>

        {/* Right: Actions (Authenticated Only) */}
        {isLoggedIn && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsBatchModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-11 sm:h-9 px-3 sm:px-3.5 rounded-full text-[13px] font-medium bg-[var(--color-surface-muted)] hover:bg-[var(--color-border)] text-[var(--color-ink)] transition-colors cursor-pointer"
              title="Bulk Batch Extraction"
            >
              <Layers className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden sm:inline">Bulk Batch</span>
              <span className="sm:hidden">Batch</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 h-11 sm:h-9 px-3 sm:px-3.5 rounded-full text-[13px] font-medium bg-[var(--color-surface-muted)] hover:bg-[var(--color-border)] text-[var(--color-ink)] transition-colors cursor-pointer"
              title="Document History"
              aria-label="Document History"
            >
              <History className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden sm:inline">History</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div role="status" aria-live="polite" className="space-y-6">
          <span className="sr-only">Loading Extracted Statement...</span>
          <div className="space-y-2.5">
            <span className="skeleton-line block h-7 w-72 max-w-full" />
            <span className="skeleton-line block h-4 w-96 max-w-full" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="skeleton-line block h-20 !rounded-xl" />
            ))}
          </div>
          <div className="space-y-3 pt-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="skeleton-line block h-4" style={{ width: `${92 - i * 7}%` }} />
            ))}
          </div>
          <p className="text-[13px] text-[var(--color-text-muted)]" aria-hidden="true">
            Retrieving reconciled data and financial metrics from database
          </p>
        </div>
      ) : errorMessage ? (
        <div role="alert" className="max-w-md mx-auto py-20 text-center space-y-4">
          <span className="mx-auto flex w-10 h-10 items-center justify-center rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
            <AlertCircle className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-[17px] font-semibold text-[var(--color-ink)]">
              Document Not Found
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {errorMessage}
            </p>
          </div>
          <Link href={isLoggedIn ? '/workspace' : '/'} className="btn-brand-primary">
            <Upload className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
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
