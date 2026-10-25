'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Fingerprint, Loader2, XCircle } from 'lucide-react';
import type { ArchiveVerification } from '@/lib/einvoice';
import { ArchiveFiles, EinvoiceRequestError, ErrorNotice, Field, SectionHeader, floatingInputClass, formatDateTime, requestEinvoice } from './shared';
import { useLang } from './i18n';

const OPERATION_LABELS: Record<string, [string, string]> = {
  'create-zugferd': ['ZUGFeRD erstellt', 'ZUGFeRD created'],
  'create-xrechnung': ['XRechnung erstellt', 'XRechnung created'],
  'convert-zugferd': ['PDF in ZUGFeRD umgewandelt', 'PDF converted to ZUGFeRD'],
  'convert-xrechnung': ['In XRechnung umgewandelt', 'Converted to XRechnung'],
  extract: ['E-Rechnung ausgelesen', 'E-invoice extracted'],
  validate: ['E-Rechnung geprüft', 'E-invoice validated'],
};

/** `request` is set by other tabs ("Integrität prüfen"); a new nonce re-runs the check for the same ID. */
export default function ArchivePanel({ request }: { request: { id: string; nonce: number } | null }) {
  const { t } = useLang();
  const [id, setId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<EinvoiceRequestError | null>(null);
  const [record, setRecord] = useState<ArchiveVerification | null>(null);
  // Checks requested from another tab can overlap a running one; only the latest may set the result.
  const latest = useRef(0);

  async function verify(archiveId: string) {
    const trimmed = archiveId.trim();
    if (!trimmed) return;
    const run = ++latest.current;
    setBusy(true);
    setError(null);
    setRecord(null);
    try {
      const res = await requestEinvoice(`/api/einvoice/archive/${encodeURIComponent(trimmed)}`, { method: 'GET' }, t, {
        400: t('Das ist keine gültige Archiv-ID. Sie beginnt mit „ea_“.', 'This is not a valid archive ID. It starts with “ea_”.'),
        404: t('Zu dieser Archiv-ID gibt es keinen Datensatz.', 'There is no record for this archive ID.'),
      });
      const data: ArchiveVerification = await res.json();
      if (run === latest.current) setRecord(data);
    } catch (err) {
      if (run === latest.current)
        setError(err instanceof EinvoiceRequestError ? err : new EinvoiceRequestError(t('Die Prüfung ist fehlgeschlagen.', 'The check failed.'), 0));
    } finally {
      if (run === latest.current) setBusy(false);
    }
  }

  useEffect(() => {
    if (!request) return;
    setId(request.id);
    verify(request.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only for a new request, not when verify/t change
  }, [request]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
      <div className="space-y-6 min-w-0">
        <SectionHeader
          title={t('Archiv-Integrität prüfen', 'Verify archive integrity')}
          description={t(
            'Jede erstellte, umgewandelte oder ausgelesene E-Rechnung wird unverändert mit SHA-256-Prüfsummen archiviert. Geben Sie die Archiv-ID ein, um nachzuweisen, dass weder Dateien noch Protokoll verändert wurden.',
            'Every created, converted or extracted e-invoice is archived unaltered with SHA-256 checksums. Enter the archive ID to prove that neither the files nor the log have been changed.'
          )}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify(id);
          }}
          className="flex flex-col sm:flex-row sm:items-start gap-2"
        >
          <Field htmlFor="einv-archive-id" label={t('Archiv-ID', 'Archive ID')}
            className="flex-1"
            hint={t('Steht im Ergebnis jeder Erstellung oder Auslesung', 'Shown in the result of every creation or extraction')}>
            <input
              id="einv-archive-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder={`${t('z. B.', 'e.g.')} ea_20261024T155024Z_a7df191907c84c8c`}
              className={`${floatingInputClass} font-mono !text-[14px]`}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
          <button type="submit" disabled={!id.trim() || busy} className="btn-brand-primary !min-h-[56px] !px-6 shrink-0">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Fingerprint className="w-4 h-4" aria-hidden="true" />}
            {t('Prüfen', 'Verify')}
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
                <p className="text-[19px] font-semibold tracking-[-0.015em] text-[var(--color-ink)]">{record.intact ? t('Unverändert', 'Unaltered') : t('Veränderung erkannt', 'Change detected')}</p>
                <p className="text-[14px] text-[var(--color-text-secondary)]">
                  {record.intact
                    ? t(
                        'Alle Dateien, das Manifest und die Protokollkette stimmen mit den gespeicherten Prüfsummen überein.',
                        'All files, the manifest and the log chain match the stored checksums.'
                      )
                    : t(
                        'Mindestens eine Prüfsumme oder die Protokollkette stimmt nicht mehr. Details unten.',
                        'At least one checksum or the log chain no longer matches. Details below.'
                      )}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                [t('Vorgang', 'Operation'), OPERATION_LABELS[record.operation] ? t(...OPERATION_LABELS[record.operation]) : record.operation],
                [t('Rechnungsnummer', 'Invoice number'), record.invoice_number || '–'],
                [t('Archiviert am', 'Archived on'), formatDateTime(record.archived_at)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--color-border)] px-3.5 py-2.5">
                  <dt className="text-[12px] text-[var(--color-text-muted)]">{k}</dt>
                  <dd className="text-[15px] text-[var(--color-ink)]">{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <p className="text-[12px] text-[var(--color-text-muted)]">{t('Hash des Protokolleintrags', 'Log entry hash')}</p>
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
        <p className="text-[15px] font-semibold text-[var(--color-ink)]">{t('Warum ein Archiv?', 'Why an archive?')}</p>
        <p>
          {t(
            'Rechnungen müssen in Deutschland 8 Jahre unveränderbar aufbewahrt werden (§ 147 AO, GoBD). Jede Datei wird beim Speichern mit einer SHA-256-Prüfsumme versehen, und jeder Eintrag ist mit dem vorherigen verkettet.',
            'In Germany, invoices must be kept unaltered for 8 years (§ 147 AO, GoBD). Every file gets a SHA-256 checksum when stored, and every entry is chained to the previous one.'
          )}
        </p>
        <p>
          {t(
            'Die Prüfung rechnet alle Prüfsummen neu und geht die gesamte Protokollkette durch. Gelöschte, geänderte oder eingefügte Einträge fallen auf.',
            'The check recalculates all checksums and walks the entire log chain. Deleted, changed or inserted entries are detected.'
          )}
        </p>
        <p>{t('Die Archiv-ID finden Sie im Ergebnis jeder Erstellung oder Auslesung.', 'You find the archive ID in the result of every creation or extraction.')}</p>
      </aside>
    </div>
  );
}
