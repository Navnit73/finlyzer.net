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

type WorkspaceTab = 'single' | 'long_doc' | 'batch';

const TABS: {
  id: WorkspaceTab;
  icon: typeof Sparkles;
  label: string;
  shortLabel: string;
  badge?: string;
}[] = [
  {
    id: 'single',
    icon: Sparkles,
    label: 'Single Document',
    shortLabel: 'Single',
  },
  {
    id: 'long_doc',
    icon: Cpu,
    label: 'Long Doc (100–200 Pages)',
    shortLabel: 'Long Doc',
    badge: 'Webhook',
  },
  {
    id: 'batch',
    icon: Layers,
    label: 'Bulk Batch',
    shortLabel: 'Bulk',
    badge: 'Multi-file',
  },
];

export default function OcrWorkspace() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('single');
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
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Tab Switcher */}
        <div
          role="tablist"
          aria-label="Processing mode"
          className="grid grid-cols-3 sm:inline-flex sm:items-center p-1 rounded-full bg-[var(--color-surface-subtle)] flex-1 sm:flex-initial gap-1 min-w-0"
        >
          {TABS.map(({ id, icon: Icon, label, shortLabel, badge }) => {
            const isActive = activeTab === id;
            return (
              <button
                type="button"
                key={id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(id)}
                className={`min-w-0 min-h-[40px] sm:min-h-[36px] px-2 sm:px-4 rounded-full text-[13px] sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 hidden sm:block" aria-hidden="true" />
                <span className="truncate sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline whitespace-nowrap">{label}</span>
                {badge && (
                  <span className="hidden md:inline text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: History Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsHistoryDrawerOpen(true)}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[36px] min-w-[44px] px-3 sm:px-4 rounded-full text-sm font-medium text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)] transition-colors cursor-pointer"
          aria-label="Document History"
          title="Document History"
        >
          <History className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Document History</span>
        </button>
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
