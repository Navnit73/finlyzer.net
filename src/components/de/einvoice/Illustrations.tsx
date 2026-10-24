import React from 'react';
import {
  ArrowRight, ChevronDown, CheckCircle2, Download, FileCheck2, FileCode2, FileSpreadsheet, FileText, Landmark,
  Paperclip, Receipt, UploadCloud, type LucideIcon,
} from 'lucide-react';

/* ------------------------------------------------------------------
   Illustrations for the German e-invoice homepage (src/app/de/page.tsx).
   Built from markup and design tokens instead of image files, so they stay
   sharp, theme with the site and carry real, readable invoice data.
   All of them share one sample invoice, so the PDF, the XML and the
   validation report visibly describe the same document.
------------------------------------------------------------------- */

export const SAMPLE_INVOICE = {
  number: 'RE-2026-0142',
  date: '24.10.2026',
  isoDate: '20261024',
  leitwegId: '04011000-1234512345-06',
  seller: 'Musterbau GmbH',
  buyer: 'Stadtverwaltung Musterstadt',
  lines: [
    { desc: 'Beratung, 8 Std. à 95,00 €', amount: '760,00 €' },
    { desc: 'Hosting, Jahrespaket', amount: '240,00 €' },
  ],
  net: '1.000,00 €',
  vat: '190,00 €',
  gross: '1.190,00 €',
};

/** Numbered marker that ties an invoice field to its XML element in the anatomy diagram. */
function Marker({ n }: { n: number }) {
  return (
    <span className="inline-flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] text-[11px] font-semibold tabular-nums">
      {n}
    </span>
  );
}

