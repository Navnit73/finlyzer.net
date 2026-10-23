'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  TableProperties,
  BadgeCheck,
  KeyRound,
  FileText,
  Lock,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Trash2,
  BrainCircuit,
  RotateCcw,
} from 'lucide-react';
import { DocumentType, SupportedLanguage } from '@/types/ocr';
import AuthModal from '@/components/auth/LazyAuthModal';
import PdfPasswordModal from '@/components/ocr/PdfPasswordModal';
import { FREE_PAGE_LIMIT, GUEST_MAX_PAGES, PRICING_PLANS } from '@/types/pricing';
import { GUEST_RETENTION_HOURS } from '@/lib/retention';

const GUEST_UNLOCK_PRICE_USD = PRICING_PLANS.find((p) => p.id === 'guest_doc_unlock')?.price_usd ?? 10;

export const UPLOAD_INPUT_ID = 'bank-statement-file-input';

// Each format chip gets its own tint from the design tokens so the row reads as a set, not a wall of grey.
const EXPORT_FORMATS: { name: string; tone: string }[] = [
  { name: 'Excel', tone: 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)]' },
  { name: 'CSV', tone: 'bg-[var(--color-brand-soft)] border-[var(--color-info-border)] text-[var(--color-brand-dark)]' },
  { name: 'QuickBooks', tone: 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)]' },
  { name: 'Xero', tone: 'bg-[var(--color-brand-soft)] border-[var(--color-info-border)] text-[var(--color-brand-dark)]' },
  { name: 'Quicken', tone: 'bg-[var(--color-warning-soft)] border-[var(--color-warning-border)] text-[var(--color-warning)]' },
  { name: 'PDF', tone: 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)] text-[var(--color-danger)]' },
];

const STATEMENT_ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.tiff';
const SPREADSHEET_ACCEPT = '.csv,.xlsx,.xls';

const DEFAULT_BENEFITS = [
  'Debits, credits & balances in separate columns',
  'Running balance checked against your statement',
  'Scanned and password-protected PDFs supported',
];

interface ConverterHeroProps {
  badge?: string;
  title?: string;
  description?: string;
  benefits?: string[];
  /** Label for the main button, e.g. "Choose Chase Statement". */
  ctaLabel?: string;
  documentType?: DocumentType;
  /** Also accept CSV / Excel files (spreadsheet-to-QBO pages). */
  acceptSpreadsheets?: boolean;
}

/**
 * Upload hero shared by the homepage and every /convert/[slug] landing page:
 * copy on the left, upload card on the right (stacked on mobile).
 */
