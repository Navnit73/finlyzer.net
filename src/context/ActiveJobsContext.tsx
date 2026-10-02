'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { OCRJobStatus, ExtractionResponse } from '@/types/ocr';
import { saveToBrowserHistory } from '@/lib/browser-history';

export interface ActiveJobItem {
  jobId: string;
  documentId?: string;
  filename: string;
  status: OCRJobStatus;
  uploadProgress: number;
  processingProgress: number;
  currentStage: string;
  totalPages: number;
  processedPages: number;
  message: string;
  result?: ExtractionResponse | null;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ActiveJobsContextType {
  activeJobs: ActiveJobItem[];
  addJob: (job: Partial<ActiveJobItem> & { jobId: string; filename: string }) => void;
  updateJob: (jobId: string, updates: Partial<ActiveJobItem>) => void;
  removeJob: (jobId: string) => void;
  clearCompletedJobs: () => void;
  selectedJobModal: ActiveJobItem | null;
  setSelectedJobModal: (job: ActiveJobItem | null) => void;
  isFloatingTrackerOpen: boolean;
  setIsFloatingTrackerOpen: (open: boolean) => void;
}

const ActiveJobsContext = createContext<ActiveJobsContextType | undefined>(undefined);

const STORAGE_KEY = 'finlyzer_active_jobs_v1';

export function ActiveJobsProvider({ children }: { children: React.ReactNode }) {
  const [activeJobs, setActiveJobs] = useState<ActiveJobItem[]>([]);
  const [selectedJobModal, setSelectedJobModal] = useState<ActiveJobItem | null>(null);
  const [isFloatingTrackerOpen, setIsFloatingTrackerOpen] = useState(true);
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());
  const isInitialized = useRef(false);

  const removeJob = useCallback((jobId: string) => {
    setActiveJobs((prev) => prev.filter((j) => j.jobId !== jobId));
    const es = eventSourcesRef.current.get(jobId);
    if (es) {
      es.close();
      eventSourcesRef.current.delete(jobId);
    }
  }, []);

  const updateJob = useCallback((jobId: string, updates: Partial<ActiveJobItem>) => {
    setActiveJobs((prev) =>
      prev.map((job) => {
        if (job.jobId !== jobId) return job;
        const updated = {
          ...job,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        // If completed, update client browser history
        if (updates.status === 'completed') {
          saveToBrowserHistory({
            id: updated.documentId || updated.jobId,
            filename: updated.filename,
            document_type: (updated.result?.document_type as any) || 'bank_statement',
            pages: updated.totalPages || updated.result?.metadata?.pages || 1,
            created_at: updated.createdAt,
            status: 'success',
            closing_balance: (updated.result?.extraction as any)?.closing_balance,
            currency: (updated.result?.extraction as any)?.currency,
          });
        }

        return updated;
      })
    );
  }, []);

  const addJob = useCallback(
    (jobData: Partial<ActiveJobItem> & { jobId: string; filename: string }) => {
      const newJob: ActiveJobItem = {
        jobId: jobData.jobId,
        documentId: jobData.documentId,
        filename: jobData.filename,
        status: jobData.status || 'queued',
        uploadProgress: jobData.uploadProgress ?? 100,
        processingProgress: jobData.processingProgress ?? 0,
        currentStage: jobData.currentStage || 'queued',
        totalPages: jobData.totalPages ?? 1,
        processedPages: jobData.processedPages ?? 0,
        message: jobData.message || 'Queued for background processing...',
        result: jobData.result || null,
        error: jobData.error || null,
        createdAt: jobData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setActiveJobs((prev) => {
        const filtered = prev.filter((j) => j.jobId !== newJob.jobId);
        return [newJob, ...filtered];
      });
      setIsFloatingTrackerOpen(true);
    },
    []
  );

  const clearCompletedJobs = useCallback(() => {
    setActiveJobs((prev) => prev.filter((j) => j.status === 'processing' || j.status === 'queued'));
  }, []);

  // 1. Load active jobs from localStorage on initial mount and listen for external additions
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ActiveJobItem[] = JSON.parse(stored);
        setActiveJobs(parsed);
      }
    } catch {
      // Ignore storage errors
    }
    isInitialized.current = true;

    const handleExternalJobAdd = (e: Event) => {
      const customEvent = e as CustomEvent<Partial<ActiveJobItem> & { jobId: string; filename: string }>;
      if (customEvent.detail && customEvent.detail.jobId) {
        addJob(customEvent.detail);
      }
    };