/** A plain PDF invoice as most invoicing tools export it. */
export function InvoicePaper({ markers = false, className = '' }: { markers?: boolean; className?: string }) {
  const inv = SAMPLE_INVOICE;
  const field = (n: number, label: string, value: string) => (
    <div className={`flex items-center justify-between gap-3 rounded-md px-1.5 py-0.5 ${markers ? 'bg-[var(--color-brand-soft)]' : ''}`}>
      <span className="flex items-center gap-1.5 whitespace-nowrap text-[var(--color-text-muted)]">
        {markers && <Marker n={n} />}
        {label}
      </span>
      <span className="font-medium text-right break-all sm:break-normal sm:whitespace-nowrap text-[var(--color-ink)] tabular-nums">{value}</span>
    </div>
  );
  return (
    <div className={`card-surface p-4 sm:p-6 text-left text-[11px] sm:text-[12px] leading-snug ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] sm:text-[14px] font-semibold text-[var(--color-ink)]">{inv.seller}</p>
          <div className="mt-2 space-y-1" aria-hidden="true">
            <div className="h-1.5 w-28 rounded-full bg-[var(--color-surface-muted)]" />
            <div className="h-1.5 w-20 rounded-full bg-[var(--color-surface-muted)]" />
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
          <FileText className="w-3 h-3" aria-hidden="true" /> PDF
        </span>
      </div>

      <p className="mt-5 text-[16px] sm:text-[18px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">Rechnung</p>
      <p className="mt-1 text-[var(--color-text-muted)]">an {inv.buyer}</p>

      <div className="mt-4 space-y-1">
        {field(1, 'Rechnungsnr.', inv.number)}
        {field(2, 'Datum', inv.date)}
        {field(3, 'Leitweg-ID', inv.leitwegId)}
      </div>

      <div className="mt-4 hairline-t pt-3 space-y-1.5">
        {inv.lines.map((l) => (
          <div key={l.desc} className="flex justify-between gap-3">
            <span className="text-[var(--color-text-secondary)]">{l.desc}</span>
            <span className="tabular-nums text-[var(--color-ink)]">{l.amount}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 hairline-t pt-3 space-y-1">
        <div className="flex justify-between gap-3 px-1.5 text-[var(--color-text-secondary)]">
          <span>Netto</span><span className="tabular-nums">{inv.net}</span>
        </div>
        <div className="flex justify-between gap-3 px-1.5 text-[var(--color-text-secondary)]">
          <span>USt. 19 %</span><span className="tabular-nums">{inv.vat}</span>
        </div>
        <div className={`flex items-center justify-between gap-3 rounded-md px-1.5 py-0.5 text-[13px] font-semibold text-[var(--color-ink)] ${markers ? 'bg-[var(--color-brand-soft)]' : ''}`}>
          <span className="flex items-center gap-1.5">{markers && <Marker n={4} />}Gesamtbetrag</span>
          <span className="tabular-nums">{inv.gross}</span>
        </div>
      </div>
    </div>
  );
}

type XmlLine = { indent: number; tag: string; value?: string; attr?: string; close?: boolean };

const XML_LINES: XmlLine[] = [
  { indent: 0, tag: 'rsm:CrossIndustryInvoice' },
  { indent: 1, tag: 'rsm:ExchangedDocument' },
  { indent: 2, tag: 'ram:ID', value: SAMPLE_INVOICE.number },
  { indent: 2, tag: 'ram:TypeCode', value: '380' },
  { indent: 2, tag: 'ram:IssueDateTime' },
  { indent: 3, tag: 'udt:DateTimeString', attr: 'format="102"', value: SAMPLE_INVOICE.isoDate },
  { indent: 2, tag: 'ram:IssueDateTime', close: true },
  { indent: 1, tag: 'rsm:ExchangedDocument', close: true },
  { indent: 1, tag: 'ram:BuyerReference', value: SAMPLE_INVOICE.leitwegId },
  { indent: 1, tag: 'ram:TaxBasisTotalAmount', value: '1000.00' },
  { indent: 1, tag: 'ram:TaxTotalAmount', attr: 'currencyID="EUR"', value: '190.00' },
  { indent: 1, tag: 'ram:GrandTotalAmount', value: '1190.00' },
  { indent: 0, tag: 'rsm:CrossIndustryInvoice', close: true },
];

/** Excerpt of the structured CII data (EN 16931) behind the sample invoice. */
export function XmlPanel({ fileName = 'factur-x.xml', className = '' }: { fileName?: string; className?: string }) {
  const tag = (name: string, closing = false, attr?: string) => (
    <>
      <span className="text-[var(--color-text-muted)]">{closing ? '</' : '<'}</span>
      <span className="text-[var(--color-brand-dark)]">{name}</span>
      {attr && <span className="text-[var(--color-text-muted)]"> {attr}</span>}
      <span className="text-[var(--color-text-muted)]">&gt;</span>
    </>
  );
  return (
    <div className={`surface-dark rounded-2xl overflow-hidden text-left ${className}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--color-border)]">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-text-secondary)]">
          <FileCode2 className="w-3.5 h-3.5" aria-hidden="true" /> {fileName}
        </span>
        <span className="text-[11px] text-[var(--color-text-muted)]">EN 16931 · CII</span>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[11px] sm:text-[12px] leading-[1.7]">
        {XML_LINES.map((l, i) => (
          <div key={i} style={{ paddingLeft: `${l.indent * 1.25}em` }} className="whitespace-pre">
            {l.close ? (
              tag(l.tag, true)
            ) : l.value !== undefined ? (
              <>
                {tag(l.tag, false, l.attr)}
                <span className="text-[var(--color-media-orange)]">{l.value}</span>
                {tag(l.tag, true)}
              </>
            ) : (
              tag(l.tag)
            )}
          </div>
        ))}
      </pre>
    </div>
  );
}

/* ---------------- Tints ----------------
   Blue = input / action, green = done / valid output, orange = third category only.
   Every value is a token from globals.css. */

export type Tone = 'blue' | 'green' | 'orange';

export const TONE_CLASSES: Record<Tone, { soft: string; border: string; fg: string; fill: string }> = {
  blue: {
    soft: 'bg-[var(--color-brand-soft)]',
    border: 'border-[var(--color-info-border)]',
    fg: 'text-[var(--color-brand-dark)]',
    fill: 'bg-[var(--color-brand)]',
  },
  green: {
    soft: 'bg-[var(--color-success-soft)]',
    border: 'border-[var(--color-success-border)]',
    fg: 'text-[var(--color-success)]',
    fill: 'bg-[var(--color-success)]',
  },
  orange: {
    soft: 'bg-[var(--color-media-orange-soft)]',
    border: 'border-[var(--color-media-orange-border)]',
    fg: 'text-[var(--color-media-orange-text)]',
    fill: 'bg-[var(--color-media-orange)]',
  },
};

/* ---------------- Hero cards ---------------- */

