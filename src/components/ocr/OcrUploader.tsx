'use client';

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Upload,
  Sparkles,
  Lock,
  Layers,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { ExtractionResponse, DocumentType, SupportedLanguage } from '@/types/ocr';
import { inspectPdfFile } from '@/lib/pdf-helper';
import PdfPasswordModal from './PdfPasswordModal';
import AuthModal from '../auth/AuthModal';
import UploadConfigModal from './UploadConfigModal';
import { saveToBrowserHistory } from '@/lib/browser-history';

interface OcrUploaderProps {
  onExtractionComplete: (data: ExtractionResponse) => void;
  onOpenBatchModal: () => void;
}

export default function OcrUploader({
  onExtractionComplete,
  onOpenBatchModal,
}: OcrUploaderProps) {
  const { data: session } = useSession();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [estimatedPages, setEstimatedPages] = useState<number>(1);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [documentType, setDocumentType] = useState<DocumentType>('auto');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [cleanWithAi, setCleanWithAi] = useState<boolean>(true);

  // Modal States
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authReason, setAuthReason] = useState<'page_limit' | 'batch_upload' | 'general'>('general');
  const [authPageCount, setAuthPageCount] = useState<number>(1);

  // Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setSelectedFile(file);

    // Client-side PDF Inspection (Page count and password protection)
    const inspection = await inspectPdfFile(file);
    setEstimatedPages(inspection.pageCount);
    setIsEncrypted(inspection.isEncrypted);

    // Open configuration popup to select Document Type & Language
    setIsConfigModalOpen(true);
  };

  const handleConfirmConfig = () => {
    setIsConfigModalOpen(false);
    if (!selectedFile) return;

    // Rule: If document > 10 pages and guest user, prompt Google Sign In!
    if (!session?.user && estimatedPages > 10) {
      setAuthReason('page_limit');
      setAuthPageCount(estimatedPages);
      setIsAuthModalOpen(true);
      return;
    }

    // Rule: If encrypted PDF, prompt Password Modal!
    if (isEncrypted) {
      setIsPasswordModalOpen(true);
      return;
    }

    // Otherwise, trigger extraction with chosen options
    executeExtraction(selectedFile, undefined, estimatedPages);
  };

  const handleCloseConfigModal = () => {
    setIsConfigModalOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 1) {
        // Multi files dropped -> open batch modal!
        onOpenBatchModal();
      } else {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    }
  };

  const executeExtraction = async (file: File, password?: string, pageCount = 1) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setPasswordError(null);
    setProgress(20);
    setProcessingStage('1. Uploading document & validating format...');

    const stageTimer1 = setTimeout(() => {
      setProgress(55);
      setProcessingStage('2. Performing PyMuPDF OCR character & table extraction...');
    }, 600);

    const stageTimer2 = setTimeout(() => {
      setProgress(85);
      setProcessingStage('3. DeepSeek AI cleaning, reconciliation & formatting...');
    }, 1400);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('language', language);
      formData.append('clean_with_ai', cleanWithAi ? 'true' : 'false');
      formData.append('page_count', String(pageCount));
      if (password) {
        formData.append('password', password);
      }

      const res = await fetch('/api/ocr/extract', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setProgress(100);

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'PASSWORD_REQUIRED') {
          setIsPasswordModalOpen(true);
          setPasswordError('Invalid password or password required. Please try again.');
          setIsProcessing(false);
          return;
        }

        if (data.code === 'LOGIN_REQUIRED') {
          setAuthReason('page_limit');
          setAuthPageCount(data.pageCount || pageCount);
          setIsAuthModalOpen(true);
          setIsProcessing(false);
          return;
        }

        throw new Error(data.error || 'Extraction failed');
      }

      // Close password modal if open
      setIsPasswordModalOpen(false);

      // Save summary to local browser history (available to free guest users as well)
      saveToBrowserHistory({
        id: data.id,
        filename: file.name,
        document_type: data.document_type || documentType,
        pages: data.metadata?.pages || pageCount || 1,
        created_at: new Date().toISOString(),
        status: data.status || 'success',
        closing_balance: (data.extraction as { closing_balance?: number })?.closing_balance,
        currency: (data.extraction as { currency?: string })?.currency,
      });

      // Cache full payload in sessionStorage for instant page rendering
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('doc_' + data.id, JSON.stringify(data));
        } catch {
          // Ignore storage overflow
        }
      }

      // Callback to parent
      onExtractionComplete(data);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setErrorMessage(err.message || 'An error occurred while extracting the document.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasswordSubmit = (pwd: string) => {
    if (!selectedFile) return;
    executeExtraction(selectedFile, pwd, estimatedPages);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Main Dropzone Card */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer bg-[var(--color-surface)] shadow-xs ${
            isDragging
              ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]/20 scale-[1.01]'
              : 'border-[var(--color-border)] hover:border-[var(--color-brand)] hover:bg-[var(--color-surface-subtle)]'
          } ${isProcessing ? 'pointer-events-none opacity-90' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {/* Processing Overlay / State */}
          {isProcessing ? (
            <div className="space-y-6 max-w-md mx-auto py-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-brand)] animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-[var(--color-ink)]">
                  {progress}%
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-[var(--color-ink)] tracking-tight">
                  Processing Financial Document
                </h3>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-brand-hover)] animate-pulse">
                  {processingStage}
                </p>
                <div className="w-full bg-[var(--color-border)] h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-[var(--color-brand)] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            /* Default Dropzone Content */
            <div className="space-y-5 max-w-lg mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight">
                  Upload Financial Statement or PDF
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  Drag &amp; drop your bank statement, invoice, or receipt here, or{' '}
                  <span className="text-[var(--color-ink)] font-bold underline decoration-[var(--color-brand)] decoration-2 underline-offset-2">
                    browse files
                  </span>
                </p>
              </div>

              {/* Supported Format Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-[var(--color-text-muted)] font-medium">
                <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                  PDF (Up to 200 Pages)
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                  PNG &bull; JPG &bull; TIFF
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center gap-1 text-[var(--color-brand-hover)]">
                  <Lock className="w-3 h-3" /> Password Protected PDFs
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Extraction Notice</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Hub Bar: Feature Highlights & Bulk Batch Upload */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 bg-[var(--color-surface-subtle)] rounded-2xl border border-[var(--color-border)] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-hover)]" />
              <span>DeepSeek AI Reconciliation</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% In-Memory &amp; Private</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Password-Protected Support</span>
            </span>
          </div>

          <button
            onClick={onOpenBatchModal}
            className="btn btn-xs sm:btn-sm rounded-full border border-[var(--media-violet)]/40 bg-[#F2EDFD] hover:bg-[#EAE1FB] text-[var(--media-violet)] font-bold px-4 py-1.5 flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Bulk / Batch Upload</span>
          </button>
        </div>
      </div>

      {/* Upload Configuration Popup (Document Type & Language Selection) */}
      <UploadConfigModal
        isOpen={isConfigModalOpen}
        file={selectedFile}
        estimatedPages={estimatedPages}
        isEncrypted={isEncrypted}
        documentType={documentType}
        language={language}
        cleanWithAi={cleanWithAi}
        onDocumentTypeChange={setDocumentType}
        onLanguageChange={setLanguage}
        onCleanWithAiChange={setCleanWithAi}
        onConfirm={handleConfirmConfig}
        onClose={handleCloseConfigModal}
      />

      {/* PDF Password Modal */}
      <PdfPasswordModal
        isOpen={isPasswordModalOpen}
        filename={selectedFile?.name || 'Encrypted_Statement.pdf'}
        errorMessage={passwordError}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        onSubmitPassword={handlePasswordSubmit}
        isLoading={isProcessing}
      />

      {/* Auth Modal (Triggered when > 10 pages or batch upload) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason={authReason}
        pageCount={authPageCount}
      />
    </>
  );
}
