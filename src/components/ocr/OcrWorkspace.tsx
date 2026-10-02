'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExtractionResponse } from '@/types/ocr';
import OcrUploader from './OcrUploader';
import BatchUploader from './BatchUploader';
import BatchProcessingModal from './BatchProcessingModal';
import HistoryDrawer from './HistoryDrawer';
import { Layers, History, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export default function OcrWorkspace() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // When AI extraction completes, navigate to dedicated /document/[id] results page!
  const handleExtractionComplete = (data: ExtractionResponse) => {
    if (data?.id) {
      router.push(`/document/${data.id}`);
    }
  };

  const handleSelectDocument = (docId: string) => {
    setIsHistoryDrawerOpen(false);
    setIsBatchModalOpen(false);
    router.push(`/document/${docId}`);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header & Segmented Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        {/* Left: Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'single'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs border border-[var(--color-border)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'single' ? 'text-[var(--color-brand-dark)]' : ''}`} />
            <span>Single Document OCR</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs border border-[var(--color-border)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${activeTab === 'batch' ? 'text-[var(--media-violet)]' : ''}`} />
            <span>Bulk Batch Processing</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[var(--media-violet-soft)] text-[var(--media-violet)]">
              Multi-file
            </span>
          </button>
        </div>

        {/* Right: History Drawer Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="btn btn-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)] text-xs font-bold flex items-center gap-1.5 px-3.5 shadow-none cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Document History</span>
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'single' ? (
        <OcrUploader
          onExtractionComplete={handleExtractionComplete}
          onOpenBatchModal={() => setActiveTab('batch')}
        />
      ) : (
        <BatchUploader
          onSelectExtraction={handleSelectDocument}
        />
      )}

      {/* Saved Documents History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onSelectDocument={handleSelectDocument}
      />
    </div>
  );
}
