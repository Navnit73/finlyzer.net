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
import { useLang } from './i18n';

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {});
const text = (v: unknown) => (v === null || v === undefined || v === '' ? '–' : String(v));
const money = (v: unknown) => (typeof v === 'number' ? formatEuro(v) : text(v));
const date = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00:00`).toLocaleDateString('de-DE') : text(v));

const XMP_LABELS: Record<string, [string, string]> = {
  pdfa_part: ['PDF/A-Teil', 'PDF/A part'],
  pdfa_conformance: ['PDF/A-Konformität', 'PDF/A conformance'],
  document_type: ['Dokumenttyp', 'Document type'],
  document_file_name: ['XML-Anhang', 'XML attachment'],
  version: ['Factur-X-Version', 'Factur-X version'],
  conformance_level: ['Profil (XMP)', 'Profile (XMP)'],
  namespace: ['Namensraum', 'Namespace'],
};

/** [title DE, title EN, body DE, body EN] */
const OUTPUTS = [
  ['Rechnungsdaten', 'Invoice data', 'Parteien, Positionen und Summen übersichtlich aufbereitet', 'Parties, line items and totals clearly laid out'],
  ['Profil und Version', 'Profile and version', 'z. B. EN 16931, XRechnung 3.0 oder Factur-X', 'e.g. EN 16931, XRechnung 3.0 or Factur-X'],
  ['XML und JSON', 'XML and JSON', 'Rohe XML ansehen, kopieren oder als JSON exportieren', 'View and copy the raw XML or export it as JSON'],
  ['Ins Formular übernehmen', 'Use in the form', 'Daten mit einem Klick in „Erstellen“ weiterverwenden', 'Reuse the data in “Create” with one click'],
];

export default function ExtractPanel({
  onUseInForm,
  onVerifyArchive,
}: {
  onUseInForm: (data: ExtractResponse) => void;
  onVerifyArchive: (id: string) => void;
}) {
  const { t } = useLang();
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
      const res = await requestEinvoice('/api/einvoice/extract', { method: 'POST', body }, t, {
        422: t(
          'In dieser Datei wurde keine E-Rechnung gefunden. Ist es eine ZUGFeRD-PDF oder eine XRechnung-/CII-XML?',
          'No e-invoice was found in this file. Is it a ZUGFeRD PDF or an XRechnung/CII XML?'
        ),
      });
      setData(await res.json());
    } catch (err) {
      setError(err instanceof EinvoiceRequestError ? err : new EinvoiceRequestError(t('Die Datei konnte nicht ausgelesen werden.', 'The file could not be read.'), 0));
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
            title={t('E-Rechnung auslesen', 'Extract e-invoice')}
            description={t(
              `Laden Sie eine ZUGFeRD-/Factur-X-PDF oder eine XRechnung-, CII- oder UBL-XML hoch. Wir lesen die strukturierten Rechnungsdaten, erkennen Profil und Version und zeigen die rohe XML. Max. ${EINVOICE_MAX_UPLOAD_MB} MB.`,
              `Upload a ZUGFeRD/Factur-X PDF or an XRechnung, CII or UBL XML. We read the structured invoice data, detect profile and version and show the raw XML. Max. ${EINVOICE_MAX_UPLOAD_MB} MB.`
            )}
          />
          <FileDrop
            id="einv-extract-file"
            accept=".pdf,.xml,application/pdf,application/xml,text/xml"
            extensions={['.pdf', '.xml']}
            title={t('E-Rechnung hochladen', 'Upload e-invoice')}
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
            {busy ? t('Wird ausgelesen …', 'Extracting …') : t('Daten auslesen', 'Extract data')}
          </button>
        </section>

        <aside className="surface-dark rounded-2xl p-5 sm:p-6">
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">{t('Das erhalten Sie', 'What you get')}</p>
          <ul className="mt-4 space-y-3">
            {OUTPUTS.map(([titleDe, titleEn, bodyDe, bodyEn]) => (
              <li key={titleDe} className="flex gap-3">
                <span className="mt-px">
                  <CheckDot />
                </span>
                <div>
                  <p className="text-[14px] font-medium text-[var(--color-ink)]">{t(titleDe, titleEn)}</p>
                  <p className="text-[13px] leading-snug text-[var(--color-text-secondary)]">{t(bodyDe, bodyEn)}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {error && <ErrorNotice error={error} onDismiss={() => setError(null)} />}

      {data && (
        <section aria-label={t('Ausgelesene Rechnungsdaten', 'Extracted invoice data')} className="space-y-6">
          <div className="rounded-2xl border border-[var(--color-border)] p-4 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] text-[var(--color-text-muted)] break-all">{data.filename}</p>
                <h3 className="text-[21px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                  {t('Rechnung', 'Invoice')} {text(invoice.invoice_number)}
                </h3>
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
                    {t('In Formular übernehmen', 'Use in form')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
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
                    [t('Rechnungsdatum', 'Invoice date'), date(invoice.issue_date)],
                    [t('Leistungsdatum', 'Delivery date'), date(invoice.delivery_date)],
                    [t('Belegart', 'Document type'), text(invoice.type_code)],
                    [t('Währung', 'Currency'), text(invoice.currency)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[12px] text-[var(--color-text-muted)]">{k}</dt>
                      <dd className="text-[15px] text-[var(--color-ink)]">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    [t('Rechnungssteller', 'Seller'), seller],
                    [t('Rechnungsempfänger', 'Buyer'), buyer],
                  ].map(([label, p]) => (
                    <div key={label as string} className="rounded-xl bg-[var(--color-surface-subtle)] p-4">
                      <p className="text-[12px] text-[var(--color-text-muted)]">{label as string}</p>
                      <p className="mt-0.5 text-[15px] font-medium text-[var(--color-ink)]">{text((p as Obj).name)}</p>
                      <p className="text-[13px] text-[var(--color-text-secondary)]">{party(p as Obj) || '–'}</p>
                      {Boolean((p as Obj).vat_id) && <p className="text-[13px] text-[var(--color-text-secondary)]">
                          {t('USt-IdNr.', 'VAT ID')} {text((p as Obj).vat_id)}
                        </p>}
                      {Boolean((p as Obj).buyer_reference) && <p className="text-[13px] text-[var(--color-text-secondary)]">Leitweg-ID {text((p as Obj).buyer_reference)}</p>}
                    </div>
                  ))}
                </div>

                {lines.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                    <table className="w-full text-[14px]">
                      <thead className="bg-[var(--color-surface-subtle)] text-[12px] text-[var(--color-text-muted)]">
                        <tr>
                          <th className="text-left font-medium px-3 py-2">{t('Pos.', 'No.')}</th>
                          <th className="text-left font-medium px-3 py-2">{t('Bezeichnung', 'Description')}</th>
                          <th className="text-right font-medium px-3 py-2">{t('Menge', 'Qty')}</th>
                          <th className="text-right font-medium px-3 py-2">{t('Netto/Einh.', 'Net/unit')}</th>
                          <th className="text-right font-medium px-3 py-2">{t('USt.', 'VAT')}</th>
                          <th className="text-right font-medium px-3 py-2">{t('Betrag', 'Amount')}</th>
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
                    [t('Nettobetrag', 'Net amount'), totals.net_total],
                    [t('Umsatzsteuer', 'VAT'), totals.vat_total],
                    [t('Gesamtbetrag', 'Total'), totals.gross_total],
                    [t('Zahlbetrag', 'Amount due'), totals.payable_amount],
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
              <p className="text-[13px] font-medium text-[var(--color-text-muted)] mb-2">{t('PDF-Metadaten (XMP)', 'PDF metadata (XMP)')}</p>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(data.xmp).map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-[var(--color-border)] px-3 py-2">
                    <dt className="text-[12px] text-[var(--color-text-muted)]">{XMP_LABELS[k] ? t(...XMP_LABELS[k]) : k}</dt>
                    <dd className="text-[14px] text-[var(--color-ink)] break-words">{text(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {data.warnings.length > 0 && (
            <div>
              <p className="text-[13px] font-medium text-[var(--color-text-muted)] mb-2">
                {t('Befunde beim Auslesen', 'Extraction findings')} ({data.warnings.length})
              </p>
              <IssueList issues={data.warnings} tone="warning" />
            </div>
          )}

          <XmlViewer xml={data.raw_xml} filename={`${String(invoice.invoice_number || 'rechnung')}.xml`} title={t('Rohe XML', 'Raw XML')} />

          <ArchiveCard archive={data.archive} onVerify={onVerifyArchive} />
        </section>
      )}
    </div>
  );
}
