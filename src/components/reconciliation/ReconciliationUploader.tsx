'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Landmark,
  Lock,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  X,
} from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import PdfPasswordModal from '@/components/ocr/PdfPasswordModal';
import { UPLOAD_INPUT_ID } from '@/components/converter/ConverterHero';
import { inspectPdfFile } from '@/lib/pdf-helper';
import { saveReconciliationToken } from '@/lib/reconciliation-client';
import { FREE_PAGE_LIMIT, GUEST_MAX_PAGES, PRICING_PLANS } from '@/types/pricing';
import { APP_RECONCILIATIONS } from '@/lib/routes';
import { RECON_MAX_TOTAL_MB, unsupportedFileMessage } from '@/lib/reconciliation-limits';

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.tif,.tiff,.csv,.xlsx';
const PASS_PRICE = PRICING_PLANS.find((p) => p.id === 'guest_doc_unlock')?.price_usd ?? 10;

interface PickedFile {
  file: File;
  pages: number;
  /** Set after the user enters it for a password-protected PDF; only sent with the upload. */
  password?: string;
}

type DocumentRole = 'bank_statement' | 'business_ledger';

/** Estimates pages for guidance only; the server counts again before applying limits. */
async function estimatePages(file: File): Promise<number> {
  const result = await inspectPdfFile(file);
  return result.isPdf ? Math.max(1, result.pageCount) : 1;
}

function FileSlot({
  inputId,
  label,
  hint,
  icon: Icon,
  picked,
  disabled,
  onPick,
  onClear,
}: {
  inputId?: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  picked: PickedFile | null;
  disabled: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const open = () => !disabled && inputRef.current?.click();

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="hidden"
        aria-label={`Upload ${label.toLowerCase()}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = '';
        }}
      />
      {picked ? (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-3">
          <span className="w-10 h-10 rounded-lg bg-[var(--media-violet)] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[var(--color-on-dark)]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
            <p className="text-sm font-semibold text-[var(--color-ink)] truncate" title={picked.file.name}>
              {picked.file.name}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {(picked.file.size / (1024 * 1024)).toFixed(2)} MB · {picked.pages} page{picked.pages === 1 ? '' : 's'}
              {picked.password && (
                <span className="inline-flex items-center gap-1 ml-1.5 font-semibold text-[var(--color-ink)]">
                  · <Lock className="w-3 h-3" aria-hidden="true" /> Password added
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="p-2.5 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40"
            aria-label={`Remove ${label.toLowerCase()}`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Choose or drag and drop your ${label.toLowerCase()}`}
          onClick={open}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              open();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file && !disabled) onPick(file);
          }}
          className={`rounded-lg border-2 border-dashed p-4 flex items-center gap-3 cursor-pointer transition-colors ${
            isDragging
              ? 'border-[var(--media-violet)] bg-[var(--media-violet-hover)]'
              : 'border-[var(--media-violet-border)] bg-[var(--media-violet-soft)] hover:border-[var(--media-violet)] hover:bg-[var(--media-violet-hover)]'
          }`}
        >
          <span className="w-10 h-10 rounded-full bg-[var(--media-violet)] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-[var(--color-on-dark)]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-bold text-[var(--media-violet-text)]">{label}</p>
            <p className="text-xs text-[var(--media-violet-text)]/80">{hint}</p>
          </div>
          <Upload className="w-5 h-5 text-[var(--media-violet-text)] shrink-0" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

/**
 * Two-file upload card (bank statement + business ledger) with matching options and page-limit
 * guidance. Used by the /reconcile landing pages (guests) and the /reconciliations app page.
 * On success it opens /reconciliation/[id] for the live report.
 */
