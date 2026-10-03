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
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ExtractionResponse } from '@/types/ocr';
import AuthModal from '@/components/auth/AuthModal';
import PdfPasswordModal from '@/components/ocr/PdfPasswordModal';
import { SEOConverterPage } from '@/types/seo';

interface LandingPageProcessorProps {
  pageData: SEOConverterPage;
}

export default function LandingPageProcessor({ pageData }: LandingPageProcessorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [estimatedPages, setEstimatedPages] = useState<number>(1);
  const [isDetectingPages, setIsDetectingPages] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [pendingPassword, setPendingPassword] = useState<string | undefined>(undefined);
  const [completedResult, setCompletedResult] = useState<ExtractionResponse | null>(null);

  // Client-side quick page detection for PDFs
  const detectPdfPages = async (file: File): Promise<number> => {
    if (!file.name.toLowerCase().endsWith('.pdf')) return 1;
    try {
      const buffer = await file.slice(0, 500000).arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      const matches = text.match(/\/Type\s*\/Page[^s]/g);
      if (matches && matches.length > 0) return matches.length;
      const countMatch = text.match(/\/Count\s+(\d+)/);
      if (countMatch && countMatch[1]) return parseInt(countMatch[1], 10);
    } catch {
      // Ignore detection errors
    }
    return 1;
  };

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setCompletedResult(null);
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
    setCompletedResult(null);
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
    setProgressStage('Uploading statement to secure AI parser...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', 'bank_statement');
      formData.append('language', 'en');
      formData.append('clean_with_ai', 'true');

      const pass = customPassword || pendingPassword;
      if (pass) {
        formData.append('password', pass);
      }

      setProgressStage('Extracting tables & reconciling balances...');

      const res = await fetch('/api/ocr/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requires_password) {
          setIsPasswordModalOpen(true);
          setIsUploading(false);
          setProgressStage('');
          return;
        }

        if (res.status === 401 || data.auth_required) {
          setIsAuthModalOpen(true);
          setIsUploading(false);
          setProgressStage('');
          return;
        }

        throw new Error(data.detail || data.error || 'Failed to extract financial data');
      }

      setCompletedResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Extraction error. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
      setProgressStage('');
    }
  };

  const handlePasswordSubmit = (password: string) => {
    setPendingPassword(password);
    setIsPasswordModalOpen(false);
    handleProcessDocument(password);
  };

  return (
    <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden text-[var(--color-ink)] transition-all">
      {/* Top Banner */}
      <div className="bg-[var(--color-surface-subtle)] px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand)] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
            {pageData.bankName} Dedicated AI Parser
          </span>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)] border border-[var(--color-brand)]/30">
          1–10 Pages Free
        </span>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Dropzone Container */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            selectedFile
              ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]/20'
              : 'border-[var(--color-border)] hover:border-[var(--color-brand)] bg-[var(--color-surface-subtle)]/60 hover:bg-[var(--color-surface-subtle)]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.tiff"
            className="hidden"
            onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
            disabled={isUploading}
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-soft)] border border-[var(--color-brand)]/40 flex items-center justify-center text-[var(--color-brand-hover)] shadow-xs">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-[var(--color-ink)] truncate max-w-sm">
                  {selectedFile.name}
                </p>
                <div className="flex items-center justify-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)]">
                  <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>&bull;</span>
                  <span className="font-bold text-[var(--color-ink)]">
                    {isDetectingPages ? 'Detecting pages...' : `${estimatedPages} ${estimatedPages === 1 ? 'Page' : 'Pages'}`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                className="mt-1 px-3 py-1 text-xs font-bold text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] rounded-lg transition"
              >
                Remove File
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-brand-hover)] shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-base text-[var(--color-ink)]">
                  Drop your {pageData.bankName} Statement here
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Supports PDF, Scanned Images (PNG, JPG, TIFF) up to 50MB
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[11px] font-semibold text-[var(--color-text-muted)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-hover)]" />
                <span>Auto-categorizes Debits, Credits &amp; Balances</span>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] text-xs text-[var(--color-danger)] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Completed Output Banner */}
        {completedResult && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-[var(--color-brand-soft)]/60 border border-[var(--color-brand)]/40 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/90 border border-[var(--color-brand)]/60 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <CheckCircle2 className="w-4.5 h-4.5 text-[var(--color-brand-hover)]" />
              </div>
              <div className="space-y-0.5">
                <p className="font-extrabold text-sm text-[var(--color-ink)]">
                  Statement Successfully Extracted!
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {(completedResult.extraction?.transactions?.length || completedResult.metadata?.pages || 1)} transactions extracted with verified ledger totals.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => router.push(`/document/${completedResult.id}`)}
                className="w-full sm:flex-1 btn-brand-primary !min-h-[46px] !h-[46px] !px-5 text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Open Financial Viewer</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <a
                href={`/api/export/download/${completedResult.id}?format=xlsx`}
                className="w-full sm:w-auto btn-brand-secondary !min-h-[46px] !h-[46px] !px-5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 whitespace-nowrap border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                <span>Download Excel</span>
              </a>
            </div>
          </div>
        )}

        {/* Action Trigger Button */}
        {!completedResult && (
          <button
            onClick={() => handleProcessDocument()}
            disabled={!selectedFile || isUploading}
            className={`w-full btn-brand-primary !min-h-[48px] !h-[48px] !px-6 text-sm font-black rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              !selectedFile || isUploading ? 'opacity-50 cursor-not-allowed' : 'active:scale-98'
            }`}
          >
            {isUploading ? (
              <>
                <Zap className="w-4 h-4 animate-spin" />
                <span>{progressStage || 'Processing Statement...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Convert {pageData.bankName} Statement to Excel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        {/* Security & Privacy Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[var(--color-brand-hover)]" />
            <span>256-Bit SSL Encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[var(--color-brand-hover)]" />
            <span>Files Auto-Deleted After Processing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-hover)]" />
            <span>100% Math Reconciliation</span>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <PdfPasswordModal
        isOpen={isPasswordModalOpen}
        filename={selectedFile?.name || 'Protected Bank Statement'}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmitPassword={handlePasswordSubmit}
      />

      {/* Auth Modal for > 30 Pages */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="page_limit"
        pageCount={estimatedPages}
      />
    </div>
  );
}