    window.addEventListener('finlyzer:job_added', handleExternalJobAdd);
    return () => {
      window.removeEventListener('finlyzer:job_added', handleExternalJobAdd);
    };
  }, [addJob]);

  // 2. Save active jobs to localStorage when changed
  useEffect(() => {
    if (!isInitialized.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeJobs));
    } catch {
      // Ignore
    }
  }, [activeJobs]);

  // 3. Background Job Sync Worker Loop (Connects SSE and checks status for in-flight jobs)
  useEffect(() => {
    const inFlightJobs = activeJobs.filter(
      (j) => j.status === 'queued' || j.status === 'processing'
    );

    inFlightJobs.forEach((job) => {
      if (eventSourcesRef.current.has(job.jobId)) return;

      try {
        const sseUrl = `/api/ocr/jobs/${job.jobId}/events`;
        const es = new EventSource(sseUrl);
        eventSourcesRef.current.set(job.jobId, es);

        es.addEventListener('ocr.job.progress', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            updateJob(job.jobId, {
              status: 'processing',
              processingProgress: data.progress,
              currentStage: data.current_stage || 'ocr_extraction',
              totalPages: data.total_pages || job.totalPages,
              processedPages: data.processed_pages,
              message: data.message || `Extracting page ${data.processed_pages} of ${data.total_pages}...`,
            });
          } catch {}
        });

        es.addEventListener('ocr.job.completed', async (event: MessageEvent) => {
          es.close();
          eventSourcesRef.current.delete(job.jobId);

          let finalResult: ExtractionResponse | null = null;
          try {
            const data = JSON.parse(event.data);
            if (data.result) finalResult = data.result;
          } catch {}

          if (!finalResult && (job.documentId || job.jobId)) {
            try {
              const res = await fetch(`/api/documents/${job.documentId || job.jobId}`);
              if (res.ok) finalResult = await res.json();
            } catch {}
          }

          updateJob(job.jobId, {
            status: 'completed',
            processingProgress: 100,
            currentStage: 'completed',
            result: finalResult,
            message: 'Extraction completed successfully!',
          });
        });

        es.addEventListener('ocr.job.failed', (event: MessageEvent) => {
          es.close();
          eventSourcesRef.current.delete(job.jobId);
          try {
            const data = JSON.parse(event.data);
            updateJob(job.jobId, {
              status: 'failed',
              error: data.error || 'Document extraction failed',
            });
          } catch {
            updateJob(job.jobId, { status: 'failed', error: 'Document extraction failed' });
          }
        });

        es.onerror = () => {
          es.close();
          eventSourcesRef.current.delete(job.jobId);
        };
      } catch {}
    });

    // Also poll every 3 seconds for fallback resilience
    const pollTimer = setInterval(async () => {
      const currentInFlight = activeJobs.filter(
        (j) => j.status === 'queued' || j.status === 'processing'
      );

      for (const job of currentInFlight) {
        try {
          const res = await fetch(`/api/ocr/jobs/${job.jobId}`);
          if (res.ok) {
            const data = await res.json();
            updateJob(job.jobId, {
              status: data.status,
              processingProgress: data.progress,
              currentStage: data.current_stage || job.currentStage,
              totalPages: data.total_pages || job.totalPages,
              processedPages: data.processed_pages,
              message: data.message,
              result: data.result || job.result,
              error: data.error,
            });

            if (data.status === 'completed' || data.status === 'failed') {
              const es = eventSourcesRef.current.get(job.jobId);
              if (es) {
                es.close();
                eventSourcesRef.current.delete(job.jobId);
              }
            }
          }
        } catch {}
      }
    }, 3500);

    return () => {
      clearInterval(pollTimer);
    };
  }, [activeJobs, updateJob]);

  return (
    <ActiveJobsContext.Provider
      value={{
        activeJobs,
        addJob,
        updateJob,
        removeJob,
        clearCompletedJobs,
        selectedJobModal,
        setSelectedJobModal,
        isFloatingTrackerOpen,
        setIsFloatingTrackerOpen,
      }}
    >
      {children}
    </ActiveJobsContext.Provider>
  );
}

export function useActiveJobs() {
  const context = useContext(ActiveJobsContext);
  if (!context) {
    throw new Error('useActiveJobs must be used within an ActiveJobsProvider');
  }
  return context;
}
