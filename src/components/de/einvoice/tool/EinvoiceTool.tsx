'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FilePlus2, FileSearch, Fingerprint, ShieldCheck } from 'lucide-react';
import { emptyInvoiceForm, invoiceToForm, type EinvoiceFormat, type ExtractResponse, type FormMode, type InvoiceForm } from '@/lib/einvoice';
import CreatePanel, { type ImportNotice } from './CreatePanel';
import ExtractPanel from './ExtractPanel';
import ValidatePanel from './ValidatePanel';
import ArchivePanel from './ArchivePanel';

type Tab = 'erstellen' | 'auslesen' | 'pruefen' | 'archiv';

const TABS: { id: Tab; title: string; body: string; icon: typeof FilePlus2 }[] = [
  { id: 'erstellen', title: 'Erstellen', body: 'PDF in ZUGFeRD oder XRechnung umwandeln.', icon: FilePlus2 },
  { id: 'auslesen', title: 'Auslesen', body: 'Daten aus einer vorhandenen E-Rechnung extrahieren.', icon: FileSearch },
  { id: 'pruefen', title: 'Prüfen', body: 'Eine E-Rechnung gegen EN 16931 und die XRechnung-Regeln validieren.', icon: ShieldCheck },
  { id: 'archiv', title: 'Archiv', body: 'Nachweisen, dass eine archivierte Rechnung unverändert ist (GoBD).', icon: Fingerprint },
];

const isTab = (v: string): v is Tab => TABS.some((t) => t.id === v);

/**
 * The German e-invoice tool: one page, four tabs, each backed by one backend endpoint group
 * (create/convert, extract, validate, archive). Panels stay mounted so results survive tab switches.
 * `intro` (the page heading) is rendered in the parchment band above the tab bar.
 */
export default function EinvoiceTool({ intro }: { intro?: React.ReactNode }) {
  const [tab, setTab] = useState<Tab>('erstellen');
  const [form, setForm] = useState<InvoiceForm>(emptyInvoiceForm);
  const [format, setFormat] = useState<EinvoiceFormat>('zugferd');
  const [mode, setMode] = useState<FormMode>('simple');
  const [importNotice, setImportNotice] = useState<ImportNotice | null>(null);
  const [archiveRequest, setArchiveRequest] = useState<{ id: string; nonce: number } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});

  // Deep links such as /de/konverter/e-rechnung#pruefen open that tab.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (isTab(hash)) setTab(hash);
  }, []);

  const select = (next: Tab, scroll = false) => {
    setTab(next);
    window.history.replaceState(null, '', `#${next}`);
    if (scroll) topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onTabKey = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const id = TABS[(next + TABS.length) % TABS.length].id;
    select(id);
    tabRefs.current[id]?.focus();
  };

  const active = TABS.find((t) => t.id === tab)!;

  const applyExtracted = (data: ExtractResponse) => {
    if (!data.invoice) return;
    const { form: next, lossy } = invoiceToForm(data.invoice);
    setForm(next);
    setMode('full');
    setFormat(data.profile?.toUpperCase().includes('XRECHNUNG') ? 'xrechnung' : 'zugferd');
    setImportNotice({ filename: data.filename, lossy });
    select('erstellen', true);
  };

  const verifyArchive = (id: string) => {
    setArchiveRequest((prev) => ({ id, nonce: (prev?.nonce ?? 0) + 1 }));
    select('archiv', true);
  };

  return (
    <div>
      <div className="-mt-6 sm:-mt-10 pt-10 sm:pt-14 pb-8 sm:pb-10 bg-[var(--color-surface-subtle)] shadow-[0_0_0_100vmax_var(--color-surface-subtle)] [clip-path:inset(0_-100vmax)]">
        {intro}
        <div ref={topRef} className={`scroll-mt-20 ${intro ? 'mt-8 sm:mt-10' : ''}`}>
          <div
            role="tablist"
            aria-label="Werkzeuge"
            onKeyDown={onTabKey}
            className="grid grid-cols-4 sm:inline-grid sm:grid-flow-col sm:auto-cols-fr gap-1 w-full sm:w-auto rounded-full bg-[var(--color-surface-muted)] p-1"
          >
            {TABS.map((t) => {
              const selected = tab === t.id;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[t.id] = el;
                  }}
                  id={`einv-tab-${t.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`einv-panel-${t.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(t.id)}
                  className={`min-h-[44px] px-2 sm:px-5 inline-flex items-center justify-center gap-2 rounded-full text-[14px] sm:text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] ${
                    selected ? 'bg-[var(--color-ink)] text-[var(--color-surface)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  <t.icon className="hidden sm:block w-4 h-4 shrink-0" aria-hidden="true" />
                  {t.title}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[14px] leading-snug text-[var(--color-text-secondary)]">{active.body}</p>
        </div>
      </div>

      <div className="pt-8 sm:pt-12">
        {TABS.map((t) => (
          <div key={t.id} id={`einv-panel-${t.id}`} role="tabpanel" aria-labelledby={`einv-tab-${t.id}`} hidden={tab !== t.id}>
            {t.id === 'erstellen' && (
              <CreatePanel
                form={form}
                setForm={setForm}
                format={format}
                setFormat={setFormat}
                mode={mode}
                setMode={setMode}
                importNotice={importNotice}
                onDismissImport={() => setImportNotice(null)}
                onVerifyArchive={verifyArchive}
              />
            )}
            {t.id === 'auslesen' && <ExtractPanel onUseInForm={applyExtracted} onVerifyArchive={verifyArchive} />}
            {t.id === 'pruefen' && <ValidatePanel />}
            {t.id === 'archiv' && <ArchivePanel request={archiveRequest} />}
          </div>
        ))}
      </div>
    </div>
  );
}
