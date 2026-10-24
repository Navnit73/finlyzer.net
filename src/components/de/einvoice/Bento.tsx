import React from 'react';
import { ArrowRight, CheckCircle2, FileCode2, FileText, Landmark, Plus, Receipt } from 'lucide-react';
import { SAMPLE_INVOICE, TONE_CLASSES, type Tone } from './Illustrations';

/* ------------------------------------------------------------------
   Bento tiles for the German e-invoice homepage: a visual on top (or
   beside, for wide tiles) and a title with short copy below. Light tiles
   sit on the band colour; one dark tile per grid gives the rhythm.
------------------------------------------------------------------- */

export function BentoTile({
  visual,
  title,
  body,
  step,
  dark = false,
  horizontal = false,
  className = '',
}: {
  visual: React.ReactNode;
  title: string;
  body: React.ReactNode;
  /** Optional numbered badge before the title, with its tint. */
  step?: { n: number; tone: Tone };
  dark?: boolean;
  /** Text beside the visual from lg up (for full-width tiles). */
  horizontal?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-7 flex flex-col gap-6 ${
        horizontal ? 'lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-10' : ''
      } ${dark ? 'surface-dark border-transparent' : 'bg-[var(--color-surface)] border-[var(--color-border)]'} ${className}`}
    >
      <div
        className={`rounded-xl bg-[var(--color-surface-subtle)] p-3 sm:p-6 flex items-center justify-center min-w-0 ${
          horizontal ? 'lg:order-2' : 'flex-1'
        }`}
      >
        {visual}
      </div>
      <div className={horizontal ? 'lg:order-1' : ''}>
        <h3 className="type-headline flex items-center gap-2.5">
          {step && (
            <span
              className={`inline-flex w-7 h-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-[var(--color-on-brand)] ${TONE_CLASSES[step.tone].fill}`}
            >
              {step.n}
            </span>
          )}
          {title}
        </h3>
        <div className="mt-2 text-[15px] sm:text-base leading-relaxed text-[var(--color-text-secondary)]">{body}</div>
      </div>
    </div>
  );
}

/* ---------------- "Warum jetzt" visuals ---------------- */

const DEADLINES: { date: string; title: string; body: string; tone: Tone; done: boolean }[] = [
  { date: '1. Januar 2025', title: 'Empfang', body: 'Alle Unternehmen müssen E-Rechnungen empfangen können.', tone: 'green', done: true },
  { date: '1. Januar 2027', title: 'Versand ab 800.000 €', body: 'Pflicht ab 800.000 € Vorjahresumsatz.', tone: 'orange', done: false },
  { date: '1. Januar 2028', title: 'Versand für alle', body: 'Gilt für alle Unternehmen im B2B-Bereich.', tone: 'blue', done: false },
];

/** Horizontal timeline from sm up, vertical list on phones. */
export function DeadlineTimeline() {
  return (
    <div className="w-full">
      <p className="text-[13px] font-medium text-[var(--color-text-muted)]">E-Rechnungspflicht im B2B-Bereich · Deutschland</p>
      <ol className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
        {DEADLINES.map((d, i) => {
          const t = TONE_CLASSES[d.tone];
          return (
            <li key={d.date} className="min-w-0">
              <div className="flex items-center gap-2" aria-hidden="true">
                <span
                  className={`w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    d.done ? `${t.fill} border-transparent` : `${t.soft} ${t.border}`
                  }`}
                >
                  {d.done ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-on-brand)]" />
                  ) : (
                    <span className={`w-2.5 h-2.5 rounded-full ${t.fill}`} />
                  )}
                </span>
                {i < DEADLINES.length - 1 && <span className="hidden sm:block h-0.5 flex-1 rounded-full bg-[var(--color-border)]" />}
              </div>
              <p className={`mt-4 text-[13px] font-medium ${t.fg}`}>{d.date}</p>
              <p className="mt-1 text-[17px] sm:text-[18px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">{d.title}</p>
              <p className="mt-1.5 text-[14px] leading-snug text-[var(--color-text-secondary)]">{d.body}</p>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 sm:mt-8 rounded-xl border border-[var(--color-media-orange-border)] bg-[var(--color-media-orange-soft)] px-4 py-3 text-[13px] leading-snug text-[var(--color-ink)]">
        <span className="font-semibold text-[var(--color-media-orange-text)]">Übergangsfrist:</span> Bis Ende 2026 sind Papierrechnungen
        und – mit Zustimmung des Empfängers – PDF-Rechnungen noch zulässig.
      </p>
    </div>
  );
}

/** "Your tools stay": the existing invoicing tools, plus Finlyzers on top. */
export function KeepWorkflowVisual() {
  const tools: { icon: typeof FileText; label: string; tone: Tone }[] = [
    { icon: FileText, label: 'Word', tone: 'blue' },
    { icon: FileText, label: 'Excel', tone: 'green' },
    { icon: Receipt, label: 'Ihr Programm', tone: 'orange' },
  ];
  return (
    <div className="w-full max-w-xs space-y-2" aria-hidden="true">
      {tools.map((tool) => (
        <div
          key={tool.label}
          className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5"
        >
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${TONE_CLASSES[tool.tone].fill}`}>
            <tool.icon className="w-4 h-4 text-[var(--color-on-brand)]" />
          </span>
          <span className="text-[14px] font-medium text-[var(--color-ink)] truncate">{tool.label}</span>
          <span className="ml-auto text-[12px] text-[var(--color-text-muted)]">bleibt</span>
        </div>
      ))}
      <div className="flex items-center gap-3 rounded-xl bg-[var(--color-brand)] px-3 py-2.5 text-[var(--color-on-brand)]">
        <span className="w-8 h-8 rounded-lg bg-[var(--color-on-brand)]/15 flex items-center justify-center">
          <Plus className="w-4 h-4" />
        </span>
        <span className="text-[14px] font-medium">Finlyzers</span>
        <ArrowRight className="ml-auto w-4 h-4" />
        <span className="text-[12px] font-medium">E-Rechnung</span>
      </div>
    </div>
  );
}

