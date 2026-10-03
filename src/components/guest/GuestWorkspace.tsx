'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  Sparkles,
  Zap,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Receipt,
  Layers,
  X,
} from 'lucide-react';
import { ExtractionResponse, DocumentType, SupportedLanguage } from '@/types/ocr';
import AuthModal from '@/components/auth/AuthModal';
import PdfPasswordModal from '@/components/ocr/PdfPasswordModal';

export default function GuestWorkspace() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [estimatedPages, setEstimatedPages] = useState<number>(1);
  const [isDetectingPages, setIsDetectingPages] = useState<boolean>(false);
  const [documentType, setDocumentType] = useState<DocumentType>('auto');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [cleanWithAi, setCleanWithAi] = useState<boolean>(true);

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

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setIsDetectingPages(true);

    const pages = await detectPdfPages(file);
    setEstimatedPages(pages);
    setIsDetectingPages(false);

    if (pages > 30) {
      setIsAuthModalOpen(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
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

  const handleProcessDocument = async (customPassword?: string) => {
    if (!selectedFile) return;

    if (estimatedPages > 30) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setProgressStage('Uploading financial statement...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', documentType);
      formData.append('language', language);
      formData.append('clean_with_ai', cleanWithAi ? 'true' : 'false');
      formData.append('page_count', estimatedPages.toString());

      const activePassword = customPassword || pendingPassword;
      if (activePassword) {
        formData.append('password', activePassword);
      }

      setProgressStage('Extracting tables & ledger balances with AI...');
      const response = await fetch('/api/ocr/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'PASSWORD_REQUIRED') {
          setIsPasswordModalOpen(true);
          setIsUploading(false);
          return;
        }

        if (data.code === 'LOGIN_REQUIRED') {
          setIsAuthModalOpen(true);
          setIsUploading(false);
          return;
        }

        throw new Error(data.error || 'Failed to extract document');
      }

      setProgressStage('Reconciliation complete! Redirecting to statement viewer...');

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

  return (
    <div className="w-full space-y-8 sm:space-y-12 pb-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3.5 pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] text-xs font-black border border-[var(--color-brand)]/40 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-ink)]" />
          <span>Instant AI Financial Statement Extraction</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--color-ink)] tracking-tight leading-[1.15]">
          Convert Financial Statements <br className="hidden sm:inline" />
          to Excel &amp; Accounting Feeds
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
          Upload any bank statement, credit card invoice, or receipt. Extract ledger transactions and formulas with zero manual data entry.
        </p>
      </div>

      {/* 3-Tier Visual Page Limits Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {/* Tier 1: 1-10 Pages */}
        <div className="p-3.5 rounded-xl bg-[var(--color-brand-soft)]/70 border border-[var(--color-brand)]/50 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-on-brand)] bg-[var(--color-brand)] px-2 py-0.5 rounded-full">
              FREE TIER
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-ink)]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-[var(--color-ink)]">1–10 Pages</h4>
            <p className="text-[11px] text-[var(--color-ink-soft)] mt-0.5 leading-snug">
              100% Free Processing &amp; Instant Multi-Format Downloads.
            </p>
          </div>
        </div>        {/* Tier 2: 11–30 Pages */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-ink)] bg-[var(--color-surface-muted)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
              PAY-PER-DOWNLOAD
            </span>
            <Lock className="w-3.5 h-3.5 text-[var(--color-ink)]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-[var(--color-ink)]">11–30 Pages</h4>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">
              Free AI Reconciliation Preview. Unlock all 6 formats for $10.
            </p>
          </div>
        </div>

        {/* Tier 3: 30+ Pages */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--media-violet-text)] bg-[var(--media-violet-soft)] px-2 py-0.5 rounded-full border border-[var(--media-violet-border)]">
              PRO / ENTERPRISE
            </span>
            <Zap className="w-3.5 h-3.5 text-[var(--media-violet)]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-[var(--color-ink)]">Above 30 Pages</h4>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">
              Requires free sign-in. Supports up to 200 pages and bulk batches.
            </p>
          </div>
        </div>
      </div>

      {/* Main Drag & Drop Card Container */}
      <div className="max-w-3xl mx-auto rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 sm:p-8 space-y-6 shadow-xs">
        {/* File Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3.5 ${
            selectedFile
              ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]/20'
              : 'border-[var(--color-border)] hover:border-[var(--color-ink)] bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink)] shadow-xs">
            {selectedFile ? (
              <FileText className="w-7 h-7 text-[var(--color-brand-hover)]" />
            ) : (
              <Upload className="w-7 h-7 text-[var(--color-text-secondary)]" />
            )}
          </div>

          {selectedFile ? (
            <div className="space-y-2">
              <p className="text-sm sm:text-base font-black text-[var(--color-ink)] truncate max-w-md">
                {selectedFile.name}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs font-mono">
                <span className="text-[var(--color-text-secondary)]">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                <span>&bull;</span>
                <span className="font-bold text-[var(--color-ink)]">
                  {isDetectingPages ? 'Detecting pages...' : `${estimatedPages} page(s) detected`}
                </span>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)] text-[var(--color-ink)] border border-[var(--color-border)] cursor-pointer transition-colors shadow-2xs"
                >
                  <X className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                  <span>Choose different file</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm sm:text-base font-black text-[var(--color-ink)]">
                Click or drag &amp; drop statement here
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Supports PDF, Scanned Images (PNG, JPG, TIFF) up to 50MB
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {['PDF', 'PNG', 'JPG', 'TIFF'].map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                  >
                    .{fmt.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected File Status & Tier Guidance Pill */}
        {selectedFile && (
          <div className="space-y-3">
            {estimatedPages <= 10 ? (
              <div className="p-3.5 rounded-xl bg-[var(--color-brand-soft)] border border-[var(--color-brand)]/40 flex items-center gap-3 text-xs text-[var(--color-on-brand)]">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-hover)] shrink-0" />
                <div>
                  <p className="font-bold">Eligible for 100% Free Processing &amp; Free Downloads</p>
                  <p className="text-[11px] opacity-90">
                    This {estimatedPages}-page statement is within the 10-page free guest limit.
                  </p>
                </div>
              </div>
            ) : estimatedPages <= 30 ? (
              <div className="p-3.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center gap-3 text-xs text-[var(--color-ink)]">
                <Lock className="w-5 h-5 text-[var(--color-ink)] shrink-0" />
                <div>
                  <p className="font-bold">11–30 Page Document — Free Preview &amp; $10 to Unlock Exports</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    You can process and preview full metrics for free. A $10 unlock pass enables all 6 download formats.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] flex items-center justify-between gap-3 text-xs text-[var(--color-danger)]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold">This document contains {estimatedPages} pages (Above 30-Page Guest Limit)</p>
                    <p className="text-[11px] opacity-90">
                      Guest processing is limited to 30 pages. Sign in with Google for large documents.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn btn-xs bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-soft)] font-bold rounded-lg border-none px-3 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] text-xs font-semibold text-[var(--color-danger)] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button & Trust Guarantee */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <ShieldCheck className="w-4 h-4 text-[var(--color-brand-hover)] shrink-0" />
            <span>256-bit SSL encrypted &bull; Zero permanent data retention</span>
          </div>

          <button
            onClick={() => handleProcessDocument()}
            disabled={!selectedFile || isUploading || estimatedPages > 30}
            className="btn-brand-primary w-full sm:w-auto !min-h-[46px] !h-[46px] !px-8 text-xs sm:text-sm font-black rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                <span>{progressStage || 'Processing with AI...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Statement Now</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-4xl mx-auto pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Feature 1 */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-[var(--color-ink)]">6 Export Formats</h4>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            Excel (.xlsx), CSV, QuickBooks (.qbo), Xero/OFX (.ofx), Quicken (.qif), and formatted PDF.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--media-blue-soft)] text-[var(--media-blue-text)] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-[var(--color-ink)]">99.8% Precision</h4>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            Neural models trained on millions of financial layouts for accurate decimal and ledger alignment.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--media-violet-soft)] text-[var(--media-violet-text)] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-[var(--color-ink)]">Zero Data Retention</h4>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            Ephemeral processing with TLS 1.3 encryption. Financial data is never used for AI training.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--media-orange-soft)] text-[var(--media-orange-text)] flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-[var(--color-ink)]">Auto-Reconciliation</h4>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            Instant credit/debit balances, starting and closing ledger verification in seconds.
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
          handleProcessDocument(pass);
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
    </div>
  );
}
