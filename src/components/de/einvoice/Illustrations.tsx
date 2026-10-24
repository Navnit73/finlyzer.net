import React from 'react';
import {
  ArrowRight, ArrowDown, CheckCircle2, Download, FileCode2, FileText, Paperclip, UploadCloud,
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
      <span className="font-medium whitespace-nowrap text-[var(--color-ink)] tabular-nums">{value}</span>
    </div>
  );
  return (
    <div className={`card-surface p-5 sm:p-6 text-left text-[11px] sm:text-[12px] leading-snug ${className}`}>
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

/** The hybrid ZUGFeRD file: a normal-looking PDF/A-3 with the XML attached. */
export function ZugferdFileCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card-surface p-4 text-left ${className}`}>
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-[var(--color-brand-dark)]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--color-ink)] truncate">{SAMPLE_INVOICE.number}.pdf</p>
          <p className="text-[12px] text-[var(--color-text-muted)]">ZUGFeRD · PDF/A-3</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--color-success-soft)] border border-[var(--color-success-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-success)] shrink-0">
          <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> valide
        </span>
      </div>
      <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-[var(--color-surface-subtle)] px-2.5 py-1.5 text-[12px] text-[var(--color-text-secondary)]">
        <Paperclip className="w-3.5 h-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
        factur-x.xml eingebettet
      </p>
    </div>
  );
}

/** Hero: plain PDF in, ZUGFeRD PDF/A-3 plus structured XML out. */
export function HeroIllustration() {
  return (
    <div
      role="img"
      aria-label="Eine normale PDF-Rechnung wird von Finlyzers in eine ZUGFeRD-Datei im Format PDF/A-3 mit eingebetteter XML und in strukturierte XRechnung-Daten umgewandelt."
      className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)] items-center gap-4 md:gap-6 max-w-5xl mx-auto"
    >
      <div className="space-y-2">
        <p className="text-[13px] font-medium text-[var(--color-text-muted)] text-center md:text-left">Ihre Rechnung heute</p>
        <InvoicePaper />
      </div>

      <div className="flex md:flex-col items-center justify-center gap-2 py-1">
        <span className="rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] px-3 py-1 text-[12px] font-medium">Finlyzers</span>
        <ArrowRight className="hidden md:block w-6 h-6 text-[var(--color-brand-dark)]" aria-hidden="true" />
        <ArrowDown className="md:hidden w-6 h-6 text-[var(--color-brand-dark)]" aria-hidden="true" />
      </div>

      <div className="space-y-2 min-w-0">
        <p className="text-[13px] font-medium text-[var(--color-text-muted)] text-center md:text-left">Ihre E-Rechnung</p>
        <ZugferdFileCard />
        <XmlPanel />
      </div>
    </div>
  );
}

/** Field-to-element mapping for the anatomy section. BT numbers are EN 16931 business terms. */
export const FIELD_MAPPING = [
  { n: 1, field: 'Rechnungsnummer', element: 'ram:ID', bt: 'BT-1' },
  { n: 2, field: 'Rechnungsdatum', element: 'ram:IssueDateTime', bt: 'BT-2' },
  { n: 3, field: 'Leitweg-ID (Käuferreferenz)', element: 'ram:BuyerReference', bt: 'BT-10' },
  { n: 4, field: 'Gesamtbetrag inkl. USt.', element: 'ram:GrandTotalAmount', bt: 'BT-112' },
];

export function FieldMappingList() {
  return (
    <ol className="space-y-3">
      {FIELD_MAPPING.map((m) => (
        <li key={m.n} className="card-surface p-4 flex items-start gap-3">
          <Marker n={m.n} />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-[var(--color-ink)]">{m.field}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
              <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
              <code className="font-mono text-[12px] px-1.5 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-[var(--color-ink)]">
                &lt;{m.element}&gt;
              </code>
              <span className="text-[var(--color-text-muted)]">{m.bt}</span>
            </p>
          </div>
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
      <div className="w-full h-full rounded-lg border-2 border-dashed border-[var(--color-border-hover)] flex flex-col items-center justify-center gap-2">
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
      <FileText className="w-4 h-4 text-[var(--color-brand-dark)] shrink-0" />
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-[var(--color-ink)] truncate">{name}</p>
        <p className="text-[10px] text-[var(--color-text-muted)]">{kind}</p>
      </div>
      <Download className="ml-auto w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
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
