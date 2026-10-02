'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExtractionResponse } from '@/types/ocr';
import OcrUploader from './OcrUploader';
import BatchProcessingModal from './BatchProcessingModal';
import HistoryDrawer from './HistoryDrawer';
import { Layers, History } from 'lucide-react';

export default function OcrWorkspace() {
  const router = useRouter();
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // When AI extraction completes, navigate to dedicated /document/[id] results page!
  const handleExtractionComplete = (data: ExtractionResponse) => {
    if (data?.id) {
      router.push(`/document/${data.id}`);
    }
  };

  // When user selects a document from History or Batch modal, route to that document's page
  const handleSelectDocument = (docId: string) => {
    setIsHistoryDrawerOpen(false);
    setIsBatchModalOpen(false);
    router.push(`/document/${docId}`);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header / Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand)] animate-pulse"></span>
          <span className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider">
            AI OCR Statement Studio
          </span>
        </div>

        {/* Global Hub Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="btn btn-sm rounded-full border border-[var(--media-violet)]/40 bg-[#F2EDFD] hover:bg-[#EAE1FB] text-[var(--media-violet)] text-xs font-bold flex items-center gap-1.5 px-3.5 shadow-xs transition-all hover:scale-[1.02]"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Batch Extraction</span>
          </button>

          <button
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="btn btn-sm rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)] text-xs font-bold flex items-center gap-1.5 px-3.5 shadow-xs transition-all hover:scale-[1.02]"
          >
            <History className="w-3.5 h-3.5" />
            <span>Document History</span>
          </button>
        </div>
      </div>

      {/* Main Upload Dropzone Component */}
      <OcrUploader
        onExtractionComplete={handleExtractionComplete}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
      />

      {/* Batch Processing Modal */}
      <BatchProcessingModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSelectExtraction={handleSelectDocument}
      />

      {/* Saved Documents History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onSelectDocument={handleSelectDocument}
      />
    </div>
  );
}
