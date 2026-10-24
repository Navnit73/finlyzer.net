'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Fingerprint, Loader2, XCircle } from 'lucide-react';
import type { ArchiveVerification } from '@/lib/einvoice';
import { ArchiveFiles, EinvoiceRequestError, ErrorNotice, Field, SectionHeader, floatingInputClass, formatDateTime, requestEinvoice } from './shared';

const OPERATION_LABELS: Record<string, string> = {
  'create-zugferd': 'ZUGFeRD erstellt',
  'create-xrechnung': 'XRechnung erstellt',
  'convert-zugferd': 'PDF in ZUGFeRD umgewandelt',
  'convert-xrechnung': 'In XRechnung umgewandelt',
  extract: 'E-Rechnung ausgelesen',
  validate: 'E-Rechnung geprüft',
};

/** `request` is set by other tabs ("Integrität prüfen"); a new nonce re-runs the check for the same ID. */
export default function ArchivePanel({ request }: { request: { id: string; nonce: number } | null }) {
  const [id, setId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<EinvoiceRequestError | null>(null);
  const [record, setRecord] = useState<ArchiveVerification | null>(null);

  async function verify(archiveId: string) {
    const trimmed = archiveId.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    setRecord(null);
    try {
      const res = await requestEinvoice(`/api/einvoice/archive/${encodeURIComponent(trimmed)}`, { method: 'GET' }, {
        400: 'Das ist keine gültige Archiv-ID. Sie beginnt mit „ea_“.',
        404: 'Zu dieser Archiv-ID gibt es keinen Datensatz.',
      });
      setRecord(await res.json());
    } catch (err) {
      setError(err instanceof EinvoiceRequestError ? err : new EinvoiceRequestError('Die Prüfung ist fehlgeschlagen.', 0));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!request) return;
    setId(request.id);
    verify(request.id);
  }, [request]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
      <div className="space-y-6 min-w-0">
        <SectionHeader
          title="Archiv-Integrität prüfen"
          description="Jede erstellte, umgewandelte oder ausgelesene E-Rechnung wird unverändert mit SHA-256-Prüfsummen archiviert. Geben Sie die Archiv-ID ein, um nachzuweisen, dass weder Dateien noch Protokoll verändert wurden."
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify(id);
          }}
          className="flex flex-col sm:flex-row sm:items-start gap-2"
        >
          <Field htmlFor="einv-archive-id" label="Archiv-ID" className="flex-1" hint="Steht im Ergebnis jeder Erstellung oder Auslesung">
            <input
              id="einv-archive-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="z. B. ea_20261024T155024Z_a7df191907c84c8c"
              className={`${floatingInputClass} font-mono !text-[14px]`}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
          <button type="submit" disabled={!id.trim() || busy} className="btn-brand-primary !min-h-[56px] !px-6 shrink-0">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Fingerprint className="w-4 h-4" aria-hidden="true" />}
            Prüfen
          </button>
        </form>

        {error && <ErrorNotice error={error} onDismiss={() => setError(null)} />}

        {record && (
          <div className="space-y-4">
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 sm:p-5 ${
                record.intact ? 'border-[var(--color-success-border)] bg-[var(--color-success-soft)]' : 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)]'
              }`}
            >
              {record.intact ? (
                <CheckCircle2 className="w-7 h-7 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
              ) : (
                <XCircle className="w-7 h-7 shrink-0 text-[var(--color-danger)]" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <p className="text-[19px] font-semibold tracking-[-0.015em] text-[var(--color-ink)]">{record.intact ? 'Unverändert' : 'Veränderung erkannt'}</p>
                <p className="text-[14px] text-[var(--color-text-secondary)]">
                  {record.intact
                    ? 'Alle Dateien, das Manifest und die Protokollkette stimmen mit den gespeicherten Prüfsummen überein.'
                    : 'Mindestens eine Prüfsumme oder die Protokollkette stimmt nicht mehr. Details unten.'}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ['Vorgang', OPERATION_LABELS[record.operation] ?? record.operation],
                ['Rechnungsnummer', record.invoice_number || '–'],
                ['Archiviert am', formatDateTime(record.archived_at)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--color-border)] px-3.5 py-2.5">
                  <dt className="text-[12px] text-[var(--color-text-muted)]">{k}</dt>
                  <dd className="text-[15px] text-[var(--color-ink)]">{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <p className="text-[12px] text-[var(--color-text-muted)]">Hash des Protokolleintrags</p>
              <p className="font-mono text-[12px] text-[var(--color-ink)] break-all">{record.entry_hash}</p>
            </div>
            {record.files.length > 0 && <ArchiveFiles files={record.files} />}
            {record.problems.length > 0 && (
              <ul className="space-y-1.5 rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] p-4">
                {record.problems.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[14px] text-[var(--color-ink)]">
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-danger)]" aria-hidden="true" /> {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <aside className="surface-dark rounded-2xl p-5 sm:p-6 space-y-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success)] text-[var(--color-on-brand)] px-3 py-1 text-[12px] font-medium">
          <Fingerprint className="w-3.5 h-3.5" aria-hidden="true" /> GoBD · § 147 AO
        </span>
        <p className="text-[15px] font-semibold text-[var(--color-ink)]">Warum ein Archiv?</p>
        <p>
          Rechnungen müssen in Deutschland 8 Jahre unveränderbar aufbewahrt werden (§ 147 AO, GoBD). Jede Datei wird beim Speichern mit einer SHA-256-Prüfsumme
          versehen, und jeder Eintrag ist mit dem vorherigen verkettet.
        </p>
        <p>Die Prüfung rechnet alle Prüfsummen neu und geht die gesamte Protokollkette durch. Gelöschte, geänderte oder eingefügte Einträge fallen auf.</p>
        <p>Die Archiv-ID finden Sie im Ergebnis jeder Erstellung oder Auslesung.</p>
      </aside>
    </div>
  );
}
