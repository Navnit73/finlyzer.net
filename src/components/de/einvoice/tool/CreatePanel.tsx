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
import { useLang } from './i18n';

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

const FORMATS: { id: EinvoiceFormat; title: string; tag: [string, string]; body: [string, string]; icon: typeof FileText }[] = [
  {
    id: 'zugferd',
    title: 'ZUGFeRD',
    tag: ['Für Unternehmen · PDF/A-3', 'For businesses · PDF/A-3'],
    body: [
      'Lesbare PDF mit eingebetteter XML. Für Geschäftskunden, die PDF und Daten in einer Datei erhalten.',
      'Readable PDF with embedded XML. For business customers who get the PDF and the data in one file.',
    ],
    icon: FileText,
  },
  {
    id: 'xrechnung',
    title: 'XRechnung',
    tag: ['Für Behörden · reine XML', 'For public authorities · XML only'],
    body: [
      'Strukturierte XML ohne Sichtteil, mit Leitweg-ID. Pflicht für Rechnungen an Behörden (ZRE, OZG-RE).',
      'Structured XML without a visual part, with Leitweg-ID. Required for invoices to German authorities (ZRE, OZG-RE).',
    ],
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

const MODES: { id: FormMode; title: [string, string]; body: [string, string] }[] = [
  { id: 'simple', title: ['Schnell', 'Quick'], body: ['Nur die Pflichtangaben', 'Required fields only'] },
  {
    id: 'full',
    title: ['Vollständig', 'Complete'],
    body: ['Mit Belegart, Bestellnummer, Skonto & Verwendungszweck', 'With document type, order number, early-payment discount & reference'],
  },
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
  const { t } = useLang();
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
      setError(err instanceof EinvoiceRequestError ? err : new EinvoiceRequestError(t('Die E-Rechnung konnte nicht erstellt werden.', 'The e-invoice could not be created.'), 0));
    } finally {
      setBusy(false);
    }
  }

  /** Flat form → /convert returns the file; a follow-up /validate on it supplies the full report. */
  async function convertSimple(): Promise<CreateResult> {
    const body = new FormData();
    body.append('invoice_data', JSON.stringify(buildFlatPayload(form, format)));
    if (!xr && pdf) body.append('file', pdf, pdf.name);
    const res = await requestEinvoice('/api/einvoice/convert', { method: 'POST', body }, t);
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
      report = await (await requestEinvoice('/api/einvoice/validate', { method: 'POST', body: check }, t)).json();
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
      const res = await requestEinvoice(
        '/api/einvoice/create-xrechnung?output=json',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
        t
      );
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
    const res = await requestEinvoice('/api/einvoice/create-zugferd?output=json', { method: 'POST', body }, t);
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
      /** Shown as "z. B. …" / "e.g. …" while the field is focused and empty. */
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
          placeholder={opts.example ? `${t('z. B.', 'e.g.')} ${opts.example}` : ' '}
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
        {text(`${party}-street`, t('Straße und Hausnummer', 'Street and number'), p.street, setter('street'), {
          errorKey: `${party}.address.street`,
          required: true,
          example: party === 'seller' ? 'Hauptstraße 12' : 'Kundenstraße 15',
          className: 'sm:col-span-2',
          autoComplete: 'street-address',
        })}
        <div className="grid grid-cols-[110px_minmax(0,1fr)_80px] gap-3 sm:col-span-2">
          {text(`${party}-postcode`, t('PLZ', 'Postcode'), p.postcode, setter('postcode'), { errorKey: `${party}.address.postcode`, required: true, inputMode: 'numeric', example: party === 'seller' ? '10115' : '60311' })}
          {text(`${party}-city`, t('Ort', 'City'), p.city, setter('city'), { errorKey: `${party}.address.city`, required: true, example: party === 'seller' ? 'Berlin' : 'Frankfurt' })}
          {text(`${party}-country`, t('Land', 'Country'), p.country, (v) => setter('country')(v.toUpperCase()), {
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
      <Landmark className="w-3.5 h-3.5" aria-hidden="true" /> {t('XRechnung-Pflichtfelder aktiv', 'XRechnung required fields active')}
    </span>
  );

  // Rough completeness per section, mirroring the fields marked required below. Only guides the user;
  // the server is the source of truth for validation.
  const filled = (...values: string[]) => values.every((v) => v.trim() !== '');
  const hasAddress = (p: { name: string; street: string; postcode: string; city: string; country: string }) =>
    filled(p.name, p.street, p.postcode, p.city, p.country);
  const checklist: { id: string; label: string; done: boolean }[] = [
    { id: 'daten', label: t('Rechnungsdaten', 'Invoice details'), done: filled(form.invoiceNumber, form.issueDate) },
    {
      id: 'steller',
      label: t('Rechnungssteller', 'Seller'),
      done:
        hasAddress(form.seller) &&
        (full ? filled(form.seller.vatId) || filled(form.seller.taxNumber) : filled(form.seller.vatId)) &&
        (!xr || filled(form.seller.contactName, form.seller.phone, form.seller.email)),
    },
    { id: 'empfaenger', label: t('Rechnungsempfänger', 'Buyer'), done: hasAddress(form.buyer) && (!xr || filled(form.buyer.leitwegId, form.buyer.email)) },
    { id: 'positionen', label: t('Positionen', 'Line items'), done: form.lines.every((l) => filled(l.description, l.quantity, l.netPrice)) },
    {
      id: 'zahlung',
      label: t('Zahlung', 'Payment'),
      done: xr ? filled(form.payment.dueDate, form.payment.iban) : filled(form.payment.dueDate) || filled(form.payment.terms),
    },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const isDone = (id: string) => checklist.some((c) => c.id === id && c.done);
  const jumpTo = (id: string) => document.getElementById(`einv-sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const submitLabel = xr ? t('XRechnung erstellen', 'Create XRechnung') : t('ZUGFeRD-PDF erstellen', 'Create ZUGFeRD PDF');
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
            <SectionHeader
              step={nextStep()}
              done
              title={t('Format wählen', 'Choose format')}
              description={t('An wen geht die Rechnung? Die Pflichtfelder passen sich an.', 'Who receives the invoice? The required fields adapt.')}
            />
            <div role="radiogroup" aria-label={t('Ausgabeformat', 'Output format')} className="grid grid-cols-2 gap-3">
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
                        <span className="block mt-0.5 text-[12px] sm:text-[13px] leading-snug text-[var(--color-text-muted)]">{t(...f.tag)}</span>
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
                    <p className="hidden sm:block mt-3 text-[14px] leading-snug text-[var(--color-text-secondary)]">{t(...f.body)}</p>
                  </button>
                );
              })}
            </div>
            {xr && (
              <p className="flex items-start gap-2 text-[13px] leading-snug text-[var(--color-text-secondary)]">
                <Landmark className="w-4 h-4 mt-px shrink-0 text-[var(--color-success)]" aria-hidden="true" />
                {t(
                  'Kein PDF nötig: Eine XRechnung ist eine reine XML-Datei. Das Rechnungsportal der Behörde stellt sie lesbar dar.',
                  'No PDF needed: an XRechnung is a pure XML file. The authority’s invoice portal displays it in readable form.'
                )}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl bg-[var(--color-surface-subtle)] p-2 pl-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <div role="radiogroup" aria-label={t('Formularumfang', 'Form scope')} className="inline-flex rounded-full bg-[var(--color-surface-muted)] p-0.5">
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
                      {t(...m.title)}
                    </button>
                  ))}
                </div>
                <span className="text-[13px] text-[var(--color-text-muted)]">{t(...MODES.find((m) => m.id === mode)!.body)}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => reset(sampleInvoiceForm())}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-full text-[14px] font-medium text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)]"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" /> {t('Beispiel laden', 'Load sample')}
                </button>
                <button
                  type="button"
                  onClick={() => reset(emptyInvoiceForm())}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-full text-[14px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" /> {t('Leeren', 'Clear')}
                </button>
              </div>
            </div>

            {importNotice && (
              <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-info-border)] bg-[var(--color-info-soft)] p-4">
                <Info className="w-5 h-5 mt-0.5 text-[var(--color-brand-dark)] shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1 text-[14px] text-[var(--color-ink)]">
                  <p>
                    {t('Daten aus', 'Data imported from')} <span className="font-medium break-all">{importNotice.filename}</span>
                    {t(
                      ' übernommen. Prüfen Sie die Angaben und erstellen Sie die E-Rechnung neu.',
                      '. Check the details and create the e-invoice again.'
                    )}
                  </p>
                  {importNotice.lossy && (
                    <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                      {t(
                        'Hinweis: Die Rechnung enthält Rabatte, Zuschläge, Anzahlungen oder steuerfreie Positionen, die dieses Formular nicht abbildet. Diese Angaben wurden nicht übernommen.',
                        'Note: the invoice contains discounts, surcharges, prepayments or tax-exempt lines that this form does not support. These were not imported.'
                      )}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onDismissImport}
                  className="w-9 h-9 -mt-1.5 -mr-1.5 inline-flex items-center justify-center rounded-full hover:bg-[var(--color-surface)]"
                  aria-label={t('Hinweis schließen', 'Dismiss')}
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
                title={t('Ihre Rechnung als PDF (optional)', 'Your invoice as PDF (optional)')}
                description={t(
                  'Wir betten die XML-Daten in Ihre bestehende PDF ein und machen sie PDF/A-3-konform. Ohne Upload erzeugen wir eine saubere Rechnungs-PDF aus Ihren Angaben.',
                  'We embed the XML data into your existing PDF and make it PDF/A-3 compliant. Without an upload, we generate a clean invoice PDF from your details.'
                )}
              />
              <FileDrop
                id="einv-pdf"
                accept=".pdf,application/pdf"
                extensions={['.pdf']}
                title={t('Standard-PDF hochladen', 'Upload standard PDF')}
                hint={t(`PDF bis ${EINVOICE_MAX_UPLOAD_MB} MB, am besten mit eingebetteten Schriften`, `PDF up to ${EINVOICE_MAX_UPLOAD_MB} MB, ideally with embedded fonts`)}
                file={pdf}
                onFile={setPdf}
                onError={(m) => setError(new EinvoiceRequestError(m, 0))}
                disabled={busy}
              />
            </section>
          )}

          {/* Invoice */}
          <section id="einv-sec-daten" className={sectionClass}>
            <SectionHeader
              step={nextStep()}
              done={isDone('daten')}
              title={t('Rechnungsdaten', 'Invoice details')}
              description={t('Rechnungsnummer und Daten, wie sie auf Ihrer Rechnung stehen.', 'Invoice number and dates as they appear on your invoice.')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {text('number', t('Rechnungsnummer', 'Invoice number'), form.invoiceNumber, set('invoiceNumber'), { errorKey: 'invoice_number', required: true, example: 'RE-2026-0142' })}
              {text('issue-date', t('Rechnungsdatum', 'Invoice date'), form.issueDate, set('issueDate'), { errorKey: 'issue_date', required: true, type: 'date' })}
              {text('delivery-date', t('Leistungsdatum', 'Delivery date'), form.deliveryDate, set('deliveryDate'), {
                errorKey: 'delivery_date',
                type: 'date',
                hint: t('Pflichtangabe nach § 14 UStG', 'Required under § 14 UStG (German VAT Act)'),
              })}
              {full && (
                <>
                  <Field htmlFor="einv-type" label={t('Belegart', 'Document type')} errors={errorsFor('type_code')} floated>
                    <select id="einv-type" value={form.typeCode} onChange={(e) => set('typeCode')(e.target.value)} className={floatingSelectClass}>
                      {TYPE_CODES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {t(c.label, c.labelEn)} ({c.value})
                        </option>
                      ))}
                    </select>
                  </Field>
                  {text('order-ref', t('Bestellnummer des Kunden', 'Customer order number'), form.orderReference, set('orderReference'), { errorKey: 'order_reference', className: 'sm:col-span-2', example: 'PO-2026-001' })}
                  <Field htmlFor="einv-note" label={t('Hinweistext auf der Rechnung', 'Note on the invoice')} className="sm:col-span-3" errors={errorsFor('notes')} floated>
                    <textarea
                      id="einv-note"
                      value={form.note}
                      onChange={(e) => set('note')(e.target.value)}
                      rows={2}
                      placeholder={t('z. B. Rechnung gemäß Bestellung vom 01.03.2026.', 'e.g. Invoice as per order of 01.03.2026.')}
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
              title={t('Rechnungssteller (Sie)', 'Seller (you)')}
              description={t('Ihre Firma mit vollständiger Anschrift und Steuernummer bzw. USt-IdNr.', 'Your company with full address and tax number or VAT ID.')}
              aside={xrBadge}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {text('seller-name', t('Firmenname', 'Company name'), form.seller.name, setSeller('name'), { errorKey: 'seller.name', required: true, className: 'sm:col-span-2', autoComplete: 'organization', example: 'Muster GmbH' })}
              {address('seller', setSeller)}
              {text('seller-vat', t('USt-IdNr.', 'VAT ID'), form.seller.vatId, setSeller('vatId'), {
                errorKey: 'seller.vat_id',
                required: !full,
                example: 'DE123456789',
                hint: full ? t('USt-IdNr. oder Steuernummer angeben', 'Enter VAT ID or tax number') : t('DE + 9 Ziffern', 'DE + 9 digits'),
              })}
              {text('seller-tax', t('Steuernummer', 'Tax number'), form.seller.taxNumber, setSeller('taxNumber'), { errorKey: 'seller.tax_number', example: '12/345/67890' })}
              {text('seller-contact', t('Ansprechpartner', 'Contact person'), form.seller.contactName, setSeller('contactName'), { errorKey: 'seller.contact.name', required: xr, autoComplete: 'name', example: 'Max Mustermann' })}
              {text('seller-phone', t('Telefon', 'Phone'), form.seller.phone, setSeller('phone'), { errorKey: 'seller.contact.phone', required: xr, type: 'tel', autoComplete: 'tel', example: '+49 30 1234567' })}
              {text('seller-email', t('E-Mail', 'Email'), form.seller.email, setSeller('email'), {
                errorKey: 'seller.contact.email',
                required: xr,
                type: 'email',
                autoComplete: 'email',
                example: 'rechnung@muster-gmbh.de',
                className: 'sm:col-span-2',
                hint: xr ? t('Wird auch als elektronische Adresse des Verkäufers (BT-34) verwendet', 'Also used as the seller’s electronic address (BT-34)') : undefined,
              })}
            </div>
          </section>

          {/* Buyer */}
          <section id="einv-sec-empfaenger" className={sectionClass}>
            <SectionHeader
              step={nextStep()}
              done={isDone('empfaenger')}
              title={xr ? t('Rechnungsempfänger (Behörde)', 'Buyer (public authority)') : t('Rechnungsempfänger', 'Buyer')}
              description={
                xr
                  ? t(
                      'Die öffentliche Stelle mit ihrer Leitweg-ID. Sie finden die ID in der Bestellung oder beim Auftraggeber.',
                      'The public body with its Leitweg-ID. You find the ID in the purchase order or from your client.'
                    )
                  : t('Ihr Kunde mit vollständiger Anschrift.', 'Your customer with full address.')
              }
              aside={xrBadge}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {xr &&
                text('buyer-leitweg', 'Leitweg-ID', form.buyer.leitwegId, setBuyer('leitwegId'), {
                  errorKey: 'buyer.buyer_reference',
                  required: true,
                  example: '04011000-1234512345-06',
                  hint: t('Grobadressierung-Feinadressierung-Prüfziffer; die Prüfziffer wird kontrolliert', 'Coarse address-fine address-check digit; the check digit is verified'),
                  className: 'sm:col-span-2',
                })}
              {text('buyer-name', t('Name / Firma', 'Name / company'), form.buyer.name, setBuyer('name'), { errorKey: 'buyer.name', required: true, className: 'sm:col-span-2', example: xr ? 'Stadtverwaltung Musterstadt' : 'Kunden AG' })}
              {address('buyer', setBuyer)}
              {full && text('buyer-vat', t('USt-IdNr. des Kunden', 'Customer VAT ID'), form.buyer.vatId, setBuyer('vatId'), { errorKey: 'buyer.vat_id', example: 'DE987654321' })}
              {text('buyer-email', t('E-Mail des Empfängers', 'Buyer email'), form.buyer.email, setBuyer('email'), {
                errorKey: 'buyer.electronic_address',
                required: xr,
                type: 'email',
                example: 'einkauf@kunde.de',
                className: full ? '' : 'sm:col-span-2',
                hint: xr ? t('Elektronische Adresse des Käufers (BT-49)', 'Buyer’s electronic address (BT-49)') : undefined,
              })}
            </div>
          </section>

          {/* Lines */}
          <section id="einv-sec-positionen" className={sectionClass}>
            <SectionHeader
              step={nextStep()}
              done={isDone('positionen')}
              title={t('Positionen', 'Line items')}
              description={t(
                'Menge × Nettopreis ergibt den Positionsbetrag. Umsatzsteuer und Summen rechnen wir automatisch.',
                'Quantity × net price gives the line amount. VAT and totals are calculated automatically.'
              )}
            />
            {errorsFor('lines').length > 0 && !form.lines.some((_, i) => errorsFor(`lines[${i}]`).length) && (
              <p className="text-[13px] text-[var(--color-danger)]">{errorsFor('lines').join(' ')}</p>
            )}
            <div className="md:rounded-2xl md:border md:border-[var(--color-border)] md:overflow-hidden">
              <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_68px_100px_100px_76px_92px_40px] gap-2 px-3 py-2.5 bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] text-[12px] font-medium text-[var(--color-text-muted)]">
                <span>{t('Bezeichnung', 'Description')}</span>
                <span>{t('Menge', 'Qty')}</span>
                <span>{t('Einheit', 'Unit')}</span>
                <span>{t('Netto/Einh.', 'Net/unit')}</span>
                <span>{t('USt.', 'VAT')}</span>
                <span className="text-right">{t('Betrag', 'Amount')}</span>
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
              <Plus className="w-4 h-4" aria-hidden="true" /> {t('Position hinzufügen', 'Add line item')}
            </button>
          </section>

          {/* Payment */}
          <section id="einv-sec-zahlung" className={sectionClass}>
            <SectionHeader
              step={nextStep()}
              done={isDone('zahlung')}
              title={t('Zahlung', 'Payment')}
              description={
                xr
                  ? t('XRechnung verlangt Zahlungsanweisungen: IBAN und Fälligkeit oder Zahlungsbedingungen.', 'XRechnung requires payment instructions: IBAN and due date or payment terms.')
                  : t(
                      'Fälligkeit oder Zahlungsbedingungen sind Pflicht; mit IBAN wird SEPA-Überweisung vermerkt.',
                      'A due date or payment terms are required; with an IBAN, SEPA credit transfer is noted.'
                    )
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {text('due', t('Fällig am', 'Due date'), form.payment.dueDate, setPayment('dueDate'), { errorKey: 'payment.due_date', type: 'date', required: xr })}
              {text('terms', t('Zahlungsbedingungen', 'Payment terms'), form.payment.terms, setPayment('terms'), {
                errorKey: 'payment.terms',
                example: t('Zahlbar innerhalb 30 Tagen netto', 'Payable within 30 days net'),
              })}
              {text('iban', 'IBAN', form.payment.iban, setPayment('iban'), { errorKey: 'payment.iban', required: xr, example: 'DE02 1203 0000 0000 2020 51', hint: t('Prüfziffer wird kontrolliert', 'Check digit is verified') })}
              {text('bic', 'BIC', form.payment.bic, setPayment('bic'), { errorKey: 'payment.bic', example: 'BYLADEM1001' })}
              {full && (
                <>
                  {text('reference', t('Verwendungszweck', 'Payment reference'), form.payment.reference, setPayment('reference'), { errorKey: 'payment.payment_reference', className: 'sm:col-span-2', example: 'RE-2026-0142' })}
                  {text('skonto-days', t('Skonto: Tage', 'Discount: days'), form.payment.skontoDays, setPayment('skontoDays'), { errorKey: 'payment.discount_days', inputMode: 'numeric', example: '10' })}
                  {text('skonto-percent', t('Skonto: Prozent', 'Discount: percent'), form.payment.skontoPercent, setPayment('skontoPercent'), {
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
                <p className="text-[13px] font-medium text-[var(--color-text-muted)]">{t('Zusammenfassung', 'Summary')}</p>
                <p className="mt-1 text-[17px] font-semibold text-[var(--color-ink)]">{xr ? 'XRechnung 3.x (XML)' : 'ZUGFeRD 2.x (PDF/A-3)'}</p>
                <p className="text-[13px] text-[var(--color-text-secondary)]">{t('Profil', 'Profile')} EN 16931 (COMFORT)</p>
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
                <p className="text-[13px] font-medium text-[var(--color-text-muted)]">{t('Pflichtangaben', 'Required details')}</p>
                <p className="text-[13px] tabular-nums text-[var(--color-text-secondary)]">
                  {doneCount} {t('von', 'of')} {checklist.length}
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
                      <span className="sr-only">{c.done ? t('(vollständig)', '(complete)') : t('(unvollständig)', '(incomplete)')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="space-y-2 text-[14px] border-t border-[var(--color-border)] pt-4">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--color-text-secondary)]">{t('Nettobetrag', 'Net amount')}</dt>
                <dd className="font-medium tabular-nums text-[var(--color-ink)]">{formatEuro(totals.net)}</dd>
              </div>
              {totals.vat.map((v) => (
                <div key={v.rate} className="flex justify-between gap-3">
                  <dt className="text-[var(--color-text-secondary)]">
                    {t('USt.', 'VAT')} {String(v.rate).replace('.', ',')} %{' '}
                    <span className="text-[12px] text-[var(--color-text-muted)]">
                      {t('auf', 'on')} {formatEuro(v.basis)}
                    </span>
                  </dt>
                  <dd className="font-medium tabular-nums text-[var(--color-ink)]">{formatEuro(v.tax)}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3 border-t border-[var(--color-border)] pt-3">
                <dt className="font-medium text-[var(--color-ink)]">{t('Gesamtbetrag', 'Total')}</dt>
                <dd className="text-[24px] font-semibold tracking-[-0.02em] tabular-nums text-[var(--color-ink)]">{formatEuro(totals.gross)}</dd>
              </div>
            </dl>
            {errorsFor('totals').length > 0 && (
              <p className="rounded-xl bg-[var(--color-danger-soft)] px-3 py-2 text-[12px] text-[var(--color-danger)]">{errorsFor('totals').join(' ')}</p>
            )}
            <button ref={submitRef} type="submit" disabled={busy} className="btn-brand-primary w-full !min-h-[50px] !text-[16px]">
              {busy ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> {t('Wird erstellt und geprüft …', 'Creating and validating …')}
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
              t('Alle Beträge werden serverseitig nach EN 16931 nachgerechnet.', 'All amounts are recalculated on the server according to EN 16931.'),
              t('Jede Datei wird vor der Ausgabe erneut validiert.', 'Every file is validated again before output.'),
              t('Eingaben und Ergebnis werden unverändert archiviert (GoBD).', 'Input and result are archived unaltered (GoBD).'),
            ].map((note) => (
              <li key={note} className="flex gap-2">
                <CheckDot size="sm" /> {note}
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
                {t('Gesamt', 'Total')} · {doneCount}/{checklist.length} {t('Pflichtangaben', 'required')}
              </p>
              <p className="text-[19px] font-semibold tracking-[-0.015em] tabular-nums text-[var(--color-ink)]">{formatEuro(totals.gross)}</p>
            </div>
            <button type="submit" disabled={busy} className="btn-brand-primary !min-h-[46px] !px-5 shrink-0">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : null}
              {busy ? t('Wird erstellt …', 'Creating …') : t('Erstellen', 'Create')}
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
  const { t } = useLang();
  const base = `einv-line-${index}`;
  const errors = errorsFor(`lines[${index}]`);
  const cell = (apiKey: string) => errorsFor(`lines[${index}].${apiKey}`).length > 0 ? '!border-[var(--color-danger)]' : '';
  const unitOptions = UNITS.some((u) => u.value === line.unit) ? UNITS : [...UNITS, { value: line.unit, label: line.unit, labelEn: line.unit, code: line.unit }];
  const small = 'input h-11 w-full rounded-xl text-[15px] px-3 bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none';
  const label = 'block text-[12px] font-medium text-[var(--color-text-muted)] mb-1 md:sr-only';
  const removeButton = onRemove && (
    <button
      type="button"
      onClick={onRemove}
      className="w-10 h-10 inline-flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors"
      aria-label={t(`Position ${index + 1} entfernen`, `Remove line item ${index + 1}`)}
    >
      <Trash2 className="w-4 h-4" aria-hidden="true" />
    </button>
  );

  return (
    <li className="rounded-2xl md:rounded-none border md:border-0 border-[var(--color-border)] p-3.5 md:px-3 md:py-2">
      <div className="flex items-center justify-between min-h-[40px] -mt-1 mb-1 md:hidden">
        <span className="text-[13px] font-medium text-[var(--color-text-muted)]">
          {t('Position', 'Line item')} {index + 1}
        </span>
        {removeButton}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-[minmax(0,1fr)_68px_100px_100px_76px_92px_40px] gap-2 items-end md:items-center">
        <div className="col-span-2 md:col-span-1">
          <label htmlFor={`${base}-desc`} className={label}>
            {t('Bezeichnung', 'Description')}
          </label>
          <input
            id={`${base}-desc`}
            value={line.description}
            onChange={(e) => onChange('description', e.target.value)}
            required
            placeholder={t('z. B. Beratung', 'e.g. Consulting')}
            className={`${small} ${cell('description')}`}
          />
        </div>
        <div>
          <label htmlFor={`${base}-qty`} className={label}>
            {t('Menge', 'Quantity')}
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
            {t('Einheit', 'Unit')}
          </label>
          <select id={`${base}-unit`} value={line.unit} onChange={(e) => onChange('unit', e.target.value)} className={`select ${small} ${cell('unit')}`}>
            {unitOptions.map((u) => (
              <option key={u.value} value={u.value}>
                {t(u.label, u.labelEn)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${base}-price`} className={label}>
            {t('Netto/Einh. (€)', 'Net/unit (€)')}
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
            {t('USt.', 'VAT')}
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
          <span className="md:sr-only text-[13px] font-normal text-[var(--color-text-secondary)]">{t('Betrag (netto)', 'Amount (net)')}</span>
          {formatEuro(amount)}
        </p>
        <div className="hidden md:flex justify-end">{removeButton}</div>
      </div>
      {errors.length > 0 && <p className="mt-1.5 text-[12px] leading-snug text-[var(--color-danger)]">{errors.join(' ')}</p>}
    </li>
  );
}

function ResultView({ result, onClose, onVerifyArchive }: { result: CreateResult; onClose: () => void; onVerifyArchive: (id: string) => void }) {
  const { t } = useLang();
  const isPdf = result.format === 'zugferd';
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // The browser's PDF viewer is heavy; only load it once the preview is opened.
  const [previewOpen, setPreviewOpen] = useState(false);

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
              {valid ? t('Ihre E-Rechnung ist fertig', 'Your e-invoice is ready') : t('E-Rechnung erstellt, aber mit Befunden', 'E-invoice created, but with findings')}
            </h3>
            <p className="text-[14px] text-[var(--color-text-secondary)] break-all">
              {result.filename} · {formatBytes(result.blob.size)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => downloadBlob(result.blob, result.filename)} className="btn-brand-primary !min-h-[46px] !px-6">
            <Download className="w-4 h-4" aria-hidden="true" /> {isPdf ? t('ZUGFeRD-PDF herunterladen', 'Download ZUGFeRD PDF') : t('XRechnung herunterladen', 'Download XRechnung')}
          </button>
          <button type="button" onClick={onClose} className="btn-brand-secondary !min-h-[46px]">
            {t('Schließen', 'Close')}
          </button>
        </div>
      </div>

      {result.report ? (
        <ReportView report={result.report} />
      ) : (
        result.headerSummary && (
          <p className="flex items-start gap-2 rounded-xl bg-[var(--color-surface-subtle)] px-4 py-3 text-[14px] text-[var(--color-text-secondary)]">
            <Building2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            {t('Profil', 'Profile')} {result.headerSummary.profile || 'EN 16931'} ·{' '}
            {result.headerSummary.valid ? t('gültig', 'valid') : t('nicht gültig', 'not valid')} · {result.headerSummary.warnings}{' '}
            {t('Hinweise. Den ausführlichen Prüfbericht erhalten Sie im Reiter „Prüfen“.', 'warnings. You get the full validation report in the “Validate” tab.')}
          </p>
        )
      )}

      {previewUrl && (
        <details onToggle={(e) => setPreviewOpen(e.currentTarget.open)} className="group rounded-2xl border border-[var(--color-border)]">
          <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 sm:px-5 py-3.5 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block text-[15px] font-medium text-[var(--color-ink)]">{t('PDF-Vorschau', 'PDF preview')}</span>
              <span className="block text-[12px] text-[var(--color-text-muted)]">
                {t(
                  'Sichtteil der Rechnung; die XML steckt als Anhang „factur-x.xml“ in der Datei',
                  'Visual part of the invoice; the XML is embedded in the file as the “factur-x.xml” attachment'
                )}
              </span>
            </span>
            <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)] transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          {previewOpen && (
            <iframe src={previewUrl} title={t('Vorschau der ZUGFeRD-PDF', 'ZUGFeRD PDF preview')} className="w-full h-[640px] border-t border-[var(--color-border)] rounded-b-2xl" />
          )}
        </details>
      )}

      {result.xml && <XmlViewer xml={result.xml} filename={result.filename.replace(/\.(pdf|xml)$/i, '') + '.xml'} title={isPdf ? t('Eingebettete XML (factur-x.xml)', 'Embedded XML (factur-x.xml)') : 'XRechnung-XML'} />}

      <ArchiveCard archive={result.archive} archiveId={result.archiveId} onVerify={onVerifyArchive} />
    </section>
  );
}
