'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Fingerprint,
  MinusCircle,
  UploadCloud,
  X,
  XCircle,
} from 'lucide-react';
import {
  CHECK_LABELS,
  EINVOICE_MAX_UPLOAD_BYTES,
  EINVOICE_MAX_UPLOAD_MB,
  ISSUE_SOURCE_LABELS,
  type ArchiveInfo,
  type ValidationIssue,
  type ValidationReport,
} from '@/lib/einvoice';
import { useLang, type T } from './i18n';

/* ---------------- Requests ---------------- */

export class EinvoiceRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string,
    public issues: ValidationIssue[] = [],
    public report?: ValidationReport
  ) {
    super(message);
  }
}

const statusMessages = (t: T): Record<number, string> => ({
  401: t('Der E-Rechnungsdienst hat die Anfrage abgelehnt. Bitte versuchen Sie es später erneut.', 'The e-invoice service rejected the request. Please try again later.'),
  404: t('Nicht gefunden.', 'Not found.'),
  413: t(`Die Datei ist zu groß. Erlaubt sind höchstens ${EINVOICE_MAX_UPLOAD_MB} MB pro Datei.`, `The file is too large. The maximum is ${EINVOICE_MAX_UPLOAD_MB} MB per file.`),
  415: t(
    'Dieser Dateityp passt nicht. Erlaubt sind PDF- bzw. XML-Dateien, deren Inhalt zur Dateiendung passt.',
    'This file type is not supported. Allowed are PDF or XML files whose content matches the file extension.'
  ),
  422: t('Die Angaben enthalten Fehler. Bitte prüfen Sie die Hinweise unten.', 'The data contains errors. Please check the notes below.'),
  429: t('Zu viele Anfragen in kurzer Zeit. Bitte warten Sie einen Moment und versuchen Sie es erneut.', 'Too many requests in a short time. Please wait a moment and try again.'),
  502: t(
    'Der E-Rechnungsdienst ist gerade nicht erreichbar. Bitte versuchen Sie es in einigen Minuten erneut.',
    'The e-invoice service is currently unavailable. Please try again in a few minutes.'
  ),
  503: t(
    'Das revisionssichere Archiv ist gerade nicht verfügbar. Aus Sicherheitsgründen wurde nichts erstellt.',
    'The audit-proof archive is currently unavailable. For safety reasons, nothing was created.'
  ),
});

function formatLoc(loc: unknown): string | null {
  if (!Array.isArray(loc)) return null;
  return loc
    .filter((part) => part !== 'body')
    .reduce<string>((path, part) => (typeof part === 'number' ? `${path}[${part}]` : path ? `${path}.${part}` : String(part)), '');
}

/**
 * Calls one of our /api/einvoice/* proxy routes. Non-2xx responses become an EinvoiceRequestError
 * with a message in the current UI language plus the backend's field-level issues (both of its 422 formats).
 */
export async function requestEinvoice(
  url: string,
  init: RequestInit,
  t: T,
  messages: Partial<Record<number, string>> = {}
): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new EinvoiceRequestError(t('Keine Verbindung. Bitte prüfen Sie Ihre Internetverbindung.', 'No connection. Please check your internet connection.'), 0);
  }
  if (res.ok) return res;

  let body: Record<string, unknown> | null = null;
  try {
    body = await res.json();
  } catch {}
  const error = body?.error;
  let detail: string | undefined;
  let issues: ValidationIssue[] = [];
  let report: ValidationReport | undefined;
  if (typeof error === 'string') {
    detail = error;
  } else if (error && typeof error === 'object') {
    const e = error as { message?: string; errors?: ValidationIssue[]; validation?: ValidationReport };
    detail = e.message;
    issues = Array.isArray(e.errors) ? e.errors : [];
    report = e.validation;
  }
  if (Array.isArray(body?.details)) {
    issues = (body.details as { loc?: unknown; msg?: string }[]).map((d) => ({
      rule_id: 'SCHEMA',
      field: formatLoc(d.loc),
      message: (d.msg || t('Ungültiger Wert', 'Invalid value')).replace(/^Value error, /, ''),
      severity: 'error',
      source: 'input',
    }));
  }
  const message = messages[res.status] ?? statusMessages(t)[res.status] ?? t(`Unerwarteter Fehler (HTTP ${res.status}).`, `Unexpected error (HTTP ${res.status}).`);
  throw new EinvoiceRequestError(message, res.status, detail, issues, report);
}