/** Format switch: one upload, either output. */
export function FormatChoiceVisual() {
  const files: { icon: typeof FileText; name: string; kind: string; tone: Tone }[] = [
    { icon: FileText, name: `${SAMPLE_INVOICE.number}.pdf`, kind: 'ZUGFeRD · PDF/A-3 · B2B', tone: 'blue' },
    { icon: FileCode2, name: `${SAMPLE_INVOICE.number}.xml`, kind: 'XRechnung · XML · B2G', tone: 'green' },
  ];
  return (
    <div className="w-full max-w-lg" aria-hidden="true">
      <div className="mx-auto w-fit flex rounded-full bg-[var(--color-surface-muted)] p-1 text-[13px] font-medium">
        <span className="rounded-full bg-[var(--color-surface)] px-4 py-1.5 text-[var(--color-brand-dark)] border border-[var(--color-border)]">ZUGFeRD</span>
        <span className="px-4 py-1.5 text-[var(--color-text-secondary)]">XRechnung</span>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {files.map((f) => {
          const t = TONE_CLASSES[f.tone];
          return (
            <div key={f.name} className={`rounded-xl border px-4 py-3.5 ${t.soft} ${t.border}`}>
              <div className="flex items-center gap-2.5">
                <f.icon className={`w-5 h-5 shrink-0 ${t.fg}`} />
                <span className="text-[13px] font-semibold text-[var(--color-ink)] truncate">{f.name}</span>
              </div>
              <p className="mt-1.5 text-[12px] text-[var(--color-text-secondary)]">{f.kind}</p>
              <p className={`mt-2.5 inline-flex items-center gap-1 text-[12px] font-medium ${t.fg}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> EN 16931
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Audience visuals ---------------- */

/** A freelancer's month: a handful of invoices, each turned into ZUGFeRD. */
export function FewInvoicesVisual() {
  const rows = [
    { nr: 'RE-2026-0140', client: 'Agentur Nord', amount: '840,00 €' },
    { nr: 'RE-2026-0141', client: 'Praxis Weber', amount: '312,50 €' },
    { nr: SAMPLE_INVOICE.number, client: 'Stadtverwaltung', amount: SAMPLE_INVOICE.gross },
  ];
  return (
    <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden" aria-hidden="true">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] text-[12px]">
        <span className="font-medium text-[var(--color-ink)]">Rechnungen im Oktober</span>
        <span className="text-[var(--color-text-muted)]">3 Stück</span>
      </div>
      <ul className="divide-y divide-[var(--color-border-subtle)]">
        {rows.map((r) => (
          <li key={r.nr} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
            <div className="min-w-0">
              <p className="font-medium text-[var(--color-ink)] truncate">{r.nr}</p>
              <p className="text-[12px] text-[var(--color-text-muted)] truncate">{r.client}</p>
            </div>
            <span className="ml-auto tabular-nums text-[var(--color-ink)] whitespace-nowrap">{r.amount}</span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[var(--color-success-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-success)] whitespace-nowrap">
              <CheckCircle2 className="w-3 h-3" /> ZUGFeRD
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Public-sector invoice: the Leitweg-ID field and the portal it goes to. */
export function LeitwegVisual() {
  return (
    <div className="w-full max-w-xs space-y-3" aria-hidden="true">
      <div>
        <p className="text-[11px] text-[var(--color-text-muted)]">Leitweg-ID (BT-10)</p>
        <div className="mt-1 flex items-center gap-2 rounded-lg border border-[var(--color-success)] bg-[var(--color-surface)] px-3 py-2">
          <span className="font-mono text-[12px] text-[var(--color-ink)] truncate">{SAMPLE_INVOICE.leitwegId}</span>
          <CheckCircle2 className="ml-auto w-4 h-4 shrink-0 text-[var(--color-success)]" />
        </div>
        <p className="mt-1 text-[11px] text-[var(--color-success-border)]">Format gültig</p>
      </div>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 space-y-2">
        <div className="flex items-center gap-2 text-[12px] text-[var(--color-ink)]">
          <FileCode2 className="w-4 h-4 text-[var(--color-brand-dark)]" /> {SAMPLE_INVOICE.number}.xml
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
          <ArrowRight className="w-4 h-4" /> Einreichung über die ZRE
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-on-brand)]">
        <Landmark className="w-3.5 h-3.5" /> XRechnung bereit
      </span>
    </div>
  );
}

/** Bridge: existing program → Finlyzers → ZUGFeRD. */
export function BridgeVisual() {
  const step = (label: string, sub: string, cls: string) => (
    <div className={`rounded-xl border px-3 py-2.5 text-center min-w-0 ${cls}`}>
      <p className="text-[13px] font-semibold text-[var(--color-ink)] truncate">{label}</p>
      <p className="text-[11px] text-[var(--color-text-muted)] truncate">{sub}</p>
    </div>
  );
  return (
    <div className="w-full max-w-lg grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2" aria-hidden="true">
      {step('Ihr Programm', 'wie gewohnt', 'bg-[var(--color-media-orange-soft)] border-[var(--color-media-orange-border)]')}
      <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)]" />
      {step('Finlyzers', 'PDF hochladen', 'bg-[var(--color-brand-soft)] border-[var(--color-info-border)]')}
      <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)]" />
      {step('ZUGFeRD', 'E-Rechnung', 'bg-[var(--color-success-soft)] border-[var(--color-success-border)]')}
    </div>
  );
}
