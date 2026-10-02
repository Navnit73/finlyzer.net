'use client';

import React, { useState } from 'react';
import { ExtractionResponse } from '@/types/ocr';
import OcrUploader from './OcrUploader';
import ExtractionViewer from './ExtractionViewer';
import BatchProcessingModal from './BatchProcessingModal';
import HistoryDrawer from './HistoryDrawer';
import { Sparkles, Layers, History, ArrowLeft, FileSpreadsheet } from 'lucide-react';

interface OcrWorkspaceProps {
  initialDocumentId?: string;
}

export default function OcrWorkspace({ initialDocumentId }: OcrWorkspaceProps) {
  const [currentExtraction, setCurrentExtraction] = useState<ExtractionResponse | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);

  // Load a document by ID from history or selection
  const handleSelectDocument = async (docId: string) => {
    setIsLoadingDoc(true);
    try {
      const res = await fetch(`/api/documents/${docId}`);
      if (res.ok) {
        const doc = await res.json();
        setCurrentExtraction({
          id: doc.id,
          status: doc.status,
          document_type: doc.document_type,
          filename: doc.filename,
          extraction: doc.extraction,
          raw_text: doc.raw_text,
          cleaned_text: doc.cleaned_text,
          metadata: doc.metadata || { pages: doc.pages || 1 },
          created_at: doc.created_at,
        });
      }
    } catch (e) {
      console.error('Failed to load document:', e);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Workspace Sub-Header / Quick Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          {currentExtraction ? (
            <button
              onClick={() => setCurrentExtraction(null)}
              className="btn btn-sm btn-ghost rounded-full border border-[var(--color-border)] text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Upload</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand)] animate-pulse"></span>
              <span className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider">
                AI OCR Advance Studio
              </span>
            </div>
          )}
        </div>

        {/* Global Hub Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="btn btn-sm rounded-full border border-[var(--media-violet)]/40 bg-[#F2EDFD] hover:bg-[#EAE1FB] text-[var(--media-violet)] text-xs font-bold flex items-center gap-1.5 px-3.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Batch Extraction</span>
          </button>

          <button
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="btn btn-sm rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)] text-xs font-bold flex items-center gap-1.5 px-3.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>Document History</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoadingDoc ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <span className="loading loading-spinner loading-lg text-[var(--color-brand)]"></span>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            Loading extracted statement from MongoDB...
          </p>
        </div>
      ) : currentExtraction ? (
        <ExtractionViewer
          data={currentExtraction}
          onNewScan={() => setCurrentExtraction(null)}
          onConsolidateClick={() => setIsBatchModalOpen(true)}
        />
      ) : (
        <OcrUploader
          onExtractionComplete={(data) => setCurrentExtraction(data)}
          onOpenBatchModal={() => setIsBatchModalOpen(true)}
        />
      )}

      {/* Batch Processing Modal */}
      <BatchProcessingModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSelectExtraction={(id) => handleSelectDocument(id)}
      />

      {/* Saved Documents History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onSelectDocument={(id) => handleSelectDocument(id)}
      />
    </div>
  );
}