export default function ConverterHero({
  badge,
  title = 'Bank Statement Converter',
  description = 'Convert PDF and scanned bank statements into Excel, CSV, QuickBooks (QBO), OFX or QIF files. Every transaction is extracted and checked against the statement balance before you download.',
  benefits = DEFAULT_BENEFITS,
  ctaLabel = 'Choose Bank Statement',
  documentType = 'auto',
  acceptSpreadsheets = false,
}: ConverterHeroProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [estimatedPages, setEstimatedPages] = useState<number>(1);
  const [isDetectingPages, setIsDetectingPages] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [language] = useState<SupportedLanguage>('en');
  const [cleanWithAi] = useState<boolean>(true);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [pendingPassword, setPendingPassword] = useState<string | undefined>(undefined);

  // Client-side quick page detection for PDFs
  const detectPdfPages = async (file: File): Promise<number> => {
    if (!file.name.toLowerCase().endsWith('.pdf')) return 1;
    try {
      const buffer = await file.slice(0, 500000).arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      const matches = text.match(/\/Type\s*\/Page[^s]/g);
      if (matches && matches.length > 0) {
        return matches.length;
      }
      const countMatch = text.match(/\/Count\s+(\d+)/);
      if (countMatch && countMatch[1]) {
        return parseInt(countMatch[1], 10);
      }
    } catch {
      // Ignore detection errors
    }
    return 1;
  };

  const processDocument = async (file: File, pages: number, customPassword?: string) => {
    if (pages > GUEST_MAX_PAGES) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setProgressStage(acceptSpreadsheets ? 'Uploading file...' : 'Uploading statement...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('language', language);
      formData.append('clean_with_ai', cleanWithAi ? 'true' : 'false');
      formData.append('page_count', pages.toString());

      const activePassword = customPassword || pendingPassword;
      if (activePassword) {
        formData.append('password', activePassword);
      }

      setProgressStage('Extracting transactions & checking balances...');
      const response = await fetch('/api/ocr/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'PASSWORD_REQUIRED' || data.requires_password) {
          setIsPasswordModalOpen(true);
          setIsUploading(false);
          return;
        }

        if (data.code === 'LOGIN_REQUIRED') {
          setIsAuthModalOpen(true);
          setIsUploading(false);
          return;
        }

        throw new Error(data.detail || data.error || 'Failed to extract document');
      }

      setProgressStage('Done! Opening your transactions...');

      // Save to instant sessionStorage for fast initial render
      if (data?.id && typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('doc_' + data.id, JSON.stringify(data));
        } catch {}
      }

      if (data?.id) {
        router.push(`/document/${data.id}`);
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Extraction failed. Please try again.');
      setIsUploading(false);
    }
  };

  // Picking a file starts the conversion right away: one action instead of two.
  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setPendingPassword(undefined);
    setIsDetectingPages(true);

    const pages = await detectPdfPages(file);
    setEstimatedPages(pages);
    setIsDetectingPages(false);

    if (pages > GUEST_MAX_PAGES) {
      setIsAuthModalOpen(true);
      return;
    }
    processDocument(file, pages);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const openFilePicker = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setEstimatedPages(1);
    setErrorMessage(null);
    setPendingPassword(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isBusy = isUploading || isDetectingPages;

  const uploadCard = (
    <div className="card-surface w-full p-3 sm:p-6 !rounded-[18px] !border-[var(--color-info-border)]">
      <input
        ref={fileInputRef}
        id={UPLOAD_INPUT_ID}
        name="bank_statement_file"
        type="file"
        accept={acceptSpreadsheets ? `${SPREADSHEET_ACCEPT},${STATEMENT_ACCEPT}` : STATEMENT_ACCEPT}
        className="hidden"
        aria-label={acceptSpreadsheets ? 'Upload CSV, Excel or PDF file' : 'Upload PDF bank statement or scanned document'}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={acceptSpreadsheets ? 'Choose or drag and drop a CSV, Excel or PDF file to convert' : 'Choose or drag and drop a bank statement PDF to convert'}
        aria-busy={isBusy}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={openFilePicker}
        className={`rounded-xl border-2 border-dashed px-4 py-8 sm:py-14 text-center transition-colors flex flex-col items-center justify-center gap-3 ${
          isBusy ? 'cursor-progress' : 'cursor-pointer'
        } ${
          isDragging
            ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]'
            : 'border-[var(--color-info-border)] bg-[var(--color-brand-soft)] hover:border-[var(--color-brand)]'
        }`}
      >
        {isBusy && selectedFile ? (
          <div className="flex flex-col items-center gap-3 w-full" aria-live="polite">
            <span className="loading loading-spinner loading-lg text-[var(--color-brand)]" />
            <p className="text-base font-semibold text-[var(--color-ink)]">
              {isDetectingPages ? 'Reading your file...' : progressStage || 'Converting...'}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] truncate max-w-full px-2" title={selectedFile.name}>
              {selectedFile.name}
              {!isDetectingPages && ` · ${estimatedPages} page${estimatedPages === 1 ? '' : 's'}`}
            </p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-info-border)] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[var(--color-brand-dark)]" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-[var(--color-ink)] truncate max-w-full px-2" title={selectedFile.name}>
              {selectedFile.name}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {estimatedPages} page{estimatedPages === 1 ? '' : 's'}
            </p>
            <button
              type="button"
              onClick={handleClearFile}
              className="link mt-1 text-sm font-medium min-h-[44px] px-3"
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-info-border)] flex items-center justify-center">
              <UploadCloud className="w-7 h-7 text-[var(--color-brand)]" aria-hidden="true" />
            </div>
            <p className="text-lg sm:text-xl font-semibold text-[var(--color-ink)]">
              {acceptSpreadsheets ? 'Drop your CSV or Excel file here, or browse' : 'Drop your bank statement here, or browse'}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {acceptSpreadsheets ? 'CSV, XLSX, XLS or PDF · up to 50 MB' : 'PDF, scanned PNG / JPG / TIFF · up to 50 MB'}
            </p>
            <span className="btn-brand-primary mt-1 w-full sm:w-auto !min-h-[50px] !px-8 !text-[17px] pointer-events-none">
              <span>{ctaLabel}</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </span>
          </>
        )}
      </div>

      {/* Tier guidance for the picked file */}
      {selectedFile && !isDetectingPages && estimatedPages > FREE_PAGE_LIMIT && (
        <div className="mt-3">
          {estimatedPages <= GUEST_MAX_PAGES ? (
            <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                <strong>{estimatedPages} pages:</strong> preview free, then a one-time ${GUEST_UNLOCK_PRICE_USD} unlock for all export formats.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[var(--color-warning-soft)] border border-[var(--color-warning-border)] flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-[var(--color-ink)]">
              <div className="flex items-start gap-2.5 flex-1">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-warning)]" aria-hidden="true" />
                <p>
                  <strong>{estimatedPages} pages</strong> is above the {GUEST_MAX_PAGES}-page guest limit. Sign in free to convert up to 200 pages.
                </p>
              </div>
              <button type="button" onClick={() => setIsAuthModalOpen(true)} className="btn-brand-dark shrink-0">
                Sign In Free
              </button>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 p-3 rounded-lg bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-[var(--color-danger)]" role="alert">
          <div className="flex items-start gap-2.5 flex-1">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
          {selectedFile && (
            <button
              type="button"
              onClick={() => processDocument(selectedFile, estimatedPages)}
              className="btn-brand-dark shrink-0"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}

      {/* Trust row */}
      <ul className="mt-4 px-1 flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-x-6 gap-y-2 text-[13px] text-[var(--color-text-secondary)]">
        <li className="flex items-center gap-1.5 sm:justify-center">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
          <span>Encrypted upload (HTTPS)</span>
        </li>
        <li className="flex items-center gap-1.5 sm:justify-center">
          <Trash2 className="w-4 h-4 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
          <span>Auto-deleted in {GUEST_RETENTION_HOURS}h</span>
        </li>
        <li className="flex items-center gap-1.5 sm:justify-center">
          <BrainCircuit className="w-4 h-4 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
          <span>Never used for AI training</span>
        </li>
      </ul>
    </div>
  );

  const benefitIcons = [TableProperties, BadgeCheck, KeyRound];
  const titleWords = title.split(' ');
  const titleLead = titleWords.slice(0, -1).join(' ');
  const titleAccent = titleWords[titleWords.length - 1];

  return (
    <section
      id="upload"
      aria-labelledby="hero-title"
      className="w-full scroll-mt-24 pb-10 sm:pb-16 bg-[var(--color-surface-subtle)] shadow-[0_0_0_100vmax_var(--color-surface-subtle)] [clip-path:inset(0_-100vmax)]"
    >
      {/* Centered flow: badge → H1 → lead → upload card → benefit cards → formats & pricing. */}
      <div className="pt-6 sm:pt-12 lg:pt-16 text-center">
        {badge && (
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-soft)] border border-[var(--color-info-border)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-brand-dark)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
            {badge}
          </p>
        )}
        <h1 id="hero-title" className="type-hero !text-[clamp(2rem,6.5vw,3.5rem)] max-w-4xl mx-auto text-balance">
          {titleLead}{' '}
          <span className="text-[var(--color-brand)]">{titleAccent}</span>
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-[13px] sm:text-[15px] leading-relaxed text-[var(--color-text-secondary)]">{description}</p>

        <div className="mt-7 sm:mt-10 max-w-3xl mx-auto text-left">{uploadCard}</div>

        <ul className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-left">
          {benefits.map((benefit, i) => {
            const BenefitIcon = benefitIcons[i % benefitIcons.length];
            return (
              <li
                key={benefit}
                className="card-surface flex items-start gap-3.5 p-4 sm:p-5"
              >
                <span className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] flex items-center justify-center shrink-0">
                  <BenefitIcon className="w-5 h-5 text-[var(--color-brand-dark)]" aria-hidden="true" />
                </span>
                <span className="text-base font-medium text-[var(--color-ink)] leading-snug pt-1.5">{benefit}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-4">
          <div>
            <p className="text-[13px] font-medium text-[var(--color-text-muted)]">Export to</p>
            <ul className="mt-2.5 flex flex-wrap justify-center gap-2">
              {EXPORT_FORMATS.map((fmt) => (
                <li
                  key={fmt.name}
                  className={`px-3 py-1 rounded-full border text-[13px] font-medium ${fmt.tone}`}
                >
                  {fmt.name}
                </li>
              ))}
            </ul>
          </div>

          <p className="rounded-lg bg-[var(--color-info-soft)] border border-[var(--color-info-border)] px-3 py-2 text-[13px] text-[var(--color-text-secondary)]">
            {FREE_PAGE_LIMIT + 1}–{GUEST_MAX_PAGES} pages: free preview, ${GUEST_UNLOCK_PRICE_USD} to download · {GUEST_MAX_PAGES}+ pages: free account.{' '}
            <Link href="/pricing" className="link">
              See pricing
            </Link>
          </p>
        </div>
      </div>

      {/* Password Modal */}
      <PdfPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmitPassword={(pass: string) => {
          setPendingPassword(pass);
          setIsPasswordModalOpen(false);
          if (selectedFile) processDocument(selectedFile, estimatedPages, pass);
        }}
        filename={selectedFile?.name || 'Protected Statement.pdf'}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="page_limit"
        pageCount={estimatedPages}
      />
    </section>
  );
}
