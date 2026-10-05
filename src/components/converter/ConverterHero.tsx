'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Trash2,
  BrainCircuit,
  RotateCcw,
} from 'lucide-react';
import { DocumentType, SupportedLanguage } from '@/types/ocr';
import AuthModal from '@/components/auth/AuthModal';
import PdfPasswordModal from '@/components/ocr/PdfPasswordModal';

export const UPLOAD_INPUT_ID = 'bank-statement-file-input';

const EXPORT_FORMATS = ['Excel', 'CSV', 'QuickBooks', 'Xero', 'Quicken', 'PDF'];

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
}

/**
 * Upload hero shared by the homepage and every /convert/[slug] landing page:
 * copy on the left, upload card on the right (stacked on mobile).
 */
export default function ConverterHero({
  badge = 'Free bank statement converter · No signup',
  title = 'Convert Bank Statements to Excel, CSV & QuickBooks',
  description = 'Upload a PDF or scanned bank statement and download clean transactions in seconds. Free for statements up to 10 pages.',
  benefits = DEFAULT_BENEFITS,
  ctaLabel = 'Choose Bank Statement',
  documentType = 'auto',
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
    if (pages > 30) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setProgressStage('Uploading statement...');

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

    if (pages > 30) {
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
    <div className="w-full rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3 sm:p-5 shadow-[0_12px_40px_-16px_rgba(23,23,23,0.18)]">
      <input
        ref={fileInputRef}
        id={UPLOAD_INPUT_ID}
        name="bank_statement_file"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff"
        className="hidden"
        aria-label="Upload PDF bank statement or scanned document"
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
        aria-label="Choose or drag and drop a bank statement PDF to convert"
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
        className={`rounded-lg border-2 border-dashed px-4 py-7 sm:py-10 text-center transition-colors flex flex-col items-center justify-center gap-3 ${
          isBusy ? 'cursor-progress' : 'cursor-pointer'
        } ${
          isDragging
            ? 'border-[var(--media-violet)] bg-[var(--media-violet-hover)]'
            : 'border-[var(--media-violet-border)] bg-[var(--media-violet-soft)] hover:border-[var(--media-violet)] hover:bg-[var(--media-violet-hover)]'
        }`}
      >
        {isBusy && selectedFile ? (
          <div className="flex flex-col items-center gap-3 w-full" aria-live="polite">
            <span className="loading loading-spinner loading-lg text-[var(--media-violet)]" />
            <p className="text-base font-bold text-[var(--color-ink)]">
              {isDetectingPages ? 'Reading your file...' : progressStage || 'Converting...'}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] truncate max-w-full px-2" title={selectedFile.name}>
              {selectedFile.name}
              {!isDetectingPages && ` · ${estimatedPages} page${estimatedPages === 1 ? '' : 's'}`}
            </p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="w-12 h-12 rounded-full bg-[var(--media-violet)] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[var(--color-on-dark)]" />
            </div>
            <p className="text-base font-bold text-[var(--color-ink)] truncate max-w-full px-2" title={selectedFile.name}>
              {selectedFile.name}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {estimatedPages} page{estimatedPages === 1 ? '' : 's'}
            </p>
            <button
              type="button"
              onClick={handleClearFile}
              className="mt-1 text-sm font-semibold text-[var(--color-text-secondary)] underline underline-offset-4 hover:text-[var(--color-ink)] min-h-[44px] px-3"
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--media-violet)] flex items-center justify-center">
              <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-on-dark)]" />
            </div>
            <p className="hidden sm:block text-lg font-bold text-[var(--media-violet-text)]">
              Drag &amp; drop your bank statement here
            </p>
            <span className="btn-brand-primary w-full sm:w-auto !min-h-[56px] pointer-events-none !bg-[var(--media-violet)] !border-[var(--media-violet)] !text-[var(--color-on-dark)] !shadow-none">
              <span>{ctaLabel}</span>
              <ArrowRight className="w-5 h-5" />
            </span>
            <p className="text-sm text-[var(--media-violet-text)]/80">
              PDF, scanned PNG / JPG / TIFF · up to 50 MB
            </p>
          </>
        )}
      </div>

      {/* Tier guidance for the picked file */}
      {selectedFile && !isDetectingPages && estimatedPages > 10 && (
        <div className="mt-3">
          {estimatedPages <= 30 ? (
            <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                <strong>{estimatedPages} pages:</strong> preview free, then a one-time $10 unlock for all export formats.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[var(--color-warning-soft)] border border-[var(--color-warning-border)] flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-[var(--color-ink)]">
              <div className="flex items-start gap-2.5 flex-1">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-warning)]" />
                <p>
                  <strong>{estimatedPages} pages</strong> is above the 30-page guest limit. Sign in free to convert up to 200 pages.
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
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          {selectedFile && (
            <button
              type="button"
              onClick={() => processDocument(selectedFile, estimatedPages)}
              className="btn-brand-dark shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}

      {/* Trust row */}
      <ul className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-[13px] text-[var(--color-text-secondary)]">
        <li className="flex items-center gap-1.5 sm:justify-center">
          <ShieldCheck className="w-4 h-4 text-[var(--color-ink)] shrink-0" />
          <span>256-bit SSL encrypted</span>
        </li>
        <li className="flex items-center gap-1.5 sm:justify-center">
          <Trash2 className="w-4 h-4 text-[var(--color-ink)] shrink-0" />
          <span>Auto-deleted in 24h</span>
        </li>
        <li className="flex items-center gap-1.5 sm:justify-center">
          <BrainCircuit className="w-4 h-4 text-[var(--color-ink)] shrink-0" />
          <span>Never used for AI training</span>
        </li>
      </ul>
    </div>
  );

  return (
    <section id="upload" aria-labelledby="hero-title" className="w-full scroll-mt-24 pb-4 sm:pb-8">
      {/* Mobile: badge → H1 → upload card → details. Desktop: copy left, upload card right. */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-5 sm:gap-6 lg:gap-x-16 lg:gap-y-6 items-center pt-2 sm:pt-6 lg:pt-10">
        <div className="space-y-3 sm:space-y-5 text-center lg:text-left">
          <span className="feature-badge">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </span>
          <h1
            id="hero-title"
            className="text-[2rem] leading-[1.08] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.04] font-extrabold tracking-tight text-[var(--color-ink)]"
          >
            {title}
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl mx-auto lg:mx-0">
            {description}
          </p>
        </div>

        <div className="lg:row-span-2">{uploadCard}</div>

        <div className="space-y-5 text-center lg:text-left">
          <ul className="hidden sm:grid gap-2.5 max-w-xl mx-auto lg:mx-0">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center justify-center lg:justify-start gap-2.5 text-base text-[var(--color-ink)]">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-hover)] shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Export to</p>
            <ul className="flex flex-wrap justify-center lg:justify-start gap-2">
              {EXPORT_FORMATS.map((fmt) => (
                <li
                  key={fmt}
                  className="px-3 py-1.5 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)]"
                >
                  {fmt}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-[var(--color-text-secondary)]">
            11–30 pages: free preview, $10 to download · 30+ pages: free account.{' '}
            <Link href="/pricing" className="font-semibold text-[var(--color-ink)] underline underline-offset-4 decoration-[var(--color-brand)] decoration-2">
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