/** Ring chart of the sample invoice total: net and VAT share, drawn with pathLength 100 so dash values are percentages. */
function AmountRing() {
  const ring = 'fill-none [stroke-width:11]';
  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r="40" className={`${ring} stroke-[var(--color-surface-subtle)]`} />
        <circle cx="50" cy="50" r="40" pathLength={100} className={`${ring} stroke-[var(--color-brand)]`} strokeDasharray="82 18" />
        <circle cx="50" cy="50" r="40" pathLength={100} className={`${ring} stroke-[var(--color-success)]`} strokeDasharray="14 86" strokeDashoffset={-84} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[21px] sm:text-[24px] font-semibold tracking-[-0.02em] text-[var(--color-ink)] tabular-nums">1.190 €</span>
        <span className="text-[12px] text-[var(--color-text-muted)]">Gesamtbetrag</span>
      </div>
    </div>
  );
}

/** White hero card: the sample invoice as the tool reads it. */
export function InvoiceSummaryCard() {
  const rows = [
    { dot: 'bg-[var(--color-brand)]', label: 'Netto', value: SAMPLE_INVOICE.net, valueClass: 'text-[var(--color-ink)]' },
    { dot: 'bg-[var(--color-success)]', label: 'USt. 19 %', value: SAMPLE_INVOICE.vat, valueClass: 'text-[var(--color-ink)]' },
    { dot: 'bg-[var(--color-media-orange)]', label: 'Leitweg-ID', value: 'erkannt', valueClass: 'text-[var(--color-success)]' },
  ];
  return (
    <div className="card-surface p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[var(--color-brand-dark)]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-[var(--color-ink)] truncate">{SAMPLE_INVOICE.number}</p>
            <p className="text-[12px] text-[var(--color-text-muted)] truncate">{SAMPLE_INVOICE.buyer}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[12px] text-[var(--color-text-secondary)] shrink-0">
          ZUGFeRD <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-6">
        <AmountRing />
      </div>
      <ul className="mt-6 space-y-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-3 text-[14px]">
            <span className="inline-flex items-center gap-2 text-[var(--color-text-secondary)]">
              <span className={`w-2.5 h-2.5 rounded-full ${r.dot}`} aria-hidden="true" /> {r.label}
            </span>
            <span className={`inline-flex items-center gap-1 font-medium tabular-nums ${r.valueClass}`}>
              {r.value === 'erkannt' && <CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
              {r.value}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-soft)] px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-success)]">
        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" /> EN 16931 geprüft · bereit zum Download
      </p>
    </div>
  );
}

/** Dark hero tile for the public-sector (B2G) use case. */
export function XrechnungTile() {
  return (
    <div className="surface-dark rounded-2xl p-5 sm:p-7 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:gap-5">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success)] text-[var(--color-on-brand)] px-3 py-1 text-[12px] font-medium">
          <Landmark className="w-3.5 h-3.5" aria-hidden="true" /> Für Behörden
        </span>
        <p className="mt-4 text-[18px] sm:text-[22px] font-semibold leading-[1.2] tracking-[-0.015em] text-[var(--color-ink)]">
          XRechnung mit Leitweg-ID, direkt aus Ihrer PDF
        </p>
      </div>
      <div className="relative w-24 h-28 sm:w-28 sm:h-32 shrink-0" aria-hidden="true">
        <div className="absolute right-0 top-0 w-20 h-24 sm:w-24 sm:h-28 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]" />
        <div className="absolute left-0 bottom-0 w-20 h-24 sm:w-24 sm:h-28 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-2.5 sm:p-3 font-mono text-[8px] sm:text-[9px] leading-[1.6]">
          <div className="text-[var(--color-brand-dark)]">&lt;Invoice&gt;</div>
          <div className="pl-1.5 text-[var(--color-media-orange)]">04011000…</div>
          <div className="text-[var(--color-brand-dark)]">&lt;/Invoice&gt;</div>
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--color-success)] px-1.5 py-0.5 font-sans text-[9px] font-medium text-[var(--color-on-brand)]">
            <CheckCircle2 className="w-2.5 h-2.5" /> valide
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Flow diagram ---------------- */

type FlowNode = { icon: LucideIcon; label: string; tone: Tone; y: number; x: number };

// Positions are percentages of each side column; the connector paths below use the same coordinates.
const FLOW_SOURCES: FlowNode[] = [
  { icon: FileText, label: 'Word', tone: 'blue', x: 28, y: 14 },
  { icon: FileSpreadsheet, label: 'Excel', tone: 'green', x: 14, y: 50 },
  { icon: Receipt, label: 'Rechnungsprogramm', tone: 'orange', x: 28, y: 86 },
];

