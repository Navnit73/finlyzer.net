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
  const [activeJobs, setActiveJobs] = useState<ActiveJobItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        // Ignore storage errors
      }
    }
    return [];
  });
  const [selectedJobModal, setSelectedJobModal] = useState<ActiveJobItem | null>(null);
  const [isFloatingTrackerOpen, setIsFloatingTrackerOpen] = useState(true);
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());
  const activeJobsRef = useRef(activeJobs);

  useEffect(() => {
    activeJobsRef.current = activeJobs;
  }, [activeJobs]);

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
            document_type: (updated.result?.document_type as string) || 'bank_statement',
            pages: updated.totalPages || updated.result?.metadata?.pages || 1,
            created_at: updated.createdAt,
            status: 'success',
            closing_balance: (updated.result?.extraction as Record<string, unknown>)?.closing_balance as number | undefined,
            currency: (updated.result?.extraction as Record<string, unknown>)?.currency as string | undefined,
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

  // 1. Listen for external additions
  useEffect(() => {
    const handleExternalJobAdd = (e: Event) => {
      const customEvent = e as CustomEvent<Partial<ActiveJobItem> & { jobId: string; filename: string }>;
      if (customEvent?.detail?.jobId) {
        addJob(customEvent.detail);
      }
    };

    window.addEventListener('finlyzer:job_added', handleExternalJobAdd);
    return () => {
      window.removeEventListener('finlyzer:job_added', handleExternalJobAdd);
    };
  }, [addJob]);

  // 2. Save active jobs to localStorage when changed (Sanitizing result payload to prevent 5MB storage quota overflow)
  useEffect(() => {
    try {
      const sanitized = activeJobs.slice(0, 20).map((job) => ({
        ...job,
        // Do not store massive 100-page raw_text/transactions arrays in localStorage
        result: job.result ? { id: job.result.id, status: job.result.status, filename: job.result.filename, metadata: job.result.metadata } : null,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
      // Ignore quota errors gracefully
    }
  }, [activeJobs]);

  // 3. Stable Background Job Sync: Connect SSE per active job ID without tearing down timers on every progress tick
  const inFlightSyncKey = activeJobs.map((j) => `${j.jobId}:${j.status}`).join(',');
  const hasInFlightJobs = activeJobs.some((j) => j.status === 'queued' || j.status === 'processing');

  useEffect(() => {
    const inFlightJobs = activeJobs.filter(
      (j) => j.status === 'queued' || j.status === 'processing'
    );

    // Start SSE for newly in-flight jobs
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

    // Cleanup SSE for jobs that are no longer in-flight
    const inFlightIds = new Set(inFlightJobs.map((j) => j.jobId));
    eventSourcesRef.current.forEach((es, jobId) => {
      if (!inFlightIds.has(jobId)) {
        es.close();
        eventSourcesRef.current.delete(jobId);
      }
    });
  }, [inFlightSyncKey, updateJob]);

  // Fallback background polling (only runs when in-flight jobs exist and SSE is closed/missing)
  useEffect(() => {
    if (!hasInFlightJobs) return;

    const pollTimer = setInterval(async () => {
      const currentInFlight = activeJobsRef.current.filter(
        (j) => j.status === 'queued' || j.status === 'processing'
      );

      for (const job of currentInFlight) {
        // If SSE is connected, skip polling to avoid duplicate network load
        if (eventSourcesRef.current.has(job.jobId)) continue;

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
          }
        } catch {}
      }
    }, 4000);

    return () => {
      clearInterval(pollTimer);
    };
  }, [hasInFlightJobs, updateJob]);

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
