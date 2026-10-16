'use client';

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Lock, AlertCircle, UploadCloud, ArrowRight } from 'lucide-react';
import { ExtractionResponse, DocumentType, SupportedLanguage } from '@/types/ocr';
import { inspectPdfFile } from '@/lib/pdf-helper';
import AuthModal from '../auth/AuthModal';
import UploadConfigModal from './UploadConfigModal';
import { saveToBrowserHistory } from '@/lib/browser-history';

import { useOCRJob } from '@/hooks/useOCRJob';
import AsyncJobProgressModal from './AsyncJobProgressModal';

interface OcrUploaderProps {
  onExtractionComplete: (data: ExtractionResponse) => void;
  onOpenBatchModal: () => void;
  /** Pre-selected document type in the config popup (e.g. 'bank_statement' for analyzers). */
  defaultDocumentType?: DocumentType;
}

export default function OcrUploader({
  onExtractionComplete,
  onOpenBatchModal,
  defaultDocumentType = 'auto',
}: OcrUploaderProps) {
  const { data: session } = useSession();
  const {
    jobState,
    uploadAndProcess: uploadAsyncDoc,
    cancelJob,
    retryJob,
    resetJob,
  } = useOCRJob();

  const [isAsyncModalOpen, setIsAsyncModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [estimatedPages, setEstimatedPages] = useState<number>(1);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [documentType, setDocumentType] = useState<DocumentType>(defaultDocumentType);
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  // Modal States
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
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
    setPasswordError(null);
    setSelectedFile(file);

    // Client-side PDF Inspection (Page count and password protection)
    const inspection = await inspectPdfFile(file);
    setEstimatedPages(inspection.pageCount);
    setIsEncrypted(inspection.isEncrypted);

    // Open configuration popup to select Document Type & Language & Password
    setIsConfigModalOpen(true);
  };

  const handleConfirmConfig = async (password?: string) => {
    if (!selectedFile) return;

    // Rule: If document > 10 pages and guest user, prompt Google Sign In!
    if (!session?.user && estimatedPages > 10) {
      setIsConfigModalOpen(false);
      setAuthReason('page_limit');
      setAuthPageCount(estimatedPages);
      setIsAuthModalOpen(true);
      return;
    }

    setIsConfigModalOpen(false);

    // If file is large (>10 pages), automatically use the Asynchronous Webhook pipeline!
    if (estimatedPages > 10) {
      setIsAsyncModalOpen(true);
      try {
        await uploadAsyncDoc(selectedFile, {
          documentType,
          language,
          cleanWithAi: true,
          password,
          pageCount: estimatedPages,
        });
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (error.code === 'PASSWORD_REQUIRED') {
          setIsAsyncModalOpen(false);
          setIsEncrypted(true);
          setPasswordError('Password required for encrypted PDF');
          setIsConfigModalOpen(true);
        }
      }
      return;
    }

    // Otherwise standard synchronous extraction for quick 1-10 page files
    executeExtraction(selectedFile, password, estimatedPages);
  };

  const handleCloseConfigModal = () => {
    setIsConfigModalOpen(false);
    setSelectedFile(null);
    setPasswordError(null);
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
      setProcessingStage('3. AI cleaning, reconciliation & formatting...');
    }, 1400);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('language', language);
      formData.append('clean_with_ai', 'true');
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
          setIsEncrypted(true);
          setPasswordError(data.error || 'Password required or incorrect. Please enter the valid password.');
          setIsConfigModalOpen(true);
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
          onKeyDown={(e) => {
            if (!isProcessing && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={isProcessing ? -1 : 0}
          aria-label="Upload Bank Statement or PDF"
          className={`relative border-2 border-dashed rounded-2xl px-4 py-10 sm:px-10 sm:py-14 text-center transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:border-[var(--color-brand)] focus-visible:ring-4 focus-visible:ring-[var(--color-brand)]/20 ${
            isDragging
              ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]'
              : 'border-[var(--color-info-border)] bg-[var(--color-brand-soft)] hover:border-[var(--color-brand)]'
          } ${isProcessing ? 'pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff,.csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {/* Processing Overlay / State */}
          {isProcessing ? (
            <div className="space-y-5 max-w-md mx-auto py-2 text-left sm:text-center">
              <div className="space-y-1.5">
                <h3 className="text-[17px] font-semibold text-[var(--color-ink)] tracking-tight">
                  Processing Financial Document
                </h3>
                <p aria-live="polite" className="text-sm text-[var(--color-text-secondary)]">
                  {processingStage}
                </p>
              </div>
              <div className="space-y-2">
                <div
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Processing Progress"
                  className="w-full bg-[var(--color-surface-muted)] h-1 rounded-full overflow-hidden"
                >
                  <div
                    className="bg-[var(--color-brand)] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-[13px] text-[var(--color-text-muted)] tabular-nums">{progress}%</p>
              </div>
            </div>
          ) : (
            /* Default Dropzone Content */
            <div className="space-y-5 max-w-lg mx-auto">
              <span className="mx-auto w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-info-border)] flex items-center justify-center" aria-hidden="true">
                <UploadCloud className="w-7 h-7 text-[var(--color-brand)]" />
              </span>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-[var(--color-ink)] tracking-tight">
                  Drop your document here, or browse
                </h3>
                <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
                  Bank statements, invoices and receipts. Long statements switch to background processing automatically.
                </p>
              </div>

              <span className="btn-brand-primary !min-h-[50px] !px-8 !text-[17px] pointer-events-none" aria-hidden="true">
                <span>Choose File</span>
                <ArrowRight className="w-5 h-5" />
              </span>

              {/* Supported formats */}
              <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] text-[var(--color-text-muted)]">
                <span>PDF up to 200 pages</span>
                <span aria-hidden="true">&middot;</span>
                <span>PNG &bull; JPG &bull; TIFF</span>
                <span aria-hidden="true">&middot;</span>
                <span>CSV &bull; XLSX</span>
                <span aria-hidden="true">&middot;</span>
                <span className="inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" aria-hidden="true" /> Password-protected PDFs
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div role="alert" className="p-4 bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] rounded-lg text-sm text-[var(--color-danger)] flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-semibold">Extraction Notice</p>
              <p className="text-[13px]">{errorMessage}</p>
            </div>
          </div>
        )}

      </div>

      {/* Upload Configuration & Password Popup */}
      <UploadConfigModal
        isOpen={isConfigModalOpen}
        file={selectedFile}
        isEncrypted={isEncrypted}
        documentType={documentType}
        language={language}
        passwordError={passwordError}
        isLoading={isProcessing}
        onDocumentTypeChange={setDocumentType}
        onLanguageChange={setLanguage}
        onConfirm={handleConfirmConfig}
        onClose={handleCloseConfigModal}
      />

      {/* Real-time Asynchronous Job Progress Modal for 100-200 Page Documents */}
      <AsyncJobProgressModal
        isOpen={isAsyncModalOpen}
        jobState={jobState}
        filename={selectedFile?.name}
        onCancel={cancelJob}
        onRetry={retryJob}
        onClose={() => {
          setIsAsyncModalOpen(false);
          if (jobState.status === 'completed' || jobState.status === 'failed' || jobState.status === 'cancelled') {
            resetJob();
          }
          setSelectedFile(null);
        }}
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
