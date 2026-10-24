'use client';

import React, { useState } from 'react';
import { ArrowRight, Download, FileSearch, Loader2 } from 'lucide-react';
import { EINVOICE_MAX_UPLOAD_MB, formatEuro, type ExtractResponse } from '@/lib/einvoice';
import {
  ArchiveCard,
  CheckDot,
  EinvoiceRequestError,
  ErrorNotice,
  FileDrop,
  IssueList,
  SectionHeader,
  XmlViewer,
  downloadBlob,
  requestEinvoice,
} from './shared';

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {});
const text = (v: unknown) => (v === null || v === undefined || v === '' ? '–' : String(v));
const money = (v: unknown) => (typeof v === 'number' ? formatEuro(v) : text(v));
const date = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00:00`).toLocaleDateString('de-DE') : text(v));

const XMP_LABELS: Record<string, string> = {
  pdfa_part: 'PDF/A-Teil',
  pdfa_conformance: 'PDF/A-Konformität',
  document_type: 'Dokumenttyp',
  document_file_name: 'XML-Anhang',
  version: 'Factur-X-Version',
  conformance_level: 'Profil (XMP)',
  namespace: 'Namensraum',
};

const OUTPUTS = [
  ['Rechnungsdaten', 'Parteien, Positionen und Summen übersichtlich aufbereitet'],
  ['Profil und Version', 'z. B. EN 16931, XRechnung 3.0 oder Factur-X'],
  ['XML und JSON', 'Rohe XML ansehen, kopieren oder als JSON exportieren'],
  ['Ins Formular übernehmen', 'Daten mit einem Klick in „Erstellen“ weiterverwenden'],
];

export default function ExtractPanel({
  onUseInForm,
  onVerifyArchive,
}: {
  onUseInForm: (data: ExtractResponse) => void;
  onVerifyArchive: (id: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<EinvoiceRequestError | null>(null);
  const [data, setData] = useState<ExtractResponse | null>(null);

  async function run() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setData(null);
    try {
      const body = new FormData();
      body.append('file', file, file.name);
      const res = await requestEinvoice('/api/einvoice/extract', { method: 'POST', body }, {
        422: 'In dieser Datei wurde keine E-Rechnung gefunden. Ist es eine ZUGFeRD-PDF oder eine XRechnung-/CII-XML?',
      });
      setData(await res.json());
    } catch (err) {
      setError(err instanceof EinvoiceRequestError ? err : new EinvoiceRequestError('Die Datei konnte nicht ausgelesen werden.', 0));
    } finally {
      setBusy(false);
    }
  }

  const invoice = obj(data?.invoice);
  const seller = obj(invoice.seller);
  const buyer = obj(invoice.buyer);
  const totals = obj(invoice.totals);
  const lines = Array.isArray(invoice.lines) ? invoice.lines.map(obj) : [];
  const party = (p: Obj) => {
    const a = obj(p.address);
    return [a.street, [a.postcode, a.city].filter(Boolean).join(' '), a.country].filter(Boolean).join(', ');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
        <section className="space-y-5 min-w-0">
          <SectionHeader
            title="E-Rechnung auslesen"
            description={`Laden Sie eine ZUGFeRD-/Factur-X-PDF oder eine XRechnung-, CII- oder UBL-XML hoch. Wir lesen die strukturierten Rechnungsdaten, erkennen Profil und Version und zeigen die rohe XML. Max. ${EINVOICE_MAX_UPLOAD_MB} MB.`}
          />
          <FileDrop
            id="einv-extract-file"
            accept=".pdf,.xml,application/pdf,application/xml,text/xml"
            extensions={['.pdf', '.xml']}
            title="E-Rechnung hochladen"
            hint="ZUGFeRD 2.x / Factur-X (PDF), XRechnung 1.x–3.x, CII- oder UBL-XML"
            file={file}
            onFile={(f) => {
              setFile(f);
              setData(null);
              setError(null);
            }}
            onError={(m) => setError(new EinvoiceRequestError(m, 0))}
            disabled={busy}
          />
          <button type="button" onClick={run} disabled={!file || busy} className="btn-brand-primary w-full sm:w-auto !min-h-[48px] !px-7">
            {busy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <FileSearch className="w-5 h-5" aria-hidden="true" />}
            {busy ? 'Wird ausgelesen …' : 'Daten auslesen'}
          </button>
        </section>

        <aside className="surface-dark rounded-2xl p-5 sm:p-6">
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">Das erhalten Sie</p>
          <ul className="mt-4 space-y-3">
            {OUTPUTS.map(([t, b]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-px">
                  <CheckDot />
                </span>
                <div>
                  <p className="text-[14px] font-medium text-[var(--color-ink)]">{t}</p>
                  <p className="text-[13px] leading-snug text-[var(--color-text-secondary)]">{b}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {error && <ErrorNotice error={error} onDismiss={() => setError(null)} />}

      {data && (
        <section aria-label="Ausgelesene Rechnungsdaten" className="space-y-6">
          <div className="rounded-2xl border border-[var(--color-border)] p-4 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] text-[var(--color-text-muted)] break-all">{data.filename}</p>
                <h3 className="text-[21px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">Rechnung {text(invoice.invoice_number)}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[data.source_type.toUpperCase(), data.syntax, data.profile, data.version, data.embedded_filename].filter(Boolean).map((chip) => (
                    <span key={chip} className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 text-[12px] text-[var(--color-ink)]">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {data.invoice && (
                  <button type="button" onClick={() => onUseInForm(data)} className="btn-brand-primary flex-1 sm:flex-none !min-h-[44px]">
                    In Formular übernehmen <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
                {data.invoice && (
                  <button
                    type="button"
                    onClick={() =>
                      downloadBlob(new Blob([JSON.stringify(data.invoice, null, 2)], { type: 'application/json' }), `${String(invoice.invoice_number || 'rechnung')}.json`)
                    }
                    className="btn-brand-secondary !min-h-[44px]"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" /> JSON
                  </button>
                )}
              </div>
            </div>

            {data.invoice && (
              <>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 border-t border-[var(--color-border)] pt-5">
                  {[
                    ['Rechnungsdatum', date(invoice.issue_date)],
                    ['Leistungsdatum', date(invoice.delivery_date)],
                    ['Belegart', text(invoice.type_code)],
                    ['Währung', text(invoice.currency)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[12px] text-[var(--color-text-muted)]">{k}</dt>
                      <dd className="text-[15px] text-[var(--color-ink)]">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ['Rechnungssteller', seller],
                    ['Rechnungsempfänger', buyer],
                  ].map(([label, p]) => (
                    <div key={label as string} className="rounded-xl bg-[var(--color-surface-subtle)] p-4">
                      <p className="text-[12px] text-[var(--color-text-muted)]">{label as string}</p>
                      <p className="mt-0.5 text-[15px] font-medium text-[var(--color-ink)]">{text((p as Obj).name)}</p>
                      <p className="text-[13px] text-[var(--color-text-secondary)]">{party(p as Obj) || '–'}</p>
                      {Boolean((p as Obj).vat_id) && <p className="text-[13px] text-[var(--color-text-secondary)]">USt-IdNr. {text((p as Obj).vat_id)}</p>}
                      {Boolean((p as Obj).buyer_reference) && <p className="text-[13px] text-[var(--color-text-secondary)]">Leitweg-ID {text((p as Obj).buyer_reference)}</p>}
                    </div>
                  ))}
                </div>

                {lines.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                    <table className="w-full text-[14px]">
                      <thead className="bg-[var(--color-surface-subtle)] text-[12px] text-[var(--color-text-muted)]">
                        <tr>
                          <th className="text-left font-medium px-3 py-2">Pos.</th>
                          <th className="text-left font-medium px-3 py-2">Bezeichnung</th>
                          <th className="text-right font-medium px-3 py-2">Menge</th>
                          <th className="text-right font-medium px-3 py-2">Netto/Einh.</th>
                          <th className="text-right font-medium px-3 py-2">USt.</th>
                          <th className="text-right font-medium px-3 py-2">Betrag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {lines.map((l, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-[var(--color-text-muted)]">{text(l.position ?? i + 1)}</td>
                            <td className="px-3 py-2 text-[var(--color-ink)] min-w-[160px]">{text(l.description)}</td>
                            <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">
                              {text(l.quantity)} {text(l.unit)}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{money(l.net_price)}</td>
                            <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{text(l.vat_rate)} %</td>
                            <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap font-medium">{money(l.line_net_amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <dl className="ml-auto max-w-xs space-y-1.5 text-[14px]">
                  {[
                    ['Nettobetrag', totals.net_total],
                    ['Umsatzsteuer', totals.vat_total],
                    ['Gesamtbetrag', totals.gross_total],
                    ['Zahlbetrag', totals.payable_amount],
                  ].map(([k, v], i) => (
                    <div key={k as string} className={`flex justify-between gap-4 ${i === 2 ? 'border-t border-[var(--color-border)] pt-2 font-semibold text-[var(--color-ink)]' : 'text-[var(--color-text-secondary)]'}`}>
                      <dt>{k as string}</dt>
                      <dd className="tabular-nums">{money(v)}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </div>

          {data.xmp && Object.keys(data.xmp).length > 0 && (
            <div>
              <p className="text-[13px] font-medium text-[var(--color-text-muted)] mb-2">PDF-Metadaten (XMP)</p>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(data.xmp).map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-[var(--color-border)] px-3 py-2">
                    <dt className="text-[12px] text-[var(--color-text-muted)]">{XMP_LABELS[k] ?? k}</dt>
                    <dd className="text-[14px] text-[var(--color-ink)] break-words">{text(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {data.warnings.length > 0 && (
            <div>
              <p className="text-[13px] font-medium text-[var(--color-text-muted)] mb-2">Befunde beim Auslesen ({data.warnings.length})</p>
              <IssueList issues={data.warnings} tone="warning" />
            </div>
          )}

          <XmlViewer xml={data.raw_xml} filename={`${String(invoice.invoice_number || 'rechnung')}.xml`} title="Rohe XML" />

          <ArchiveCard archive={data.archive} onVerify={onVerifyArchive} />
        </section>
      )}
    </div>
  );
}