export function filenameFrom(res: Response, fallback: string): string {
  const match = res.headers.get('content-disposition')?.match(/filename="?([^";]+)"?/);
  return match?.[1] || fallback;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '–';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
}

/* ---------------- Layout bits ---------------- */

export const inputClass =
  'input h-11 w-full rounded-xl text-[15px] bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none';

/*
 * Floating-label fields: the label sits inside the empty field and moves to the top edge on focus or
 * once filled, so it never disappears. The example placeholder only shows while the field is focused
 * and empty, so it never overlaps the label. Controls need the `peer` class and must come before the
 * label (see Field).
 */
const fieldBase =
  'peer w-full rounded-xl text-[15px] text-[var(--color-ink)] bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none placeholder:text-transparent focus:placeholder:text-[var(--color-text-muted)]';
export const floatingInputClass = `input h-14 px-3.5 pt-5 pb-1 ${fieldBase}`;
export const floatingSelectClass = `select h-14 pl-3.5 pt-5 pb-1 ${fieldBase}`;
export const floatingTextareaClass = `textarea min-h-[96px] px-3.5 pt-7 pb-2 ${fieldBase}`;

/** Filled green check, readable on light and dark (.surface-dark) backgrounds. */
export function CheckDot({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      className={`rounded-full bg-[var(--color-success)] text-[var(--color-on-brand)] flex items-center justify-center shrink-0 ${size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]'}`}
      aria-hidden="true"
    >
      <Check className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} strokeWidth={3} />
    </span>
  );
}

