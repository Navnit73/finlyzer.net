'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExtractionResponse } from '@/types/ocr';
import OcrUploader from './OcrUploader';
import BatchUploader from './BatchUploader';
import AsyncDocumentProcessor from './AsyncDocumentProcessor';
import BatchProcessingModal from './BatchProcessingModal';
import HistoryDrawer from './HistoryDrawer';
import { Layers, History, Sparkles, Cpu } from 'lucide-react';

export default function OcrWorkspace() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'single' | 'long_doc' | 'batch'>('single');
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
        <div className="flex flex-wrap items-center p-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] w-full sm:w-auto gap-1">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'single'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs border border-[var(--color-border)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'single' ? 'text-[var(--color-brand-dark)]' : ''}`} />
            <span>Single Document</span>
          </button>

          <button
            onClick={() => setActiveTab('long_doc')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'long_doc'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs border border-[var(--color-border)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Cpu className={`w-3.5 h-3.5 ${activeTab === 'long_doc' ? 'text-[var(--color-brand-hover)]' : ''}`} />
            <span>Long Doc (100–200 Pages)</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]">
              Webhook
            </span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs border border-[var(--color-border)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${activeTab === 'batch' ? 'text-[var(--media-violet)]' : ''}`} />
            <span>Bulk Batch</span>
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
          onOpenLongDocModal={() => setActiveTab('long_doc')}
        />
      ) : activeTab === 'long_doc' ? (
        <AsyncDocumentProcessor />
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
