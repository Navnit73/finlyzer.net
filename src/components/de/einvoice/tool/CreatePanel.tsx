'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Circle,
  Download,
  FileCode2,
  FileText,
  Info,
  Landmark,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  EINVOICE_MAX_UPLOAD_MB,
  TYPE_CODES,
  UNITS,
  VAT_RATES,
  base64ToBlob,
  buildFlatPayload,
  buildInvoicePayload,
  computeTotals,
  emptyInvoiceForm,
  formatEuro,
  newLine,
  normalizeFieldPath,
  pathMatches,
  sampleInvoiceForm,
  type ArchiveInfo,
  type EinvoiceFormat,
  type FormMode,
  type InvoiceForm,
  type LineForm,
  type ValidationIssue,
  type ValidationReport,
} from '@/lib/einvoice';
import {
  ArchiveCard,
  CheckDot,
  EinvoiceRequestError,
  ErrorNotice,
  Field,
  FileDrop,
  ReportView,
  SectionHeader,
  XmlViewer,
  downloadBlob,
  filenameFrom,
  floatingInputClass,
  floatingSelectClass,
  floatingTextareaClass,
  formatBytes,
  requestEinvoice,
} from './shared';

interface CreateResult {
  format: EinvoiceFormat;
  filename: string;
  blob: Blob;
  xml: string | null;
  report: ValidationReport | null;
  /** From the X-Validation-* headers of /convert, used when the follow-up /validate call fails. */
  headerSummary?: { valid: boolean; warnings: number; profile: string };
  archive: ArchiveInfo | null;
  archiveId: string | null;
}

export interface ImportNotice {
  filename: string;
  lossy: boolean;
}

const FORMATS: { id: EinvoiceFormat; title: string; tag: string; body: string; icon: typeof FileText }[] = [
  {
    id: 'zugferd',
    title: 'ZUGFeRD',
    tag: 'Für Unternehmen · PDF/A-3',
    body: 'Lesbare PDF mit eingebetteter XML. Für Geschäftskunden, die PDF und Daten in einer Datei erhalten.',
    icon: FileText,
  },
  {
    id: 'xrechnung',
    title: 'XRechnung',
    tag: 'Für Behörden · reine XML',
    body: 'Strukturierte XML ohne Sichtteil, mit Leitweg-ID. Pflicht für Rechnungen an Behörden (ZRE, OZG-RE).',
    icon: Landmark,
  },
];

const FORMAT_TONES: Record<EinvoiceFormat, { selected: string; icon: string; dot: string }> = {
  zugferd: {
    selected: 'border-[var(--color-brand)] ring-1 ring-[var(--color-brand)]',
    icon: 'bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]',
    dot: 'border-[var(--color-brand)] bg-[var(--color-brand)]',
  },
  xrechnung: {
    selected: 'border-[var(--color-success)] ring-1 ring-[var(--color-success)]',
    icon: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
    dot: 'border-[var(--color-success)] bg-[var(--color-success)]',
  },
};

const MODES: { id: FormMode; title: string; body: string }[] = [
  { id: 'simple', title: 'Schnell', body: 'Nur die Pflichtangaben' },
  { id: 'full', title: 'Vollständig', body: 'Mit Belegart, Bestellnummer, Skonto & Verwendungszweck' },
];

