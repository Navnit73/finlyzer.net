'use client';

import React, { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { CHECK_LABELS, EINVOICE_MAX_UPLOAD_MB, type ValidationReport } from '@/lib/einvoice';
import { EinvoiceRequestError, ErrorNotice, FileDrop, ReportView, SectionHeader, requestEinvoice } from './shared';

export default function ValidatePanel() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<EinvoiceRequestError | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);

  async function run() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setReport(null);
    try {
      const body = new FormData();
      body.append('file', file, file.name);
      const res = await requestEinvoice('/api/einvoice/validate', { method: 'POST', body });
      setReport(await res.json());
    } catch (err) {
      setError(err instanceof EinvoiceRequestError ? err : new EinvoiceRequestError('Die Datei konnte nicht geprüft werden.', 0));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
      <div className="space-y-6 min-w-0">
        <SectionHeader
          title="E-Rechnung prüfen"
          description={`Prüfen Sie eine erhaltene oder selbst erstellte E-Rechnung gegen EN 16931 und die XRechnung-Regeln. Sie erhalten einen Bericht mit Regel-ID, Feld und Erklärung für jeden Befund. Max. ${EINVOICE_MAX_UPLOAD_MB} MB.`}
        />
        <FileDrop
          id="einv-validate-file"
          accept=".pdf,.xml,application/pdf,application/xml,text/xml"
          extensions={['.pdf', '.xml']}
          title="PDF oder XML zum Prüfen hochladen"
          hint="ZUGFeRD / Factur-X, XRechnung (CII oder UBL), Peppol BIS 3.0"
          file={file}
          onFile={(f) => {
            setFile(f);
            setReport(null);
            setError(null);
          }}
          onError={(m) => setError(new EinvoiceRequestError(m, 0))}
          disabled={busy}
        />
        <button type="button" onClick={run} disabled={!file || busy} className="btn-brand-primary w-full sm:w-auto !min-h-[48px] !px-7">
          {busy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <ShieldCheck className="w-5 h-5" aria-hidden="true" />}
          {busy ? 'Wird geprüft …' : 'Jetzt prüfen'}
        </button>
        {error && <ErrorNotice error={error} onDismiss={() => setError(null)} />}
        {report && <ReportView report={report} />}
      </div>

      <aside className="surface-dark rounded-2xl p-5 sm:p-6">
        <p className="text-[15px] font-semibold text-[var(--color-ink)]">So prüfen wir</p>
        <ol className="mt-4 space-y-4">
          {Object.entries(CHECK_LABELS).map(([key, c], i) => (
            <li key={key} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--color-success)] text-[12px] font-semibold text-[var(--color-on-brand)] flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div>
                <p className="text-[14px] font-medium text-[var(--color-ink)]">{c.label}</p>
                <p className="text-[13px] leading-snug text-[var(--color-text-secondary)]">{c.hint}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-[12px] leading-snug text-[var(--color-text-muted)]">
          MINIMUM- und BASIC-WL-Profile gelten nach UStG nicht als vollwertige Rechnung und werden als ungültig gemeldet.
        </p>
      </aside>
    </div>
  );
}