const FLOW_OUTPUTS: FlowNode[] = [
  { icon: FileText, label: 'ZUGFeRD PDF/A‑3', tone: 'green', x: 72, y: 14 },
  { icon: FileCode2, label: 'XRechnung XML', tone: 'green', x: 84, y: 50 },
  { icon: FileCheck2, label: 'Prüfbericht', tone: 'green', x: 72, y: 86 },
];

const FLOW_FIELDS = [
  { label: 'Rechnungsnr.', done: true },
  { label: 'Datum', done: true },
  { label: 'Leitweg-ID', done: true },
  { label: 'USt. 19 %', done: true },
  { label: 'Positionen', done: false },
  { label: 'Zahlungsziel', done: false },
];

function NodeBubble({ node, className = '', style }: { node: FlowNode; className?: string; style?: React.CSSProperties }) {
  const t = TONE_CLASSES[node.tone];
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`} style={style}>
      <span className={`w-12 h-12 rounded-full border flex items-center justify-center ${t.soft} ${t.border}`}>
        <node.icon className={`w-5 h-5 ${t.fg}`} aria-hidden="true" />
      </span>
      <span className="max-w-full rounded-md px-1 text-[12px] font-medium text-[var(--color-text-secondary)] text-center leading-tight hyphens-auto lg:bg-[var(--color-surface)] lg:whitespace-nowrap">{node.label}</span>
    </div>
  );
}

function FlowPill({ label, tone, className = '', style }: { label: string; tone: Tone; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-[var(--color-surface)] border pl-1.5 pr-3.5 py-1.5 text-[14px] font-medium text-[var(--color-ink)] whitespace-nowrap ${TONE_CLASSES[tone].border} ${className}`}
      style={style}
    >
      <span className={`w-6 h-6 rounded-full flex items-center justify-center ${TONE_CLASSES[tone].fill}`}>
        <ArrowRight className="w-3.5 h-3.5 text-[var(--color-on-brand)]" aria-hidden="true" />
      </span>
      {label}
    </span>
  );
}

/** Curved connectors for one side column, in the column's 0–100 coordinate space. */
function Connectors({ side }: { side: 'in' | 'out' }) {
  const nodes = side === 'in' ? FLOW_SOURCES : FLOW_OUTPUTS;
  const hub = side === 'in' ? 78 : 22;
  const edge = side === 'in' ? 0 : 100;
  const center = side === 'in' ? 100 : 0;
  const flowing = [
    ...nodes.map((n) => `M${n.x} ${n.y} C${(n.x + hub) / 2} ${n.y}, ${(n.x + hub) / 2} 50, ${hub} 50`),
    `M${hub} 50 L${center} 50`,
  ];
  const tails = nodes.map((n) => `M${edge} ${n.y} L${n.x} ${n.y}`);
  // Input lines run node → hub, output lines hub → node, so the dots always move left to right.
  const ordered = side === 'in' ? flowing : flowing.map((d, i) => (i < nodes.length ? reverseCurve(nodes[i], hub) : d));
  const base = side === 'in' ? 'stroke-[var(--color-info-border)]' : 'stroke-[var(--color-success-border)]';
  const dots = side === 'in' ? 'stroke-[var(--color-brand)]' : 'stroke-[var(--color-success)]';
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
      {tails.map((d) => (
        <path key={d} d={d} fill="none" vectorEffect="non-scaling-stroke" className="stroke-[var(--color-border)] [stroke-width:1]" />
      ))}
      {ordered.map((d) => (
        <g key={d}>
          <path d={d} fill="none" vectorEffect="non-scaling-stroke" className={`${base} [stroke-width:1.5]`} />
          <path d={d} fill="none" vectorEffect="non-scaling-stroke" className={`${dots} flow-dash [stroke-width:2]`} />
        </g>
      ))}
    </svg>
  );
}

function reverseCurve(n: FlowNode, hub: number) {
  const mid = (n.x + hub) / 2;
  return `M${hub} 50 C${mid} 50, ${mid} ${n.y}, ${n.x} ${n.y}`;
}