export function SectionHeader({
  step,
  done,
  title,
  description,
  aside,
}: {
  step?: number;
  /** Turns the step number into a green check once the section's required fields are filled. */
  done?: boolean;
  title: string;
  description?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const { t } = useLang();
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        {step !== undefined && (
          <span
            className={`mt-0.5 w-7 h-7 rounded-full text-[13px] font-semibold flex items-center justify-center shrink-0 transition-colors ${
              done ? 'bg-[var(--color-success)] text-[var(--color-on-brand)]' : 'bg-[var(--color-ink)] text-[var(--color-surface)]'
            }`}
          >
            {done ? <Check className="w-4 h-4" strokeWidth={3} aria-hidden="true" /> : step}
            {done && <span className="sr-only">{t(`Schritt ${step}, vollständig`, `Step ${step}, complete`)}</span>}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-[19px] font-semibold tracking-[-0.015em] text-[var(--color-ink)]">{title}</h3>
          {description && <p className="mt-1 text-[14px] leading-relaxed text-[var(--color-text-secondary)] max-w-2xl">{description}</p>}
        </div>
      </div>
      {aside}
    </div>
  );
}

/** Wraps one control (input/select/textarea with a floating*Class) and renders its floating label. */
export function Field({
  label,
  hint,
  required,
  errors = [],
  className = '',
  children,
  htmlFor,
  floated = false,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  errors?: string[];
  className?: string;
  htmlFor: string;
  children: React.ReactNode;
  /** Keep the label at the top edge: selects, dates and textareas always show content. */
  floated?: boolean;
}) {
  const resting = floated
    ? ''
    : 'peer-[:placeholder-shown:not(:focus)]:top-1/2 peer-[:placeholder-shown:not(:focus)]:-translate-y-1/2 peer-[:placeholder-shown:not(:focus)]:text-[15px] peer-[:placeholder-shown:not(:focus)]:font-normal peer-[:placeholder-shown:not(:focus)]:text-[var(--color-text-muted)]';
  return (
    <div className={className}>
      <div className="relative">
        {children}
        <label
          htmlFor={htmlFor}
          className={`pointer-events-none absolute left-3.5 top-2 max-w-[calc(100%-2.5rem)] truncate text-[12px] font-medium leading-tight text-[var(--color-text-secondary)] transition-all duration-150 peer-focus:text-[var(--color-brand-dark)] ${resting}`}
        >
          {label}
          {required && (
            <span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      </div>
      {errors.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5" id={`${htmlFor}-error`}>
          {errors.map((e) => (
            <li key={e} className="flex items-start gap-1 text-[12px] leading-snug text-[var(--color-danger)]">
              <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" /> {e}
            </li>
          ))}
        </ul>
      ) : (
        hint && <p className="mt-1.5 text-[12px] leading-snug text-[var(--color-text-muted)]">{hint}</p>
      )}
    </div>
  );
}

export function ErrorNotice({ error, onDismiss }: { error: EinvoiceRequestError; onDismiss?: () => void }) {
  const { t } = useLang();
  return (
    <div role="alert" className="rounded-2xl border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 text-[var(--color-danger)] shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">{error.message}</p>
          {error.detail && error.detail !== error.message && (
            <p className="mt-1 text-[13px] text-[var(--color-text-secondary)] break-words">{error.detail}</p>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="w-9 h-9 -mt-1.5 -mr-1.5 inline-flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
            aria-label={t('Hinweis schließen', 'Dismiss')}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {error.issues.length > 0 && (
        <div className="mt-4">
          <IssueList issues={error.issues} tone="danger" />
        </div>
      )}
    </div>
  );
}

/* ---------------- File drop ---------------- */

export function FileDrop({
  id,
  accept,
  extensions,
  title,
  hint,
  file,
  onFile,
  onError,
  disabled,
}: {
  id: string;
  accept: string;
  /** Lower-case extensions incl. dot, checked before upload (the server checks content too). */
  extensions: string[];
  title: string;
  hint: string;
  file: File | null;
  onFile: (file: File | null) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (f: File | undefined) => {
    if (!f) return;
    const ext = f.name.includes('.') ? f.name.slice(f.name.lastIndexOf('.')).toLowerCase() : '';
    if (!extensions.includes(ext)) {
      const allowed = extensions.map((e) => e.slice(1).toUpperCase()).join(', ');
      onError(t(`„${f.name}“ hat kein unterstütztes Format. Erlaubt: ${allowed}.`, `“${f.name}” is not a supported format. Allowed: ${allowed}.`));
      return;
    }
    if (f.size > EINVOICE_MAX_UPLOAD_BYTES) {
      onError(
        t(
          `„${f.name}“ ist ${formatBytes(f.size)} groß. Erlaubt sind höchstens ${EINVOICE_MAX_UPLOAD_MB} MB.`,
          `“${f.name}” is ${formatBytes(f.size)}. The maximum is ${EINVOICE_MAX_UPLOAD_MB} MB.`
        )
      );
      return;
    }
    onFile(f);
  };

  const input = (
    <input
      ref={inputRef}
      id={id}
      type="file"
      accept={accept}
      className="sr-only"
      disabled={disabled}
      onChange={(e) => {
        pick(e.target.files?.[0]);
        e.target.value = '';
      }}
    />
  );

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-success-border)] bg-[var(--color-success-soft)] px-4 py-3">
        {input}
        <span className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-success-border)] flex items-center justify-center shrink-0">
          <FileText className="w-[18px] h-[18px] text-[var(--color-success)]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-[var(--color-ink)] truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-[13px] text-[var(--color-text-secondary)] tabular-nums">{formatBytes(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => onFile(null)}
          disabled={disabled}
          className="w-11 h-11 -mr-1.5 inline-flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-colors disabled:opacity-40"
          aria-label={t(`${file.name} entfernen`, `Remove ${file.name}`)}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      // dragleave also fires when moving onto a child element; only reset when leaving the drop zone.
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) pick(e.dataTransfer.files?.[0]);
      }}
      className={`flex flex-col items-center justify-center gap-1.5 text-center rounded-2xl border border-dashed px-4 py-8 sm:py-10 cursor-pointer transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-brand)] ${
        dragging
          ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]'
          : 'border-[var(--color-border-hover)] bg-[var(--color-surface-subtle)] hover:border-[var(--color-brand)]'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {input}
      <span className="w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
        <UploadCloud className="w-5 h-5 text-[var(--color-brand)]" aria-hidden="true" />
      </span>
      <span className="mt-2 text-[16px] font-semibold text-[var(--color-ink)]">{title}</span>
      <span className="text-[13px] text-[var(--color-text-secondary)] max-w-md">{hint}</span>
      <span className="mt-2 inline-flex items-center min-h-[36px] px-4 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[14px] font-medium text-[var(--color-brand-dark)]">
        <span className="sm:hidden">{t('Datei auswählen', 'Choose file')}</span>
        <span className="hidden sm:inline">{t('Hierher ziehen oder Datei auswählen', 'Drag here or choose a file')}</span>
      </span>
    </label>
  );
}

/* ---------------- Validation report ---------------- */

export function IssueList({ issues, tone }: { issues: ValidationIssue[]; tone: 'danger' | 'warning' }) {
  const { t } = useLang();
  const Icon = tone === 'danger' ? XCircle : AlertTriangle;
  const color = tone === 'danger' ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]';
  return (
    <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      {issues.map((issue, i) => (
        <li key={`${issue.rule_id}-${issue.field}-${i}`} className="flex items-start gap-3 px-4 py-3">
          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-[var(--color-surface-muted)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--color-ink)]">{issue.rule_id}</span>
              {issue.source && (
                <span className="text-[11px] text-[var(--color-text-muted)]">{ISSUE_SOURCE_LABELS[issue.source] ? t(ISSUE_SOURCE_LABELS[issue.source].label, ISSUE_SOURCE_LABELS[issue.source].labelEn) : issue.source}</span>
              )}
              {typeof issue.line === 'number' && <span className="text-[11px] text-[var(--color-text-muted)]">· {t('Zeile', 'Line')} {issue.line}</span>}
            </div>
            <p className="mt-1 text-[14px] leading-snug text-[var(--color-ink)] break-words">{issue.message}</p>
            {issue.field && <p className="mt-1 font-mono text-[11px] text-[var(--color-text-muted)] break-all">{issue.field}</p>}
            {(issue.expected || issue.actual) && (
              <p className="mt-1 text-[12px] text-[var(--color-text-secondary)] tabular-nums">
                {t('Erwartet', 'Expected')} <span className="font-medium text-[var(--color-ink)]">{issue.expected ?? '–'}</span> · {t('erhalten', 'got')}{' '}
                <span className="font-medium text-[var(--color-ink)]">{issue.actual ?? '–'}</span>
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

const CHECK_STATE: Record<string, { icon: typeof Check; className: string; label: string; labelEn: string }> = {
  passed: { icon: CheckCircle2, className: 'text-[var(--color-success)]', label: 'Bestanden', labelEn: 'Passed' },
  failed: { icon: XCircle, className: 'text-[var(--color-danger)]', label: 'Fehlgeschlagen', labelEn: 'Failed' },
  skipped: { icon: MinusCircle, className: 'text-[var(--color-text-muted)]', label: 'Übersprungen', labelEn: 'Skipped' },
};

export function ReportView({ report, title }: { report: ValidationReport; title?: string }) {
  const { t } = useLang();
  const valid = report.valid;
  const meta = [report.profile, report.version, report.syntax].filter(Boolean).join(' · ');
  return (
    <div className="space-y-5">
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 sm:p-5 ${
          valid ? 'border-[var(--color-success-border)] bg-[var(--color-success-soft)]' : 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)]'
        }`}
      >
        {valid ? (
          <CheckCircle2 className="w-7 h-7 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
        ) : (
          <XCircle className="w-7 h-7 shrink-0 text-[var(--color-danger)]" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <p className="text-[19px] font-semibold tracking-[-0.015em] text-[var(--color-ink)]">
            {title ?? (valid ? t('Gültige E-Rechnung', 'Valid e-invoice') : t('E-Rechnung ist nicht gültig', 'E-invoice is not valid'))}
          </p>
          <p className="mt-0.5 text-[14px] text-[var(--color-text-secondary)]">
            {valid
              ? t('Alle Pflichtprüfungen nach EN 16931 wurden bestanden.', 'All mandatory EN 16931 checks passed.')
              : t(
                  `${report.errors.length} Fehler gefunden. Die Details stehen unten.`,
                  `${report.errors.length} error${report.errors.length === 1 ? '' : 's'} found. See the details below.`
                )}
            {report.warnings.length > 0 &&
              t(
                ` ${report.warnings.length} Hinweis${report.warnings.length === 1 ? '' : 'e'}.`,
                ` ${report.warnings.length} warning${report.warnings.length === 1 ? '' : 's'}.`
              )}
          </p>
          {meta && <p className="mt-1.5 text-[13px] text-[var(--color-text-muted)] break-words">{meta}</p>}
        </div>
      </div>

      {Object.keys(report.checks).length > 0 && (
        <div>
          <p className="text-[13px] font-medium text-[var(--color-text-muted)] mb-2">{t('Prüfschritte', 'Checks')}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(report.checks).map(([key, state]) => {
              const s = CHECK_STATE[state] ?? CHECK_STATE.skipped;
              const info = CHECK_LABELS[key] ?? { label: key, hint: '', labelEn: key, hintEn: '' };
              return (
                <li key={key} className="flex items-start gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3">
                  <s.icon className={`w-[18px] h-[18px] mt-px shrink-0 ${s.className}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-[var(--color-ink)]">
                      {t(info.label, info.labelEn)} <span className={`text-[12px] font-normal ${s.className}`}>· {t(s.label, s.labelEn)}</span>
                    </p>
                    {info.hint && <p className="text-[12px] leading-snug text-[var(--color-text-muted)]">{t(info.hint, info.hintEn)}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {report.errors.length > 0 && (
        <div>
          <p className="text-[13px] font-medium text-[var(--color-text-muted)] mb-2">{t('Fehler', 'Errors')} ({report.errors.length})</p>
          <IssueList issues={report.errors} tone="danger" />
        </div>
      )}
      {report.warnings.length > 0 && (
        <div>
          <p className="text-[13px] font-medium text-[var(--color-text-muted)] mb-2">{t('Hinweise', 'Warnings')} ({report.warnings.length})</p>
          <IssueList issues={report.warnings} tone="warning" />
        </div>
      )}
      {report.validated_at && <p className="text-[12px] text-[var(--color-text-muted)]">{t('Geprüft am', 'Validated on')} {formatDateTime(report.validated_at)}</p>}
    </div>
  );
}

/* ---------------- XML viewer ---------------- */

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-full text-[13px] font-medium text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)] transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
      {copied ? t('Kopiert', 'Copied') : (label ?? t('Kopieren', 'Copy'))}
    </button>
  );
}

export function XmlViewer({ xml, filename, title }: { xml: string; filename: string; title?: string }) {
  const { t } = useLang();
  // XML can be several MB: count once, and only put it in the DOM while the panel is open.
  const lines = useMemo(() => xml.split('\n').length, [xml]);
  const size = useMemo(() => new Blob([xml]).size, [xml]);
  const [open, setOpen] = useState(false);
  return (
    <details
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 sm:px-5 py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-[15px] font-medium text-[var(--color-ink)]">{title ?? t('XML-Daten', 'XML data')}</span>
          <span className="block text-[12px] text-[var(--color-text-muted)]">
            {lines} {t('Zeilen', 'lines')} · {formatBytes(size)} · {t('maschinenlesbarer Teil der E-Rechnung', 'machine-readable part of the e-invoice')}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)] transition-transform group-open:rotate-180 shrink-0" aria-hidden="true" />
      </summary>
      {open && (
        <div className="border-t border-[var(--color-border)]">
          <div className="flex flex-wrap justify-end gap-1 px-3 py-2">
            <CopyButton text={xml} />
            <button
              type="button"
              onClick={() => downloadBlob(new Blob([xml], { type: 'application/xml' }), filename)}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-full text-[13px] font-medium text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)] transition-colors"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" /> {t('XML herunterladen', 'Download XML')}
            </button>
          </div>
          <pre className="max-h-[420px] overflow-auto px-4 sm:px-5 pb-4 font-mono text-[12px] leading-[1.6] text-[var(--color-ink)] whitespace-pre">{xml}</pre>
        </div>
      )}
    </details>
  );
}

/* ---------------- Archive ---------------- */

export const ARCHIVE_ROLE_LABELS: Record<string, { label: string; labelEn: string }> = {
  input_json: { label: 'Eingabedaten (JSON)', labelEn: 'Input data (JSON)' },
  original_pdf: { label: 'Original-PDF', labelEn: 'Original PDF' },
  uploaded_document: { label: 'Hochgeladenes Dokument', labelEn: 'Uploaded document' },
  generated_pdf: { label: 'Erzeugtes ZUGFeRD-PDF', labelEn: 'Generated ZUGFeRD PDF' },
  generated_xml: { label: 'Erzeugte XRechnung (XML)', labelEn: 'Generated XRechnung (XML)' },
};

export function ArchiveFiles({ files }: { files: ArchiveInfo['files'] }) {
  const { t } = useLang();
  return (
    <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
      {files.map((f) => (
        <li key={f.filename} className="px-3.5 py-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="text-[13px] font-medium text-[var(--color-ink)]">{ARCHIVE_ROLE_LABELS[f.role] ? t(ARCHIVE_ROLE_LABELS[f.role].label, ARCHIVE_ROLE_LABELS[f.role].labelEn) : f.role}</p>
            <p className="text-[12px] text-[var(--color-text-muted)] tabular-nums">{formatBytes(f.size)}</p>
          </div>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)] break-all" title={f.sha256}>
            SHA-256 {f.sha256}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** Archive receipt shown after create/extract, with a jump to the integrity check. */
export function ArchiveCard({
  archive,
  archiveId,
  onVerify,
}: {
  archive?: ArchiveInfo | null;
  archiveId?: string | null;
  onVerify: (id: string) => void;
}) {
  const { t } = useLang();
  const id = archive?.archive_id ?? archiveId;
  if (!id) return null;
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Fingerprint className="w-5 h-5 mt-0.5 text-[var(--color-ink)] shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[15px] font-medium text-[var(--color-ink)]">{t('Revisionssicher archiviert (GoBD)', 'Archived audit-proof (GoBD)')}</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              {t('Unveränderte Kopie mit SHA-256-Prüfsummen', 'Unaltered copy with SHA-256 checksums')}
              {archive ? t(`, am ${formatDateTime(archive.archived_at)}`, `, on ${formatDateTime(archive.archived_at)}`) : ''}.
            </p>
            <p className="mt-1 font-mono text-[12px] text-[var(--color-ink)] break-all">{id}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <CopyButton text={id} label={t('ID kopieren', 'Copy ID')} />
          <button type="button" onClick={() => onVerify(id)} className="btn-brand-ghost !min-h-[36px] !px-4 !text-[13px]">
            {t('Integrität prüfen', 'Verify integrity')}
          </button>
        </div>
      </div>
      {archive && archive.files.length > 0 && <ArchiveFiles files={archive.files} />}
    </div>
  );
}