export default function CreatePanel({
  form,
  setForm,
  format,
  setFormat,
  mode,
  setMode,
  importNotice,
  onDismissImport,
  onVerifyArchive,
}: {
  form: InvoiceForm;
  setForm: React.Dispatch<React.SetStateAction<InvoiceForm>>;
  format: EinvoiceFormat;
  setFormat: (f: EinvoiceFormat) => void;
  mode: FormMode;
  setMode: (m: FormMode) => void;
  importNotice: ImportNotice | null;
  onDismissImport: () => void;
  onVerifyArchive: (id: string) => void;
}) {
  const [pdf, setPdf] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<EinvoiceRequestError | null>(null);
  const [result, setResult] = useState<CreateResult | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  // The mobile bottom bar repeats the submit button until the real one in the summary is on screen.
  const [submitVisible, setSubmitVisible] = useState(false);

  useEffect(() => {
    const el = submitRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setSubmitVisible(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const xr = format === 'xrechnung';
  const full = mode === 'full';
  const totals = useMemo(() => computeTotals(form.lines), [form.lines]);

  // Field-level messages from a 422 (create/convert) or from the report attached to it.
  const issues = useMemo<{ path: string; message: string }[]>(() => {
    if (!error) return [];
    const all: ValidationIssue[] = [...error.issues, ...(error.report?.errors ?? [])];
    return all.flatMap((i) => {
      const path = normalizeFieldPath(i.field);
      return path ? [{ path, message: `${i.message} (${i.rule_id})` }] : [];
    });
  }, [error]);
  const errorsFor = (key: string) => [...new Set(issues.filter((i) => pathMatches(i.path, key)).map((i) => i.message))];

  useEffect(() => {
    if (error || result) feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [error, result]);

  const set = <K extends keyof InvoiceForm>(key: K) => (value: InvoiceForm[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setSeller = (key: keyof InvoiceForm['seller']) => (value: string) => setForm((f) => ({ ...f, seller: { ...f.seller, [key]: value } }));
  const setBuyer = (key: keyof InvoiceForm['buyer']) => (value: string) => setForm((f) => ({ ...f, buyer: { ...f.buyer, [key]: value } }));
  const setPayment = (key: keyof InvoiceForm['payment']) => (value: string) => setForm((f) => ({ ...f, payment: { ...f.payment, [key]: value } }));
  const setLine = (id: string, key: keyof LineForm, value: string) =>
    setForm((f) => ({ ...f, lines: f.lines.map((l) => (l.id === id ? { ...l, [key]: value } : l)) }));

  const reset = (next: InvoiceForm) => {
    setForm(next);
    setPdf(null);
    setError(null);
    setResult(null);
    onDismissImport();
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(mode === 'simple' ? await convertSimple() : await createFull());
    } catch (err) {
      setError(err instanceof EinvoiceRequestError ? err : new EinvoiceRequestError('Die E-Rechnung konnte nicht erstellt werden.', 0));
    } finally {
      setBusy(false);
    }
  }

  /** Flat form → /convert returns the file; a follow-up /validate on it supplies the full report. */
  async function convertSimple(): Promise<CreateResult> {
    const body = new FormData();
    body.append('invoice_data', JSON.stringify(buildFlatPayload(form, format)));
    if (!xr && pdf) body.append('file', pdf, pdf.name);
    const res = await requestEinvoice('/api/einvoice/convert', { method: 'POST', body });
    const filename = filenameFrom(res, xr ? 'xrechnung.xml' : 'zugferd.pdf');
    const blob = await res.blob();
    const headerSummary = {
      valid: res.headers.get('x-validation-valid') === 'true',
      warnings: Number(res.headers.get('x-validation-warnings') || 0),
      profile: res.headers.get('x-einvoice-profile') || '',
    };

    let report: ValidationReport | null = null;
    try {
      const check = new FormData();
      check.append('file', new File([blob], filename, { type: xr ? 'application/xml' : 'application/pdf' }));
      report = await (await requestEinvoice('/api/einvoice/validate', { method: 'POST', body: check })).json();
    } catch {}

    return {
      format,
      filename,
      blob,
      xml: xr ? await blob.text() : null,
      report,
      headerSummary,
      archive: null,
      archiveId: res.headers.get('x-archive-id'),
    };
  }

  /** Full EInvoiceData → /create-zugferd (multipart) or /create-xrechnung (JSON), both with ?output=json. */
  async function createFull(): Promise<CreateResult> {
    const payload = buildInvoicePayload(form, format);
    if (xr) {
      const res = await requestEinvoice('/api/einvoice/create-xrechnung?output=json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: { filename: string; xml: string; validation: ValidationReport; archive?: ArchiveInfo } = await res.json();
      return {
        format,
        filename: data.filename,
        blob: new Blob([data.xml], { type: 'application/xml' }),
        xml: data.xml,
        report: data.validation,
        archive: data.archive ?? null,
        archiveId: data.archive?.archive_id ?? null,
      };
    }
    const body = new FormData();
    body.append('invoice_data', JSON.stringify(payload));
    if (pdf) body.append('file', pdf, pdf.name);
    const res = await requestEinvoice('/api/einvoice/create-zugferd?output=json', { method: 'POST', body });
    const data: { filename: string; pdf_base64: string; xml: string; validation: ValidationReport; archive?: ArchiveInfo } = await res.json();
    return {
      format,
      filename: data.filename,
      blob: base64ToBlob(data.pdf_base64, 'application/pdf'),
      xml: data.xml,
      report: data.validation,
      archive: data.archive ?? null,
      archiveId: data.archive?.archive_id ?? null,
    };
  }

  const text = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts: {
      errorKey?: string;
      required?: boolean;
      hint?: string;
      type?: string;
      /** Shown as "z. B. …" while the field is focused and empty. */
      example?: string;
      className?: string;
      inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
      autoComplete?: string;
      maxLength?: number;
    } = {}
  ) => {
    const errors = opts.errorKey ? errorsFor(opts.errorKey) : [];
    const fieldId = `einv-${id}`;
    return (
      <Field
        htmlFor={fieldId}
        label={label}
        hint={opts.hint}
        required={opts.required}
        errors={errors}
        className={opts.className}
        floated={opts.type === 'date'}
      >
        <input
          id={fieldId}
          type={opts.type ?? 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={opts.required}
          placeholder={opts.example ? `z. B. ${opts.example}` : ' '}
          inputMode={opts.inputMode}
          autoComplete={opts.autoComplete ?? 'off'}
          maxLength={opts.maxLength}
          aria-invalid={errors.length > 0 || undefined}
          aria-describedby={errors.length ? `${fieldId}-error` : undefined}
          className={`${floatingInputClass} ${errors.length ? '!border-[var(--color-danger)]' : ''}`}
        />
      </Field>
    );
  };

  const address = (party: 'seller' | 'buyer', setter: (k: 'street' | 'postcode' | 'city' | 'country') => (v: string) => void) => {
    const p = form[party];
    return (
      <>
        {text(`${party}-street`, 'Straße und Hausnummer', p.street, setter('street'), {
          errorKey: `${party}.address.street`,
          required: true,
          example: party === 'seller' ? 'Hauptstraße 12' : 'Kundenstraße 15',
          className: 'sm:col-span-2',
          autoComplete: 'street-address',
        })}
        <div className="grid grid-cols-[110px_minmax(0,1fr)_80px] gap-3 sm:col-span-2">
          {text(`${party}-postcode`, 'PLZ', p.postcode, setter('postcode'), { errorKey: `${party}.address.postcode`, required: true, inputMode: 'numeric', example: party === 'seller' ? '10115' : '60311' })}
          {text(`${party}-city`, 'Ort', p.city, setter('city'), { errorKey: `${party}.address.city`, required: true, example: party === 'seller' ? 'Berlin' : 'Frankfurt' })}
          {text(`${party}-country`, 'Land', p.country, (v) => setter('country')(v.toUpperCase()), {
            errorKey: `${party}.address.country`,
            required: true,
            maxLength: 2,
            example: 'DE',
          })}
        </div>
      </>
    );
  };

  const xrBadge = xr && (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--color-success)]">
      <Landmark className="w-3.5 h-3.5" aria-hidden="true" /> XRechnung-Pflichtfelder aktiv
    </span>
  );

  // Rough completeness per section, mirroring the fields marked required below. Only guides the user;
  // the server is the source of truth for validation.
  const filled = (...values: string[]) => values.every((v) => v.trim() !== '');
  const hasAddress = (p: { name: string; street: string; postcode: string; city: string; country: string }) =>
    filled(p.name, p.street, p.postcode, p.city, p.country);
  const checklist: { id: string; label: string; done: boolean }[] = [
    { id: 'daten', label: 'Rechnungsdaten', done: filled(form.invoiceNumber, form.issueDate) },
    {
      id: 'steller',
      label: 'Rechnungssteller',
      done:
        hasAddress(form.seller) &&
        (full ? filled(form.seller.vatId) || filled(form.seller.taxNumber) : filled(form.seller.vatId)) &&
        (!xr || filled(form.seller.contactName, form.seller.phone, form.seller.email)),
    },
    { id: 'empfaenger', label: 'Rechnungsempfänger', done: hasAddress(form.buyer) && (!xr || filled(form.buyer.leitwegId, form.buyer.email)) },
    { id: 'positionen', label: 'Positionen', done: form.lines.every((l) => filled(l.description, l.quantity, l.netPrice)) },
    {
      id: 'zahlung',
      label: 'Zahlung',
      done: xr ? filled(form.payment.dueDate, form.payment.iban) : filled(form.payment.dueDate) || filled(form.payment.terms),
    },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const isDone = (id: string) => checklist.some((c) => c.id === id && c.done);
  const jumpTo = (id: string) => document.getElementById(`einv-sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const submitLabel = xr ? 'XRechnung erstellen' : 'ZUGFeRD-PDF erstellen';
  const sectionClass = 'scroll-mt-24 space-y-5 pt-8 sm:pt-10 border-t border-[var(--color-border)]';

  let step = 0;
  const nextStep = () => ++step;

  return (
    <form onSubmit={submit} className="space-y-8 pb-24 lg:pb-0">
      {/* Feedback: errors or the finished invoice */}
      <div ref={feedbackRef} className="scroll-mt-24 space-y-4 empty:hidden">
        {error && (
          <>
            <ErrorNotice error={error} onDismiss={() => setError(null)} />
            {error.report && <ReportView report={error.report} />}
          </>
        )}
        {result && <ResultView result={result} onClose={() => setResult(null)} onVerifyArchive={onVerifyArchive} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px] gap-8 xl:gap-12 items-start">
        <div className="space-y-8 sm:space-y-10 min-w-0">
          {/* Format & mode */}
          <section className="space-y-5">
            <SectionHeader step={nextStep()} done title="Format wählen" description="An wen geht die Rechnung? Die Pflichtfelder passen sich an." />
            <div role="radiogroup" aria-label="Ausgabeformat" className="grid grid-cols-2 gap-3">
              {FORMATS.map((f) => {
                const active = format === f.id;
                const tone = FORMAT_TONES[f.id];
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setFormat(f.id)}
                    className={`text-left rounded-2xl border p-3.5 sm:p-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] ${
                      active ? `${tone.selected} bg-[var(--color-surface)]` : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center shrink-0 ${
                          active ? tone.icon : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]'
                        }`}
                      >
                        <f.icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] sm:text-[17px] font-semibold text-[var(--color-ink)]">{f.title}</span>
                        <span className="block mt-0.5 text-[12px] sm:text-[13px] leading-snug text-[var(--color-text-muted)]">{f.tag}</span>
                      </span>
                      <span
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          active ? tone.dot : 'border-[var(--color-border-hover)]'
                        }`}
                        aria-hidden="true"
                      >
                        {active && <span className="w-2 h-2 rounded-full bg-[var(--color-on-brand)]" />}
                      </span>
                    </div>
                    <p className="hidden sm:block mt-3 text-[14px] leading-snug text-[var(--color-text-secondary)]">{f.body}</p>
                  </button>
                );
              })}
            </div>
            {xr && (
              <p className="flex items-start gap-2 text-[13px] leading-snug text-[var(--color-text-secondary)]">
                <Landmark className="w-4 h-4 mt-px shrink-0 text-[var(--color-success)]" aria-hidden="true" />
                Kein PDF nötig: Eine XRechnung ist eine reine XML-Datei. Das Rechnungsportal der Behörde stellt sie lesbar dar.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl bg-[var(--color-surface-subtle)] p-2 pl-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <div role="radiogroup" aria-label="Formularumfang" className="inline-flex rounded-full bg-[var(--color-surface-muted)] p-0.5">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={mode === m.id}
                      onClick={() => setMode(m.id)}
                      className={`min-h-[36px] px-4 rounded-full text-[14px] font-medium transition-colors ${
                        mode === m.id ? 'bg-[var(--color-surface)] text-[var(--color-ink)] ring-1 ring-[var(--color-border)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
                      }`}
                    >
                      {m.title}
                    </button>
                  ))}
                </div>
                <span className="text-[13px] text-[var(--color-text-muted)]">{MODES.find((m) => m.id === mode)?.body}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => reset(sampleInvoiceForm())}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-full text-[14px] font-medium text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)]"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" /> Beispiel laden
                </button>
                <button
                  type="button"
                  onClick={() => reset(emptyInvoiceForm())}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-full text-[14px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" /> Leeren
                </button>
              </div>
            </div>

            {importNotice && (
              <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-info-border)] bg-[var(--color-info-soft)] p-4">
                <Info className="w-5 h-5 mt-0.5 text-[var(--color-brand-dark)] shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1 text-[14px] text-[var(--color-ink)]">
                  <p>
                    Daten aus <span className="font-medium break-all">{importNotice.filename}</span> übernommen. Prüfen Sie die Angaben und erstellen Sie
                    die E-Rechnung neu.
                  </p>
                  {importNotice.lossy && (
                    <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                      Hinweis: Die Rechnung enthält Rabatte, Zuschläge, Anzahlungen oder steuerfreie Positionen, die dieses Formular nicht abbildet. Diese
                      Angaben wurden nicht übernommen.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onDismissImport}
                  className="w-9 h-9 -mt-1.5 -mr-1.5 inline-flex items-center justify-center rounded-full hover:bg-[var(--color-surface)]"
                  aria-label="Hinweis schließen"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </section>

          {/* PDF (ZUGFeRD only; XRechnung has no visual part) */}
          {!xr && (
            <section className={sectionClass}>
              <SectionHeader
                step={nextStep()}
                done={pdf !== null}
                title="Ihre Rechnung als PDF (optional)"
                description="Wir betten die XML-Daten in Ihre bestehende PDF ein und machen sie PDF/A-3-konform. Ohne Upload erzeugen wir eine saubere Rechnungs-PDF aus Ihren Angaben."
              />
              <FileDrop
                id="einv-pdf"
                accept=".pdf,application/pdf"
                extensions={['.pdf']}
                title="Standard-PDF hochladen"
                hint={`PDF bis ${EINVOICE_MAX_UPLOAD_MB} MB, am besten mit eingebetteten Schriften`}
                file={pdf}
                onFile={setPdf}
                onError={(m) => setError(new EinvoiceRequestError(m, 0))}
                disabled={busy}
              />
            </section>
          )}

          {/* Invoice */}
          <section id="einv-sec-daten" className={sectionClass}>
            <SectionHeader step={nextStep()} done={isDone('daten')} title="Rechnungsdaten" description="Rechnungsnummer und Daten, wie sie auf Ihrer Rechnung stehen." />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {text('number', 'Rechnungsnummer', form.invoiceNumber, set('invoiceNumber'), { errorKey: 'invoice_number', required: true, example: 'RE-2026-0142' })}
              {text('issue-date', 'Rechnungsdatum', form.issueDate, set('issueDate'), { errorKey: 'issue_date', required: true, type: 'date' })}
              {text('delivery-date', 'Leistungsdatum', form.deliveryDate, set('deliveryDate'), {
                errorKey: 'delivery_date',
                type: 'date',
                hint: 'Pflichtangabe nach § 14 UStG',
              })}
              {full && (
                <>
                  <Field htmlFor="einv-type" label="Belegart" errors={errorsFor('type_code')} floated>
                    <select id="einv-type" value={form.typeCode} onChange={(e) => set('typeCode')(e.target.value)} className={floatingSelectClass}>
                      {TYPE_CODES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label} ({t.value})
                        </option>
                      ))}
                    </select>
                  </Field>
                  {text('order-ref', 'Bestellnummer des Kunden', form.orderReference, set('orderReference'), { errorKey: 'order_reference', className: 'sm:col-span-2', example: 'PO-2026-001' })}
                  <Field htmlFor="einv-note" label="Hinweistext auf der Rechnung" className="sm:col-span-3" errors={errorsFor('notes')} floated>
                    <textarea
                      id="einv-note"
                      value={form.note}
                      onChange={(e) => set('note')(e.target.value)}
                      rows={2}
                      placeholder="z. B. Rechnung gemäß Bestellung vom 01.03.2026."
                      className={floatingTextareaClass}
                    />
                  </Field>
                </>
              )}
            </div>
          </section>

          {/* Seller */}
          <section id="einv-sec-steller" className={sectionClass}>
            <SectionHeader
              step={nextStep()}
              done={isDone('steller')}
              title="Rechnungssteller (Sie)"
              description="Ihre Firma mit vollständiger Anschrift und Steuernummer bzw. USt-IdNr."
              aside={xrBadge}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {text('seller-name', 'Firmenname', form.seller.name, setSeller('name'), { errorKey: 'seller.name', required: true, className: 'sm:col-span-2', autoComplete: 'organization', example: 'Muster GmbH' })}
              {address('seller', setSeller)}
              {text('seller-vat', 'USt-IdNr.', form.seller.vatId, setSeller('vatId'), {
                errorKey: 'seller.vat_id',
                required: !full,
                example: 'DE123456789',
                hint: full ? 'USt-IdNr. oder Steuernummer angeben' : 'DE + 9 Ziffern',
              })}
              {text('seller-tax', 'Steuernummer', form.seller.taxNumber, setSeller('taxNumber'), { errorKey: 'seller.tax_number', example: '12/345/67890' })}
              {text('seller-contact', 'Ansprechpartner', form.seller.contactName, setSeller('contactName'), { errorKey: 'seller.contact.name', required: xr, autoComplete: 'name', example: 'Max Mustermann' })}
              {text('seller-phone', 'Telefon', form.seller.phone, setSeller('phone'), { errorKey: 'seller.contact.phone', required: xr, type: 'tel', autoComplete: 'tel', example: '+49 30 1234567' })}
              {text('seller-email', 'E-Mail', form.seller.email, setSeller('email'), {
                errorKey: 'seller.contact.email',
                required: xr,
                type: 'email',
                autoComplete: 'email',
                example: 'rechnung@muster-gmbh.de',
                className: 'sm:col-span-2',
                hint: xr ? 'Wird auch als elektronische Adresse des Verkäufers (BT-34) verwendet' : undefined,
              })}
            </div>
          </section>

          {/* Buyer */}
          <section id="einv-sec-empfaenger" className={sectionClass}>
            <SectionHeader
              step={nextStep()}
              done={isDone('empfaenger')}
              title={xr ? 'Rechnungsempfänger (Behörde)' : 'Rechnungsempfänger'}
              description={xr ? 'Die öffentliche Stelle mit ihrer Leitweg-ID. Sie finden die ID in der Bestellung oder beim Auftraggeber.' : 'Ihr Kunde mit vollständiger Anschrift.'}
              aside={xrBadge}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {xr &&
                text('buyer-leitweg', 'Leitweg-ID', form.buyer.leitwegId, setBuyer('leitwegId'), {
                  errorKey: 'buyer.buyer_reference',
                  required: true,
                  example: '04011000-1234512345-06',
                  hint: 'Grobadressierung-Feinadressierung-Prüfziffer; die Prüfziffer wird kontrolliert',
                  className: 'sm:col-span-2',
                })}
              {text('buyer-name', 'Name / Firma', form.buyer.name, setBuyer('name'), { errorKey: 'buyer.name', required: true, className: 'sm:col-span-2', example: xr ? 'Stadtverwaltung Musterstadt' : 'Kunden AG' })}
              {address('buyer', setBuyer)}
              {full && text('buyer-vat', 'USt-IdNr. des Kunden', form.buyer.vatId, setBuyer('vatId'), { errorKey: 'buyer.vat_id', example: 'DE987654321' })}
              {text('buyer-email', 'E-Mail des Empfängers', form.buyer.email, setBuyer('email'), {
                errorKey: 'buyer.electronic_address',
                required: xr,
                type: 'email',
                example: 'einkauf@kunde.de',
                className: full ? '' : 'sm:col-span-2',
                hint: xr ? 'Elektronische Adresse des Käufers (BT-49)' : undefined,
              })}
            </div>
          </section>

          {/* Lines */}
          <section id="einv-sec-positionen" className={sectionClass}>
            <SectionHeader
              step={nextStep()}
              done={isDone('positionen')}
              title="Positionen"
              description="Menge × Nettopreis ergibt den Positionsbetrag. Umsatzsteuer und Summen rechnen wir automatisch."
            />
            {errorsFor('lines').length > 0 && !form.lines.some((_, i) => errorsFor(`lines[${i}]`).length) && (
              <p className="text-[13px] text-[var(--color-danger)]">{errorsFor('lines').join(' ')}</p>
            )}
            <div className="md:rounded-2xl md:border md:border-[var(--color-border)] md:overflow-hidden">
              <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_68px_100px_100px_76px_92px_40px] gap-2 px-3 py-2.5 bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] text-[12px] font-medium text-[var(--color-text-muted)]">
                <span>Bezeichnung</span>
                <span>Menge</span>
                <span>Einheit</span>
                <span>Netto/Einh.</span>
                <span>USt.</span>
                <span className="text-right">Betrag</span>
                <span />
              </div>
              <ul className="space-y-3 md:space-y-0 md:divide-y md:divide-[var(--color-border-subtle)]">
                {form.lines.map((line, i) => (
                  <LineRow
                    key={line.id}
                    index={i}
                    line={line}
                    amount={totals.lineNets[i]}
                    errorsFor={errorsFor}
                    onChange={(k, v) => setLine(line.id, k, v)}
                    onRemove={form.lines.length > 1 ? () => setForm((f) => ({ ...f, lines: f.lines.filter((l) => l.id !== line.id) })) : undefined}
                  />
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, lines: [...f.lines, newLine()] }))}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 rounded-full border border-dashed border-[var(--color-border-hover)] text-[14px] font-medium text-[var(--color-brand-dark)] hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> Position hinzufügen
            </button>
          </section>

          {/* Payment */}
          <section id="einv-sec-zahlung" className={sectionClass}>
            <SectionHeader
              step={nextStep()}
              done={isDone('zahlung')}
              title="Zahlung"
              description={xr ? 'XRechnung verlangt Zahlungsanweisungen: IBAN und Fälligkeit oder Zahlungsbedingungen.' : 'Fälligkeit oder Zahlungsbedingungen sind Pflicht; mit IBAN wird SEPA-Überweisung vermerkt.'}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {text('due', 'Fällig am', form.payment.dueDate, setPayment('dueDate'), { errorKey: 'payment.due_date', type: 'date', required: xr })}
              {text('terms', 'Zahlungsbedingungen', form.payment.terms, setPayment('terms'), {
                errorKey: 'payment.terms',
                example: 'Zahlbar innerhalb 30 Tagen netto',
              })}
              {text('iban', 'IBAN', form.payment.iban, setPayment('iban'), { errorKey: 'payment.iban', required: xr, example: 'DE02 1203 0000 0000 2020 51', hint: 'Prüfziffer wird kontrolliert' })}
              {text('bic', 'BIC', form.payment.bic, setPayment('bic'), { errorKey: 'payment.bic', example: 'BYLADEM1001' })}
              {full && (
                <>
                  {text('reference', 'Verwendungszweck', form.payment.reference, setPayment('reference'), { errorKey: 'payment.payment_reference', className: 'sm:col-span-2', example: 'RE-2026-0142' })}
                  {text('skonto-days', 'Skonto: Tage', form.payment.skontoDays, setPayment('skontoDays'), { errorKey: 'payment.discount_days', inputMode: 'numeric', example: '10' })}
                  {text('skonto-percent', 'Skonto: Prozent', form.payment.skontoPercent, setPayment('skontoPercent'), {
                    errorKey: 'payment.discount_percent',
                    inputMode: 'decimal',
                    example: '2',
                  })}
                </>
              )}
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-[calc(var(--nav-height)+24px)] surface-dark rounded-2xl overflow-hidden">
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--color-text-muted)]">Zusammenfassung</p>
                <p className="mt-1 text-[17px] font-semibold text-[var(--color-ink)]">{xr ? 'XRechnung 3.x (XML)' : 'ZUGFeRD 2.x (PDF/A-3)'}</p>
                <p className="text-[13px] text-[var(--color-text-secondary)]">Profil EN 16931 (COMFORT)</p>
              </div>
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  xr ? 'bg-[var(--color-success)] text-[var(--color-on-brand)]' : 'bg-[var(--color-brand)] text-[var(--color-on-brand)]'
                }`}
              >
                {xr ? <FileCode2 className="w-5 h-5" aria-hidden="true" /> : <FileText className="w-5 h-5" aria-hidden="true" />}
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13px] font-medium text-[var(--color-text-muted)]">Pflichtangaben</p>
                <p className="text-[13px] tabular-nums text-[var(--color-text-secondary)]">
                  {doneCount} von {checklist.length}
                </p>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden" aria-hidden="true">
                <div
                  className={`h-full rounded-full transition-[width,background-color] duration-300 ${doneCount === checklist.length ? 'bg-[var(--color-success)]' : 'bg-[var(--color-ink)]'}`}
                  style={{ width: `${(doneCount / checklist.length) * 100}%` }}
                />
              </div>
              <ul className="mt-3 -mx-2">
                {checklist.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(c.id)}
                      className="w-full flex items-center gap-2.5 min-h-[36px] px-2 rounded-lg text-left text-[14px] hover:bg-[var(--color-surface-muted)] transition-colors"
                    >
                      {c.done ? <CheckDot /> : <Circle className="w-[18px] h-[18px] shrink-0 text-[var(--color-border-hover)]" aria-hidden="true" />}
                      <span className={c.done ? 'text-[var(--color-ink)]' : 'text-[var(--color-text-secondary)]'}>{c.label}</span>
                      <span className="sr-only">{c.done ? '(vollständig)' : '(unvollständig)'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="space-y-2 text-[14px] border-t border-[var(--color-border)] pt-4">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--color-text-secondary)]">Nettobetrag</dt>
                <dd className="font-medium tabular-nums text-[var(--color-ink)]">{formatEuro(totals.net)}</dd>
              </div>
              {totals.vat.map((v) => (
                <div key={v.rate} className="flex justify-between gap-3">
                  <dt className="text-[var(--color-text-secondary)]">
                    USt. {String(v.rate).replace('.', ',')} % <span className="text-[12px] text-[var(--color-text-muted)]">auf {formatEuro(v.basis)}</span>
                  </dt>
                  <dd className="font-medium tabular-nums text-[var(--color-ink)]">{formatEuro(v.tax)}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3 border-t border-[var(--color-border)] pt-3">
                <dt className="font-medium text-[var(--color-ink)]">Gesamtbetrag</dt>
                <dd className="text-[24px] font-semibold tracking-[-0.02em] tabular-nums text-[var(--color-ink)]">{formatEuro(totals.gross)}</dd>
              </div>
            </dl>
            {errorsFor('totals').length > 0 && (
              <p className="rounded-xl bg-[var(--color-danger-soft)] px-3 py-2 text-[12px] text-[var(--color-danger)]">{errorsFor('totals').join(' ')}</p>
            )}
            <button ref={submitRef} type="submit" disabled={busy} className="btn-brand-primary w-full !min-h-[50px] !text-[16px]">
              {busy ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Wird erstellt und geprüft …
                </>
              ) : (
                <>
                  {submitLabel} <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
          <ul className="space-y-2 bg-[var(--color-surface-subtle)] border-t border-[var(--color-border)] px-5 sm:px-6 py-4 text-[12px] leading-snug text-[var(--color-text-secondary)]">
            {[
              'Alle Beträge werden serverseitig nach EN 16931 nachgerechnet.',
              'Jede Datei wird vor der Ausgabe erneut validiert.',
              'Eingaben und Ergebnis werden unverändert archiviert (GoBD).',
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <CheckDot size="sm" /> {t}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Mobile: total and submit stay reachable while scrolling the long form */}
      {!submitVisible && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 surface-dark hairline-t pb-[env(safe-area-inset-bottom)]">
          <div className="site-container flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)] tabular-nums">
                {doneCount === checklist.length && <CheckDot size="sm" />}
                Gesamt · {doneCount}/{checklist.length} Pflichtangaben
              </p>
              <p className="text-[19px] font-semibold tracking-[-0.015em] tabular-nums text-[var(--color-ink)]">{formatEuro(totals.gross)}</p>
            </div>
            <button type="submit" disabled={busy} className="btn-brand-primary !min-h-[46px] !px-5 shrink-0">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : null}
              {busy ? 'Wird erstellt …' : 'Erstellen'}
              {!busy && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

function LineRow({
  index,
  line,
  amount,
  errorsFor,
  onChange,
  onRemove,
}: {
  index: number;
  line: LineForm;
  amount: number;
  errorsFor: (key: string) => string[];
  onChange: (key: keyof LineForm, value: string) => void;
  onRemove?: () => void;
}) {
  const base = `einv-line-${index}`;
  const errors = errorsFor(`lines[${index}]`);
  const cell = (apiKey: string) => errorsFor(`lines[${index}].${apiKey}`).length > 0 ? '!border-[var(--color-danger)]' : '';
  const unitOptions = UNITS.some((u) => u.value === line.unit) ? UNITS : [...UNITS, { value: line.unit, label: line.unit, code: line.unit }];
  const small = 'input h-11 w-full rounded-xl text-[15px] px-3 bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none';
  const label = 'block text-[12px] font-medium text-[var(--color-text-muted)] mb-1 md:sr-only';
  const removeButton = onRemove && (
    <button
      type="button"
      onClick={onRemove}
      className="w-10 h-10 inline-flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors"
      aria-label={`Position ${index + 1} entfernen`}
    >
      <Trash2 className="w-4 h-4" aria-hidden="true" />
    </button>
  );

  return (
    <li className="rounded-2xl md:rounded-none border md:border-0 border-[var(--color-border)] p-3.5 md:px-3 md:py-2">
      <div className="flex items-center justify-between min-h-[40px] -mt-1 mb-1 md:hidden">
        <span className="text-[13px] font-medium text-[var(--color-text-muted)]">Position {index + 1}</span>
        {removeButton}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-[minmax(0,1fr)_68px_100px_100px_76px_92px_40px] gap-2 items-end md:items-center">
        <div className="col-span-2 md:col-span-1">
          <label htmlFor={`${base}-desc`} className={label}>
            Bezeichnung
          </label>
          <input
            id={`${base}-desc`}
            value={line.description}
            onChange={(e) => onChange('description', e.target.value)}
            required
            placeholder="z. B. Beratung"
            className={`${small} ${cell('description')}`}
          />
        </div>
        <div>
          <label htmlFor={`${base}-qty`} className={label}>
            Menge
          </label>
          <input
            id={`${base}-qty`}
            value={line.quantity}
            onChange={(e) => onChange('quantity', e.target.value)}
            required
            inputMode="decimal"
            className={`${small} text-right tabular-nums ${cell('quantity')}`}
          />
        </div>
        <div>
          <label htmlFor={`${base}-unit`} className={label}>
            Einheit
          </label>
          <select id={`${base}-unit`} value={line.unit} onChange={(e) => onChange('unit', e.target.value)} className={`select ${small} ${cell('unit')}`}>
            {unitOptions.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${base}-price`} className={label}>
            Netto/Einh. (€)
          </label>
          <input
            id={`${base}-price`}
            value={line.netPrice}
            onChange={(e) => onChange('netPrice', e.target.value)}
            required
            inputMode="decimal"
            placeholder="0,00"
            className={`${small} text-right tabular-nums ${cell('net_price')}`}
          />
        </div>
        <div>
          <label htmlFor={`${base}-vat`} className={label}>
            USt.
          </label>
          <select id={`${base}-vat`} value={line.vatRate} onChange={(e) => onChange('vatRate', e.target.value)} className={`select ${small} ${cell('vat_rate')}`}>
            {VAT_RATES.map((r) => (
              <option key={r} value={r}>
                {r} %
              </option>
            ))}
          </select>
        </div>
        <p className="col-span-2 md:col-span-1 flex items-baseline justify-between md:justify-end gap-2 mt-1 md:mt-0 pt-2.5 md:pt-0 border-t md:border-0 border-[var(--color-border-subtle)] text-[15px] font-medium tabular-nums text-[var(--color-ink)]">
          <span className="md:sr-only text-[13px] font-normal text-[var(--color-text-secondary)]">Betrag (netto)</span>
          {formatEuro(amount)}
        </p>
        <div className="hidden md:flex justify-end">{removeButton}</div>
      </div>
      {errors.length > 0 && <p className="mt-1.5 text-[12px] leading-snug text-[var(--color-danger)]">{errors.join(' ')}</p>}
    </li>
  );
}

