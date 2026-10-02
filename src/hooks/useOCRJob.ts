import { useState, useEffect, useRef, useCallback } from 'react';
import {
  OCRJobState,
  ExtractionResponse,
  DocumentType,
  SupportedLanguage,
} from '@/types/ocr';
import { saveToBrowserHistory } from '@/lib/browser-history';

export interface UploadOptions {
  documentType?: DocumentType;
  language?: SupportedLanguage;
  cleanWithAi?: boolean;
  password?: string;
  pageCount?: number;
}

const INITIAL_STATE: OCRJobState = {
  jobId: null,
  documentId: null,
  status: 'idle',
  uploadProgress: 0,
  processingProgress: 0,
  currentStage: 'idle',
  totalPages: 0,
  processedPages: 0,
  message: '',
  result: null,
  error: null,
};

export function useOCRJob() {
  const [jobState, setJobState] = useState<OCRJobState>(INITIAL_STATE);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupListeners = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  const fetchFinalResult = useCallback(async (docId: string, jobId?: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`);
      if (res.ok) {
        const data: ExtractionResponse = await res.json();
        setJobState((prev) => ({
          ...prev,
          status: 'completed',
          processingProgress: 100,
          currentStage: 'completed',
          result: data,
        }));
        return;
      }
    } catch {
      // Ignore
    }

    // Fallback: Query job endpoint
    if (jobId) {
      try {
        const jobRes = await fetch(`/api/ocr/jobs/${jobId}`);
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          if (jobData.result) {
            setJobState((prev) => ({
              ...prev,
              status: 'completed',
              processingProgress: 100,
              currentStage: 'completed',
              result: jobData.result,
            }));
            return;
          }
        }
      } catch {
        // Ignore
      }
    }

    setJobState((prev) => ({
      ...prev,
      status: 'completed',
      processingProgress: 100,
      currentStage: 'completed',
    }));
  }, []);

  const startPolling = useCallback((jobId: string, docId: string) => {
    if (pollingTimerRef.current) return;

    pollingTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/ocr/jobs/${jobId}`);
        if (!res.ok) return;

        const job = await res.json();
        setJobState((prev) => ({
          ...prev,
          status: job.status,
          processingProgress: job.progress ?? prev.processingProgress,
          currentStage: job.current_stage || prev.currentStage,
          totalPages: job.total_pages || prev.totalPages,
          processedPages: job.processed_pages ?? prev.processedPages,
          message: job.message || prev.message,
        }));

        if (job.status === 'completed') {
          cleanupListeners();
          if (job.result) {
            setJobState((prev) => ({
              ...prev,
              status: 'completed',
              processingProgress: 100,
              result: job.result,
            }));
          } else {
            fetchFinalResult(docId, jobId);
          }
        } else if (job.status === 'failed' || job.status === 'cancelled') {
          cleanupListeners();
          setJobState((prev) => ({
            ...prev,
            status: job.status,
            error: job.error || (job.status === 'cancelled' ? 'Job was cancelled.' : 'Extraction failed.'),
          }));
        }
      } catch (e) {
        console.warn('[useOCRJob] Polling error:', e);
      }
    }, 2000);
  }, [cleanupListeners, fetchFinalResult]);

  const connectSSE = useCallback((jobId: string, docId: string) => {
    cleanupListeners();

    try {
      const sseUrl = `/api/ocr/jobs/${jobId}/events`;
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.addEventListener('connected', () => {
        setJobState((prev) => ({
          ...prev,
          status: 'processing',
          message: 'Connected to live event stream...',
        }));
      });

      es.addEventListener('ocr.job.started', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          setJobState((prev) => ({
            ...prev,
            status: 'processing',
            processingProgress: data.progress || 5,
            currentStage: data.current_stage || 'ocr_extraction',
            message: data.message || 'Processing started...',
          }));
        } catch {
          // Ignore
        }
      });

      es.addEventListener('ocr.job.progress', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          setJobState((prev) => ({
            ...prev,
            status: 'processing',
            processingProgress: data.progress ?? prev.processingProgress,
            currentStage: data.current_stage || prev.currentStage,
            totalPages: data.total_pages || prev.totalPages,
            processedPages: data.processed_pages ?? prev.processedPages,
            message: data.message || `Extracting page ${data.processed_pages || 0} of ${data.total_pages || 0}...`,
          }));
        } catch {
          // Ignore
        }
      });

      es.addEventListener('ocr.job.completed', (event: MessageEvent) => {
        cleanupListeners();
        try {
          const data = JSON.parse(event.data);
          if (data.result) {
            setJobState((prev) => ({
              ...prev,
              status: 'completed',
              processingProgress: 100,
              result: data.result,
            }));
          } else {
            fetchFinalResult(docId, jobId);
          }
        } catch {
          fetchFinalResult(docId, jobId);
        }
      });

      es.addEventListener('ocr.job.failed', (event: MessageEvent) => {
        cleanupListeners();
        try {
          const data = JSON.parse(event.data);
          setJobState((prev) => ({
            ...prev,
            status: 'failed',
            error: data.error || 'Document processing failed.',
          }));
        } catch {
          setJobState((prev) => ({ ...prev, status: 'failed', error: 'Document processing failed.' }));
        }
      });

      es.onerror = () => {
        // Fallback gracefully to polling if SSE disconnected
        es.close();
        eventSourceRef.current = null;
        startPolling(jobId, docId);
      };
    } catch {
      startPolling(jobId, docId);
    }
  }, [cleanupListeners, fetchFinalResult, startPolling]);

  const uploadAndProcess = async (
    file: File,
    options: UploadOptions = {}
  ): Promise<{ job_id: string; document_id: string } | null> => {
    cleanupListeners();

    const {
      documentType = 'auto',
      language = 'en',
      cleanWithAi = true,
      password,
      pageCount = 1,
    } = options;

    setJobState({
      jobId: null,
      documentId: null,
      status: 'uploading',
      uploadProgress: 0,
      processingProgress: 0,
      currentStage: 'file_upload',
      totalPages: pageCount,
      processedPages: 0,
      message: 'Uploading document to server...',
      result: null,
      error: null,
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('language', language);
    formData.append('clean_with_ai', cleanWithAi ? 'true' : 'false');
    formData.append('page_count', String(pageCount));
    if (password) {
      formData.append('password', password);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/ocr/jobs/upload');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded * 100) / event.total);
          setJobState((prev) => ({
            ...prev,
            uploadProgress: percent,
            message: `Uploading: ${percent}%...`,
          }));
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            const { job_id, document_id } = response;
            setJobState((prev) => ({
              ...prev,
              jobId: job_id,
              documentId: document_id,
              status: 'queued',
              currentStage: 'queued',
              uploadProgress: 100,
              message: 'Document queued. Asynchronous workers processing...',
            }));

            // Save to client browser history placeholder
            saveToBrowserHistory({
              id: document_id,
              filename: file.name,
              document_type: documentType,
              pages: pageCount,
              created_at: new Date().toISOString(),
              status: 'processing',
            });

            // Dispatch global event for persistent background tracking across route changes
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('finlyzer:job_added', {
                  detail: {
                    jobId: job_id,
                    documentId: document_id,
                    filename: file.name,
                    status: 'queued',
                    uploadProgress: 100,
                    processingProgress: 0,
                    currentStage: 'queued',
                    totalPages: pageCount,
                    processedPages: 0,
                    message: 'Document queued. Asynchronous workers processing...',
                  },
                })
              );
            }

            // Connect real-time Server-Sent Events stream
            connectSSE(job_id, document_id);
            resolve({ job_id, document_id });
          } else {
            const err = new Error(response.error || 'Upload failed');
            (err as unknown as { code?: string }).code = response.code;
            setJobState((prev) => ({
              ...prev,
              status: 'failed',
              error: response.error || 'Upload failed',
            }));
            reject(err);
          }
        } catch {
          const err = new Error('Invalid server response');
          setJobState((prev) => ({ ...prev, status: 'failed', error: 'Invalid response from server' }));
          reject(err);
        }
      };

      xhr.onerror = () => {
        const err = new Error('Network error during upload');
        setJobState((prev) => ({ ...prev, status: 'failed', error: 'Network error occurred during upload' }));
        reject(err);
      };

      xhr.send(formData);
    });
  };

  const cancelCurrentJob = async () => {
    if (!jobState.jobId) return;
    try {
      await fetch(`/api/ocr/jobs/${jobState.jobId}/cancel`, { method: 'POST' });
      cleanupListeners();
      setJobState((prev) => ({
        ...prev,
        status: 'cancelled',
        message: 'Job was cancelled.',
      }));
    } catch (e) {
      console.error('[useOCRJob] Cancel failed:', e);
    }
  };

  const retryCurrentJob = async () => {
    if (!jobState.jobId) return;
    try {
      await fetch(`/api/ocr/jobs/${jobState.jobId}/retry`, { method: 'POST' });
      setJobState((prev) => ({
        ...prev,
        status: 'queued',
        error: null,
        message: 'Retrying job in background...',
      }));
      if (jobState.documentId) {
        connectSSE(jobState.jobId, jobState.documentId);
      }
    } catch (e) {
      console.error('[useOCRJob] Retry failed:', e);
    }
  };

  const resetJob = () => {
    cleanupListeners();
    setJobState(INITIAL_STATE);
  };

  useEffect(() => {
    return () => {
      cleanupListeners();
    };
  }, [cleanupListeners]);

  return {
    jobState,
    uploadAndProcess,
    cancelJob: cancelCurrentJob,
    retryJob: retryCurrentJob,
    resetJob,
  };
}
