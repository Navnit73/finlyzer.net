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
  iconActiveClass: string;
  badgeClass?: string;
}[] = [
  {
    id: 'single',
    icon: Sparkles,
    label: 'Single Document',
    shortLabel: 'Single',
    iconActiveClass: 'text-[var(--color-brand-dark)]',
  },
  {
    id: 'long_doc',
    icon: Cpu,
    label: 'Long Doc (100–200 Pages)',
    shortLabel: 'Long Doc',
    badge: 'Webhook',
    iconActiveClass: 'text-[var(--color-brand-hover)]',
    badgeClass: 'bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]',
  },
  {
    id: 'batch',
    icon: Layers,
    label: 'Bulk Batch',
    shortLabel: 'Bulk',
    badge: 'Multi-file',
    iconActiveClass: 'text-[var(--media-violet)]',
    badgeClass: 'bg-[var(--media-violet-soft)] text-[var(--media-violet)]',
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
      <div className="flex items-stretch sm:items-center justify-between gap-2 sm:gap-4 pb-4 border-b border-[var(--color-border)]">
        {/* Left: Tab Switcher */}
        <div
          role="tablist"
          aria-label="Processing mode"
          className="grid grid-cols-3 sm:flex sm:items-center p-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex-1 sm:flex-initial gap-1 min-w-0"
        >
          {TABS.map(({ id, icon: Icon, label, shortLabel, badge, iconActiveClass, badgeClass }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(id)}
                className={`min-w-0 px-2 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs border-[var(--color-border)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? iconActiveClass : ''}`} aria-hidden="true" />
                <span className="truncate sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline whitespace-nowrap">{label}</span>
                {badge && (
                  <span className={`hidden md:inline text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeClass}`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: History Drawer Trigger */}
        <button
          onClick={() => setIsHistoryDrawerOpen(true)}
          className="shrink-0 btn btn-sm h-auto sm:h-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)] text-xs font-bold flex items-center gap-1.5 px-3 sm:px-3.5 shadow-none cursor-pointer"
          aria-label="Document History"
          title="Document History"
        >
          <History className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
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