function ResultView({ result, onClose, onVerifyArchive }: { result: CreateResult; onClose: () => void; onVerifyArchive: (id: string) => void }) {
  const isPdf = result.format === 'zugferd';
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isPdf) return;
    const url = URL.createObjectURL(result.blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [isPdf, result.blob]);

  const valid = result.report?.valid ?? result.headerSummary?.valid ?? false;

  return (
    <section aria-labelledby="einv-result-title" className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
              valid ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' : 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]'
            }`}
          >
            {isPdf ? <FileText className="w-5 h-5" aria-hidden="true" /> : <FileCode2 className="w-5 h-5" aria-hidden="true" />}
          </span>
          <div className="min-w-0">
            <h3 id="einv-result-title" className="text-[21px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
              {valid ? 'Ihre E-Rechnung ist fertig' : 'E-Rechnung erstellt, aber mit Befunden'}
            </h3>
            <p className="text-[14px] text-[var(--color-text-secondary)] break-all">
              {result.filename} · {formatBytes(result.blob.size)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => downloadBlob(result.blob, result.filename)} className="btn-brand-primary !min-h-[46px] !px-6">
            <Download className="w-4 h-4" aria-hidden="true" /> {isPdf ? 'ZUGFeRD-PDF herunterladen' : 'XRechnung herunterladen'}
          </button>
          <button type="button" onClick={onClose} className="btn-brand-secondary !min-h-[46px]">
            Schließen
          </button>
        </div>
      </div>

      {result.report ? (
        <ReportView report={result.report} />
      ) : (
        result.headerSummary && (
          <p className="flex items-start gap-2 rounded-xl bg-[var(--color-surface-subtle)] px-4 py-3 text-[14px] text-[var(--color-text-secondary)]">
            <Building2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            Profil {result.headerSummary.profile || 'EN 16931'} · {result.headerSummary.valid ? 'gültig' : 'nicht gültig'} ·{' '}
            {result.headerSummary.warnings} Hinweise. Den ausführlichen Prüfbericht erhalten Sie im Reiter „Prüfen“.
          </p>
        )
      )}

      {previewUrl && (
        <details className="group rounded-2xl border border-[var(--color-border)]">
          <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 sm:px-5 py-3.5 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block text-[15px] font-medium text-[var(--color-ink)]">PDF-Vorschau</span>
              <span className="block text-[12px] text-[var(--color-text-muted)]">Sichtteil der Rechnung; die XML steckt als Anhang „factur-x.xml“ in der Datei</span>
            </span>
            <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)] transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <iframe src={previewUrl} title="Vorschau der ZUGFeRD-PDF" className="w-full h-[640px] border-t border-[var(--color-border)] rounded-b-2xl" />
        </details>
      )}

      {result.xml && <XmlViewer xml={result.xml} filename={result.filename.replace(/\.(pdf|xml)$/i, '') + '.xml'} title={isPdf ? 'Eingebettete XML (factur-x.xml)' : 'XRechnung-XML'} />}

      <ArchiveCard archive={result.archive} archiveId={result.archiveId} onVerify={onVerifyArchive} />
    </section>
  );
}