export default function ReconciliationUploader({ layout = 'stacked' }: { layout?: 'stacked' | 'split' }) {
  const router = useRouter();
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const [bank, setBank] = useState<PickedFile | null>(null);
  const [ledger, setLedger] = useState<PickedFile | null>(null);
  const [tolerance, setTolerance] = useState(2);
  const [descriptionMatching, setDescriptionMatching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; showPricing?: boolean } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // Page count from the server's LOGIN_REQUIRED answer, which can differ from the browser estimate.
  const [serverPages, setServerPages] = useState<number | null>(null);
  // Which file the server asked a PDF password for, and the error to show (wrong password).
  const [passwordPrompt, setPasswordPrompt] = useState<{ document: DocumentRole; error: string | null } | null>(null);

  const totalPages = (bank?.pages ?? 0) + (ledger?.pages ?? 0);
  const totalMb = ((bank?.file.size ?? 0) + (ledger?.file.size ?? 0)) / (1024 * 1024);
  const tooLarge = totalMb > RECON_MAX_TOTAL_MB;
  const needsLogin = !isLoggedIn && (serverPages ?? totalPages) > GUEST_MAX_PAGES;

  const pick = (setter: (p: PickedFile | null) => void, label: string) => async (file: File) => {
    setError(null);
    setServerPages(null);
    const typeError = unsupportedFileMessage(file.name, label);
    if (typeError) {
      setError({ message: typeError });
      return;
    }
    setter({ file, pages: await estimatePages(file) });
  };

  /** Uploads both files. Takes the files explicitly so a just-entered password is used right away. */
  const submit = async (bankFile = bank, ledgerFile = ledger) => {
    if (!bankFile || !ledgerFile || tooLarge) return;
    if (needsLogin) {
      setIsAuthOpen(true);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('bank_statement', bankFile.file);
      form.append('business_ledger', ledgerFile.file);
      form.append('date_tolerance_days', String(tolerance));
      form.append('description_matching', descriptionMatching ? 'true' : 'false');
      if (bankFile.password) form.append('bank_statement_password', bankFile.password);
      if (ledgerFile.password) form.append('business_ledger_password', ledgerFile.password);

      const res = await fetch('/api/reconciliation/upload', { method: 'POST', body: form });
      // Errors from the web server in front of the app (e.g. a 413 page) are not JSON.
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.code === 'PASSWORD_REQUIRED' || data.code === 'PASSWORD_INCORRECT') {
          setPasswordPrompt({
            document: data.document === 'business_ledger' ? 'business_ledger' : 'bank_statement',
            error: data.code === 'PASSWORD_INCORRECT' ? data.error : null,
          });
          setIsSubmitting(false);
          return;
        }
        if (data.code === 'LOGIN_REQUIRED') {
          if (typeof data.pages === 'number') setServerPages(data.pages);
          setIsAuthOpen(true);
          setIsSubmitting(false);
          return;
        }
        const fallback =
          res.status === 413
            ? `The two files together must be under ${RECON_MAX_TOTAL_MB} MB.`
            : res.status === 429
              ? 'Too many requests right now. Please wait a minute and try again.'
              : 'Upload failed. Please try again.';
        setError({ message: data.error || fallback, showPricing: data.code === 'QUOTA_EXCEEDED' });
        setIsSubmitting(false);
        return;
      }

      setPasswordPrompt(null);
      if (data.access_token) saveReconciliationToken(data.reconciliation_id, data.access_token);
      router.push(`/reconciliation/${data.reconciliation_id}`);
    } catch {
      setError({ message: 'Upload failed. Check your connection and try again.' });
      setIsSubmitting(false);
    }
  };

  const submitPassword = (password: string) => {
    if (!passwordPrompt || !bank || !ledger) return;
    const nextBank = passwordPrompt.document === 'bank_statement' ? { ...bank, password } : bank;
    const nextLedger = passwordPrompt.document === 'business_ledger' ? { ...ledger, password } : ledger;
    setBank(nextBank);
    setLedger(nextLedger);
    submit(nextBank, nextLedger);
  };
  const promptFile = passwordPrompt?.document === 'business_ledger' ? ledger : bank;

  return (
    <div
      className={`w-full rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3 sm:p-5 space-y-3 ${
        layout === 'stacked' ? 'shadow-[0_12px_40px_-16px_rgba(23,23,23,0.18)]' : ''
      }`}
    >
      <div className={layout === 'split' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}>
      <FileSlot
        inputId={UPLOAD_INPUT_ID}
        label="Bank statement"
        hint="PDF, scan, photo, CSV or XLSX"
        icon={Landmark}
        picked={bank}
        disabled={isSubmitting}
        onPick={pick(setBank, 'Bank statement')}
        onClear={() => { setBank(null); setServerPages(null); }}
      />
      <FileSlot
        label="Business ledger / cash book"
        hint="Excel (.xlsx), CSV or PDF export"
        icon={BookOpen}
        picked={ledger}
        disabled={isSubmitting}
        onPick={pick(setLedger, 'Business ledger')}
        onClear={() => { setLedger(null); setServerPages(null); }}
      />
      </div>

      <details className="group rounded-lg border border-[var(--color-border)] px-3 [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex items-center gap-2 min-h-[44px] cursor-pointer list-none text-sm font-semibold text-[var(--color-ink)]">
          <SlidersHorizontal className="w-4 h-4 text-[var(--color-text-secondary)]" aria-hidden="true" />
          Matching options
          <span className="ml-auto text-xs font-normal text-[var(--color-text-muted)]">
            ±{tolerance} day{tolerance === 1 ? '' : 's'} · descriptions {descriptionMatching ? 'on' : 'off'}
          </span>
        </summary>
        <div className="pb-3 space-y-3">
          <label className="flex items-center justify-between gap-3 text-sm text-[var(--color-ink)]">
            <span>
              Date tolerance
              <span className="block text-xs text-[var(--color-text-secondary)]">Max days between bank and ledger dates</span>
            </span>
            <select
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              disabled={isSubmitting}
              className="select select-sm w-28 bg-[var(--color-surface)] border-[var(--color-border)]"
            >
              {[0, 1, 2, 3, 5, 7, 10, 14, 31].map((d) => (
                <option key={d} value={d}>
                  {d === 0 ? 'Same day' : `±${d} day${d === 1 ? '' : 's'}`}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center justify-between gap-3 text-sm text-[var(--color-ink)] cursor-pointer">
            <span>
              Use descriptions when scoring
              <span className="block text-xs text-[var(--color-text-secondary)]">Helps pick between entries with the same amount</span>
            </span>
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={descriptionMatching}
              onChange={(e) => setDescriptionMatching(e.target.checked)}
              disabled={isSubmitting}
            />
          </label>
        </div>
      </details>

      {bank && ledger && totalPages > FREE_PAGE_LIMIT && (
        isLoggedIn ? (
          <p className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-ink)]">
            <strong>{totalPages} pages</strong> will be taken from your page credits once the report is ready.
          </p>
        ) : needsLogin ? (
          <div className="p-3 rounded-lg bg-[var(--color-warning-soft)] border border-[var(--color-warning-border)] flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-warning)]" aria-hidden="true" />
            <p>
              <strong>{totalPages} pages</strong> in total is above the {GUEST_MAX_PAGES}-page guest limit. Sign in free to reconcile longer documents.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>{totalPages} pages</strong> in total: see the summary free, then a one-time ${PASS_PRICE} unlock for every transaction and the Excel / CSV report.
            </p>
          </div>
        )
      )}

      {tooLarge && (
        <div role="alert" className="p-3 rounded-lg bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] flex items-start gap-2.5 text-sm text-[var(--color-danger)]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            These files add up to {totalMb.toFixed(1)} MB. The two files together must be under {RECON_MAX_TOTAL_MB} MB; a CSV or Excel export
            of the ledger is usually much smaller than a PDF.
          </span>
        </div>
      )}

      {error && (
        <div role="alert" className="p-3 rounded-lg bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] flex items-start gap-2.5 text-sm text-[var(--color-danger)]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            {error.message}{' '}
            {error.showPricing && (
              <Link href="/pricing" className="font-semibold underline underline-offset-4">
                Buy page credits
              </Link>
            )}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => submit()}
        disabled={!bank || !ledger || isSubmitting || tooLarge}
        aria-busy={isSubmitting}
        className="btn-brand-primary w-full !min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner loading-sm" aria-hidden="true" />
            <span>Uploading both files…</span>
          </>
        ) : needsLogin ? (
          <>
            <span>Sign In to Reconcile</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </>
        ) : (
          <>
            <span>{bank && ledger ? 'Reconcile Now' : 'Add Both Files to Reconcile'}</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </>
        )}
      </button>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-[13px] text-[var(--color-text-secondary)]">
        <li className="flex items-center gap-1.5 sm:justify-center">
          <ShieldCheck className="w-4 h-4 text-[var(--color-ink)] shrink-0" aria-hidden="true" />
          <span>Encrypted upload (HTTPS)</span>
        </li>
        <li className="flex items-center gap-1.5 sm:justify-center">
          <CheckCircle2 className="w-4 h-4 text-[var(--color-ink)] shrink-0" aria-hidden="true" />
          <span>Matching is rule-based, not AI</span>
        </li>
      </ul>

      <PdfPasswordModal
        // Remount per file so a password typed for one file never pre-fills the other.
        key={passwordPrompt?.document ?? 'none'}
        isOpen={passwordPrompt !== null}
        filename={promptFile?.file.name ?? 'document.pdf'}
        errorMessage={passwordPrompt?.error}
        isLoading={isSubmitting}
        onClose={() => setPasswordPrompt(null)}
        onSubmitPassword={submitPassword}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        reason="reconciliation"
        pageCount={serverPages ?? totalPages}
        redirectUrl={APP_RECONCILIATIONS}
      />
    </div>
  );
}