function FlowCard() {
  const done = FLOW_FIELDS.filter((f) => f.done).length;
  return (
    <div className="card-surface p-4 sm:p-6 w-full">
      <div className="flex items-center gap-3 rounded-xl border border-[var(--color-info-border)] bg-[var(--color-brand-soft)] px-3.5 sm:px-4 py-3">
        <FileText className="w-5 h-5 text-[var(--color-brand-dark)] shrink-0" aria-hidden="true" />
        <p className="text-[13px] sm:text-[14px] text-[var(--color-text-secondary)] leading-snug min-w-0">
          <span className="font-medium text-[var(--color-ink)]">{SAMPLE_INVOICE.number}.pdf</span> in{' '}
          <span className="font-medium text-[var(--color-brand-dark)]">ZUGFeRD</span> nach{' '}
          <span className="font-medium text-[var(--color-ink)]">EN 16931</span> umwandeln
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-[12px]">
        <span className="font-medium text-[var(--color-text-secondary)]">Pflichtfelder erkannt</span>
        <span className="font-medium text-[var(--color-success)] tabular-nums">
          {done} / {FLOW_FIELDS.length}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden" aria-hidden="true">
        <div className="h-full rounded-full bg-[var(--color-success)]" style={{ width: `${(done / FLOW_FIELDS.length) * 100}%` }} />
      </div>

      <ul className="mt-4 flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {FLOW_FIELDS.map((f) => (
          <li
            key={f.label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] ${
              f.done
                ? 'border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-ink)]'
                : 'border-dashed border-[var(--color-border-hover)] text-[var(--color-text-muted)]'
            }`}
          >
            {f.done ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" aria-hidden="true" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-dashed border-[var(--color-border-hover)]" aria-hidden="true" />
            )}
            {f.label}
          </li>
        ))}
      </ul>

      <div className="relative mt-3 h-20 sm:h-24 flex items-end justify-center overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 200 100" className="absolute bottom-0 h-full">
          {[
            [90, 'stroke-[var(--color-border)]'],
            [70, 'stroke-[var(--color-info-border)]'],
            [50, 'stroke-[var(--color-success-border)]'],
          ].map(([r, cls]) => (
            <path
              key={r}
              d={`M${100 - Number(r)} 100 A${r} ${r} 0 0 1 ${100 + Number(r)} 100`}
              fill="none"
              className={`${cls} [stroke-width:1.25]`}
            />
          ))}
        </svg>
        <span className="relative mb-1.5 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--color-brand)] flex items-center justify-center">
          <FileCode2 className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-on-brand)]" />
        </span>
      </div>
    </div>
  );
}

/** Short vertical connector for the stacked (mobile/tablet) flow. */
function Spine({ tone }: { tone: Tone }) {
  return (
    <span
      className={`block w-px h-6 ${tone === 'green' ? 'bg-[var(--color-success-border)]' : 'bg-[var(--color-info-border)]'}`}
      aria-hidden="true"
    />
  );
}

/** Sources → Finlyzers → generated files, after the Connect/Sync diagrams common on SaaS sites. */
export function FlowDiagram() {
  return (
    <div
      role="img"
      aria-label="Rechnungen aus Word, Excel oder Ihrem Rechnungsprogramm werden als PDF hochgeladen. Finlyzers erkennt die Pflichtfelder und erzeugt eine ZUGFeRD-PDF/A-3, eine XRechnung-XML und einen Prüfbericht."
    >
      {/* Desktop: side columns with curved connectors */}
      <div className="hidden lg:grid grid-cols-[minmax(0,1fr)_minmax(0,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)_minmax(0,1fr)] items-center">
        <div className="relative h-[360px]">
          <Connectors side="in" />
          {FLOW_SOURCES.map((n) => (
            <NodeBubble key={n.label} node={n} className="absolute -translate-x-1/2 -translate-y-6" style={{ left: `${n.x}%`, top: `${n.y}%` }} />
          ))}
          <FlowPill label="Hochladen" tone="blue" className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: '78%', top: '50%' }} />
        </div>
        <FlowCard />
        <div className="relative h-[360px]">
          <Connectors side="out" />
          <FlowPill label="Erzeugen" tone="green" className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: '22%', top: '50%' }} />
          {FLOW_OUTPUTS.map((n) => (
            <NodeBubble key={n.label} node={n} className="absolute -translate-x-1/2 -translate-y-6" style={{ left: `${n.x}%`, top: `${n.y}%` }} />
          ))}
        </div>
      </div>

      {/* Mobile and tablet: the same flow on a vertical spine */}
      <div className="lg:hidden flex flex-col items-center">
        <div className="grid grid-cols-3 gap-3 w-full max-w-md">
          {FLOW_SOURCES.map((n) => <NodeBubble key={n.label} node={n} />)}
        </div>
        <Spine tone="blue" />
        <FlowPill label="Hochladen" tone="blue" />
        <Spine tone="blue" />
        <div className="w-full max-w-md"><FlowCard /></div>
        <Spine tone="green" />
        <FlowPill label="Erzeugen" tone="green" />
        <Spine tone="green" />
        <div className="grid grid-cols-3 gap-3 w-full max-w-md">
          {FLOW_OUTPUTS.map((n) => <NodeBubble key={n.label} node={n} />)}
        </div>
      </div>
    </div>
  );
}

/** Field-to-element mapping for the anatomy section. BT numbers are EN 16931 business terms. */
export const FIELD_MAPPING = [
  { n: 1, field: 'Rechnungsnummer', value: SAMPLE_INVOICE.number, element: 'ram:ID', bt: 'BT-1' },
  { n: 2, field: 'Rechnungsdatum', value: SAMPLE_INVOICE.date, element: 'ram:IssueDateTime', bt: 'BT-2' },
  { n: 3, field: 'Leitweg-ID (Käuferreferenz)', value: SAMPLE_INVOICE.leitwegId, element: 'ram:BuyerReference', bt: 'BT-10' },
  { n: 4, field: 'Gesamtbetrag inkl. USt.', value: SAMPLE_INVOICE.gross, element: 'ram:GrandTotalAmount', bt: 'BT-112' },
];

export function FieldMappingList({ className = 'space-y-3' }: { className?: string }) {
  return (
    <ol className={className}>
      {FIELD_MAPPING.map((m) => (
        <li key={m.n} className="card-surface p-4 flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <Marker n={m.n} />
            <span className="rounded-full bg-[var(--color-media-orange-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-media-orange-text)]">
              {m.bt}
            </span>
          </div>
          <p className="mt-3 text-[14px] text-[var(--color-text-secondary)]">{m.field}</p>
          <p className="mt-0.5 text-[15px] font-semibold text-[var(--color-ink)] tabular-nums break-all">{m.value}</p>
          <p className="mt-auto pt-3 flex items-center gap-2 text-[13px]">
            <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
            <code className="font-mono text-[12px] px-1.5 py-0.5 rounded-md bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] truncate">
              &lt;{m.element}&gt;
            </code>
          </p>
        </li>
      ))}
    </ol>
  );
}

/* ---------------- Step visuals ---------------- */

const stepFrame = 'rounded-xl bg-[var(--color-surface-subtle)] h-40 p-4 flex items-center justify-center';

export function UploadVisual() {
  return (
    <div className={stepFrame} aria-hidden="true">
      <div className="w-full h-full rounded-lg border-2 border-dashed border-[var(--color-info-border)] bg-[var(--color-brand-soft)] flex flex-col items-center justify-center gap-2">
        <UploadCloud className="w-7 h-7 text-[var(--color-brand-dark)]" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] px-2.5 py-1 text-[12px] text-[var(--color-ink)]">
          <FileText className="w-3.5 h-3.5 text-[var(--color-text-muted)]" /> rechnung.pdf
        </span>
      </div>
    </div>
  );
}

export function FormVisual() {
  const input = (label: string, value: string, active = false) => (
    <div>
      <p className="text-[10px] text-[var(--color-text-muted)]">{label}</p>
      <div
        className={`mt-0.5 rounded-md border bg-[var(--color-surface)] px-2 py-1 text-[12px] text-[var(--color-ink)] font-mono truncate ${
          active ? 'border-[var(--color-brand)]' : 'border-[var(--color-border)]'
        }`}
      >
        {value}
      </div>
    </div>
  );
  return (
    <div className={`${stepFrame} !items-stretch`} aria-hidden="true">
      <div className="w-full space-y-2">
        {input('Leitweg-ID', SAMPLE_INVOICE.leitwegId, true)}
        <div className="grid grid-cols-2 gap-2">
          {input('USt-IdNr.', 'DE123456789')}
          {input('Fällig am', '23.11.2026')}
        </div>
      </div>
    </div>
  );
}

export function DownloadVisual() {
  const file = (name: string, kind: string) => (
    <div className="flex items-center gap-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2">
      <FileText className="w-4 h-4 text-[var(--color-success)] shrink-0" />
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-[var(--color-ink)] truncate">{name}</p>
        <p className="text-[10px] text-[var(--color-text-muted)]">{kind}</p>
      </div>
      <Download className="ml-auto w-4 h-4 text-[var(--color-success)] shrink-0" />
    </div>
  );
  return (
    <div className={`${stepFrame} !items-stretch flex-col gap-2 !justify-center`} aria-hidden="true">
      {file(`${SAMPLE_INVOICE.number}.pdf`, 'ZUGFeRD · PDF/A-3')}
      {file(`${SAMPLE_INVOICE.number}.xml`, 'XRechnung · XML')}
    </div>
  );
}

/* ---------------- Format visuals ---------------- */

export function ZugferdFormatVisual() {
  return (
    <div className="relative h-36 flex items-center justify-center" aria-hidden="true">
      <div className="w-24 h-32 card-surface p-3 space-y-1.5">
        <div className="h-2 w-12 rounded-full bg-[var(--color-ink)]" />
        <div className="h-1.5 w-16 rounded-full bg-[var(--color-surface-muted)]" />
        <div className="h-1.5 w-14 rounded-full bg-[var(--color-surface-muted)]" />
        <div className="pt-2 space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-muted)]" />
          <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-muted)]" />
          <div className="h-1.5 w-10 ml-auto rounded-full bg-[var(--color-ink)]" />
        </div>
      </div>
      <span className="absolute translate-x-12 translate-y-10 inline-flex items-center gap-1 rounded-lg surface-dark px-2 py-1 text-[11px] font-mono">
        <Paperclip className="w-3 h-3" /> .xml
      </span>
    </div>
  );
}

export function XrechnungFormatVisual() {
  return (
    <div className="h-36 flex items-center justify-center" aria-hidden="true">
      <div className="w-40 surface-dark rounded-xl p-3 font-mono text-[10px] leading-[1.7]">
        <div><span className="text-[var(--color-brand-dark)]">&lt;Invoice&gt;</span></div>
        <div className="pl-3"><span className="text-[var(--color-brand-dark)]">&lt;cbc:ID&gt;</span><span className="text-[var(--color-media-orange)]">RE-…</span></div>
        <div className="pl-3"><span className="text-[var(--color-brand-dark)]">&lt;cbc:BuyerReference&gt;</span></div>
        <div className="pl-3"><span className="text-[var(--color-brand-dark)]">&lt;cac:LegalMonetaryTotal&gt;</span></div>
        <div><span className="text-[var(--color-brand-dark)]">&lt;/Invoice&gt;</span></div>
      </div>
    </div>
  );
}

/* ---------------- Validation report ---------------- */

const CHECKS = [
  { label: 'Pflichtangaben nach EN 16931 vollständig', detail: 'Rechnungsnummer, Datum, Parteien, Steuersätze' },
  { label: 'Summen rechnerisch korrekt', detail: '1.000,00 € + 190,00 € = 1.190,00 €' },
  { label: 'Leitweg-ID im gültigen Format', detail: SAMPLE_INVOICE.leitwegId },
  { label: 'XML-Schema & Geschäftsregeln geprüft', detail: 'EN 16931 und XRechnung-Regeln' },
  { label: 'PDF/A-3 mit eingebetteter XML', detail: 'factur-x.xml als Anhang' },
];

export function ValidationReport() {
  return (
    <div
      role="img"
      aria-label="Beispiel eines Prüfberichts: alle fünf Prüfungen bestanden."
      className="card-surface overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--color-border)]">
        <div>
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">Prüfbericht</p>
          <p className="text-[12px] text-[var(--color-text-muted)]">{SAMPLE_INVOICE.number} · ZUGFeRD (EN 16931)</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-soft)] border border-[var(--color-success-border)] px-2.5 py-1 text-[12px] font-medium text-[var(--color-success)]">
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Bestanden
        </span>
      </div>
      <ul className="divide-y divide-[var(--color-border-subtle)]">
        {CHECKS.map((c) => (
          <li key={c.label} className="flex items-start gap-3 px-5 py-3.5">
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-[var(--color-ink)]">{c.label}</p>
              <p className="text-[12px] text-[var(--color-text-muted)] font-mono truncate">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
